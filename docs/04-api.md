# API 통신 계층

> 서버와 데이터를 주고받는 방법.

---

## 전체 구조

```
config/api.ts          ← API 서버 주소 + 엔드포인트 목록
    ↓
lib/api-client.ts      ← 실제 HTTP 요청 함수 (fetch 래퍼)
    ↓
features/xxx/api/      ← 각 기능별 API 함수
    ↓
features/xxx/hooks/    ← TanStack Query 훅 (데이터 캐싱)
```

---

## 1. API 서버 설정 (`config/api.ts`)

### 기본 URL

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3300';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 초과 시 요청 중단
} as const;
```

`.env` 파일에 `VITE_API_URL=http://실제서버주소`를 설정하면 자동으로 교체된다.
설정 안 하면 개발용 `localhost:3300` 사용.

### 엔드포인트 목록 (`API_ENDPOINTS`)

모든 URL을 한 곳에서 관리한다. URL을 직접 문자열로 쓰지 않는다.

```typescript
// 고정 URL: 문자열
AUTH: '/auth/login',
PRODUCTS: '/products',

// 동적 URL: 함수 (ID나 파라미터 포함)
PRODUCT_DETAIL: (id: string) => `/products/${id}`,
PRODUCTS_BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
```

**사용법:**
```typescript
import { API_ENDPOINTS } from '@/config/api';

// 고정 URL
apiGet(API_ENDPOINTS.PRODUCTS);

// 동적 URL
apiGet(API_ENDPOINTS.PRODUCT_DETAIL('abc123'));
```

---

## 2. HTTP 요청 함수 (`lib/api-client.ts`)

### 공개 함수 4개

```typescript
apiGet<T>(endpoint, options?)        // 데이터 조회
apiPost<T>(endpoint, data?, options?) // 데이터 생성
apiPatch<T>(endpoint, data?, options?) // 데이터 수정
apiDelete<T>(endpoint, options?)     // 데이터 삭제
```

### 사용 예시

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// 상품 목록 조회
const products = await apiGet<Product[]>(API_ENDPOINTS.PRODUCTS);

// 장바구니에 추가
const item = await apiPost(API_ENDPOINTS.CART, { productId: 'abc', quantity: 1 });

// 장바구니 수량 수정
await apiPatch(API_ENDPOINTS.CART_ITEM('item123'), { quantity: 2 });

// 장바구니 항목 삭제
await apiDelete(API_ENDPOINTS.CART_ITEM('item123'));
```

### 자동으로 처리되는 것들

**인증 토큰 자동 첨부**
```
로그인 시 localStorage에 'auth_token' 저장됨
→ 모든 요청 헤더에 Authorization: Bearer {토큰} 자동 추가
→ 별도 처리 불필요
```

**서버 응답 자동 언래핑**

서버가 `{ success: true, data: [...] }` 형식으로 응답할 때, `data` 부분만 자동으로 꺼내준다.

```typescript
// 서버 원본 응답
{ success: true, data: [{ id: 1, name: '상품A' }], timestamp: '...' }

// apiGet이 반환하는 값
[{ id: 1, name: '상품A' }]
```

**타임아웃 처리**

10초 안에 응답 없으면 자동으로 요청 중단 → `ApiClientError` 발생.

**개발 환경 로그**

`npm run dev`로 실행 중일 때만 콘솔에 요청/응답 로그가 찍힌다.
```
[API] ▶ GET http://localhost:3300/products
[API] ✓ GET http://localhost:3300/products → 200 (10건)
```
프로덕션 빌드(`npm run build`)에서는 로그 없음.

### 에러 처리

요청 실패 시 `ApiClientError`가 던져진다.

```typescript
try {
  const product = await apiGet<Product>(API_ENDPOINTS.PRODUCT_DETAIL(id));
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.status);     // HTTP 상태 코드 (404, 500 등)
    console.error(error.message);    // 에러 메시지
    console.error(error.statusText); // 'Not Found', 'Internal Server Error' 등
  }
}
```

실제로는 TanStack Query 훅이 이 에러를 `isError` 플래그로 변환해주기 때문에,
페이지에서 `try/catch`를 직접 쓸 일은 드물다.

---

## 3. 기능별 API 함수 (`features/xxx/api/`)

`api-client.ts`의 함수를 감싸서 기능별로 묶은 것.

예시 — 상품 API (`features/products/api/productApi.ts`):

```typescript
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// 상품 목록 (필터 파라미터 포함)
export async function getProducts(params?: ProductParams): Promise<Product[]> {
  const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return apiGet<Product[]>(API_ENDPOINTS.PRODUCTS + query);
}

