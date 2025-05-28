"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function ProductFilters() {
  const [priceRange, setPriceRange] = useState([0, 1000])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <Accordion type="multiple" defaultValue={["category", "price"]}>
          <AccordionItem value="category">
            <AccordionTrigger>Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="electronics" />
                  <Label htmlFor="electronics">Electronics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="clothing" />
                  <Label htmlFor="clothing">Clothing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="home" />
                  <Label htmlFor="home">Home & Decor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="accessories" />
                  <Label htmlFor="accessories">Accessories</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger>Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex items-center justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="rating">
            <AccordionTrigger>Rating</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rating-4" />
                  <Label htmlFor="rating-4" className="flex">
                    <span className="flex text-yellow-500">
                      {[...Array(4)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                      <span className="text-muted-foreground ml-1">& up</span>
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="rating-3" />
                  <Label htmlFor="rating-3" className="flex">
                    <span className="flex text-yellow-500">
                      {[...Array(3)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                      <span className="text-muted-foreground ml-1">& up</span>
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="rating-2" />
                  <Label htmlFor="rating-2" className="flex">
                    <span className="flex text-yellow-500">
                      {[...Array(2)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                      <span className="text-muted-foreground ml-1">& up</span>
                    </span>
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="availability">
            <AccordionTrigger>Availability</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="in-stock" />
                  <Label htmlFor="in-stock">In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="out-of-stock" />
                  <Label htmlFor="out-of-stock">Out of Stock</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
