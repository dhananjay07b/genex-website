import { Button } from '@/components/ui/Button'
import { setConsent, useConsent } from '@/lib/consent'

/**
 * Asks once (both sites share the answer) whether Google Analytics may run, and
 * again whenever a footer's "Cookie settings" reopens it. Allow and Decline are the
 * same size: declining must be as easy as accepting. It doesn't block the page.
 * Rendered outside the router, so the policy link is a plain <a>.
 */
export function ConsentBanner() {
  const { consent, reopened } = useConsent()
  if (consent && !reopened) return null

  return (
    <section
      aria-labelledby="consent-heading"
      className="fixed inset-x-4 bottom-4 z-60 rounded-xl border border-border bg-white p-5 shadow-lg sm:inset-x-auto sm:left-6 sm:max-w-md"
    >
      <h2 id="consent-heading" className="text-sm font-bold text-text-primary">
        Analytics cookies Test
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        We&rsquo;d like to use Google Analytics cookies to see how visitors use this site, so we can improve it.
        Nothing is collected unless you allow it.{' '}
        <a href="/privacy-policy" className="font-semibold text-primary underline-offset-2 hover:underline">
          Privacy Policy
        </a>
      </p>
      {reopened && consent && (
        <p className="mt-2 text-xs text-text-muted">
          Currently: analytics {consent === 'granted' ? 'allowed' : 'declined'}.
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button size="sm" onClick={() => setConsent('granted')}>Allow analytics</Button>
        <Button size="sm" variant="secondary" onClick={() => setConsent('denied')}>Decline</Button>
      </div>
    </section>
  )
}
