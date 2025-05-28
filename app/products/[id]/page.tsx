import { notFound } from "next/navigation"
import Image from "next/image"
import { products } from "@/lib/products"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductRecommendations from "@/components/product-recommendations"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.id === params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-500 mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={i < product.rating ? "currentColor" : "none"}
                  stroke={i < product.rating ? "none" : "currentColor"}
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Features</h2>
            <ul className="list-disc list-inside text-muted-foreground">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      <ProductRecommendations currentProductId={product.id} />
    </div>
  )
}
