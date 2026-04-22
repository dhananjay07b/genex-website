export interface WagtailPage {
  id: number
  meta: {
    type: string
    detail_url: string
    slug: string
    first_published_at: string
  }
  title: string
}

export interface ProductPage extends WagtailPage {
  tagline: string
  description: string
  features: StreamField[]
}

export interface CaseStudyPage extends WagtailPage {
  client: string
  industry: string
  challenge: string
  solution: string
  result_metric: string
}

export interface BlogPostPage extends WagtailPage {
  author: string
  body: StreamField[]
  tags: string[]
  intro: string
}

export interface StreamField {
  type: string
  value: unknown
  id: string
}
