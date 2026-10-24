import { useId, useState, type ReactNode } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import LinkIcon from '@mui/icons-material/Link'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import { cn, getMediaUrl } from '@/lib/utils'
import { RichTextImageDialog, type UploadedImage } from './RichTextImageDialog'

/**
 * Images are uploaded Wagtail images. Besides src/alt they carry Wagtail's
 * editor attributes (data-embedtype/data-id/data-format/data-alt), which the
 * server turns into an image reference the CMS editor understands. src is
 * shown via getMediaUrl, since the backend hands back /media/… paths.
 */
const WagtailImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => (attributes.src ? { src: getMediaUrl(attributes.src as string) } : {}),
      },
      'data-embedtype': { default: null },
      'data-id': { default: null },
      'data-format': { default: null },
      'data-alt': { default: null },
    }
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  error?: string
  label?: string
  /** Screen-reader name for the editing area when there's no visible label. */
  ariaLabel?: string
  minHeightClassName?: string
}

/**
 * The GeLearn rich-text editor: blog posts and the Company Studio. Its tools
 * are exactly what the server keeps and the Wagtail editor offers for the same
 * content (backend pages/editor_features.py), so nothing is lost either way.
 */
export function RichTextEditor({ value, onChange, error, label, ariaLabel, minHeightClassName = 'min-h-96' }: RichTextEditorProps) {
  const labelId = useId()
  // StarterKit includes Link and Underline (Tiptap v3). No inline code: Wagtail's editor here has code blocks only.
  const link = { openOnClick: false, autolink: true }
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link, code: false }), WagtailImage],
    // Re-render on every change so the toolbar's active states (bold, lists…) follow the cursor.
    shouldRerenderOnTransaction: true,
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: cn('rich-text px-6 py-5 outline-none text-sm text-text-primary', minHeightClassName),
        role: 'textbox',
        'aria-multiline': 'true',
        // Named by the visible label when there is one.
        ...(label ? { 'aria-labelledby': labelId } : { 'aria-label': ariaLabel ?? 'Content' }),
      },
    },
  })

  if (!editor) return null

  return (
    <div>
      {/* A <label> can't point at a contenteditable, so the editor references this by id. */}
      {label && <p id={labelId} className="block text-sm font-semibold text-text-primary mb-1.5">{label}</p>}
      <div className={cn('border rounded-xl overflow-hidden bg-white', error ? 'border-red-500' : 'border-border')}>
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  label: string
  children: ReactNode
}

function ToolbarButton({ onClick, active, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface hover:text-text-primary'
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const [imageDialog, setImageDialog] = useState(false)

  function addLink() {
    const url = window.prompt('Link URL')
    if (!url) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function insertImage(image: UploadedImage, alt: string) {
    setImageDialog(false)
    editor.chain().focus().insertContent({
      type: 'image',
      attrs: { src: image.url, alt, 'data-embedtype': 'image', 'data-id': String(image.id), 'data-format': 'fullwidth', 'data-alt': alt },
    }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface">
      <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <FormatBoldIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <FormatItalicIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <FormatUnderlinedIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughSIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <span className="text-xs font-extrabold">H2</span>
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <span className="text-xs font-extrabold">H3</span>
      </ToolbarButton>
      <ToolbarButton label="Heading 4" active={editor.isActive('heading', { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        <span className="text-xs font-extrabold">H4</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <FormatListBulletedIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <FormatListNumberedIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <FormatQuoteIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <CodeIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <HorizontalRuleIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton label="Insert link" active={editor.isActive('link')} onClick={addLink}>
        <LinkIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={() => setImageDialog(true)}>
        <ImageOutlinedIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <UndoIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <RedoIcon sx={{ fontSize: 17 }} />
      </ToolbarButton>

      {imageDialog && <RichTextImageDialog onInsert={insertImage} onClose={() => setImageDialog(false)} />}
    </div>
  )
}
