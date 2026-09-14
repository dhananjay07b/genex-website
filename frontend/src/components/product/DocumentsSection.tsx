import { motion } from 'framer-motion'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { getMediaUrl } from '@/lib/utils'
import type { DocumentItemValue } from '@/types/api'

interface DocumentsSectionProps {
  heading: string
  documents: DocumentItemValue[]
}

export function DocumentsSection({ heading, documents }: DocumentsSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-24 border-t border-[#f1f5f9]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-bold text-[#162456] leading-tight mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {heading}
        </motion.h2>

        <div className="flex flex-col divide-y divide-[#eaf0f6] border-t border-b border-[#eaf0f6]">
          {documents.map((doc, i) => {
            const url = doc.document?.url ? getMediaUrl(doc.document.url) : null
            const Wrapper = url ? 'a' : 'div'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Wrapper
                  {...(url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-4 py-5 hover:bg-[#f8fafc] transition-colors duration-200 -mx-2 px-2 rounded-lg"
                >
                  <div className="size-11 rounded-xl bg-[#f0f4f8] text-[#0f2930] flex items-center justify-center shrink-0">
                    <DescriptionOutlinedIcon style={{ fontSize: 20 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#162456] leading-snug truncate">{doc.title}</p>
                    {doc.note && <p className="text-xs text-[#62748e] mt-0.5">{doc.note}</p>}
                  </div>
                  {url && (
                    <FileDownloadOutlinedIcon
                      style={{ fontSize: 18 }}
                      className="text-[#9aa5b1] group-hover:text-primary transition-colors duration-200 shrink-0"
                    />
                  )}
                </Wrapper>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
