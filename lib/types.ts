export interface Product {
  id: string
  name: string
  description: string
  price: number
  oldPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  featured: boolean
  inStock: boolean
  features: string[]
}
