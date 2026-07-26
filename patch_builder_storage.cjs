const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderStorage.tsx', 'utf8');

const targetStr = `import { Trash2, Folder, File, RefreshCw, Eye, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '../lib/utils';`;

const replaceStr = `import { Trash2, Folder, File, RefreshCw, Eye, Image as ImageIcon, FileText, X } from 'lucide-react';
import { cn } from '../lib/utils';`;

code = code.replace(targetStr, replaceStr);

const stateTarget = `const [error, setError] = useState<string | null>(null);`;
const stateReplace = `const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{name: string, url: string, isImage: boolean} | null>(null);`;

code = code.replace(stateTarget, stateReplace);

const tableTarget = `<a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </a>`;
const tableReplace = `<button onClick={() => setPreviewFile({ name: file.name, url, isImage: !!isImage })} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Open in new tab">
                          <FileText className="w-4 h-4" />
                        </a>`;

code = code.replace(tableTarget, tableReplace);

const modalTarget = `</div>
    </div>
  );
}`;
const modalReplace = `</div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface/50 backdrop-blur-md">
              <h3 className="font-display text-xl text-on-surface font-bold truncate pr-4">{previewFile.name}</h3>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-surface-variant/20 p-4 flex items-center justify-center">
              {previewFile.isImage ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
              ) : (
                <iframe src={previewFile.url} className="w-full h-full rounded-lg shadow-sm border border-outline-variant/40 bg-white" title="PDF Preview" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(modalTarget, modalReplace);

fs.writeFileSync('src/pages/BuilderStorage.tsx', code);
console.log("Patched!");
