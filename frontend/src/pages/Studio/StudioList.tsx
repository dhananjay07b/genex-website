import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { EmptyState } from '@/pages/Account/dashboard/EmptyState'
import { ConfirmDeleteDialog } from '@/pages/Account/dashboard/ConfirmDeleteDialog'
import { apiFetch } from '@/lib/api/client'
import type { SnippetListResponse } from '@/types/api'
import type { StudioItem } from '@/types/studio'
import { getStudioType } from './studioTypes'

export default function StudioList() {
  const { type } = useParams<{ type: string }>()
  const config = getStudioType(type)
  const location = useLocation()
  const navigate = useNavigate()
  const flash = (location.state as { flash?: string } | null)?.flash
  const [items, setItems] = useState<StudioItem[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<StudioItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!config) return
    let cancelled = false
    apiFetch<SnippetListResponse<StudioItem>>(`/api/studio/${config.key}/?limit=200`)
      .then(res => { if (!cancelled) { setItems(res.results); setLoadError(false) } })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [config])

  if (!config) return <Navigate to="/studio" replace />
  const Icon = config.icon

  async function confirmDelete() {
    if (!config || !pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await apiFetch(`/api/studio/${config.key}/${pendingDelete.id}/`, { method: 'DELETE' })
      setItems(prev => prev?.filter(i => i.id !== pendingDelete.id) ?? null)
      setPendingDelete(null)
      // Drop the flash from history state so it doesn't reappear.
      if (flash) navigate(location.pathname, { replace: true, state: null })
    } catch {
      setDeleteError("Couldn't delete it. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageMeta title={`${config.label} — Company Studio`} description={config.description} canonical={`/studio/${config.key}`} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">{config.label}</h2>
          <p className="text-sm text-text-muted mt-1">{config.description}</p>
        </div>
        <Link to={`/studio/${config.key}/new`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-white text-sm font-bold px-5 py-2.5 hover:opacity-90 transition-opacity shrink-0">
          <AddIcon sx={{ fontSize: 17 }} /> New {config.singular}
        </Link>
      </div>

      {flash && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold px-4 py-3">
          <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> {flash}
        </p>
      )}
      {deleteError && <p role="alert" className="text-sm font-semibold text-red-600">{deleteError}</p>}

      {loadError ? (
        <p className="text-sm text-red-600">Couldn&apos;t load your {config.label.toLowerCase()}. Refresh to try again.</p>
      ) : items === null ? (
        <div className="min-h-40" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Icon sx={{ fontSize: 24 }} />}
          title={`No ${config.label.toLowerCase()} yet`}
          description={`Anything you publish here appears on GeLearn under your company's name.`}
          action={
            <Link to={`/studio/${config.key}/new`} className="text-sm font-bold text-primary hover:underline">
              Publish your first {config.singular}
            </Link>
          }
        />
      ) : (
        <ul className="border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {items.map(item => (
            <li key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-surface/60 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-text-primary truncate">{item.title}</p>
                <p className="text-xs text-text-muted mt-1 truncate">
                  {config.listMeta(item)}
                  {item.owner && <> · by {item.owner.display_name || item.owner.username}</>}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link to={config.publicPath(item)} title="View on GeLearn" aria-label={`View ${item.title} on GeLearn`}
                  className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-white hover:text-primary">
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                </Link>
                <Link to={`/studio/${config.key}/${item.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors">
                  <EditOutlinedIcon sx={{ fontSize: 14 }} /> Edit
                </Link>
                <button type="button" onClick={() => setPendingDelete(item)} aria-label={`Delete ${item.title}`}
                  className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600">
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          label={pendingDelete.title}
          message="will be removed from GeLearn for everyone."
          confirming={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