// 인기 상품 TOP N
export async function getTopProducts(limit: number): Promise<Product[]> {
  return apiGet<Product[]>(`${API_ENDPOINTS.TOP_PRODUCTS}?limit=${limit}`);
}

// 상품 상세
export async function getProductDetail(id: string): Promise<ProductDetail> {
  return apiGet<ProductDetail>(API_ENDPOINTS.PRODUCT_DETAIL(id));
}
```

---

## 4. 엔드포인트 전체 목록

| 카테고리 | 엔드포인트 상수 | URL | 설명 |
|---------|----------------|-----|------|
| **인증** | `LOGIN` | POST `/auth/login` | 로그인 |
| | `REGISTER` | POST `/auth/register` | 회원가입 |
| | `LOGOUT` | POST `/auth/logout` | 로그아웃 |
| | `ME` | GET `/auth/me` | 내 정보 |
| **상품** | `PRODUCTS` | GET `/products` | 상품 목록 |
| | `PRODUCT_DETAIL(id)` | GET `/products/:id` | 상품 상세 |
| | `TOP_PRODUCTS` | GET `/products/top` | 인기 상품 |
| | `PRODUCTS_BY_CATEGORY(id)` | GET `/products/category/:id` | 카테고리별 |
| | `PRODUCTS_BY_MAIN_CATEGORY(id)` | GET `/products/main-category/:id` | 메인 카테고리별 |
| | `PRODUCTS_BY_BRAND(id)` | GET `/products/brand/:id` | 브랜드별 |
| **브랜드** | `BRANDS` | GET `/brands` | 브랜드 목록 |
| | `BRAND_DETAIL(id)` | GET `/brands/:id` | 브랜드 상세 |
| **카테고리** | `CATEGORIES` | GET `/categories` | 카테고리 전체 |
| | `CATEGORIES_MAIN` | GET `/categories/main` | 메인 카테고리 |
| **장바구니** | `CART` | GET/POST `/cart` | 조회/추가 |
| | `CART_ITEM(id)` | PATCH/DELETE `/cart/:id` | 수정/삭제 |
| **찜** | `WISHLIST` | GET/POST `/wishlist` | 조회/추가 |
| | `WISHLIST_ITEM(id)` | DELETE `/wishlist/:id` | 삭제 |
| | `WISHLIST_PRODUCT(id)` | DELETE `/wishlist/product/:id` | 상품ID로 삭제 |
| **주문** | `ORDERS` | POST `/orders` | 주문 생성 (회원) |
| | `ORDERS_GUEST` | POST `/orders/guest` | 주문 생성 (비회원) |
| | `ORDERS_ME` | GET `/orders/me` | 내 주문 목록 |
| **A/S** | `USABILITY_SERVICES` | GET/POST `/usability-services` | A/S 신청 |
| | `USABILITY_SERVICES_ME` | GET `/usability-services/me` | 내 A/S 목록 |
| **컨설팅** | `CONSULTING` | GET/POST `/consulting` | 컨설팅 신청 |
| | `CONSULTING_ME` | GET `/consulting/me` | 내 컨설팅 |
| **공지사항** | `NOTICES` | GET `/notices` | 공지사항 목록 |
| | `NOTICE_DETAIL(id)` | GET `/notices/:id` | 공지사항 상세 |
| **강의실** | `LECTURES` | GET `/lectures` | 강의 목록 |
| **FAQ** | `FAQS` | GET `/faqs` | FAQ 목록 |
| **시뮬레이터** | `SIMULATOR_PRESETS(type?)` | GET `/simulator/presets` | 추천 세트 |

---

## 5. 새 API를 추가할 때

**Step 1** — 엔드포인트 등록 (`config/api.ts`)

```typescript
export const API_ENDPOINTS = {
  // ... 기존 목록
  MY_FEATURE: '/my-feature',
  MY_FEATURE_ITEM: (id: string) => `/my-feature/${id}`,
};
```

**Step 2** — API 함수 작성 (`features/my-feature/api/myFeatureApi.ts`)

```typescript
import { apiGet, apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export async function getMyFeatures(): Promise<MyFeature[]> {
  return apiGet<MyFeature[]>(API_ENDPOINTS.MY_FEATURE);
}

export async function createMyFeature(data: CreateMyFeatureDto): Promise<MyFeature> {
  return apiPost<MyFeature>(API_ENDPOINTS.MY_FEATURE, data);
}
```

**Step 3** — 훅 작성 (`features/my-feature/hooks/useMyFeature.ts`)

→ `docs/05-state-management.md` 참고

