import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Button,
  DialogActions,
  Stack,
  DialogTitle,
  Container,
  CircularProgress,
  DialogContent,
} from '@mui/material';
import Interview from '@/components/Question/Interview';
import { motion } from 'framer-motion';
import AppContext from '@/contexts/AppContext';
import { useRouter } from 'next/router';
import Dialog from '@mui/material/Dialog';
import { questionList } from '@/constants/questionList';
import { SignalWifiStatusbarNullTwoTone } from '@mui/icons-material';
import { Ready } from '@/components/Question/Ready';
import AnalysisModal from '@/components/Question/AnalysisModal';

export default function Question() {
  const recognitionRef = useRef(null);
  const router = useRouter();
  const [recordButtonLabel, setRecordButtonLabel] = useState('Record');
  const [recordButtonColor, setRecordButtonColor] = useState('primary');
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [indexNum, setIndexNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [interviewOver, setInterviewOver] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [recordStarted, setRecordStarted] = useState(false);
  let { questions, setQuestions } = useContext(AppContext);
  const [answers, setAnswers] = useState(
    questions.map((item) => {
      return '';
    })
  );
  const [isClicked, setIsClicked] = useState(false);
  const [tempAnswer, setTempAnswer] = useState(answers[indexNum - 1]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [expanded, setExpanded] = useState(false);
  const currentlyPlayingAudioRef = useRef(null);
  const mediaRecorder = useRef(null);
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]); // Ensure this is defined
  globalThis.tempAnswerBase = '';
  globalThis.tempAnswerPlusFlag = false;

  useEffect(() => {
    const savedChunks =
      JSON.parse(localStorage.getItem(`videoChunks_${indexNum}`)) || [];
    setRecordedChunks(savedChunks);
  }, [indexNum]);

  // Function to get microphone and camera permission
  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };

  // Function to start recording
  const startRecording = async () => {
    setExpanded(true);
    console.log('started...');

    let currentTime = Date.now();
    let lastMessageTime = currentTime;

    let answer_temp = '';

    console.log(localStorage.getItem('recordStarted'), 'recordStarted');

    if (localStorage.getItem('recordStarted') === '1') {
      console.log('lll222222lll');
      console.log('llllll');
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setPermission(true);
        setStream(streamData);

        const media = new MediaRecorder(streamData, { type: 'video/mp4' });
        mediaRecorder.current = media;
        let localChunks = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localChunks.push(event.data);
          }
        };

        mediaRecorder.current.onstop = () => {
          const blob = new Blob(localChunks, { type: 'video/mp4' });
          setRecordedChunks([blob]);
          localStorage.setItem(
            `videoChunks_${indexNum}`,
            JSON.stringify([URL.createObjectURL(blob)])
          );
        };

        const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
          'token',
          '017954fbe0412aa422dd5dca9e7874cc029649f4',
        ]);

        socket.onopen = () => {
          console.log({ event: 'onopen' });

          socket.send(
            JSON.stringify({
              config: {
                language: 'en-US',
                smart_format: false,
                vad_events: true,
                model: 'nova',
                interim_results: true,
                profanity_filter: true,
                endpointing: false,
                no_delay: true,
                punctuate: true,
              },
            })
          );

          mediaRecorder.current.addEventListener('dataavailable', (event) => {
            if (
              event.data.size > 0 &&
              socket.readyState == 1 &&
              localStorage.getItem('recordStarted') === '1'
            ) {
              socket.send(event.data);
              setRecordedChunks((prev) => [...prev, event.data]); // Save the chunks for download
            }
          });

          mediaRecorder.current.start(300);
        };

        socket.onmessage = (message) => {
          console.log({ event: 'onmessage', message });

          let received = JSON.parse(message.data);
          console.log(received, '--received--');

          if (
            received.channel &&
            localStorage.getItem('recordStarted') === '1'
          ) {
            console.log(
              localStorage.getItem('recordStarted'),
              'recordStarted1'
            );

            const transcript = received.channel.alternatives[0].transcript;

            if (transcript === '') {
              currentTime = Date.now();
              const timeIntervalSeconds =
                (currentTime - lastMessageTime) / 1000;
              if (timeIntervalSeconds >= 4) {
                console.log(
                  `Time interval since last message: ${timeIntervalSeconds} seconds`
                );
              } else {
                console.log('---below---');
              }
            } else {
              lastMessageTime = currentTime;
            }

            if (transcript) {
              answer_temp = answer_temp + transcript + ' ';
              setTempAnswer(answer_temp);
            }
          }
        };

        socket.onclose = () => {
          console.log({ event: 'onclose' });
        };

        socket.onerror = (error) => {
          console.log({ event: 'onerror', error });
        };
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };

  const handleStartRecordingClick = async () => {
    stopAIResponseAudio();
    if (recordStarted) {
      // Stop recording
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
      }
      setRecordStarted(false);
      setRecordButtonLabel('Record');
      setRecordButtonColor('primary');
    } else {
      // Start recording
      setRecordedChunks([]);
      localStorage.setItem('recordStarted', '1');
      await getMicrophonePermission();
      startRecording();
      setRecordStarted(true);
      setRecordButtonLabel('STOP');
      setRecordButtonColor('secondary');
    }
  };

  const handleDownloadRecording = () => {
    stopAIResponseAudio();
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = `InterviewAI_Recording_${indexNum}.mp4`;
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleDownloadAnalysis = async () => {
    try {
      const response = await fetch('/api/generate_analysis');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadLink(url);
    } catch (error) {
      console.error('Error fetching analysis file:', error);
    }
  };

  const playAIsResponse = async (responseText) => {
    try {
      console.log(responseText);
      const response = await fetch('/api/synthesize_speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseText: responseText,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (isAiTalking === false) {
        setIsAiTalking(true);
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentlyPlayingAudioRef.current = audio;

        audio.addEventListener('ended', () => {
          setIsListening(true);
          setIsAiTalking(false);
          currentlyPlayingAudioRef.current = SignalWifiStatusbarNullTwoTone;
        });
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
    }
  };

  const getInitialAIQuestion = async () => {
    try {
      const response = await fetch('/api/interview_start');
      const initialQuestion = response.question;
      setConversationHistory([{ user: '', ai: initialQuestion }]);
    } catch (error) {
      console.error('Error fetching initial AI question:', error);
    }
  };

  const sendToChatGPT = async (speech) => {
    try {
      const response = await fetch('/api/ es', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speech: speech,
        }),
      });
      setConversationHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        newHistory[newHistory.length - 1].ai = response.question;
        return newHistory;
      });
      setCurrentQuestionNumber(response.question_count); // Update question count

      if (response.question_count > max_question_count) {
        // Handle end of interview
        setInterviewOver(true);
        handleDownloadAnalysis(); // Call function to generate and set download link
      } else {
        // Continue interview as normal
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stopAIResponseAudio = () => {
    if (
      currentlyPlayingAudioRef.current &&
      typeof currentlyPlayingAudioRef.current.pause === 'function'
    ) {
      currentlyPlayingAudioRef.current.pause();
      currentlyPlayingAudioRef.current = null;
      setIsAiTalking(false);
    }
  };

  const handleSubmitAnswer = async (updatedAnswers) => {
    let combinedQA;
    setIsLoading(true);
    if (indexNum == 10) {
      combinedQA = questions
        .map((question, index) => {
          let qNumber = question.split('.')[0];
          return `question ${qNumber}: ${question.slice(
            qNumber.length + 2
          )}\nanswer ${qNumber}: ${updatedAnswers[index]}`;
        })
        .join('\n\n');
    } else {
      combinedQA =
        'Question: ' +
        questions[indexNum - 1].split('.').slice(1).join('.') +
        '\n' +
        'Answer: ' +
        updatedAnswers[indexNum - 1];
    }

    console.log(combinedQA);
    setIsLoading(true);
    const response = await fetch('/api/submit_answer', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        combinedQA: combinedQA,
      }),
    });
    setIsLoading(false);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);
    } else {
      let res = await response.json();
      console.log(res.analysis, 'api res');

      setAnalysis(res.analysis);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedChunks =
      JSON.parse(localStorage.getItem(`videoChunks_${indexNum}`)) || [];
    if (savedChunks.length > 0) {
      fetch(savedChunks[0])
        .then((response) => response.blob())
        .then((blob) => setRecordedChunks([blob]));
    } else {
      setRecordedChunks([]);
    }
  }, [indexNum]);

  useEffect(() => {
    if (!recordStarted) {
      setRecordedChunks([]); // Reset recorded chunks on new question
    }
  }, [indexNum, recordStarted]);

  useEffect(() => {
    console.log(recordStarted);
    if (recordStarted === false && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [recordStarted]);

  useEffect(() => {
    setTempAnswer(answers[indexNum - 1]);
    if (questions.length > 0 && isFirstRender !== true) {
      console.log(isAiTalking, 'playing audio....');
      if (!isAiTalking && isStarted) {
        playAIsResponse(questions[indexNum - 1]);
      }
    }
    setIsFirstRender(false);
  }, [indexNum, isFirstRender, isStarted]);

  useEffect(() => {
    const stopAudio = () => {
      if (
        currentlyPlayingAudioRef.current &&
        typeof currentlyPlayingAudioRef.current.pause === 'function'
      ) {
        currentlyPlayingAudioRef.current.pause();
        currentlyPlayingAudioRef.current = null;
      }
    };

    return () => {
      stopAudio();
    };
  }, [indexNum]);

  useEffect(() => {
    console.log(questions);

    if (!questions || questions.length === 0) router.push('/');
  }, [questions]);

  // useEffect(() => {
  //   console.log(answers);
  // }, [answers]);

  useEffect(() => {
    if (analysis != '') {
      setOpen(true);
    }
  }, [analysis]);

  const componentList = questions.map((question, index) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <Interview
          questionType={questionList[indexNum - 1]}
          indexNum={indexNum}
          totalNum={questions.length}
          question={question}
          setIndexNum={setIndexNum}
          recordStarted={recordStarted}
          setRecordStarted={setRecordStarted}
          handleStartRecordingClick={handleStartRecordingClick}
          getMicrophonePermission={getMicrophonePermission}
          permission={permission}
          stream={stream}
          answers={answers}
          setAnswers={setAnswers}
          tempAnswer={tempAnswer}
          setTempAnswer={setTempAnswer}
          expanded={expanded}
          setExpanded={setExpanded}
          handleSubmitAnswer={handleSubmitAnswer}
          isAiTalking={isAiTalking}
          setIsAiTalking={setIsAiTalking}
          mediaRecorder={mediaRecorder}
          recordButtonLabel={recordButtonLabel}
          recordButtonColor={recordButtonColor}
          setRecordButtonLabel={setRecordButtonLabel}
          setRecordButtonColor={setRecordButtonColor}
          handleDownloadRecording={handleDownloadRecording}
          recordedChunks={recordedChunks}
          setRecordedChunks={setRecordedChunks}
          stopAIResponseAudio={stopAIResponseAudio}
        />
      </motion.div>
    );
  });

  return isStarted ? (
    <div className="relative">
      <AnalysisModal
        open={open}
        onClose={handleClose}
        analysis={analysis}
        isLoading={isLoading}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          zIndex: '2',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'fixed',
          display: isLoading ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </div>
      {componentList[indexNum - 1]}{' '}
    </div>
  ) : (
    <Ready
      startInterview={() => {
        setIsStarted(true);
      }}
    />
  );
}
