# 상태 관리

> 데이터를 어디에 보관하고 어떻게 공유하는지.

---

## 핵심 원칙: 상태를 두 종류로 나눈다

| 종류 | 정의 | 도구 |
|------|------|------|
| **서버 상태** | 서버에서 가져온 데이터 (상품, 브랜드 목록 등) | TanStack Query |
| **클라이언트 상태** | 앱 안에서만 사는 데이터 (로그인 여부, 장바구니) | Context API |

이 둘을 섞으면 코드가 복잡해진다. 명확히 구분한다.

---

## 서버 상태 — TanStack Query

### 왜 쓰는가

직접 `useEffect + fetch`로 데이터를 가져오면:
- 로딩/에러 상태를 매번 `useState`로 직접 관리해야 함
- 같은 데이터를 여러 컴포넌트에서 요청하면 중복 API 호출 발생
- 브라우저 탭 전환 후 돌아올 때 오래된 데이터가 그대로 표시됨

TanStack Query는 이 모든 걸 자동으로 처리한다.

### 기본 사용법

```typescript
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/productApi';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],          // 캐시 키 — 같은 키면 같은 캐시 공유
    queryFn: () => getProducts(),    // 데이터 가져오는 함수
    staleTime: 1000 * 60 * 5,       // 5분간 신선한 데이터로 간주 (재요청 안 함)
  });
}
```

### 반환값 사용하기

```typescript
const { data, isLoading, isError, refetch } = useProducts();

if (isLoading) return <p>불러오는 중...</p>;
if (isError) return <p>오류가 발생했습니다.</p>;

return <div>{data?.map(p => <div key={p.id}>{p.name}</div>)}</div>;
```

### queryKey — 캐시 식별자

`queryKey`는 이 데이터가 "무엇"인지 구분하는 배열이다.

```typescript
['products']              // 상품 전체 목록
['products', 'top', 5]   // 인기 상품 TOP 5
['products', 'detail', 'abc123']  // abc123 상품 상세
['brands']               // 브랜드 목록
['brands', 'garmin']     // garmin 브랜드 상세
```

**같은 key = 캐시 공유**: 두 컴포넌트가 같은 key로 요청하면 API는 1번만 호출된다.

### staleTime — 재요청 주기

```
staleTime: 1000 * 60 * 5   // 5분 동안은 API 재요청 안 함
staleTime: 1000 * 60 * 10  // 10분 (브랜드처럼 잘 안 바뀌는 데이터)
staleTime: 0               // 항상 최신 데이터 (기본값)
```

자주 바뀌지 않는 데이터는 `staleTime`을 길게 설정해 불필요한 요청을 줄인다.

### 조건부 실행 (enabled)

ID가 있을 때만 요청하고 싶을 때:

```typescript
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => getProductDetail(id),
    enabled: !!id,   // id가 있을 때만 실행
  });
}
```

### 의존 쿼리 (순서대로 실행)

첫 번째 결과가 나온 후 두 번째를 실행해야 할 때:

```typescript
// BrandDetailPage에서: 브랜드 UUID 얻은 후 → 상품 목록 요청
const { data: brand } = useBrand(brandId);         // 1번 먼저 실행
const { data: products } = useBrandProducts(brand?.id); // brand.id 생기면 자동 실행

// useBrandProducts 내부
export function useBrandProducts(brandId?: string) {
  return useQuery({
    queryKey: ['products', 'brand', brandId],
    queryFn: () => getProductsByBrand(brandId!),
    enabled: !!brandId,  // brandId가 생길 때까지 대기
  });
}
```

### 현재 프로젝트에서 쓰는 훅 목록

| 훅 | queryKey | 설명 |
|----|----------|------|
| `useTopProducts(limit)` | `['products', 'top', limit]` | 인기 상품 |
| `useProductDetail(id)` | `['products', 'detail', id]` | 상품 상세 |
| `useProducts(filters?)` | `['products', filters]` | 상품 목록 |
| `useProductsByCategory(category)` | `['products', 'category', id]` | 카테고리별 상품 |
| `useBrands()` | `['brands']` | 브랜드 목록 |
| `useBrand(idOrSlug)` | `['brands', idOrSlug]` | 브랜드 상세 |
| `useBrandProducts(brandId)` | `['products', 'brand', brandId]` | 브랜드별 상품 |

---

## 클라이언트 상태 — Context API

### 왜 쓰는가

로그인 상태, 장바구니처럼 **서버가 아닌 앱 안에서 관리**하는 데이터는 Context API를 쓴다.

Context가 없으면: 최상위 컴포넌트에서 `props`로 계속 내려줘야 함 → "prop drilling"
Context 있으면: 어느 컴포넌트에서든 `useAuth()`, `useCart()` 한 줄로 접근

### 1. 인증 (`useAuth`)

**파일**: `src/features/auth/AuthContext.tsx`

```typescript
import { useAuth } from '@features/auth';

const { user, isAuthenticated, loading, login, logout, register } = useAuth();
```

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `user` | `AuthUser \| null` | 로그인한 유저. 비로그인이면 `null` |
| `isAuthenticated` | `boolean` | `user !== null`과 동일 |
| `loading` | `boolean` | 앱 시작 시 토큰 확인 중이면 `true` |
| `login(email, pw)` | `Promise<AuthUser>` | 로그인. 성공 시 `user` 자동 세팅 |
| `logout()` | `Promise<void>` | 로그아웃. 토큰 삭제 + `user = null` |
| `register(...)` | `Promise<void>` | 회원가입 + 자동 로그인 |

