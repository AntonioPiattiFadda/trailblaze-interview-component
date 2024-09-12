'use client';
// chrome://flags/#unsafely-treat-insecure-origin-as-secure
import React, { useState, useContext, useEffect } from 'react';
import { CircularProgress, useMediaQuery } from '@mui/material';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { useRouter } from 'next/router';
import AppContext from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

//API with Backend
export default function Starter() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeDescription, setResumeDescription] = useState('');
  const { questions, setQuestions } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(router.query).length > 0) {
      sessionStorage.setItem('routerQuery', JSON.stringify(router.query));
    }
  }, [router.query]);

  const submitResumeJob = async () => {
    if (jobDescription.trim().length < 50) {
      alert('Job description must be at least 50 characters long.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const response = await fetch('/api/submit_resume', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        resume: resumeDescription,
        jobDescription: jobDescription,
      }),
    });
    console.log('request received');

    if (!response.ok) {
      // handle error case
      const errorData = await response.json();
      console.error(errorData);
      setIsLoading(false);
    } else {
      let res = await response.json();
      const questionsArray = res.question
        .trim()
        .split('\n')
        .map((data) => data.trim());

      setQuestions(questionsArray);
      router.push('/interview');
      setIsLoading(false);
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume_recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResumeDescription(data.data);
    } catch (error) {
      console.error('Error:', error); // Log the error
    }
  };

  const handleFileChangeResume = (event) => {
    // This will give you File object
    const uploadedFile = event.target.files[0];

    // This will give you the file path
    const filePath = uploadedFile;

    setResumeFile(filePath);
  };

  const Recognize_resume = async (event) => {
    await uploadFile(resumeFile);
  };

  return (
    <div className="w-[100vw] h-[100vh] flex items-center justify-center">
      <div
        style={{
          width: '100%',
          height: '100%',
          zIndex: '2',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          position: 'fixed',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: isLoading ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </div>

      <div className="flex flex-col gap-10 m-10 max-w-[950px]">
        <Card className="w-[100%] place-self-center	">
          <CardHeader>
            <CardTitle
              className="font-bold text-[32px] font-outfit"
              style={{
                color: '#f97316',
              }}
            >
              Trailblaze
            </CardTitle>
            <CardDescription className=" flex flex-row items-center gap-2 text-xl text-black font-bold">
              <span className="w-[40px] h-[40px] flex items-center justify-center border border-orange-200 bg-orange-50 text-orange-600 rounded-[50%]">
                1
              </span>
              Upload Resume (Required)
            </CardDescription>
            <CardDescription className="text-sm text-slate-500">
              By providing a resume, this will tailor your interview more
              accurately.
            </CardDescription>
            <Input
              className=" w-[25%] flex mt-2 text-sm font-normal"
              type="file"
              onChange={handleFileChangeResume}
            />
            {resumeFile && (
              <p>
                {resumeFile.name.length > 10
                  ? `${resumeFile.name.substring(0, 10)}...`
                  : resumeFile.name}
              </p>
            )}
          </CardHeader>
        </Card>

        <Card className="w-[100%] place-self-center	">
          <CardHeader>
            <CardDescription className=" flex flex-row items-center gap-2 text-xl text-black font-bold">
              <span className="w-[40px] h-[40px] flex items-center justify-center border border-orange-200 bg-orange-50 text-orange-600 rounded-[50%]">
                2
              </span>
              Copy & Paste Job Description (Required)
            </CardDescription>
            <CardDescription className="text-sm text-slate-500">
              By providing a job description, this will tailor your interview
              more accurately.
            </CardDescription>
            <Input
              className=" w-[100%] flex text-sm font-normal "
              type="text"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
              }}
            />
          </CardHeader>
        </Card>

        <Card className="w-[100%] place-self-center	">
          <CardHeader>
            <CardDescription className=" flex flex-row items-center gap-2 text-xl text-black font-bold">
              <span className="w-[40px] h-[40px] flex items-center justify-center border border-orange-200 bg-orange-50 text-orange-600 rounded-[50%]">
                3
              </span>
              Click Below to Start Your Interview
            </CardDescription>

            <Button
              variant=""
              className="text-white w-[25%] self-center px-4 py-2 bg-gray-900 rounded-md"
              endIcon={<DoubleArrowIcon />}
              onClick={() => {
                Recognize_resume();
                submitResumeJob();
              }}
              size={`${isDesktop ? 'medium' : 'small'}`}
            >
              Get Started
            </Button>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
