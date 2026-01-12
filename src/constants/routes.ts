// 라우트 경로 상수
export const ROUTES = {
  HOME: '/',
  BRANDS: '/brands',
  BRAND_DETAIL: (id: string) => `/brands/${id}`,
  PRODUCT_DETAIL: (id: string) => `/product/${id}`,
  CATEGORY: (id: string) => `/category/${id}`,
  ABOUT: '/about',
  CONSULTING: '/consulting',
  SERVICE: '/service',
  FISHING_POINTS: '/fishing-points',
  MY_PAGE: '/mypage',
  LOGIN: '/login',
  CART: '/cart',
  WISHLIST: '/wishlist',
} as const;