**인증 흐름:**
```
앱 시작
  ↓
localStorage에 토큰 있는지 확인
  ↓ 있으면
서버 /auth/me 호출로 토큰 유효 확인
  ↓ 유효하면          ↓ 만료면
user 세팅            localStorage 초기화 → 비로그인
```

**로그인 필요한 페이지에서:**
```typescript
const { isAuthenticated, loading } = useAuth();

useEffect(() => {
  if (!loading && !isAuthenticated) {
    navigate(ROUTES.LOGIN + '?redirect=' + location.pathname);
  }
}, [loading, isAuthenticated]);
```

### 2. 장바구니 (`useCart`)

**파일**: `src/features/cart/CartContext.tsx`

```typescript
import { useCart } from '@features/cart';

const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
```

**비로그인 vs 로그인 동작 차이:**

| 상태 | 저장 위치 | 특징 |
|------|-----------|------|
| 비로그인 | localStorage | 로컬에만 저장. 새로고침해도 유지 |
| 로그인 | 서버 + 메모리 | 서버와 동기화. 다른 기기에서도 유지 |

로그인하면: 로컬 항목 → 서버에 자동 병합 → 서버 기준으로 갱신

```typescript
// 장바구니 추가
await addItem(product);           // 기본 수량 1
await addItem(product, 3);        // 수량 3
await addItem(product, 1, 'opt1'); // 옵션 포함

// 수량 변경
await updateQuantity(item.id, 2);

// 삭제
await removeItem(item.id);

// 전체 삭제
await clearCart();

// 합계 금액
const total = getTotalPrice(); // 숫자 반환
```

### 3. 찜 목록 (`useWishlist`)

**파일**: `src/features/wishlist/WishlistContext.tsx`

```typescript
import { useWishlist } from '@features/wishlist';

const { items, isLoading, addItem, removeItem, removeByProductId, isInWishlist } = useWishlist();
```

**로그인 전용**: 비로그인 상태에서는 빈 배열 반환.

```typescript
// 찜 추가
await addItem(product);

// 찜 삭제 (찜 항목 ID로)
await removeItem(wishlistItemId);

// 찜 삭제 (상품 ID로)
await removeByProductId(productId);

// 찜 여부 확인 (하트 버튼 색 결정에 사용)
const liked = isInWishlist(product.id); // boolean
```

### 4. 카테고리 (`useCategories`)

**파일**: `src/features/categories/CategoryContext.tsx`

```typescript
import { useCategories } from '@features/categories';

const { mainCategories, slugMap, getBySlug, loading } = useCategories();
```

앱 시작 시 1회만 서버에서 가져와 메모리에 보관. 이후 재요청 없음.

```typescript
// 헤더 메뉴 렌더링
mainCategories.map(c => <Link to={`/category/${c.slug}`}>{c.name}</Link>)

// URL의 slug → Category 객체 변환
const { categoryId } = useParams(); // 실제로는 slug
const category = getBySlug(categoryId); // Category 객체 반환
```

---

## Provider 구조 (`src/app/App.tsx`)

Context는 Provider로 감싸야 한다. 현재 구조:

```
<AppProviders>           ← TanStack Query 설정 (QueryClientProvider)
  <AuthProvider>         ← 로그인 상태
    <CartProvider>       ← 장바구니
      <WishlistProvider> ← 찜 목록
        <CategoryProvider> ← 카테고리
          <App />        ← 실제 화면
```

**순서가 중요하다**: 안쪽 Provider는 바깥 Provider에 의존할 수 있다.
(CartProvider는 로그인 상태에 따라 다르게 동작하므로 AuthProvider 안에 있어야 함)

---

## 언제 무엇을 쓸까

```
새로운 데이터가 생겼다!
        │
        ▼
서버에서 가져오는 데이터인가?
  YES → TanStack Query (useQuery)
  NO  → 앱 안에서만 쓰는 데이터인가?
          YES → 여러 컴포넌트가 공유해야 하는가?
                  YES → Context API (기존 context 활용하거나 새로 만들기)
                  NO  → useState (컴포넌트 로컬 상태로 충분)
```

---

## TanStack Query 훅을 새로 만들 때

```typescript
// src/features/my-feature/hooks/useMyFeature.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMyFeatures, createMyFeature } from '../api/myFeatureApi';

// 조회 (GET)
export function useMyFeatures() {
  return useQuery({
    queryKey: ['my-feature'],
    queryFn: getMyFeatures,
    staleTime: 1000 * 60 * 5,
  });
}

// 생성/수정/삭제 (POST/PATCH/DELETE) → useMutation 사용
export function useCreateMyFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMyFeature,
    onSuccess: () => {
      // 성공 후 목록 캐시 무효화 → 자동으로 다시 조회됨
      queryClient.invalidateQueries({ queryKey: ['my-feature'] });
    },
  });
}
```

```typescript
// 컴포넌트에서 useMutation 사용
const { mutate: create, isPending } = useCreateMyFeature();

<button
  disabled={isPending}
  onClick={() => create({ name: '새 항목' })}
>
  {isPending ? '저장 중...' : '저장'}
</button>
```
