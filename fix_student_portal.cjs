const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentPortal.tsx', 'utf8');

const target = `              })() : checkInStatus === 'checked_out' ? \`\${userName} is ready to go home\` : 'Not Checked In'}`;

const replace = `              })() : checkInStatus === 'checked_out' ? (() => {
                if (!checkInTime) return \`\${userName} is ready to go home\`;
                const d = new Date(checkInTime);
                const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});
                const dateStr = \`\${(d.getMonth() + 1)}/\${d.getDate()}/\${d.getFullYear()}\`;
                return \`\${userName} is ready to go home。\${timeStr} on \${dateStr}\`;
              })() : 'Not Checked In'}`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/StudentPortal.tsx', code);
console.log('done fixing student portal');
