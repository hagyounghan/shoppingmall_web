import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link2, Image as ImageIcon,
  Heading1, Heading2, Undo, Redo, Code,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rich-editor min-h-[180px] px-3 py-2 text-sm focus:outline-none',
      },
    },
  });

  // sync external value changes (e.g. when modal opens)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, title: string, icon: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
    >
      {icon}
    </button>
  );

  const handleAddLink = () => {
    const url = window.prompt('URL을 입력하세요');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const handleAddImage = () => {
    const url = window.prompt('이미지 URL을 입력하세요');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-slate-50">
        {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1', <Heading1 size={15}/>)}
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', <Heading2 size={15}/>)}
        <div className="w-px h-4 bg-slate-200 mx-1"/>
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), '굵게', <Bold size={15}/>)}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), '기울임', <Italic size={15}/>)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), '밑줄', <UnderlineIcon size={15}/>)}
        {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), '취소선', <Strikethrough size={15}/>)}
        {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), '코드', <Code size={15}/>)}
        <div className="w-px h-4 bg-slate-200 mx-1"/>
        {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), '왼쪽', <AlignLeft size={15}/>)}
        {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), '가운데', <AlignCenter size={15}/>)}
        {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), '오른쪽', <AlignRight size={15}/>)}
        <div className="w-px h-4 bg-slate-200 mx-1"/>
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '목록', <List size={15}/>)}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '번호 목록', <ListOrdered size={15}/>)}
        <div className="w-px h-4 bg-slate-200 mx-1"/>
        {btn(editor.isActive('link'), handleAddLink, '링크', <Link2 size={15}/>)}
        {btn(false, handleAddImage, '이미지', <ImageIcon size={15}/>)}
        <div className="w-px h-4 bg-slate-200 mx-1 ml-auto"/>
        {btn(false, () => editor.chain().focus().undo().run(), '실행 취소', <Undo size={15}/>)}
        {btn(false, () => editor.chain().focus().redo().run(), '다시 실행', <Redo size={15}/>)}
      </div>
      {/* 에디터 영역 */}
      <div className="bg-white relative">
        {!editor.getText() && placeholder && (
          <p className="absolute top-2 left-3 text-sm text-slate-300 pointer-events-none">{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
