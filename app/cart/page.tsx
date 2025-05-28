"use client"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (cart.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-16 flex flex-col items-center justify-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="relative w-20 h-20 overflow-hidden rounded">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.id}`} className="font-semibold hover:underline">
                  {item.name}
                </Link>
                <p className="text-muted-foreground text-sm">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeFromCart(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
        <div className="bg-muted/40 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{cartTotal > 50 ? "Free" : "$4.99"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${(cartTotal * 0.07).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${(cartTotal + (cartTotal > 50 ? 0 : 4.99) + cartTotal * 0.07).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <Button className="w-full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
