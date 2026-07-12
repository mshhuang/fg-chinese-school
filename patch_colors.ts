import fs from 'fs';
let content = fs.readFileSync('src/pages/StaffAttendance.tsx', 'utf-8');

// Replace standard colors
content = content.replace(/bg-\[#FCFBF8\]/g, 'bg-surface-container-lowest');
content = content.replace(/bg-\[#EBECE5\]/g, 'bg-surface-container-low');
content = content.replace(/bg-\[#E0E2D8\]/g, 'bg-surface-variant');
content = content.replace(/bg-\[#F4F2EB\]/g, 'bg-surface');
content = content.replace(/bg-\[#8B7524\]/g, 'bg-primary');
content = content.replace(/bg-\[#D4AE4B\]/g, 'bg-secondary');
content = content.replace(/text-\[#5C5542\]/g, 'text-on-surface-variant');
content = content.replace(/text-\[#3D382D\]/g, 'text-on-surface');
content = content.replace(/text-\[#8B7524\]/g, 'text-primary');
content = content.replace(/text-\[#8A8476\]/g, 'text-on-surface-variant');
content = content.replace(/text-\[#1a1a1a\]/g, 'text-on-surface');
content = content.replace(/text-\[#A06752\]/g, 'text-secondary');
content = content.replace(/text-\[#4B7A6A\]/g, 'text-tertiary');
content = content.replace(/border-\[#E6E1D6\]/g, 'border-outline-variant/30');
content = content.replace(/border-\[#D4AE4B\]/g, 'border-primary/50');
content = content.replace(/border-\[#8B7524\]/g, 'border-primary');
content = content.replace(/hover:bg-\[#F4F2EB\]/g, 'hover:bg-surface-variant');
content = content.replace(/hover:bg-\[#C19842\]/g, 'hover:bg-secondary/90');
content = content.replace(/hover:bg-\[#8B7524\]/g, 'hover:bg-primary');
content = content.replace(/hover:border-\[#D4AE4B\]\/30/g, 'hover:border-primary/30');
content = content.replace(/hover:border-\[#D4AE4B\]\/50/g, 'hover:border-primary/50');
content = content.replace(/hover:border-\[#8B7524\]/g, 'hover:border-primary');
content = content.replace(/focus-within:border-\[#8B7524\]/g, 'focus-within:border-primary');
content = content.replace(/group-hover:border-\[#8B7524\]/g, 'group-hover:border-primary');
content = content.replace(/group-hover:text-\[#8B7524\]/g, 'group-hover:text-primary');
content = content.replace(/group-hover:bg-\[#D4AE4B\]/g, 'group-hover:bg-primary');
content = content.replace(/text-\[1\.1rem\]/g, 'text-lg');

fs.writeFileSync('src/pages/StaffAttendance.tsx', content);
