"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { useCart } from "./cart-provider"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border h-[420px]">
      <Link href={`/products/${product.id}`} className="aspect-square overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="object-cover transition-transform group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold tracking-tight h-12 flex items-start overflow-hidden">
          <Link href={`/products/${product.id}`} className="leading-tight overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden'
                }}
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={i < product.rating ? "currentColor" : "none"}
              stroke={i < product.rating ? "none" : "currentColor"}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          ))}
          <span className="text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold">${product.price.toFixed(2)}</p>
          {product.oldPrice && (
            <p className="text-sm text-muted-foreground line-through">${product.oldPrice.toFixed(2)}</p>
          )}
        </div>
        <div className="mt-auto">
          <Button size="sm" className="w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
