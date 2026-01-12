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
  TOP_PRODUCTS: '/products/top',

  // Cart
  CART: '/cart',
  CART_ITEM: (itemId: string) => `/cart/${itemId}`,
} as const;

