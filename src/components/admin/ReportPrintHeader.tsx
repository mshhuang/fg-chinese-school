import React from 'react';

interface ReportPrintHeaderProps {
  title: string;
}

export function ReportPrintHeader({ title }: ReportPrintHeaderProps) {
  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}-${currentYear + 1}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { timeZone: 'America/New_York',  month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});

  return (
    <div className="hidden print:flex flex-col items-center w-full mb-8">
      {/* Top section with school name */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex items-center justify-center gap-6 mb-2 mt-2">
           <div className="text-black flex items-center justify-center relative">
             <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 70 C20 70 10 55 10 45 C10 35 25 45 40 60 C55 45 70 35 70 45 C70 55 60 70 35 70 Z" />
                <path d="M40 60 C35 35 20 20 20 10 C30 20 40 30 50 50 C60 30 70 20 80 10 C80 20 60 40 40 60 Z" />
             </svg>
             <span className="absolute bottom-1 right-[-10px] text-black font-bold italic text-sm">NY</span>
           </div>
           <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold tracking-widest text-black mb-1" style={{ fontFamily: 'SimSun, "Noto Serif TC", serif' }}>紐約佛光中文學校</h1>
              <h2 className="text-xl font-bold text-black" style={{ letterSpacing: '0.15em' }}>
                 <span className="italic text-lg mr-2">NY</span>IBPS NY CHINESE SCHOOL
              </h2>
           </div>
        </div>
        
        {/* Double black border like the image */}
        <div className="w-full border-t border-black mb-0.5"></div>
        <div className="w-full border-t-2 border-black mb-4"></div>
        
        {/* Report Title Section */}
        <div className="flex flex-col items-center gap-1 w-full text-center">
           <h3 className="text-xl font-black text-black uppercase tracking-wide mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{title}</h3>
           <p className="text-black font-semibold text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>School Year {schoolYear}</p>
           <p className="text-black text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>Data as of {formattedDate}, {formattedTime}</p>
        </div>
      </div>
    </div>
  );
}
