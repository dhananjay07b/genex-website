/**
 * After a deploy, a tab that was already open still asks for the previous
 * build's code files, which no longer exist, so opening another page fails.
 * Reloading picks up the new build. The reload happens at most once a minute,
 * so a real outage (files missing for another reason) can't cause a reload loop.
 */
const RELOAD_KEY = 'genex-stale-build-reload'
const MIN_GAP_MS = 60_000

/** True for the errors browsers raise when a lazily loaded code or style file can't be fetched. */
export function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(message)
}

/** Whether a reload is allowed now: not already done in the last minute, and storage works to remember it. */
export function canReloadForNewBuild(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(RELOAD_KEY) ?? 0) >= MIN_GAP_MS
  } catch {
    // Storage blocked (private mode, site data off): without the guard, don't risk a loop.
    return false
  }
}

/** Reloads the page to load the new build, if canReloadForNewBuild() allows it. */
export function reloadForNewBuild(): void {
  if (!canReloadForNewBuild()) return
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    return
  }
  window.location.reload()
}
