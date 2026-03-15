"use client"

import { useRef } from "react"
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { Markdown } from "tiptap-markdown"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  ImagePlus,
  Undo,
  Redo,
  Minus,
} from "lucide-react"
import { toast } from "sonner"

interface ArticleEditorProps {
  content: string // Markdown format
  onChange: (markdown: string) => void // Returns Markdown
}

async function uploadImageFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append("image", file)

  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
    const json = await res.json() as { success: boolean; data?: { url: string }; message?: string }
    if (!json.success) {
      toast.error(json.message ?? "Image upload failed")
      return null
    }
    return json.data?.url ?? null
  } catch {
    toast.error("Upload failed — is the server running?")
    return null
  }
}

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    startXRef.current = e.clientX
    const imgEl = e.currentTarget.parentElement?.querySelector("img") as HTMLImageElement | null
    const attrs = node.attrs as { width: number | null }
    startWidthRef.current = imgEl?.offsetWidth ?? attrs.width ?? 300

    const onMouseMove = (moveEvent: MouseEvent): void => {
      const newWidth = Math.max(80, startWidthRef.current + (moveEvent.clientX - startXRef.current))
      updateAttributes({ width: newWidth })
    }

    const onMouseUp = (): void => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const attrs = node.attrs as { src: string; alt?: string; title?: string; width: number | null }

  return (
    <NodeViewWrapper
      style={{
        display: "inline-block",
        position: "relative",
        maxWidth: "100%",
        width: attrs.width ? `${attrs.width}px` : "auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attrs.src}
        alt={attrs.alt ?? ""}
        title={attrs.title ?? undefined}
        draggable={false}
        style={{ width: "100%", display: "block" }}
      />
      {selected && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 14,
            height: 14,
            cursor: "nwse-resize",
            background: "#3b82f6",
            borderBottomRightRadius: 4,
            zIndex: 10,
          }}
        />
      )}
    </NodeViewWrapper>
  )
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const w = element.getAttribute("width")
          return w ? parseInt(w, 10) : null
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.width) return {}
          return { width: String(attributes.width) }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})

export function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing your article..." }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      const storage = e.storage as unknown as { markdown: { getMarkdown: () => string } }
      onChange(storage.markdown.getMarkdown())
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-1",
      },
      // Handle paste: intercept image files and upload them
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? [])
        const imageItem = items.find((item) => item.type.startsWith("image/"))
        if (!imageItem) return false

        event.preventDefault()
        const file = imageItem.getAsFile()
        if (!file) return true

        void uploadImageFile(file).then((url) => {
          if (url) {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image!.create({ src: url })
              )
            )
          }
        })
        return true
      },
      // Handle drop: drag image files from desktop into editor
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? [])
        const imageFile = files.find((f) => f.type.startsWith("image/"))
        if (!imageFile) return false

        event.preventDefault()
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

        void uploadImageFile(imageFile).then((url) => {
          if (url) {
            const node = view.state.schema.nodes.image!.create({ src: url })
            const transaction = view.state.tr.insert(coordinates?.pos ?? view.state.selection.from, node)
            view.dispatch(transaction)
          }
        })
        return true
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const addImage = (): void => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const url = await uploadImageFile(file)
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
    input.click()
  }

  const setLink = (): void => {
    const url = window.prompt("Enter URL:")
    if (!url) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors hover:bg-muted ${
        active ? "bg-muted text-foreground" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-lg border bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b p-2 sticky top-0 bg-background z-10">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link">
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert Image (or paste/drop)">
          <ImagePlus className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="p-6 md:p-10">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
