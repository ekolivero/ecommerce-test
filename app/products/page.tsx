import { products } from "@/lib/products"
import ProductFilters from "@/components/product-filters"
import ProductGrid from "@/components/product-grid"

export default function ProductsPage() {
  return (
    <div className="container px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <ProductFilters />
        <ProductGrid products={products} />
      </div>
    </div>
  )
}
