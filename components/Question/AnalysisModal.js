import { Button } from '../ui/button';
import { Card, CardDescription, CardTitle, CardContent } from '../ui/card';

const AnalysisModal = ({ open, onClose, analysis }) => {
  console.log(analysis);

  return (
    <div
      style={open ? { display: 'grid' } : { display: 'none' }}
      className="w-screen top-0 right-0 absolute backdrop-blur-lg z-50 min-h-[100vh]"
    >
      <Card className="w-1/2  mx-auto my-10 p-6">
        <CardTitle
          className="font-bold text-[32px] font-outfit"
          style={{
            color: '#f97316',
          }}
        >
          Trailblaze
        </CardTitle>
        <CardDescription className="text-xl text-black font-bold my-4">
          Question Analysis{' '}
        </CardDescription>{' '}
        <span className="h-[25px] px-2 bg-slate-100 text-[12px] text-[#525252] rounded-[8px] px-2 py-1 text-center ">
          {' '}
          {/* Question {indexNum} of {totalNum}: {questionType} */}
          Question
        </span>
        <CardContent
          className="flex flex-col gap-2 border rounded-[8px] py-4 mt-6"
          dividers={true}
        >
          {analysis.split('\n').map((line, index) => {
            console.log(line);

            if (line === '') return null;
            return (
              <CardContent
                className="rounded-[8px] py-2 border text-[12px]"
                key={index}
              >
                {line}
                <br />
              </CardContent>
            );
          })}
        </CardContent>
        <CardContent>
          <Button onClick={onClose}>Done</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisModal;
