import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button.jsx";

// Editor visual (igual que el portal): negrita, cursiva, títulos,
// listas, enlaces + vista previa. Guarda HTML.
export function DescriptionEditor({ value, onChange }) {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const btn = (activo) => (activo ? "default" : "outline");
  const linkActual = () => {
    const url = window.prompt("URL del enlace:", editor.getAttributes("link").href ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-wrap gap-1 border-b bg-muted p-2">
        <Button type="button" size="sm" variant={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </Button>
        <Button type="button" size="sm" variant={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </Button>
        <Button type="button" size="sm" variant={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button type="button" size="sm" variant={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Button>
        <Button type="button" size="sm" variant={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • Lista
        </Button>
        <Button type="button" size="sm" variant={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. Lista
        </Button>
        <Button type="button" size="sm" variant={btn(editor.isActive("link"))} onClick={linkActual}>
          Enlace
        </Button>
        <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => setShowPreview((v) => !v)}>
          {showPreview ? "Editar" : "Vista previa"}
        </Button>
      </div>
      {showPreview ? (
        <div className="min-h-40 p-4 text-sm" dangerouslySetInnerHTML={{ __html: value || "" }} />
      ) : (
        <EditorContent editor={editor} className="min-h-40 p-4 text-sm focus:outline-none [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-blue-600 [&_a]:underline" />
      )}
    </div>
  );
}
