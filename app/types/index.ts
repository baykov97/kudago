export interface City {
  id: number
  name: string
  slug: string
  timezone: string
  coords: {
    lat: number
    lon: number
  }
}

export interface EventImage {
  image: string
  source: {
    name: string
    link: string
  }
}

export interface EventDate {
  start: number
  end: number
}

export interface Event {
  id: number
  title: string
  slug: string
  description: string
  body_text: string
  publication_date: string
  location?: {
    id: number
    name: string
    slug: string
    address: string
    coords: {
      lat: number
      lon: number
    }
  }
  categories: string[]
  tags: string[]
  age_restriction: string | null
  price: string
  is_free: boolean
  images: EventImage[]
  dates: EventDate[]
  place: {
    id: number
    name: string
    slug: string
    address: string
    coords: {
      lat: number
      lon: number
    }
  }
  site_url: string
  short_title: string
  tags_do: string[]
}

export interface EventsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Event[]
}

export interface EventParams {
  location?: string
  actual_since?: string
  actual_until?: string
  page_size?: number
  page?: number
  categories?: string
  tags?: string
  search?: string
  text_format?: 'html' | 'plain' | 'text'
}

export interface CachedData<T> {
  data: T
  timestamp: number
}

