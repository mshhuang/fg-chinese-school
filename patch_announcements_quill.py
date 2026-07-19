import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# Add imports for Smile icon
content = content.replace('Image as ImageIcon } from "lucide-react";', 'Image as ImageIcon, Smile } from "lucide-react";')

# Register Fonts
fonts_registration = """
import MagicUrl from 'quill-magic-url';

const Font = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display'];
Quill.register(Font, true);

Quill.register('modules/magicUrl', MagicUrl);
"""
content = content.replace("import MagicUrl from 'quill-magic-url';\n\nQuill.register('modules/magicUrl', MagicUrl);", fonts_registration.strip())


# Update modules config
modules_target = """const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {"""

modules_replacement = """const modules = {
  toolbar: {
    container: [
      [{ 'font': ['sans-serif', 'serif', 'monospace', 'comic-sans', 'inter', 'roboto', 'display'] }],
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video', 'emoji'],
      ['clean']
    ],
    handlers: {
      emoji: function() {
        document.dispatchEvent(new CustomEvent('open-quill-emoji-modal', { detail: { quill: this.quill } }));
      },"""

content = content.replace(modules_target, modules_replacement)

# Add emojiModal state
state_target = """  const [quillModal, setQuillModal] = useState<{ isOpen: boolean, type: 'video' | 'link', quill: any, url: string }>({ isOpen: false, type: 'video', quill: null, url: '' });"""
state_replacement = state_target + """\n  const [emojiModal, setEmojiModal] = useState<{ isOpen: boolean, quill: any }>({ isOpen: false, quill: null });"""
content = content.replace(state_target, state_replacement)

# Add event listener for emoji modal
listener_target = """    const handleQuillModal = (e: any) => {
        setQuillModal({ isOpen: true, type: e.detail.type, quill: e.detail.quill, url: '' });
    };
    document.addEventListener('open-quill-modal', handleQuillModal);"""

listener_replacement = listener_target + """
    const handleQuillEmojiModal = (e: any) => {
        setEmojiModal({ isOpen: true, quill: e.detail.quill });
    };
    document.addEventListener('open-quill-emoji-modal', handleQuillEmojiModal);"""
content = content.replace(listener_target, listener_replacement)

# Add removeEventListener for emoji modal
remove_listener_target = """    return () => document.removeEventListener('open-quill-modal', handleQuillModal);"""
remove_listener_replacement = """    return () => {
      document.removeEventListener('open-quill-modal', handleQuillModal);
      document.removeEventListener('open-quill-emoji-modal', handleQuillEmojiModal);
    };"""
content = content.replace(remove_listener_target, remove_listener_replacement)


# Add Emoji Picker UI
emoji_picker_ui = """
       {/* Emoji Modal */}
       {emojiModal.isOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-surface-container-lowest rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                   <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
                       <h3 className="font-title font-bold text-on-surface flex items-center gap-2">
                           <Smile className="w-5 h-5 text-primary"/> Insert Emoji
                       </h3>
                       <button onClick={() => setEmojiModal(prev => ({...prev, isOpen: false}))} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="p-4 grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
                       {['😀', '😂', '🥰', '😎', '🤔', '😭', '👍', '👎', '❤️', '🔥', '✨', '🎉', '🌟', '👀', '🙌', '👏', '🙏', '💯', '😊', '😉', '😍', '😘', '😜', '😝', '😡', '🤬', '🤯', '🥶', '🥵', '😱', '🤫', '🤥', '🤡', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠', '💐', '🌸', '💮', '🪷', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'].map(emoji => (
                           <button key={emoji} onClick={() => {
                               if (emojiModal.quill) {
                                   const range = emojiModal.quill.getSelection(true) || { index: 0, length: 0 };
                                   emojiModal.quill.insertText(range.index, emoji);
                                   emojiModal.quill.setSelection(range.index + 1);
                               }
                               setEmojiModal({ isOpen: false, quill: null });
                           }} className="text-2xl hover:bg-surface-variant rounded-lg p-2 transition-colors flex items-center justify-center">
                               {emoji}
                           </button>
                       ))}
                   </div>
               </div>
           </div>
       )}
"""

quill_modal_target = "       {/* Quill Modal */}"
content = content.replace(quill_modal_target, emoji_picker_ui + "\n" + quill_modal_target)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)

