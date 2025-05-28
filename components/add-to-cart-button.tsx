"use client"

import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { useCart } from "./cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`,
    })
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center">{quantity}</span>
        <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button className="w-full" onClick={handleAddToCart}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  )
}
