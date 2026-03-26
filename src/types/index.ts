// ==========================================
// 1. 공통 응답 처리 (페이지네이션)
// ==========================================
export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

// ==========================================
// 2. 제품 (Product) 관련 타입
// ==========================================
export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  order: number;
  isActive: boolean;
}

export interface RelatedProduct {
  id: string;
  category: 'transducer' | 'heading-sensor' | 'antenna';
  product: Product; 
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: 'BEST' | 'NEW' | 'SALE' | null;
  brandId: string;
  categoryId: string;
  stock: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rank?: number; // UI에서 순위 표시용으로 사용 가능
}

export interface ProductDetail extends Product {
  images: ProductImage[];
  options: ProductOption[];
  relatedProducts: RelatedProduct[];
}

// ==========================================
// 3. 사용자 및 인증 (User & Auth)
// ==========================================
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  fishingPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// AuthContext에서 사용하는 로그인 유저 타입 (token 포함)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  fishingPoints?: number;
  token: string;
}

// ==========================================
// 4. 카테고리 및 브랜드 (Category & Brand)
// ==========================================
export interface Category {
  id: string;
  name: string;
  label: string;
  icon: string;
  link: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

// ==========================================
// 5. 장바구니 및 찜 목록 (Cart & Wishlist)
// ==========================================
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  optionId?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

// UI에서 사용하는 장바구니 아이템 (product join 포함)
export interface CartItemUI {
  id: string;
  productId: string;
  optionId?: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

// UI에서 사용하는 찜 목록 아이템 (product join 포함)
export interface WishlistItemUI {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  tag?: 'BEST' | 'NEW' | 'SALE' | null;
}

// ==========================================
// 6. 주문 (Order)
// ==========================================
export interface OrderItem {
  productId: string;
  optionId?: string;
  quantity: number;
}

export type PaymentMethod = '카드' | '무통장입금';

export interface CreateOrderRequest {
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
}

export interface CreateGuestOrderRequest extends CreateOrderRequest {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface Order {
  id: string;
  status: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

