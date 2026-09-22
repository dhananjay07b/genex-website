import type { ReactNode } from 'react'

interface MosaicGridProps<T> {
  items: T[]
  renderCell: (item: T, index: number) => ReactNode
}

const SQUARE = 'aspect-square'
const RECT = 'aspect-[2/1]'

/**
 * Repeating 4-image mosaic: 2 squares stacked over 1 rectangle on one side,
 * matched in total height by a single tall image on the other side. Mirrors
 * left/right every other block. Falls back to a plain 1/2/3-image row for a
 * partial trailing block — no empty placeholder cells are ever rendered.
 */
export function MosaicGrid<T>({ items, renderCell }: MosaicGridProps<T>) {
  const blocks: T[][] = []
  for (let i = 0; i < items.length; i += 4) blocks.push(items.slice(i, i + 4))

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, blockIndex) => {
        const mirrored = blockIndex % 2 === 1
        const startIndex = blockIndex * 4
        const [sq1, sq2, rect, tall] = block

        if (block.length === 4) {
          return (
            <div
              key={blockIndex}
              className={[
                'grid grid-cols-1 gap-4 md:grid-rows-2',
                mirrored ? 'md:grid-cols-[2fr_1fr_1fr]' : 'md:grid-cols-[1fr_1fr_2fr]',
              ].join(' ')}
            >
              <div className={[SQUARE, 'md:row-start-1', mirrored ? 'md:col-start-2' : 'md:col-start-1'].join(' ')}>
                {renderCell(sq1, startIndex)}
              </div>
              <div className={[SQUARE, 'md:row-start-1', mirrored ? 'md:col-start-3' : 'md:col-start-2'].join(' ')}>
                {renderCell(sq2, startIndex + 1)}
              </div>
              <div className={[RECT, 'md:row-start-2 md:col-span-2', mirrored ? 'md:col-start-2' : 'md:col-start-1'].join(' ')}>
                {renderCell(rect, startIndex + 2)}
              </div>
              <div
                className={[
                  SQUARE, 'md:aspect-auto md:row-start-1 md:row-span-2',
                  mirrored ? 'md:col-start-1' : 'md:col-start-3',
                ].join(' ')}
              >
                {renderCell(tall, startIndex + 3)}
              </div>
            </div>
          )
        }

        if (block.length === 3) {
          return (
            <div key={blockIndex} className="grid grid-cols-2 gap-4">
              <div className={SQUARE}>{renderCell(sq1, startIndex)}</div>
              <div className={SQUARE}>{renderCell(sq2, startIndex + 1)}</div>
              <div className={[RECT, 'col-span-2'].join(' ')}>{renderCell(rect, startIndex + 2)}</div>
            </div>
          )
        }

        if (block.length === 2) {
          return (
            <div key={blockIndex} className="grid grid-cols-2 gap-4">
              <div className={SQUARE}>{renderCell(sq1, startIndex)}</div>
              <div className={SQUARE}>{renderCell(sq2, startIndex + 1)}</div>
            </div>
          )
        }

        return (
          <div key={blockIndex} className="aspect-video">
            {renderCell(sq1, startIndex)}
          </div>
        )
      })}
    </div>
  )
}
