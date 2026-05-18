export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | 'electronics'
  | 'clothing'
  | 'food'
  | 'books'
  | 'home'
  | 'sports';

export interface ProductFilter {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShoppingCart {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}
