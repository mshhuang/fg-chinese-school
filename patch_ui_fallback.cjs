const fs = require('fs');
let content = fs.readFileSync('src/pages/BuilderDatabase.tsx', 'utf8');

const updatedUI = `
                 {/* Item 8 */}
                 <div className="p-5 flex justify-between items-center group">
                    <div>
                       <div className="flex items-center gap-1 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer">
                          Storage Image Transformations
                       </div>
                       <div className="mt-1 font-mono text-[13px] text-on-surface-variant">
                          Unavailable in plan
                       </div>
                    </div>
                    <button className="px-3 py-1 bg-[#61E7A5] text-emerald-950 font-bold text-xs rounded hover:bg-[#61E7A5]/90 transition-colors">
                       Upgrade
                    </button>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Fallback API Data Display */}
        {usageData && Object.keys(usageData).length > 0 && (
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden mb-8 p-6">
             <h3 className="font-bold text-lg text-on-surface mb-4">Raw API Response</h3>
             <pre className="text-xs text-on-surface-variant font-mono bg-surface-lowest p-4 rounded-xl overflow-auto max-h-[300px]">
                {JSON.stringify(usageData, null, 2)}
             </pre>
          </div>
        )}
`;

content = content.replace(/                 \{\/\* Item 8 \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, updatedUI);
fs.writeFileSync('src/pages/BuilderDatabase.tsx', content);
