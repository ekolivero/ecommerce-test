"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DiscountModal({ isOpen, onClose }: DiscountModalProps) {
  const [copied, setCopied] = useState(false)
  const discountCode = "RIPPLE30"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-green-600">
            🎉 Welcome Discount!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Get 30% off your first purchase with the code below
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="bg-gray-100 border-2 border-dashed border-green-500 rounded-lg p-4 w-full text-center">
            <p className="text-sm text-gray-600 mb-2">Discount Code</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-bold text-green-600 tracking-widest">
                {discountCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="ml-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Save 30% on your entire order
            </p>
            <p className="text-xs text-gray-500">
              Valid for first-time customers only
            </p>
          </div>
          
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Start Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}