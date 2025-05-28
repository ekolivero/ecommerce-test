import { products } from "@/lib/products"
import ProductCard from "./product-card"

interface ProductRecommendationsProps {
  currentProductId: string
}

export default function ProductRecommendations({ currentProductId }: ProductRecommendationsProps) {
  // Get 4 random products that are not the current product
  const recommendations = products
    .filter((product) => product.id !== currentProductId)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
