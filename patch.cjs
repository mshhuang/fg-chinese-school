const fs = require('fs');
let code = fs.readFileSync('src/components/RichTextEditor.tsx', 'utf8');

// Replace imports
code = code.replace(
  "import React, { useEffect, useRef } from 'react';",
  "import React, { useEffect, useRef, useState } from 'react';"
);

// Add state
code = code.replace(
  "const timeoutRef = useRef<any>(null);",
  "const timeoutRef = useRef<any>(null);\n  const [promptState, setPromptState] = useState<{ type: 'link' | 'youtube' | 'table' | null; val1: string; val2: string }>({ type: null, val1: '', val2: '' });"
);

// Replace addYoutube
code = code.replace(
  /const addYoutube = \(\) => \{\s*const url = window\.prompt\('YouTube URL'\);\s*if \(url\) \{\s*editor\.commands\.setYoutubeVideo\(\{ src: url \}\);\s*\}\s*\};/g,
  "const addYoutube = () => { setPromptState({ type: 'youtube', val1: '', val2: '' }); };"
);

// Replace setLink
code = code.replace(
  /const setLink = \(\) => \{[\s\S]*?editor\.chain\(\)\.focus\(\)\.extendMarkRange\('link'\)\.setLink\(\{ href: url \}\)\.run\(\);\s*\};/g,
  "const setLink = () => { const previousUrl = editor.getAttributes('link').href; setPromptState({ type: 'link', val1: previousUrl || '', val2: '' }); };"
);

// Replace insertTable
code = code.replace(
  /const insertTable = \(\) => \{\s*\/\/ Directly insert a 3x3 table without a blocking prompt, which causes focus loss\s*editor\.chain\(\)\.focus\(\)\.insertTable\(\{ rows: 3, cols: 3, withHeaderRow: true \}\)\.run\(\);\s*\};/g,
  "const insertTable = () => { setPromptState({ type: 'table', val1: '3', val2: '3' }); };"
);

// Add handlePromptSubmit
code = code.replace(
  "const ToolbarButton =",
  `const handlePromptSubmit = () => {
    if (promptState.type === 'link') {
      if (promptState.val1 === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: promptState.val1 }).run();
      }
    } else if (promptState.type === 'youtube') {
      if (promptState.val1) {
        editor.chain().focus().setYoutubeVideo({ src: promptState.val1 }).run();
      }
    } else if (promptState.type === 'table') {
      const rows = parseInt(promptState.val1, 10);
      const cols = parseInt(promptState.val2, 10);
      if (rows && cols) {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      }
    }
    setPromptState({ type: null, val1: '', val2: '' });
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePromptSubmit();
    } else if (e.key === 'Escape') {
      setPromptState({ type: null, val1: '', val2: '' });
    }
  };

  const ToolbarButton =`
);

// Add prompt UI
code = code.replace(
  /<div className="flex flex-wrap items-center gap-1 p-2 border-b border-outline-variant\/30 bg-surface-variant\/10">[\s\S]*?<\/div>/g,
  `$&
      {promptState.type && (
        <div className="p-2 border-b border-outline-variant/30 bg-surface-variant/20 flex gap-2 items-center">
          {promptState.type === 'link' && (
            <>
              <span className="text-xs font-bold text-on-surface-variant">URL:</span>
              <input 
                type="text" 
                className="flex-1 px-2 py-1 text-sm rounded bg-surface border border-outline-variant/50 focus:border-primary outline-none" 
                value={promptState.val1} 
                onChange={e => setPromptState(prev => ({...prev, val1: e.target.value}))}
                onKeyDown={handlePromptKeyDown}
                placeholder="https://..."
                autoFocus
              />
            </>
          )}
          {promptState.type === 'youtube' && (
            <>
              <span className="text-xs font-bold text-on-surface-variant">YouTube URL:</span>
              <input 
                type="text" 
                className="flex-1 px-2 py-1 text-sm rounded bg-surface border border-outline-variant/50 focus:border-primary outline-none" 
                value={promptState.val1} 
                onChange={e => setPromptState(prev => ({...prev, val1: e.target.value}))}
                onKeyDown={handlePromptKeyDown}
                placeholder="https://youtube.com/..."
                autoFocus
              />
            </>
          )}
          {promptState.type === 'table' && (
            <>
              <span className="text-xs font-bold text-on-surface-variant">Rows:</span>
              <input 
                type="number" 
                className="w-16 px-2 py-1 text-sm rounded bg-surface border border-outline-variant/50 focus:border-primary outline-none" 
                value={promptState.val1} 
                onChange={e => setPromptState(prev => ({...prev, val1: e.target.value}))}
                onKeyDown={handlePromptKeyDown}
                min="1"
                autoFocus
              />
              <span className="text-xs font-bold text-on-surface-variant">Cols:</span>
              <input 
                type="number" 
                className="w-16 px-2 py-1 text-sm rounded bg-surface border border-outline-variant/50 focus:border-primary outline-none" 
                value={promptState.val2} 
                onChange={e => setPromptState(prev => ({...prev, val2: e.target.value}))}
                onKeyDown={handlePromptKeyDown}
                min="1"
              />
            </>
          )}
          <button type="button" onClick={handlePromptSubmit} className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold">Apply</button>
          <button type="button" onClick={() => setPromptState({ type: null, val1: '', val2: '' })} className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded text-xs font-bold">Cancel</button>
        </div>
      )}`
);

fs.writeFileSync('src/components/RichTextEditor.tsx', code);
console.log('Patched');
