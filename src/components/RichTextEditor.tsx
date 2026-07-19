import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { cn } from '../lib/utils';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, Heading3, List, ListOrdered, 
  Quote, Code, ImageIcon, Link as LinkIcon, Youtube as YoutubeIcon, 
  Table as TableIcon, Undo, Redo 
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Type here...', className }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timeoutRef = useRef<any>(null);
  const [promptState, setPromptState] = useState<{ type: 'link' | 'youtube' | 'table' | null; val1: string; val2: string }>({ type: null, val1: '', val2: '' });

  const processFile = (file: File, editorView: any, event: Event) => {
    if (!file.type.startsWith('image/')) return false;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      
      // If we have coordinates from a drop event, insert there
      if (event && (event as any).clientX !== undefined && editorView) {
          const coordinates = editorView.posAtCoords({ left: (event as any).clientX, top: (event as any).clientY });
          if (coordinates) {
              editorView.dispatch(editorView.state.tr.insert(coordinates.pos, editorView.state.schema.nodes.image.create({ src })));
              return;
          }
      }
      
      // Otherwise just insert at cursor
      editor?.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    return true;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Youtube.configure({
        inline: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 300);
    },
    onBlur: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onChange(editor.getHTML());
    },
    editorProps: {
      handleDrop: function(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          let handled = false;
          Array.from(event.dataTransfer.files).forEach(file => {
             if (processFile(file, view, event)) {
                 handled = true;
             }
          });
          return handled;
        }
        return false;
      },
      handlePaste: function(view, event, slice) {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          let handled = false;
          Array.from(event.clipboardData.files).forEach(file => {
             if (processFile(file, view, event)) {
                 handled = true;
             }
          });
          return handled;
        }
        return false;
      },
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[150px] p-4',
          '[&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0',
          '[&_a]:text-primary [&_a]:underline cursor-text',
          '[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:my-4',
          '[&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-h-[600px] [&_img]:w-auto [&_img]:inline-block',
          '[&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-outline-variant/50',
          '[&_td]:border [&_td]:border-outline-variant/50 [&_td]:p-2',
          '[&_th]:border [&_th]:border-outline-variant/50 [&_th]:p-2 [&_th]:bg-surface-variant/30',
          'tiptap-editor break-normal whitespace-pre-wrap'
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (editor.isFocused) return; // Prevent overwriting content and cursor jumping while the user is actively typing
      editor.commands.setContent(value, { emitUpdate: false }); // false to not emit update
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach(file => {
          processFile(file, null, e as any);
      });
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const addYoutube = () => { setPromptState({ type: 'youtube', val1: '', val2: '' }); };

  const setLink = () => { const previousUrl = editor.getAttributes('link').href; setPromptState({ type: 'link', val1: previousUrl || '', val2: '' }); };

  const insertTable = () => { setPromptState({ type: 'table', val1: '3', val2: '3' }); };

  const handlePromptSubmit = () => {
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

  const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled = false, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()} // Prevent editor focus loss when clicking toolbar buttons
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-lg transition-colors",
        isActive ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-surface-variant",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("flex flex-col border border-outline-variant/50 rounded-xl overflow-hidden bg-surface", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-outline-variant/30 bg-surface-variant/10">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
        
        <div className="w-px h-6 bg-outline-variant/30 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />
        
        <div className="w-px h-6 bg-outline-variant/30 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Blockquote" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={Code} title="Code Block" />
        
        <div className="w-px h-6 bg-outline-variant/30 mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Link" />
        <ToolbarButton onClick={addImage} isActive={false} icon={ImageIcon} title="Image" />
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
        <ToolbarButton onClick={addYoutube} isActive={editor.isActive('youtube')} icon={YoutubeIcon} title="YouTube Video" />
        <ToolbarButton onClick={insertTable} isActive={editor.isActive('table')} icon={TableIcon} title="Table" />
        
        <div className="w-px h-6 bg-outline-variant/30 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} title="Redo" />
      </div>
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
      )}

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
