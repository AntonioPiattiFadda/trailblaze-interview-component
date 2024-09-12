import React, { useState, useEffect, useRef } from 'react';
import {
  Stack,
  Container,
  Box,
  TextField,
  Typography,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionActions,
  CardMedia,
  useMediaQuery,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import ArrowLeft from '../../assets/arrow-left.svg';
import Users from '../../assets/users.svg';
import InfoCircle from '../../assets/info-circle.svg';
import Message from '../../assets/message-orange.svg';
import Microphone from '../../assets/microphone.svg';
import Download from '../../assets/download.svg';
import Ia from '../../assets/ia.svg';
import UsersBlack from '../../assets/users-black.svg';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Image from 'next/image';
import Link from 'next/link';

const TRAILBLAZE_DASHBOARD_URL = 'localhost:100/student/dashboard';

export default function Interview({
  questionType,
  indexNum,
  totalNum,
  question,
  setIndexNum,
  recordStarted,
  setRecordStarted,
  handleStartRecordingClick,
  getMicrophonePermission,
  stream,
  permission,
  answers,
  setAnswers,
  handleSubmitAnswer,
  isAiTalking,
  setIsAiTalking,
  tempAnswer,
  setTempAnswer,
  expanded,
  setExpanded,
  isClicked,
  setIsClicked,
  mediaRecorder,
  recordButtonLabel,
  recordButtonColor,
  setRecordButtonLabel,
  setRecordButtonColor,
  handleDownloadRecording,
  recordedChunks,
  setRecordedChunks,
  stopAIResponseAudio,
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isDisabled, setIsDisabled] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  const [videoGender, setVideoGender] = useState(
    JSON.parse(localStorage.getItem('videoGender')) || true
  );
  const [showAnswerBox, setShowAnswerBox] = useState(true);

  const videoRef = useRef(null);

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(
      2,
      '0'
    )}`;
  };

  const handleExpandClick = () => {
    setShowAnswerBox(!showAnswerBox);
  };

  const handleAccordionChange = (event, newExpanded) => {
    setExpanded(newExpanded);
  };

  const handleNext = () => {
    stopAIResponseAudio();
    handleChangeAnswer();
    localStorage.setItem(
      `videoChunks_${indexNum}`,
      JSON.stringify(recordedChunks.map((chunk) => URL.createObjectURL(chunk)))
    );
    setIndexNum(indexNum + 1);
    setExpanded(false);
    setIsAiTalking(false);
    setRecordStarted(false);
    localStorage.setItem('videoGender', JSON.stringify(videoGender));
  };

  //back for video chunks
  useEffect(() => {
    const savedChunks =
      JSON.parse(localStorage.getItem(`videoChunks_${indexNum}`)) || [];
    if (savedChunks.length > 0) {
      Promise.all(
        savedChunks.map((url) => fetch(url).then((response) => response.blob()))
      ).then((blobs) => setRecordedChunks(blobs));
    } else {
      setRecordedChunks([]);
    }
  }, [indexNum]);
  //prevent memory leaks
  useEffect(() => {
    return () => {
      recordedChunks.forEach((chunk) => {
        if (typeof chunk === 'string') {
          URL.revokeObjectURL(chunk);
        }
      });
    };
  }, [recordedChunks]);

  const handlePrev = () => {
    stopAIResponseAudio();
    handleChangeAnswer();
    localStorage.setItem(
      `videoChunks_${indexNum}`,
      JSON.stringify(recordedChunks.map((chunk) => URL.createObjectURL(chunk)))
    );
    setIndexNum(indexNum - 1);
    setExpanded(false);
    setIsAiTalking(false);
    setRecordStarted(false);
    const previousChunks =
      JSON.parse(localStorage.getItem(`videoChunks_${indexNum - 1}`)) || [];
    setRecordedChunks(previousChunks);
    localStorage.setItem('videoGender', JSON.stringify(videoGender));
  };

  const handleChangeVideoShow = () => {
    setShowVideo(!showVideo);
  };

  const handleChangeVideoGender = (e) => {
    setVideoGender(!videoGender);
    localStorage.setItem('videoGender', JSON.stringify(!videoGender));
  };

  const StyledTypography = styled(Typography)({
    color: 'gray',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  });

  const TranscriptIcon = styled('span')({
    marginRight: '8px',
    display: 'inline-block',
    width: '0px',
    height: '18px',
    backgroundSize: 'cover',
  });

  const handleAnalyzeClick = async () => {
    stopAIResponseAudio();
    setRecordButtonLabel('Record');
    setRecordButtonColor('primary');
    setRecordStarted(false); // Reset recording state

    const updatedAnswers = handleChangeAnswer();
    await handleSubmitAnswer(updatedAnswers);
  };

  const handleChangeAnswer = () => {
    let newAnswers = [...answers];
    newAnswers[indexNum - 1] = tempAnswer;
    setAnswers(newAnswers);
    setExpanded(false);
    localStorage.setItem('recordStarted', '0');
    localStorage.setItem(
      `videoChunks_${indexNum}`,
      JSON.stringify(recordedChunks.map((chunk) => URL.createObjectURL(chunk)))
    ); // Save current chunks as Blob URLs

    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        console.log('microphone closed');
      };
    }

    if (stream) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      stream = null;
    }
    return newAnswers; // Return the updated answers
  };

  useEffect(() => {
    setRecordedChunks([]); // Reset recorded chunks on question change
    setRecordButtonLabel('Record');
    setRecordButtonColor('primary');
    setRecordStarted(false);
  }, [indexNum]);

  useEffect(() => {
    const savedGender = JSON.parse(localStorage.getItem('videoGender'));
    if (savedGender !== null) {
      setVideoGender(savedGender);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDisabled(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [indexNum]);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('Error accessing media devices.', err);
        });
    }
  }, []);

  console.log(TRAILBLAZE_DASHBOARD_URL);

  return (
    <div className="flex flex-col">
      <div className="p-[32px] flex flex-col gap-[20px] col-span-2">
        <Link href={TRAILBLAZE_DASHBOARD_URL}>
          <Card className="flex flex-col h-[100%] w-[290px] justify-between px-6 py-2 border cursor-pointer">
            <CardTitle className="text-[14px]  font-semibold text-[#171717] flex gap-2 ">
              <Image src={ArrowLeft} alt="Arrow left" />
              Cancel and return to dashboard{' '}
            </CardTitle>
          </Card>
        </Link>
        <div className="grid grid-cols-[2fr_1fr] gap-8">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row justify-between border-b-[1px] py-3 h-[85px]">
              <div className="flex w-[300px] items-center gap-4">
                <Image src={Users} alt="Users" />
                On the call
                <span className="w-[40px] h-[40px] flex items-center justify-center border border-orange-200 bg-orange-50 text-orange-600 rounded-[50%]">
                  1
                </span>
              </div>
              <div className="flex flex-col items-end">
                <CardDescription className="text-lg font-semibold text-[#171717]">
                  {formatTime(seconds)}
                </CardDescription>
                <CardDescription className="text-sm text-slate-500">
                  Time on call
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent
              className="flex items-center justify-center h-[500px]"
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                style={{
                  width: '100%', // Mantiene el ancho al 100%
                  height: '500px', // Fija la altura en 450px
                  transform: 'scaleX(-1)', // Espejo horizontal del video
                  borderRadius: '20px',
                  marginTop: '40px',
                  objectFit: 'cover', // Ajusta el video para cubrir el contenedor sin distorsionar
                }}
              ></video>
              <div
                style={{
                  width: '300px', // Doubled the size
                  height: '170px', // Doubled the size
                  margin: '0px 0px 0px 20px',
                  borderRadius: '20px',
                  position: 'absolute',
                  top: '40px',
                  left: '30px',
                  overflow: 'hidden',
                  // border: '1px solid white',
                }}
              >
                <CardMedia
                  component="video"
                  src="https://storage.googleapis.com/interviewai-app-public/woman-interview.mp4"
                  title="Interviewer Video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%', // Doubled the size
                    height: '100%', // Doubled the size

                    display: videoGender ? '' : 'none',
                  }}
                />
                <CardMedia
                  component="video"
                  src="https://storage.googleapis.com/interviewai-app-public/man-interview.mp4"
                  title="Interviewer Video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%', // Doubled the size
                    height: '100%', // Doubled the size
                    display: !videoGender ? '' : 'none',
                  }}
                />
              </div>
            </CardContent>
            <CardContent className="border m-6 rounded-[8px]">
              <div className="flex pt-8">
                <div className="flex gap-2 items-center">
                  <Image className="w-[20px]" src={InfoCircle} alt="Info" />
                  <CardDescription className="h-[25px] px-2 bg-slate-100 text-[12px] text-[#525252] rounded-[8px] flex items-center justify-center">
                    {' '}
                    Question {indexNum} of {totalNum}: {questionType}
                  </CardDescription>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={handleExpandClick}
                    disabled={recordStarted}
                    variant={'outline'}
                  >
                    {' '}
                    <Image src={Message} alt="Message" />
                  </Button>
                  <IconButton
                    variant={'outline'}
                    aria-label="change-gender"
                    color="primary"
                    size={`${isDesktop ? 'medium' : 'small'}`}
                    onClick={handleChangeVideoGender}
                    disabled={recordStarted}
                    sx={{
                      color: recordStarted ? 'gray' : 'primary.main',
                      pointerEvents: recordStarted ? 'none' : 'auto',
                    }}
                  >
                    <Image src={UsersBlack} alt="Change User" />
                  </IconButton>
                </div>
              </div>
              <div className="p-10 flex flex-col gap-2">
                <CardDescription className="text-[#525252] text-[14px]">
                  {' '}
                  {question.replace(/^\*\s+/, '')}
                </CardDescription>
                {showAnswerBox && (
                  <div className="flex border rounded-[8px] ">
                    <CardDescription className="w-[20%] border-r-[1px] p-4">
                      {' '}
                      Your Transcript
                    </CardDescription>
                    <Input
                      multiline
                      rows={2}
                      sx={{
                        width: '100%',
                        bgcolor: 'white',
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.8rem', md: '0.8rem' },
                        },
                      }}
                      value={tempAnswer}
                      onChange={(e) => {
                        setTempAnswer(e.target.value);
                      }}
                      onBlur={() => {
                        if (tempAnswer.trim() !== '') {
                          document.getElementById(
                            'analyzeButton'
                          ).style.display = 'flex';
                        }
                      }}
                      placeholder="Your answer typed out here"
                      className="p-4 h-[100%] border-none outline-none w-[80%]"
                      style={{
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  startIcon={<MicIcon />}
                  color={recordButtonColor}
                  onClick={handleStartRecordingClick}
                  className="flex gap-2"
                  variant={'outline'}
                >
                  {' '}
                  <Image src={Microphone} alt="Record" />
                  {recordButtonLabel}
                </Button>
                <Button
                  className="flex gap-2"
                  variant={'outline'}
                  onClick={handleDownloadRecording}
                  disabled={recordStarted || recordedChunks.length === 0}
                  sx={{
                    color:
                      recordedChunks.length === 0 || recordStarted
                        ? 'gray'
                        : 'primary.main',
                    borderColor:
                      recordedChunks.length === 0 || recordStarted
                        ? 'gray'
                        : 'primary.main',
                    '&:hover': {
                      borderColor:
                        recordedChunks.length === 0 || recordStarted
                          ? 'gray'
                          : 'primary.main',
                      boxShadow:
                        recordedChunks.length === 0 || recordStarted
                          ? 'none'
                          : '0 0 30px #74B3EE',
                    },
                    pointerEvents:
                      recordedChunks.length === 0 || recordStarted
                        ? 'none'
                        : 'auto',
                  }}
                >
                  <Image src={Download} alt="Download" />
                  Download
                </Button>

                <Button
                  id="analyzeButton"
                  className={
                    tempAnswer.trim() !== '' && !recordStarted
                      ? 'active bg-gradient-to-r from-[#99C0FF] to-blue-500  flex gap-2'
                      : 'bg-gradient-to-r from-[#99C0FF] to-blue-500  flex gap-2'
                  }
                  variant="outlined"
                  onClick={handleAnalyzeClick}
                  disabled={tempAnswer.trim() === '' || recordStarted}
                >
                  <Image src={Ia} alt="Download" />
                  {indexNum === 10
                    ? 'Analyze Full Interview'
                    : 'Analyze This Response'}
                </Button>

                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outlined"
                    onClick={handlePrev}
                    disabled={indexNum === 1 || recordStarted}
                  >
                    <Image src={ArrowLeft} alt="Arrow left" />
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleNext}
                    disabled={indexNum === totalNum || recordStarted}
                  >
                    <Image
                      className="rotate-180"
                      src={ArrowLeft}
                      alt="Arrow left"
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="h-[85px] border-b-[1px]">
              {' '}
              <CardTitle className="text-lg font-semibold text-[#171717] flex gap-2">
                Participants in call{' '}
              </CardTitle>
              <CardDescription className="text-slate-500">
                Those actively in the call{' '}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-b-[1px] w-[100%] h-[60px] flex justify-between items-center py-0">
              <CardDescription className="text-slate-900 text-md">
                Transcription
              </CardDescription>
              <Image
                src={ArrowLeft}
                alt="Arrow left"
                className="-rotate-90 w-2"
              />
            </CardContent>
            <CardContent className=" w-[100%] flex flex-col pt-4 gap-6">
              <CardDescription className="text-slate-900 text-md">
                Members
              </CardDescription>

              <CardDescription className="text-slate-900 text-md flex items-center gap-2">
                <span className="w-[50px] h-[40px] flex items-center justify-center border border-orange-200 bg-orange-50 text-orange-600 font-semibold rounded-[45%]">
                  AB
                </span>
                Student Name <span className="text-slate-500">(You)</span>
              </CardDescription>
              <CardDescription className="text-slate-900 text-md flex items-center gap-2">
                <span className="w-[50px] h-[40px] flex items-center justify-center border border-orange-200 bg-orange-50 text-orange-600 font-semibold rounded-[45%]">
                  TB
                </span>
                Trailblaze <span className="text-slate-500">(AI)</span>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col h-[100%] justify-between px-6 py-4 bg-[#FFF7ED] border border-[#FED7AA]">
          <CardTitle className="text-lg font-semibold text-[#171717] flex gap-2">
            Make sure your mic and video is on.{' '}
          </CardTitle>
          <CardDescription className="text-slate-500">
            Tori requires both in order to properly assess.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
