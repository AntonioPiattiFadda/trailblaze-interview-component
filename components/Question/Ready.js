import React, { useState } from 'react';
import {
  Stack,
  TextField,
  Container,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';

export const Ready = ({ startInterview }) => {
  const [videoApproved, setVideoApproved] = useState(false);
  const [microphoneApproved, setMicrophoneApproved] = useState(false);

  const handleApproveVideo = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoApproved(true);
    } catch (error) {
      console.error('Video access denied');
    }
  };

  const handleApproveMicrophone = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneApproved(true);
    } catch (error) {
      console.error('Microphone access denied');
    }
  };

  return (
    <Container maxWidth="sm">
      <Card className="w-[100%] place-self-center	">
        <CardHeader>
          <video
            playsInline=""
            loop
            id="video"
            muted=""
            autoPlay={true}
            src="/interview.mp4"
            style={{ borderRadius: '15px' }}
          ></video>
          <CardDescription className="text-lg text-center text-black font-bold">
            Answer 10 Questions
          </CardDescription>
          <CardDescription className="text-sm text-center text-slate-500">
            First, approve proper permissions for the app. When you're done,
            review your answers and discover insights.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex gap-2">
          <Button
            className="w-[50%]"
            onClick={handleApproveVideo}
            disabled={videoApproved}
          >
            Approve Video Access
          </Button>
          <Button
            className="w-[50%]"
            onClick={handleApproveMicrophone}
            disabled={microphoneApproved}
          >
            Approve Microphone Access
          </Button>
        </CardContent>
        <CardContent>
          <Button
            onClick={startInterview}
            disabled={!videoApproved || !microphoneApproved}
            className="w-[25%] m-auto text-center"
          >
            Start
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};
