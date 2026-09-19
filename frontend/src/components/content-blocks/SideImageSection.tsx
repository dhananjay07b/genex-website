import { motion } from 'framer-motion'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { getMediaUrl } from '@/lib/utils'
import { RichText } from '@/components/ui/RichText'
import { renderStreamField, type BlockComponentMap } from '@/lib/streamfield/renderStreamField'
import type { BulletPointValue, SideImageSectionValue } from '@/types/api'

function BulletItem({ value }: { value: unknown }) {
  const { bold_title, point } = value as BulletPointValue
  return (
    <div className="flex items-start gap-3">
      <CheckCircleOutlinedIcon style={{ fontSize: 20 }} className="text-primary shrink-0 mt-0.5" />
      <p className="text-base text-text-muted leading-relaxed">
        <span className="font-bold text-[#162456]">{bold_title}</span>
        {point && <> — {point}</>}
      </p>
    </div>
  )
}

function TextParagraph({ value }: { value: unknown }) {
  return <p className="text-base text-text-muted leading-relaxed">{value as string}</p>
}

const bodyBlockMap: BlockComponentMap = {
  bullet: BulletItem,
  text: TextParagraph,
}

export function SideImageSection({ value }: { value: SideImageSectionValue }) {
  const imageOnRight = value.image?.position !== 'left'
  const image = value.image?.image

  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: imageOnRight ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={imageOnRight ? 'lg:order-1' : 'lg:order-2'}
          >
            {value.heading && (
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-6">{value.heading}</h2>
            )}
            {value.description && (
              <RichText
                html={value.description}
                className="text-base text-text-muted leading-relaxed [&_h2]:text-[#162456] [&_h3]:text-[#162456] [&_h4]:text-[#162456] [&_strong]:text-[#162456] [&_b]:text-[#162456]"
              />
            )}
            {value.body_blocks.length > 0 && (
              <div className="mt-6 space-y-4">
                {renderStreamField(value.body_blocks, bodyBlockMap)}
              </div>
            )}
          </motion.div>

          {image && (
            <motion.div
              initial={{ opacity: 0, x: imageOnRight ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className={imageOnRight ? 'lg:order-2' : 'lg:order-1'}
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10)]">
                <img
                  src={getMediaUrl(image.url)}
                  alt={value.image?.alt ?? ''}
                  width={image.width}
                  height={image.height}
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
