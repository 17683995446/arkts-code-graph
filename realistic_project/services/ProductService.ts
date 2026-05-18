import { Product, ProductFilter, ProductReview, ShoppingCart, CartItem } from '../types/product';

export class ProductService {
  private products: Map<number, Product> = new Map();
  private reviews: Map<number, ProductReview[]> = new Map();
  private nextProductId: number = 1;

  constructor() {
    this.initializeSampleProducts();
  }

  private initializeSampleProducts(): void {
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        title: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        category: 'electronics',
        images: ['/images/headphones-1.jpg', '/images/headphones-2.jpg'],
        stock: 50,
        isFeatured: true,
        tags: ['electronics', 'audio', 'wireless'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Smart Watch',
        description: 'Feature-rich smart watch with health monitoring',
        price: 299.99,
        category: 'electronics',
        images: ['/images/watch-1.jpg'],
        stock: 30,
        isFeatured: true,
        tags: ['electronics', 'wearable', 'fitness'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleProducts.forEach(p => this.createProduct(p));
  }

  createProduct(data: Omit<Product, 'id'>): Product {
    const product: Product = {
      ...data,
      id: this.nextProductId++
    };
    this.products.set(product.id, product);
    return product;
  }

  getProductById(id: number): Product | undefined {
    return this.products.get(id);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  filterProducts(filter: ProductFilter): Product[] {
    let results = this.getAllProducts();

    if (filter.category) {
      results = results.filter(p => p.category === filter.category);
    }

    if (filter.minPrice !== undefined) {
      results = results.filter(p => p.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      results = results.filter(p => p.price <= filter.maxPrice!);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (filter.inStockOnly) {
      results = results.filter(p => p.stock > 0);
    }

    if (filter.featuredOnly) {
      results = results.filter(p => p.isFeatured);
    }

    return results;
  }

  updateProduct(id: number, updates: Partial<Product>): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  deleteProduct(id: number): boolean {
    return this.products.delete(id);
  }

  addReview(productId: number, review: Omit<ProductReview, 'id' | 'createdAt'>): ProductReview | undefined {
    if (!this.products.has(productId)) return undefined;

    const newReview: ProductReview = {
      ...review,
      id: Date.now(),
      createdAt: new Date()
    };

    const reviews = this.reviews.get(productId) || [];
    reviews.push(newReview);
    this.reviews.set(productId, reviews);

    return newReview;
  }

  getProductReviews(productId: number): ProductReview[] {
    return this.reviews.get(productId) || [];
  }

  getAverageRating(productId: number): number {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  updateStock(productId: number, quantity: number): boolean {
    const product = this.products.get(productId);
    if (!product) return false;

    if (product.stock + quantity < 0) return false;

    product.stock += quantity;
    return true;
  }

  getFeaturedProducts(): Product[] {
    return this.getAllProducts().filter(p => p.isFeatured);
  }

  getProductsByCategory(category: string): Product[] {
    return this.getAllProducts().filter(p => p.category === category);
  }

  searchProducts(term: string): Product[] {
    const lowerTerm = term.toLowerCase();
    return this.getAllProducts().filter(p =>
      p.title.toLowerCase().includes(lowerTerm) ||
      p.description.toLowerCase().includes(lowerTerm) ||
      p.tags.some(t => t.toLowerCase().includes(lowerTerm))
    );
  }
}

export class CartService {
  private cart: ShoppingCart = { items: [], totalAmount: 0, itemCount: 0 };

  addItem(product: Product, quantity: number = 1): ShoppingCart {
    const existingItem = this.cart.items.find(
      item => item.product.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.items.push({ product, quantity });
    }

    this.recalculateTotal();
    return this.cart;
  }

  removeItem(productId: number): ShoppingCart {
    this.cart.items = this.cart.items.filter(
      item => item.product.id !== productId
    );
    this.recalculateTotal();
    return this.cart;
  }

  updateQuantity(productId: number, quantity: number): ShoppingCart {
    const item = this.cart.items.find(
      i => i.product.id === productId
    );

    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.recalculateTotal();
      }
    }

    return this.cart;
  }

  clearCart(): ShoppingCart {
    this.cart = { items: [], totalAmount: 0, itemCount: 0 };
    return this.cart;
  }

  private recalculateTotal(): void {
    this.cart.totalAmount = this.cart.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
    this.cart.itemCount = this.cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  getCart(): ShoppingCart {
    return { ...this.cart };
  }
}

export const productService = new ProductService();
export const cartService = new CartService();
