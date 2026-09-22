export function DashboardFooterStrip() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-10 bg-white border-t border-border flex items-center justify-center">
      <p className="text-xs text-text-muted">
        &copy; {new Date().getFullYear()} Genex Technocrats Pvt. Ltd. All rights reserved.
      </p>
    </div>
  )
}
