---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---
# React 현업 컨벤션 가이드

> TypeScript React 프로젝트 기준. [coding-style.md](./coding-style.md), [patterns.md](./patterns.md) 참고.

---

## 1. 폴더 구조

### Feature-based (기능 중심) — 현업 표준

```
src/
├── app/                        # 앱 진입점, 전역 Provider, Router
│   ├── App.tsx
│   ├── providers/              # QueryClientProvider, ThemeProvider 등
│   └── routes/                 # 라우트 정의
│
├── features/                   # 기능 단위 모듈 (핵심)
│   ├── auth/
│   │   ├── api/                # API 호출 함수
│   │   ├── components/         # 해당 기능 전용 컴포넌트
│   │   ├── hooks/              # 해당 기능 전용 훅
│   │   ├── stores/             # 상태 관리 (Zustand 등)
│   │   ├── types/              # 타입 정의
│   │   └── index.ts            # Public API (외부 노출 제어)
│   └── products/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       └── index.ts
│
├── shared/                     # 전역 공유 모듈
│   ├── components/             # 재사용 UI 컴포넌트 (Button, Modal 등)
│   ├── hooks/                  # 범용 훅 (useDebounce, useMediaQuery 등)
│   ├── utils/                  # 순수 유틸 함수
│   ├── types/                  # 공통 타입
│   └── constants/              # 전역 상수
│
├── pages/                      # 라우트와 1:1 매핑 (조립만 담당)
│   ├── HomePage.tsx
│   └── ProductDetailPage.tsx
│
└── assets/                     # 이미지, 폰트 등 정적 자원
```

**핵심 원칙:**
- `features/`는 기능별로 자체 완결. 다른 feature를 직접 import하지 않는다.
- `pages/`는 조립(composition)만. 로직은 feature에 위임.
- `shared/`는 feature에 의존하지 않는다.
- `index.ts` barrel export로 내부 구현 캡슐화.

---

## 2. 컴포넌트 네이밍 & 파일 구조

### 파일명

```
// 컴포넌트 파일: PascalCase
UserCard.tsx
ProductList.tsx
AuthModal.tsx

// 훅 파일: camelCase, use 접두사
useAuth.ts
useProductList.ts
useDebounce.ts

// 유틸 파일: camelCase
formatDate.ts
parseQueryString.ts

// 타입 파일: camelCase
user.types.ts
product.types.ts

// 상수 파일: camelCase
apiEndpoints.ts
errorMessages.ts
```

### 컴포넌트 정의

```typescript
// ✅ 함수 선언식 (현업 선호 — 호이스팅, 가독성)
function UserCard({ user, onSelect }: UserCardProps) {
  return <div onClick={() => onSelect(user.id)}>{user.name}</div>
}

export default UserCard

// ✅ Props 타입은 컴포넌트 파일 내 상단에 정의
interface UserCardProps {
  user: User
  onSelect: (id: string) => void
  className?: string
}

// ❌ React.FC 사용 금지 (children 타입 자동 포함으로 의도 불명확)
const UserCard: React.FC<UserCardProps> = ({ user }) => { ... }
```

### 컴포넌트 파일 내부 순서

```typescript
// 1. import
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 타입 정의
interface Props { ... }

// 3. 컴포넌트 본체
function MyComponent({ ... }: Props) {
  // 3-1. hooks (useState, useEffect, custom hooks)
  const [open, setOpen] = useState(false)
  const { data } = useQuery(...)

  // 3-2. 파생 상태, 계산값
  const filteredItems = items.filter(...)

  // 3-3. 핸들러
  const handleClick = () => { ... }

  // 3-4. 조기 반환 (로딩, 에러 등)
  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage />

  // 3-5. JSX 반환
  return ( ... )
}

// 4. export
export default MyComponent
```

---

## 3. 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `UserCard`, `ProductList` |
| 훅 | `use` + PascalCase | `useAuth`, `useCart` |
| 핸들러 | `handle` + 이벤트 | `handleSubmit`, `handleChange` |
| 불리언 상태 | `is/has/can` + 명사 | `isLoading`, `hasError`, `canEdit` |
| 이벤트 Props | `on` + PascalCase | `onClick`, `onSubmit`, `onChange` |
| 상수 | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `ApiResponse<T>` |
| Enum | PascalCase (값도 PascalCase) | `UserRole.Admin` |
| CSS 클래스 | kebab-case | `user-card`, `nav-item` |

---

## 4. 상태 관리 전략

### 상태 위치 결정 기준

