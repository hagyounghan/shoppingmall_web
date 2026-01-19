// 라우트 경로 상수
export const ROUTES = {
  HOME: '/',
  BRANDS: '/brands',
  BRAND_DETAIL: (id: string) => `/brands/${id}`,
  PRODUCT_DETAIL: (id: string) => `/product/${id}`,
  CATEGORY: (id: string) => `/category/${id}`,
  ABOUT: '/about',
  SIMULATOR: '/simulator',
  USABILITY_SERVICE: '/usability-service',
  PURCHASE_CONSULTING: '/purchase-consulting',
  USABILITY_CONSULTING: '/usability-consulting',
  RESOURCE_CENTER: '/resource-center',
  RESOURCE_LECTURE: '/resource-center/lecture',
  RESOURCE_QNA: '/resource-center/qna',
  RESOURCE_FISHING_POINTS: '/resource-center/fishing-points',
  MY_PAGE: '/mypage',
  LOGIN: '/login',
  CART: '/cart',
  WISHLIST: '/wishlist',
} as const;

