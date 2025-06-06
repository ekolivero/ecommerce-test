import type { Product } from "./types"

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Premium wireless headphones with active noise cancellation, 30-hour battery life, and exceptional sound quality for an immersive audio experience.",
    price: 249.99,
    oldPrice: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center",
    category: "electronics",
    rating: 4.8,
    reviews: 256,
    featured: true,
    inStock: true,
    features: [
      "Active noise cancellation",
      "30-hour battery life",
      "Bluetooth 5.0",
      "Built-in microphone",
      "Touch controls",
    ],
  },
  {
    id: "2",
    name: "Smart Fitness Tracker",
    description:
      "Track your fitness goals with this advanced smart tracker featuring heart rate monitoring, sleep tracking, and water resistance up to 50 meters.",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center",
    category: "electronics",
    rating: 4.5,
    reviews: 189,
    featured: true,
    inStock: true,
    features: [
      "Heart rate monitoring",
      "Sleep tracking",
      "Water resistant (50m)",
      "7-day battery life",
      "Smartphone notifications",
    ],
  },
  {
    id: "3",
    name: 'Ultra HD 4K Smart TV - 55"',
    description:
      "Experience stunning visuals with this 55-inch 4K Ultra HD Smart TV featuring HDR technology, built-in streaming apps, and voice control.",
    price: 699.99,
    oldPrice: 799.99,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop&crop=center",
    category: "electronics",
    rating: 4.7,
    reviews: 312,
    featured: true,
    inStock: true,
    features: [
      "4K Ultra HD resolution",
      "HDR technology",
      "Built-in streaming apps",
      "Voice control",
      "Multiple HDMI ports",
    ],
  },
  {
    id: "4",
    name: "Professional Blender",
    description:
      "A high-performance blender with multiple speed settings, perfect for smoothies, soups, and more. Features a durable stainless steel design.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center",
    category: "home",
    rating: 4.6,
    reviews: 178,
    featured: false,
    inStock: true,
    features: ["1000W motor", "Variable speed control", "Pulse function", "64 oz container", "Dishwasher-safe parts"],
  },
  {
    id: "5",
    name: "Ergonomic Office Chair",
    description:
      "Work in comfort with this ergonomic office chair featuring adjustable height, lumbar support, and breathable mesh material.",
    price: 199.99,
    oldPrice: 249.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center",
    category: "home",
    rating: 4.4,
    reviews: 145,
    featured: false,
    inStock: true,
    features: ["Adjustable height", "Lumbar support", "Breathable mesh back", "360° swivel", "Durable construction"],
  },
  {
    id: "6",
    name: "Premium Coffee Maker",
    description:
      "Brew the perfect cup of coffee with this programmable coffee maker featuring adjustable brew strength, built-in grinder, and thermal carafe.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center",
    category: "home",
    rating: 4.7,
    reviews: 203,
    featured: true,
    inStock: true,
    features: ["Programmable timer", "Adjustable brew strength", "Built-in grinder", "Thermal carafe", "Auto shut-off"],
  },
  {
    id: "7",
    name: "Wireless Bluetooth Speaker",
    description:
      "Portable Bluetooth speaker with 360° sound, 12-hour battery life, and waterproof design, perfect for outdoor adventures.",
    price: 79.99,
    oldPrice: 99.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop&crop=center",
    category: "electronics",
    rating: 4.5,
    reviews: 167,
    featured: false,
    inStock: true,
    features: ["360° sound", "12-hour battery life", "Waterproof (IPX7)", "Bluetooth 5.0", "Built-in microphone"],
  },
  {
    id: "8",
    name: "Men's Casual Jacket",
    description:
      "Stylish and comfortable casual jacket for men, perfect for everyday wear. Features water-resistant material and multiple pockets.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop&crop=center",
    category: "clothing",
    rating: 4.3,
    reviews: 124,
    featured: false,
    inStock: true,
    features: [
      "Water-resistant",
      "Multiple pockets",
      "Adjustable cuffs",
      "Machine washable",
      "Available in multiple colors",
    ],
  },
  {
    id: "9",
    name: "Women's Running Shoes",
    description:
      "Lightweight and supportive running shoes for women, designed for comfort and performance with responsive cushioning.",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center",
    category: "clothing",
    rating: 4.6,
    reviews: 198,
    featured: false,
    inStock: true,
    features: [
      "Lightweight design",
      "Responsive cushioning",
      "Breathable mesh upper",
      "Durable outsole",
      "Reflective details",
    ],
  },
  {
    id: "10",
    name: "Smart Home Security Camera",
    description:
      "Keep your home secure with this smart security camera featuring HD video, night vision, motion detection, and two-way audio.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center",
    category: "electronics",
    rating: 4.4,
    reviews: 156,
    featured: false,
    inStock: true,
    features: ["1080p HD video", "Night vision", "Motion detection", "Two-way audio", "Cloud storage"],
  },
  {
    id: "11",
    name: "Stainless Steel Cookware Set",
    description:
      "Complete 10-piece stainless steel cookware set including pots, pans, and lids. Dishwasher safe and suitable for all cooktops.",
    price: 199.99,
    oldPrice: 249.99,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center",
    category: "home",
    rating: 4.7,
    reviews: 187,
    featured: false,
    inStock: true,
    features: [
      "10-piece set",
      "Stainless steel construction",
      "Dishwasher safe",
      "Suitable for all cooktops",
      "Oven safe up to 500°F",
    ],
  },
  {
    id: "12",
    name: "Wireless Earbuds",
    description:
      "True wireless earbuds with premium sound quality, touch controls, and a compact charging case providing up to 24 hours of battery life.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop&crop=center",
    category: "electronics",
    rating: 4.5,
    reviews: 213,
    featured: false,
    inStock: true,
    features: [
      "True wireless design",
      "Touch controls",
      "24-hour battery life with case",
      "Water resistant",
      "Noise isolation",
    ],
  },
]
