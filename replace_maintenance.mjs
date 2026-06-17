import fs from 'fs';
const path = 'src/pages/Login.tsx';
let data = fs.readFileSync(path, 'utf8');

const target = `                             return;
                          }
                          let firstName = 'Demo';`;

const replacement = `                             return;
                          }
                          
                          if (localStorage.getItem('system_maintenance') === 'true') {
                              alert("System is currently under maintenance. Please try again later.");
                              return;
                          }

                          let firstName = 'Demo';`;

data = data.split(target).join(replacement);
fs.writeFileSync(path, data);
