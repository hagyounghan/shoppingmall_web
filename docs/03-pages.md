# pages/ — 페이지 컴포넌트

> 각 URL에 대응하는 페이지 목록과 역할.

---

## 원칙: 페이지는 조립만 한다

페이지 컴포넌트는 **로직을 담으면 안 된다**. features에서 훅을 가져다 쓰고, 가져온 데이터를 화면에 나열하는 것만 한다.

```typescript
// 나쁜 예 — 페이지에 API 호출 직접
export function MyPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  return <div>{products.map(...)}</div>;
}

// 좋은 예 — 훅에서 가져다 쓰기
export function MyPage() {
  const { data: products = [] } = useProducts();
  return <div>{products.map(...)}</div>;
}
```

---

## URL → 페이지 매핑 (`routes/index.tsx`)

| URL 패턴 | 페이지 컴포넌트 | 설명 |
|----------|----------------|------|
| `/` | `MainPage` | 홈 화면 |
| `/product/:id` | `ProductDetailPage` | 상품 상세 |
| `/category/:categoryId` | `CategoryPage` | 카테고리별 상품 목록 |
| `/brands` | `BrandsPage` | 브랜드 목록 |
| `/brands/:brandId` | `BrandDetailPage` | 브랜드 상세 + 상품 목록 |
| `/cart` | `CartPage` | 장바구니 |
| `/wishlist` | `WishlistPage` | 찜 목록 |
| `/order` | `OrderPage` | 주문/결제 |
| `/login` | `LoginPage` | 로그인/회원가입 |
| `/my` | `MyPage` | 마이페이지 |
| `/simulator` | `SimulatorPage` | 장비 시뮬레이터 |
| `/usability-service` | `UsabilityServicePage` | A/S 신청 |
| `/purchase-consulting` | `PurchaseConsultingPage` | 구매 컨설팅 신청 |
| `/consulting` | `ConsultingPage` | 컨설팅 예약 |
| `/service-request` | `ServiceRequestPage` | 서비스 신청 |
| `/support` | `SupportCenterPage` | 고객지원 센터 |
| `/support/notice` | `NoticePage` | 공지사항 |
| `/support/lecture` | `ResourceLecturePage` | 강의실 |
| `/support/qna` | `ResourceQnAPage` | 문의답변 |
| `/support/faq` | `ResourceFaqPage` | FAQ |
| `/support/fishing-points` | `FishingPointsPage` | 포인트 |
| `/about` | `AboutPage` | 회사 소개 |
| `/admin` | `AdminDashboard` | 관리자 (로그인 필요) |

---

## 페이지별 핵심 로직 요약

### MainPage (`/`)
- `useTopProducts(5)` — 인기 상품 TOP 5
- `apiGet(SIMULATOR_PRESETS)` — 시뮬레이터 추천 세트 (캐러셀)
- 캐러셀: `setInterval`로 자동 슬라이드, `timerRef`로 메모리 누수 방지

### ProductDetailPage (`/product/:id`)
- `useProductDetail(id)` — 상품 상세 정보
- `useCart()` — 장바구니 추가
- `useWishlist()` — 찜하기 토글
- `useAuth()` — 로그인 여부 확인

### CategoryPage (`/category/:categoryId`)
- `useCategories()` — slug → Category 객체 변환
- `useProductsByCategory(category)` — 해당 카테고리 상품 목록
- URL의 `:categoryId`는 실제로 slug (예: `gps-plotter`)

### CartPage (`/cart`)
- `useCart()` 만으로 충분
- 배송비 계산: `SHIPPING.FREE_THRESHOLD`(5만원) 기준
- 5만원 미만 → `SHIPPING.FEE`(3,000원) 부과

### OrderPage (`/order`)
- `useCart()` — 주문할 상품 목록
- `useAuth()` — 회원/비회원 구분
- 카카오 주소 API 연동 (다음 우편번호 서비스)

### LoginPage (`/login`)
- 로그인 + 회원가입 탭 전환
- `useAuth().login()`, `useAuth().register()` 호출
- 로그인 성공 후: URL에 `?redirect=/이전경로` 있으면 이전 페이지로 이동

### SimulatorPage (`/simulator`)
- 선박 위에 장비를 배치해 견적 계산
- `fishing_vessel` / `leisure` 타입 선택
- 각 카테고리 슬롯에 상품 선택 → 총 가격 계산

---

## 페이지 추가하는 법

**1. 페이지 파일 생성**
```typescript
// src/pages/새페이지.tsx
import { useProducts } from '@features/products';

export function 새페이지() {
  const { data: products = [] } = useProducts();
  return <div>{/* 화면 */}</div>;
}
```

**2. 라우트 등록**
```typescript
// src/routes/index.tsx
import { 새페이지 } from '@/pages/새페이지';

// Routes 안에 추가
<Route path="/새경로" element={<새페이지 />} />
```

**3. 경로 상수 등록**
```typescript
// src/shared/constants/routes.ts
export const ROUTES = {
  // ... 기존 경로들
  새페이지: '/새경로',
};
```

---

## 로그인이 필요한 페이지 처리

```typescript
// 방법 1: useAuth()로 직접 확인
const { isAuthenticated, loading } = useAuth();

useEffect(() => {
  if (!loading && !isAuthenticated) {
    navigate(ROUTES.LOGIN + '?redirect=' + location.pathname);
  }
}, [loading, isAuthenticated]);

// 방법 2: AdminGuard로 감싸기 (관리자 전용)
<Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
```

---

## 자주 쓰는 패턴

### 로딩/에러 처리
```typescript
const { data, isLoading, isError } = useProductDetail(id);

if (isLoading) return <p>불러오는 중...</p>;
if (isError || !data) return <p>데이터를 불러오지 못했습니다.</p>;

return <div>{data.name}</div>;
```

### URL 파라미터 읽기
```typescript
import { useParams } from 'react-router-dom';
const { id } = useParams<{ id: string }>();
```

### 페이지 이동
```typescript
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/constants/routes';

const navigate = useNavigate();
navigate(ROUTES.HOME);
navigate(ROUTES.PRODUCT_DETAIL(product.id)); // 함수형 경로
```
