// API 설정 및 기본 URL 관리
/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3300';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  ME: '/auth/me',

  // Brands
  BRANDS: '/brands',
  BRAND_DETAIL: (idOrSlug: string) => `/brands/${idOrSlug}`,

  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCTS_BY_BRAND: (brandId: string) => `/products/brand/${brandId}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
  PRODUCTS_BY_MAIN_CATEGORY: (categoryId: string) => `/products/main-category/${categoryId}`,
  TOP_PRODUCTS: '/products/top',

  // Categories
  CATEGORIES: '/categories',
  CATEGORIES_MAIN: '/categories/main',

  // Cart
  CART: '/cart',
  CART_ITEM: (itemId: string) => `/cart/${itemId}`,

  // Wishlist
  WISHLIST: '/wishlist',
  WISHLIST_ITEM: (itemId: string) => `/wishlist/${itemId}`,
  WISHLIST_PRODUCT: (productId: string) => `/wishlist/product/${productId}`,

  // Orders
  ORDERS: '/orders',
  ORDERS_GUEST: '/orders/guest',
  ORDERS_ME: '/orders/me',
  ORDERS_ME_PRODUCTS: (page: number, take: number) => `/orders/me/products?page=${page}&take=${take}`,
  ORDER_GUEST_DETAIL: (orderId: string) => `/orders/guest/${orderId}`,
  ORDER_STATUS: (id: string) => `/orders/${id}/status`,

  // Consulting (인증 필요)
  CONSULTING: '/consulting',
  CONSULTING_ME: '/consulting/me',
  CONSULTING_ALL: '/consulting',
  CONSULTING_ITEM: (id: string) => `/consulting/${id}`,

  // Usability Service / A/S (인증 필요)
  USABILITY_SERVICES: '/usability-services',
  USABILITY_SERVICES_ME: '/usability-services/me',
  USABILITY_SERVICE_ITEM: (id: string) => `/usability-services/${id}`,
  USABILITY_SERVICE_STATUS: (id: string) => `/usability-services/${id}/status`,

  // Simulator (인증 필요)
  SIMULATOR_SETS: '/simulator/sets',
  SIMULATOR_SET: (id: string) => `/simulator/sets/${id}`,
  // Simulator 추천 세트 (인증 불필요)
  SIMULATOR_PRESETS: (type?: string) => type ? `/simulator/presets?type=${type}` : '/simulator/presets',

  // Notices (공지사항)
  NOTICES: '/notices',
  NOTICE_DETAIL: (id: string) => `/notices/${id}`,

  // Inquiries (전체 상품 문의 + 일반 문의)
  INQUIRIES: '/inquiries',
  INQUIRIES_ME: '/inquiries/me',
  INQUIRY_ITEM: (id: string) => `/inquiries/${id}`,

  // Lectures (강의실)
  LECTURES: '/lectures',
  LECTURE_DETAIL: (id: string) => `/lectures/${id}`,
  LECTURE_TOPICS: '/lectures/topics',

  // FAQs
  FAQS: '/faqs',
  FAQ_CATEGORIES: '/faqs/categories',

  // Featured Products (소개 장비)
  FEATURED_PRODUCTS: '/featured-products',
  FEATURED_PRODUCT: (id: string) => `/featured-products/${id}`,
  FEATURED_PRODUCTS_REORDER: '/featured-products/reorder',

  // Stats (통계)
  STATS: '/stats',
  STATS_VISIT: '/stats/visit',

  // Product Recommendations (장비 연결)
  PRODUCT_RECOMMENDATIONS: (id: string) => `/products/${id}/recommendations`,
  PRODUCT_RECOMMENDATION: (id: string, recId: string) => `/products/${id}/recommendations/${recId}`,

  // Product Options (모델)
  PRODUCT_OPTIONS: (productId: string) => `/products/${productId}/options`,
  PRODUCT_OPTION: (productId: string, optionId: string) => `/products/${productId}/options/${optionId}`,

  // Product Series (시리즈)
  PRODUCT_SERIES: '/products/series',
  PRODUCT_SERIES_ITEM: (seriesId: string) => `/products/series/${seriesId}`,
  PRODUCT_ASSIGN_SERIES: (productId: string) => `/products/${productId}/series`,

  // Product Companion Groups (같이 구매)
  PRODUCT_COMPANION_GROUPS: (productId: string) => `/products/${productId}/companion-groups`,
  PRODUCT_COMPANION_GROUP: (productId: string, groupId: string) => `/products/${productId}/companion-groups/${groupId}`,
  PRODUCT_COMPANION_ITEMS: (productId: string, groupId: string) => `/products/${productId}/companion-groups/${groupId}/items`,
  PRODUCT_COMPANION_ITEM: (productId: string, groupId: string, itemId: string) => `/products/${productId}/companion-groups/${groupId}/items/${itemId}`,

  // Consulting Status (관리자)
  CONSULTING_STATUS: (id: string) => `/consulting/${id}/status`,

  // Inquiries (관리자 답변)
  INQUIRY_ANSWER: (productId: string, inquiryId: string) => `/products/${productId}/inquiries/${inquiryId}/answer`,

  // Product Reviews (상품 리뷰)
  PRODUCT_REVIEWS: (productId: string) => `/products/${productId}/reviews`,
  PRODUCT_REVIEW: (productId: string, reviewId: string) => `/products/${productId}/reviews/${reviewId}`,

  // Product Inquiries (상품 문의)
  PRODUCT_INQUIRIES: (productId: string) => `/products/${productId}/inquiries`,
  PRODUCT_INQUIRY: (productId: string, inquiryId: string) => `/products/${productId}/inquiries/${inquiryId}`,
} as const;
