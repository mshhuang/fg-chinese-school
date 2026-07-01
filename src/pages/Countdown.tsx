import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flower2 } from "lucide-react";

// Set your target launch date here
const LAUNCH_DATE = new Date("2026-12-31T00:00:00").getTime();

export default function Countdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 10000,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE - now;

      if (distance <= 0) {
        clearInterval(timer);
        navigate("/"); // Redirect to front page when time is up
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
          total: distance,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 mix-blend-multiply pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-container/40 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-container/40 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full">
        <div className="mb-8 shadow-lg bg-surface-container-low rounded-3xl p-4">
          <img src="/picture1.png" alt="IBPS NY Chinese School" className="w-48 h-48 object-contain" />
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight">
          Portal Opening Soon
        </h1>
        
        <p className="font-body text-xl text-on-surface-variant mb-12 max-w-2xl">
          We are putting the finishing touches on the new school management system. 
          The portal will automatically open when the countdown ends.
        </p>

        <div className="flex gap-4 md:gap-8 justify-center">
           {[
             { label: 'Days', value: timeLeft.days },
             { label: 'Hours', value: timeLeft.hours },
             { label: 'Minutes', value: timeLeft.minutes },
             { label: 'Seconds', value: timeLeft.seconds }
           ].map((unit, idx) => (
             <div key={idx} className="flex flex-col items-center">
               <div className="w-20 h-20 md:w-32 md:h-32 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-lg flex items-center justify-center mb-3">
                 <span className="font-display text-4xl md:text-6xl font-bold text-on-surface">
                   {unit.value.toString().padStart(2, '0')}
                 </span>
               </div>
               <span className="font-label text-sm md:text-base font-bold text-on-surface-variant uppercase tracking-widest">
                 {unit.label}
               </span>
             </div>
           ))}
        </div>
        
        <button 
           onClick={() => navigate("/")}
           className="mt-16 px-6 py-3 border border-outline-variant rounded-full font-label text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
           Skip to Demo
        </button>
      </div>
    </div>
  );
}
