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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface PurchasedProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  purchasedAt: string;
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

export interface ProductSeriesInfo {
  id: string;
  name: string;
  products: { id: string; name: string; price: number; image: string | null }[];
}

export interface ProductCompanionItem {
  id: string;
  companionProduct: Product;
  product?: Product; // legacy alias
  order: number;
}

export interface ProductCompanionGroup {
  id: string;
  label: string;
  isRequired: boolean;
  order: number;
  items: ProductCompanionItem[];
}

export interface ProductSeriesRecord {
  id: string;
  name: string;
  slug: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  htmlDescription?: string | null;
  price: number;
  image: string;
  tag: 'BEST' | 'NEW' | 'SALE' | null;
  brandId: string;
  categoryId: string;
  seriesId?: string | null;
  stock: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rank?: number;
}

export interface ProductDetail extends Product {
  images: ProductImage[];
  options: ProductOption[];
  htmlDescription?: string | null;
  relatedProducts: RelatedProduct[];
  series: ProductSeriesInfo | null;
  companionGroups: ProductCompanionGroup[];
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
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: 'admin' | 'customer';
    fishingPoints: number;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  fishingPoints?: number;
  role?: 'admin' | 'customer';
  token: string;
}

// ==========================================
// 4. 카테고리 및 브랜드 (Category & Brand)
// ==========================================
// 서버 응답 Category (GET /categories/main, GET /categories/:id)
export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface CartItemUI {
  id: string;
  productId: string;
  optionId?: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

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

// 서버 PaymentMethod enum과 일치
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'VIRTUAL_ACCOUNT' | 'KAKAO_PAY' | 'NAVER_PAY';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: '카드',
  BANK_TRANSFER: '무통장입금',
  VIRTUAL_ACCOUNT: '가상계좌',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
};

export type OrderStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  CONFIRMED: '주문확인',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소됨',
  REFUNDING: '환불신청',
  REFUNDED: '환불완료',
};

export interface CreateOrderRequest {
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  note?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  addressDetail?: string;
}

export interface CreateGuestOrderRequest extends CreateOrderRequest {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

// 서버 OrderResponseDto와 일치
export interface OrderResponse {
  id: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalAmount: number;
  status: OrderStatus;
  note: string | null;
  items: {
    id: string;
    productId: string;
    optionId: string | null;
    quantity: number;
    unitPrice: number;
  }[];
  payment: {
    id: string;
    paymentMethod: string;
    amount: number;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. 컨설팅 (Consulting)
// ==========================================
export type ConsultingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const CONSULTING_STATUS_LABELS: Record<ConsultingStatus, string> = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export interface ConsultingRequest {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: ConsultingStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 8. 사용성 서비스 / A/S (UsabilityService)
// ==========================================
export type UsabilityServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const USABILITY_STATUS_LABELS: Record<UsabilityServiceStatus, string> = {
  PENDING: '접수중',
  IN_PROGRESS: '처리중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export interface UsabilityServiceRequest {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: UsabilityServiceStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 9. 공지사항 (Notice)
// ==========================================
export interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 9-0. 상품 리뷰 (Review)
// ==========================================
export interface ReviewReply {
  id: string;
  adminId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  reply: ReviewReply | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReviews {
  data: ReviewItem[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

// ==========================================
// 9-1. 상품 문의 (Inquiry)
// ==========================================
export interface InquiryAnswer {
  id: string;
  adminId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  isAnswered: boolean;
  answer: InquiryAnswer | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedInquiries {
  data: InquiryItem[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

// ==========================================
// 9-1. 강의 (Lecture) 및 FAQ
// ==========================================
export interface Lecture {
  id: string;
  title: string;
  youtubeUrl: string;
  topic: string | null;
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  createdAt: string;
}

// ==========================================
// 10. 시뮬레이터 (Simulator)
// ==========================================
export interface SimulatorSetItemData {
  id: string;
  productId: string;
  productName: string | null;
  productImage: string | null;
  categoryId: string;
  categoryName: string | null;
  categorySlug: string | null;
}

export type SimulatorType = 'fishing_vessel' | 'leisure';
export type SimulatorPresetKey = 'premium' | 'value' | 'budget';

export interface SimulatorSet {
  id: string;
  userId?: string;
  userName?: string;
  type: SimulatorType;
  presetKey?: SimulatorPresetKey;
  name: string;
  description: string | null;
  isActive: boolean;
  items: SimulatorSetItemData[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSimulatorSets {
  data: SimulatorSet[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

// ==========================================
// 11. 소개 장비
// ==========================================
export interface FeaturedProduct {
  id: string;
  productId: string;
  order: number;
  product: Product;
  createdAt: string;
}

// ==========================================
// 10. 시뮬레이터 UI 전용 타입
// ==========================================
export interface EquipmentPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  category: string;
}

export interface SelectedEquipment {
  positionId: string;
  product: Product | null;
}
