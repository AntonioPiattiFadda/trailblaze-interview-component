import { useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardDescription, CardTitle, CardContent } from '../ui/card';
import { saveInterviewAnswers } from '@/services';

const AnalysisModal = ({ open, onClose, analysis }) => {
  const user = sessionStorage.getItem('routerQuery');
  const parsedUser = JSON.parse(user);

  useEffect(() => {
    if (!analysis) {
      return;
    }
    const analysisToSave = analysis.split('\n').join('</br>');
    saveInterviewAnswers(analysisToSave, parsedUser.jobId, parsedUser.studentId)
      .then(() => {
        alert('Interview data saved successfully!');
      })
      .catch((error) => {
        alert('Error saving interview answers:', error);

        console.error('Error saving interview answers:', error);
      });
  }, []);

  const analysisLines = analysis.split('\n');

  return (
    <div
      style={open ? { display: 'grid' } : { display: 'none' }}
      className="w-screen top-0 right-0 absolute backdrop-blur-lg z-50 min-h-[100vh]"
    >
      <Card className="w-1/2 mx-auto my-10 p-6">
        <CardTitle
          className="font-bold text-[32px] font-outfit"
          style={{
            color: '#f97316',
          }}
        >
          Trailblaze
        </CardTitle>
        <CardDescription className="text-xl text-black font-bold my-4">
          Question Analysis
        </CardDescription>
        <div className="flex items-center">
          <span className="h-[25px] px-2 bg-slate-100 text-[12px] text-[#525252] rounded-[8px] px-2 py-1 text-center">
            Question analysis
          </span>
        </div>
        <CardContent className="flex flex-col gap-2 border rounded-[8px] py-4 my-6">
          {
            <CardContent className="rounded-[8px] py-2 border text-[12px] flex flex-col gap-2">
              {analysisLines.map((line, index) => {
                return <p key={index}>{line}</p>;
              })}
              <br />
            </CardContent>
          }
        </CardContent>

        <CardContent>
          <Button onClick={onClose}>Done</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisModal;
