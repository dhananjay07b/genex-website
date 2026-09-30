import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { ContentAccess } from '@/types/api'

interface AccessFieldProps {
  access: ContentAccess
  price: string
  onChange: (next: { access: ContentAccess; price: string }) => void
  accessError?: string
  priceError?: string
}

const OPTIONS: { value: ContentAccess; label: string }[] = [
  { value: 'free', label: 'Free: anyone' },
  { value: 'members', label: 'Members only: signed-in accounts' },
  { value: 'paid', label: 'Paid: purchase required' },
]

export function AccessField({ access, price, onChange, accessError, priceError }: AccessFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Access"
        options={OPTIONS}
        value={access}
        error={accessError}
        onChange={e => onChange({ access: e.target.value as ContentAccess, price })}
      />
      {access === 'paid' && (
        <Input
          label="Price (INR)"
          type="number"
          min={1}
          step="1"
          inputMode="decimal"
          placeholder="e.g. 199"
          value={price}
          error={priceError}
          onChange={e => onChange({ access, price: e.target.value })}
        />
      )}
      {access === 'paid' && (
        <p className="text-xs text-text-muted -mt-1">Checkout isn&apos;t live yet. Paid content shows its price with &ldquo;Checkout coming soon&rdquo;.</p>
      )}
    </div>
  )
}
