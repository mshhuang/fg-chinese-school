const fs = require('fs');
let content = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

content = content.replace(
    `<textarea \n                                required\n                                value={composeContent} \n                                onChange={(e) => setComposeContent(e.target.value)}\n                                className="w-full h-40 px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body text-base resize-none"\n                                placeholder="What do you want to announce?"\n                            />`,
    `<div className="bg-surface rounded-xl border border-outline-variant/50 overflow-hidden">\n                                <ReactQuill \n                                  theme="snow"\n                                  value={composeContent} \n                                  onChange={setComposeContent}\n                                  modules={modules}\n                                  className="h-48 pb-10"\n                                />\n                            </div>`
);

content = content.replace(
    `<p className="font-body text-lg text-on-surface-variant mb-2 whitespace-pre-wrap leading-relaxed">{displayContent}</p>`,
    `<div \n                                        className="font-body text-lg text-on-surface-variant mb-2 leading-relaxed prose prose-sm sm:prose-base max-w-none [&_p]:mb-2 [&_a]:text-primary [&_a]:underline"\n                                        dangerouslySetInnerHTML={{ __html: displayContent }}\n                                      />`
);

fs.writeFileSync('src/pages/Announcements.tsx', content);
