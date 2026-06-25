const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentPortal.tsx', 'utf8');
const oldDyn = 'className={`flex flex-col gap-1.5 p-4 rounded-xl bg-${color}-container/10 border border-${color}-container/20`}';
const oldDyn2 = 'className={`font-label font-bold text-${color}`}';

const newDyn = 'className={cn("flex flex-col gap-1.5 p-4 rounded-xl border", color === "primary" ? "bg-primary-container/10 border-primary-container/20" : color === "secondary" ? "bg-secondary-container/10 border-secondary-container/20" : "bg-tertiary-container/10 border-tertiary-container/20")}';
const newDyn2 = 'className={cn("font-label font-bold", color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary" : "text-tertiary")}';

code = code.replace(oldDyn, newDyn);
code = code.replace(oldDyn2, newDyn2);
fs.writeFileSync('src/pages/StudentPortal.tsx', code);
