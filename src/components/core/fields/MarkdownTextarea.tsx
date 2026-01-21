'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  height?: number;
  label?: string;
  hint?: string;
  className?: string;
  required?: boolean;
}

export function MarkdownTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  height = 150,
  label,
  hint,
  className = '',
  required = false,
}: MarkdownTextareaProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Enable markdown-style input rules
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    onUpdate: ({ editor }) => {
      // Get plain text with line breaks preserved
      onChange(editor.getText());
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-3',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        className="bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        style={{ height }}
      >
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto text-gray-900 [&_.ProseMirror]:min-h-full [&_.ProseMirror]:h-full [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
        />
      </div>
      {hint && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
    </div>
  );
}
