const fs = require('fs');
let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
content = content.replace(
    /<textarea[\s\S]*?onChange={\(e\) => setComposeContent\(e\.target\.value\)}[\s\S]*?placeholder="What do you want to announce\?"[\s\S]*?\/>/,
    `<div className="bg-surface rounded-xl border border-outline-variant/50 overflow-hidden">
                                <ReactQuill 
                                  theme="snow"
                                  value={composeContent} 
                                  onChange={setComposeContent}
                                  modules={modules}
                                  className="h-48 pb-10"
                                />
                            </div>`
);
fs.writeFileSync('src/pages/Announcements.tsx', content);
