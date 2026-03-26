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
  ORDER_GUEST_DETAIL: (orderId: string) => `/orders/guest/${orderId}`,
  ORDER_STATUS: (id: string) => `/orders/${id}/status`,

  // Consulting (인증 필요)
  CONSULTING: '/consulting',
  CONSULTING_ME: '/consulting/me',
  CONSULTING_ALL: '/consulting',

  // Usability Service / A/S (인증 필요)
  USABILITY_SERVICES: '/usability-services',
  USABILITY_SERVICES_ME: '/usability-services/me',

  // Simulator (인증 필요)
  SIMULATOR_SETS: '/simulator/sets',
  SIMULATOR_SET: (id: string) => `/simulator/sets/${id}`,
} as const;
