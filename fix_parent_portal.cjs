const fs = require('fs');
let code = fs.readFileSync('src/pages/ParentPortal.tsx', 'utf8');

const target = `                    })() : checkInStatus === 'checked_out' ? \`\${children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? 'Mei' : activeChild === 'wei' ? 'Wei' : 'Student')} is ready to go home\` : 'Not Checked In'}`;

const replace = `                    })() : checkInStatus === 'checked_out' ? (() => {
                        const cName = children.find(c => c.user_id === activeChild)?.first_name || (activeChild === 'mei' ? 'Mei' : activeChild === 'wei' ? 'Wei' : 'Student');
                        if (!checkInTime) return \`\${cName} is ready to go home\`;
                        const d = new Date(checkInTime);
                        const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});
                        const dateStr = \`\${(d.getMonth() + 1)}/\${d.getDate()}/\${d.getFullYear()}\`;
                        return \`\${cName} is ready to go home。\${timeStr} on \${dateStr}\`;
                    })() : 'Not Checked In'}`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/ParentPortal.tsx', code);
console.log('done fixing parent portal');
