import React, { useEffect } from 'react';
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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image,
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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[150px] p-4',
          '[&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0',
          '[&_a]:text-primary [&_a]:underline cursor-text',
          '[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:my-4',
          '[&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-h-[600px] [&_img]:w-auto',
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
      const currentSelection = editor.state.selection;
      editor.commands.setContent(value, { emitUpdate: false }); // false to not emit update
      // We don't restore selection here as this is mostly for external updates
      // Tiptap handles controlled input nicely but it's tricky. The current standard is uncontrolled with initial content, 
      // but if we need controlled, we only update if content actually differs.
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertTable = () => {
    const rows = window.prompt('Rows', '3');
    const cols = window.prompt('Columns', '3');
    if (rows && cols) {
      editor.chain().focus().insertTable({ rows: parseInt(rows, 10), cols: parseInt(cols, 10), withHeaderRow: true }).run();
    }
  };

  const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled = false, title }: any) => (
    <button
      type="button"
      onClick={onClick}
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
        <ToolbarButton onClick={addYoutube} isActive={editor.isActive('youtube')} icon={YoutubeIcon} title="YouTube Video" />
        <ToolbarButton onClick={insertTable} isActive={editor.isActive('table')} icon={TableIcon} title="Table" />
        
        <div className="w-px h-6 bg-outline-variant/30 mx-1" />
        
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} title="Redo" />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