```
Q: 이 상태가 필요한 범위는?
  ├── 단일 컴포넌트 내부          → useState / useReducer
  ├── 부모-자식 간 2~3단계        → props drilling (허용)
  ├── 특정 feature 내 여러 컴포넌트 → Zustand (feature store)
  ├── 전역 UI 상태 (모달, 토스트)  → Zustand (global store)
  └── 서버 데이터 (API 응답)       → TanStack Query
```

### 서버 상태 — TanStack Query

```typescript
// hooks/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5, // 5분
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

### 클라이언트 상태 — Zustand

```typescript
// stores/cartStore.ts
interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item],   // 불변 업데이트
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
}))
```

---

## 5. 커스텀 훅 패턴

### 관심사 분리 (Logic ↔ UI 분리)

```typescript
// ✅ 훅으로 로직 분리
function useProductSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  })

  return { query, setQuery, results: data, isLoading, error }
}

// 컴포넌트는 UI만 담당
function ProductSearchPage() {
  const { query, setQuery, results, isLoading } = useProductSearch()

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      {isLoading ? <Spinner /> : <ResultList items={results} />}
    </div>
  )
}
```

---

## 6. API 레이어

### 3계층 구조

```
api/products.ts          ← 순수 HTTP 함수 (axios/fetch)
hooks/useProducts.ts     ← TanStack Query 래핑
components/ProductList   ← UI 렌더링
```

```typescript
// api/products.ts — 순수 API 함수
export async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  const { data } = await apiClient.get('/products', { params: filters })
  return data
}

export async function createProduct(payload: CreateProductDto): Promise<Product> {
  const { data } = await apiClient.post('/products', payload)
  return data
}
```

### apiClient 설정

```typescript
// lib/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
})

// 인터셉터: 인증 토큰 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 인터셉터: 401 자동 처리
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) redirectToLogin()
    return Promise.reject(error)
  }
)
```

---

## 7. 타입 설계

### DTO vs Domain 모델 분리

```typescript
// types/product.types.ts

// API 응답 그대로 (snake_case 가능)
interface ProductDto {
  product_id: string
  product_name: string
  created_at: string
}

// 앱 내부에서 사용하는 도메인 모델 (camelCase)
interface Product {
  id: string
  name: string
  createdAt: Date
}

// 변환 함수
function toProduct(dto: ProductDto): Product {
  return {
    id: dto.product_id,
    name: dto.product_name,
    createdAt: new Date(dto.created_at),
  }
}
```

### 유니온 타입으로 상태 표현

```typescript
// ❌ nullable 필드 남발
interface Request {
  status: string
  data?: Product
  error?: string
}

// ✅ Discriminated Union — 타입 안전성 보장
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

---

## 8. 성능 최적화

### 메모이제이션 기준

```typescript
// useMemo: 연산 비용이 큰 파생값
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.price - b.price),
  [items]
)

// useCallback: 자식 컴포넌트에 함수 props 전달 시
const handleDelete = useCallback((id: string) => {
  deleteItem(id)
}, [deleteItem])

// React.memo: props가 자주 바뀌지 않는 순수 컴포넌트
const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  return <div>{product.name}</div>
})
```

**주의:** 무분별한 `memo/useMemo/useCallback`은 오히려 성능 저하. 프로파일링 후 적용.

### 코드 스플리팅

```typescript
// 라우트 단위 lazy loading
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Suspense>
  )
}
```

---

## 9. 에러 처리

### Error Boundary

```typescript
// 페이지 단위 에러 경계
function ProductPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<Spinner />}>
        <ProductContent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### TanStack Query 에러 처리

```typescript
function ProductList() {
  const { data, isLoading, error } = useProducts()

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage message={error.message} />

  return <ul>{data?.map((p) => <ProductItem key={p.id} product={p} />)}</ul>
}
```

---

## 10. Import 순서 & 경로 별칭

### Import 순서 (eslint-plugin-import 기준)

```typescript
// 1. React 관련
import { useState, useCallback } from 'react'

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. 내부 — shared (절대경로)
import { Button } from '@/shared/components/Button'
import { useDebounce } from '@/shared/hooks/useDebounce'

// 4. 내부 — feature
import { useProducts } from '@/features/products'

// 5. 상대경로 (같은 feature/컴포넌트 내)
import { ProductCard } from './ProductCard'
import type { ProductListProps } from './types'
```

### 경로 별칭 (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

---

## 11. 체크리스트

작업 완료 전 확인:

- [ ] Props에 명시적 타입 정의
- [ ] 핸들러명 `handle` 접두사, 콜백 Props `on` 접두사
- [ ] 로직은 훅으로 분리, 컴포넌트는 UI만
- [ ] 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand/useState
- [ ] `any` 사용 없음
- [ ] console.log 없음
- [ ] feature 간 직접 import 없음 (index.ts 통해 접근)
- [ ] 컴포넌트 파일 200줄 이내
