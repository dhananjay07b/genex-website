import type { ComponentType, ReactNode } from 'react'
import type { StreamBlock } from '@/types/api'

export type BlockComponentMap = Record<string, ComponentType<{ value: unknown; blockId: string }>>

/**
 * Renders a heterogeneous StreamField `body` array by looking up each block's
 * `type` in `componentMap`. Unknown block types (e.g. a new CMS block type the
 * frontend hasn't caught up to yet) render nothing instead of crashing, with a
 * dev-only warning to surface the gap during development.
 */
export function renderStreamField(
  body: StreamBlock<unknown>[] | undefined,
  componentMap: BlockComponentMap,
): ReactNode[] {
  if (!body) return []
  return body.map((block) => {
    const Component = componentMap[block.type]
    if (!Component) {
      if (import.meta.env.DEV) {
        console.warn(`renderStreamField: no component registered for block type "${block.type}" (id: ${block.id})`)
      }
      return null
    }
    return <Component key={block.id} value={block.value} blockId={block.id} />
  })
}
