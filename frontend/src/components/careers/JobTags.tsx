import type { JobListItem } from '@/types/api'

/** Department, location and type pills; shared by the listing and the job page. */
export function JobTags({ job }: { job: Pick<JobListItem, 'department' | 'location' | 'job_type'> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {job.department && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
          {job.department}
        </span>
      )}
      {job.location && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
          {job.location}
        </span>
      )}
      {job.job_type && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
          {job.job_type}
        </span>
      )}
    </div>
  )
}
