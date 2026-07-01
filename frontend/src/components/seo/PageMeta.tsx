import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Genex Technocrats'
const SITE_URL  = 'https://genextechnocrats.com'
const OG_IMAGE  = '/images/hero/slide2.png'

interface PageMetaProps {
  title: string
  description: string
  canonical?: string
  noIndex?: boolean
}

export function PageMeta({ title, description, canonical, noIndex = false }: PageMetaProps) {
  const fullTitle    = `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={`${SITE_URL}${OG_IMAGE}`} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={`${SITE_URL}${OG_IMAGE}`} />
    </Helmet>
  )
}
