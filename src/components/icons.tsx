export const BuilderIconCustom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="50" cy="50" r="15" />
    <path d="M 40 28 L 40 10 A 5 5 0 0 1 45 5 L 55 5 A 5 5 0 0 1 60 10 L 60 28 A 21.5 21.5 0 0 1 65.5 30.5 L 78.5 17.5 A 5 5 0 0 1 85.5 17.5 L 92.5 24.5 A 5 5 0 0 1 92.5 31.5 L 79.5 44.5 A 21.5 21.5 0 0 1 82 50 A 21.5 21.5 0 0 1 79.5 55.5 L 92.5 68.5 A 5 5 0 0 1 92.5 75.5 L 85.5 82.5 A 5 5 0 0 1 78.5 82.5 L 65.5 69.5 A 21.5 21.5 0 0 1 60 72 L 60 90 A 5 5 0 0 1 55 95 L 45 95 A 5 5 0 0 1 40 90 L 40 72 A 21.5 21.5 0 0 1 34.5 69.5 L 21.5 82.5 A 5 5 0 0 1 14.5 82.5 L 7.5 75.5 A 5 5 0 0 1 7.5 68.5 L 20.5 55.5 A 21.5 21.5 0 0 1 18 50 A 21.5 21.5 0 0 1 20.5 44.5 L 7.5 31.5 A 5 5 0 0 1 7.5 24.5 L 14.5 17.5 A 5 5 0 0 1 21.5 17.5 L 34.5 30.5 A 21.5 21.5 0 0 1 40 28 Z" />
  </svg>
);

export const AdminIconCustom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Head profile */}
    <path d="M 50 15 C 30 15 15 30 15 50 C 15 65 25 75 25 85 C 25 90 20 90 35 90 H 55" />
    <path d="M 15 50 C 10 52 10 60 15 62 C 15 65 18 68 18 70" />
    
    {/* Stand of the scales */}
    <path d="M 65 25 V 75 M 55 75 H 75 M 65 30 V 22 C 65 20 66 18 68 18 C 70 18 71 20 71 22 V 30" />
    <circle cx="65" cy="25" r="3" fill="currentColor" stroke="none" />
    <path d="M 60 70 L 70 70 M 58 75 H 72" />
    
    {/* Balance beam */}
    <path d="M 40 30 Q 65 35 90 30" />
    
    {/* Left scale */}
    <path d="M 40 30 L 32 60 H 48 Z" />
    <path d="M 32 60 C 32 65 48 65 48 60" />
    
    {/* Right scale */}
    <path d="M 90 30 L 82 60 H 98 Z" />
    <path d="M 82 60 C 82 65 98 65 98 60" />
  </svg>
);

export const StaffIconCustom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="15" y="35" width="70" height="50" rx="8" />
    <path d="M 35 35 V 20 C 35 15 40 10 45 10 H 55 C 60 10 65 15 65 20 V 35" />
    <line x1="15" y1="50" x2="85" y2="50" />
    <circle cx="50" cy="50" r="5" fill="currentColor" />
  </svg>
);

export const VolunteerIconCustom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Heart */}
    <path d="M 50 70 L 25 45 C 15 35 25 20 35 20 C 45 20 50 30 50 30 C 50 30 55 20 65 20 C 75 20 85 35 75 45 Z" fill="currentColor" stroke="none" />
    
    {/* Hands holding it */}
    <path d="M 10 75 C 20 85 35 90 50 90 C 65 90 80 85 90 75" />
    <path d="M 20 85 C 20 70 30 65 45 65" />
    <path d="M 80 85 C 80 70 70 65 55 65" />
  </svg>
);

export const TeacherIconCustom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" stroke="none" className={className}>
    <circle cx="50" cy="28" r="14" />
    <path d="M25 80 C 25 55, 40 48, 50 48 C 65 48, 75 56, 75 80 Z" />
    
    <path d="M19 72 L 12 36 L 15 35 L 22 71 Z" />
    <circle cx="21" cy="74" r="7" />
    
    <path d="M51 56 H 88 V 82 H 51 Z" fill="currentColor" />
    <path d="M54 59 H 85 V 79 H 54 Z" fill="white" />
    <rect x="69" y="59" width="3" height="20" fill="currentColor" />
    <rect x="75" y="64" width="7" height="2" fill="currentColor" />
    <rect x="75" y="69" width="7" height="2" fill="currentColor" />
    <rect x="75" y="74" width="7" height="2" fill="currentColor" />
  </svg>
);

export const StudentIconCustom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Child Head */}
    <circle cx="50" cy="35" r="18" />
    
    {/* Eyes */}
    <circle cx="43" cy="32" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="57" cy="32" r="2.5" fill="currentColor" stroke="none" />
    
    {/* Smile */}
    <path d="M 44 42 Q 50 48 56 42" />
    
    {/* Hair tuft */}
    <path d="M 50 17 C 45 10 55 5 45 0" strokeWidth="4" />
    
    {/* Body */}
    <path d="M 32 50 C 20 60 15 80 15 95 H 85 C 85 80 80 60 68 50" />
    <path d="M 50 53 V 95" />
  </svg>
);
