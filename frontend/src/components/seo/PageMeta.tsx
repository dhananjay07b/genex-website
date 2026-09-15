import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Genex Technocrats'
// Resolved from the current origin so canonical/OG URLs are correct whether this
// page is served from the marketing domain or the gelearn subdomain.
const SITE_URL  = typeof window !== 'undefined' ? window.location.origin : 'https://genextechnocrats.com'
const OG_IMAGE  = '/images/hero/slide2.png'

interface PageMetaProps {
  title: string
  description: string
  canonical?: string
  noIndex?: boolean
  image?: string | null
}

export function PageMeta({ title, description, canonical, noIndex = false, image }: PageMetaProps) {
  const fullTitle    = `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined
  const ogImageUrl   = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}${OG_IMAGE}`

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
      <meta property="og:image"       content={ogImageUrl} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImageUrl} />
    </Helmet>
  )
}
