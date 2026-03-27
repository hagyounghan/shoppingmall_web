# features/ — 기능별 모듈 설명

> 기능을 추가하거나 수정할 때 가장 많이 건드리는 폴더.

---

## features/ 구조 원칙

각 feature는 **자기 완결적**이다. 하나의 기능에 필요한 모든 것(API, 훅, 컴포넌트)이 한 폴더에 있다.

```
features/
└── products/               ← 기능명
    ├── api/
    │   └── productApi.ts   ← 서버 통신 함수
    ├── hooks/
    │   ├── useProducts.ts  ← TanStack Query 훅
    │   └── useProductDetail.ts
    ├── components/
    │   └── FeaturedProductsSection.tsx  ← 이 기능 전용 컴포넌트
    └── index.ts            ← 외부에 공개할 것만 내보냄 (Public API)
```

**중요 규칙**: 다른 feature를 직접 import하지 않는다. 항상 `index.ts`를 통한다.

```typescript
// 좋은 예
import { useAuth } from '@features/auth';       // index.ts를 통한 접근

// 나쁜 예
import { useAuth } from '@features/auth/AuthContext';  // 내부 직접 접근
```

---

## auth — 인증

**파일**: `src/features/auth/`

### 역할
- 로그인, 로그아웃, 회원가입
- 현재 로그인 상태 전역 공유
- 관리자 페이지 접근 제어

### 공개 API (`index.ts`)
```typescript
import { useAuth } from '@features/auth';      // 인증 훅
import { AuthProvider } from '@features/auth'; // Provider (App.tsx에서 사용)
import { AdminGuard } from '@features/auth';   // 관리자 전용 페이지 보호
```

### `useAuth()` 반환값

```typescript
const {
  user,            // 현재 로그인 유저 (null이면 비로그인)
  isAuthenticated, // boolean — 로그인 여부
  loading,         // boolean — 초기 인증 확인 중
  login,           // (email, password) => Promise<AuthUser>
  logout,          // () => Promise<void>
  register,        // (email, password, name, phone?) => Promise<void>
} = useAuth();
```

### 인증 흐름
1. 앱 시작 → localStorage에서 토큰 확인
2. 토큰 있으면 → 서버에 `/auth/me` 요청으로 유효성 검증
3. 유효하면 `user` 세팅, 만료되면 localStorage 초기화

### 토큰 저장 위치
- `localStorage.auth_token` — JWT 토큰
- `localStorage.auth_user` — 유저 정보 (JSON)

---

## cart — 장바구니

**파일**: `src/features/cart/CartContext.tsx`

### 특징: 로그인/비로그인 이중 동작
| 상태 | 저장 위치 | 동작 |
|------|-----------|------|
| 비로그인 | localStorage | 로컬에만 저장 |
| 로그인 | 서버 + 메모리 | 서버에 동기화 |

로그인 시: 로컬 항목을 서버에 합치고 서버 기준으로 갱신

### 공개 API
```typescript
import { useCart } from '@features/cart';

const {
  items,          // CartItemUI[] — 현재 장바구니 목록
  addItem,        // (product, quantity?, optionId?) => Promise<void>
  removeItem,     // (id) => Promise<void>
  updateQuantity, // (id, quantity) => Promise<void>
  clearCart,      // () => Promise<void>
  getTotalPrice,  // () => number
  getTotalItems,  // () => number
} = useCart();
```

### CartItemUI 타입
```typescript
interface CartItemUI {
  id: string;        // 장바구니 항목 ID (로컬: "local_xxx", 서버: UUID)
  productId: string; // 상품 ID
  quantity: number;
  name: string;
  price: number;
  image: string;
}
```

---

## wishlist — 찜 목록

**파일**: `src/features/wishlist/WishlistContext.tsx`

### 특징: 로그인 전용
비로그인 상태에서는 사용 불가. 비로그인 시 빈 배열 반환.

### 공개 API
```typescript
import { useWishlist } from '@features/wishlist';

const {
  items,              // WishlistItemUI[]
  isLoading,          // boolean
  addItem,            // (product) => Promise<void>
  removeItem,         // (itemId) => Promise<void>
  removeByProductId,  // (productId) => Promise<void>
  isInWishlist,       // (productId) => boolean ← 토글 버튼에 유용
} = useWishlist();
```

---

## categories — 카테고리

**파일**: `src/features/categories/CategoryContext.tsx`

### 역할
앱 시작 시 `/categories/main` 1회 호출해서 카테고리 목록을 메모리에 유지.
Header의 메뉴, CategoryPage에서 상품 조회 시 사용.

### 공개 API
```typescript
import { useCategories } from '@features/categories';

const {
  mainCategories, // Category[] — 메인 카테고리 목록
  slugMap,        // Record<string, Category> — slug로 카테고리 찾기
  getBySlug,      // (slug) => Category | undefined
  loading,        // boolean
} = useCategories();
```

**슬러그란?** URL에서 카테고리를 식별하는 문자열. 예: `gps-plotter`, `radar`
- URL `/category/gps-plotter` → `getBySlug('gps-plotter')` → Category 객체 반환

---

## products — 상품

**파일**: `src/features/products/`

### API 함수 (`api/productApi.ts`)
```typescript
getProducts(params?)           // 상품 목록 (필터/페이징 가능)
getTopProducts(limit)          // 인기 상품 TOP N
getProductDetail(id)           // 상품 상세
getProductsByMainCategory(id)  // 메인 카테고리별 상품
getCategories()                // 전체 카테고리
getMainCategories()            // 메인 카테고리만
```

### TanStack Query 훅 (`hooks/`)
| 훅 | 용도 |
|----|------|
| `useTopProducts(limit)` | 메인 페이지 인기 상품 |
| `useProductDetail(id)` | 상품 상세 페이지 |
| `useProducts(filters?)` | 상품 목록 (필터 포함) |
| `useProductsByCategory(category)` | 카테고리 페이지 상품 목록 |

### 사용 예시
```typescript
// 메인 페이지에서 인기 상품 5개
const { data: bestProducts = [], isLoading } = useTopProducts(5);

// 상품 상세
const { data: product, isLoading, isError } = useProductDetail(id);

// 카테고리 상품
const category = getBySlug(slugParam);
const { data: products = [] } = useProductsByCategory(category);
```

---

## brands — 브랜드

**파일**: `src/features/brands/`

### TanStack Query 훅
| 훅 | 용도 |
|----|------|
| `useBrands()` | 브랜드 목록 전체 |
| `useBrand(idOrSlug)` | 단일 브랜드 상세 |
| `useBrandProducts(brandId)` | 특정 브랜드의 상품 목록 |

### 사용 예시
```typescript
// 브랜드 상세 페이지
const { brandId } = useParams();
const { data: brand, isLoading: brandLoading } = useBrand(brandId);
const { data: products = [] } = useBrandProducts(brand?.id);
```

---

## 새 feature를 만들 때 체크리스트

1. `src/features/새기능/` 폴더 생성
2. `api/새기능Api.ts` — API 호출 함수
3. `hooks/use새기능.ts` — TanStack Query 훅
4. `index.ts` — 공개할 것만 export
5. 페이지에서는 `@features/새기능`으로 import
