# 프로젝트 전체 구조 개요

> 이 문서를 먼저 읽어라. 나머지 문서는 이 문서를 기반으로 한다.

---

## 이 프로젝트가 뭔지

**명장쇼핑몰** — 해양 전자기기(GPS, 레이더, 어군탐지기 등) 전문 쇼핑몰의 **프론트엔드(클라이언트)**.

- React + TypeScript
- 별도의 백엔드 서버(`http://localhost:3300`)에 API로 통신
- 이 프로젝트는 화면만 담당하고, 데이터는 모두 API에서 가져온다

---

## 기술 스택 한눈에 보기

| 역할 | 기술 | 설명 |
|------|------|------|
| UI 프레임워크 | React 18 + TypeScript | 컴포넌트 기반 화면 구성 |
| 라우팅 | React Router v7 | URL별 페이지 전환 |
| 스타일 | Tailwind CSS | 클래스 이름으로 스타일 지정 |
| UI 컴포넌트 | Shadcn UI | 버튼, 모달, 입력창 등 기성 컴포넌트 |
| 서버 데이터 | TanStack Query | API 호출 + 캐싱 |
| 전역 상태 | Context API | 로그인, 장바구니, 찜 상태 |
| HTTP 클라이언트 | fetch (자체 래퍼) | `src/lib/api-client.ts` |
| 빌드 도구 | Vite | 개발 서버, 빌드 |

---

## 폴더 구조 (전체)

```
src/
├── app/                    ← 앱 진입 레이어
│   ├── App.tsx             ← 최상위 컴포넌트 (Provider 조립)
│   ├── components/
│   │   ├── Header.tsx      ← 상단 네비게이션
│   │   └── QuickButtons.tsx← 우측 하단 떠있는 버튼
│   └── providers/
│       └── index.tsx       ← QueryClientProvider (TanStack Query 설정)
│
├── features/               ← 기능별 모듈 (핵심)
│   ├── auth/               ← 로그인/로그아웃/회원가입
│   ├── cart/               ← 장바구니
│   ├── wishlist/           ← 찜 목록
│   ├── categories/         ← 카테고리 메뉴 데이터
│   ├── products/           ← 상품 조회 (API + 훅)
│   └── brands/             ← 브랜드 조회 (API + 훅)
│
├── pages/                  ← 라우트별 페이지 (24개)
│   ├── MainPage.tsx
│   ├── ProductDetailPage.tsx
│   └── ...
│
├── shared/                 ← 전역 공유 모듈
│   ├── components/
│   │   ├── ui/             ← Shadcn 컴포넌트 (버튼, 모달 등)
│   │   ├── ProductCard.tsx ← 상품 카드 컴포넌트
│   │   └── figma/          ← 이미지 로드 실패 처리 컴포넌트
│   ├── types/
│   │   └── index.ts        ← 모든 타입 정의 (Product, User, Order...)
│   ├── utils/
│   │   └── format.ts       ← formatPrice(), formatDate()
│   └── constants/
│       ├── routes.ts       ← URL 경로 상수
│       ├── categories.ts   ← 카테고리 목록 (아이콘, 슬러그)
│       ├── brands.ts       ← 브랜드 목록 (정적 데이터)
│       └── shipping.ts     ← 배송비 설정 (무료배송 기준: 50,000원)
│
├── lib/
│   └── api-client.ts       ← HTTP 요청 함수 (apiGet, apiPost...)
├── config/
│   └── api.ts              ← API 서버 주소, 모든 엔드포인트 목록
└── routes/
    └── index.tsx           ← URL → 페이지 매핑
```

---

## 코드의 흐름 (데이터가 어디서 어떻게 화면에 나오는지)

```
브라우저 URL 입력
    ↓
routes/index.tsx  ← URL과 페이지 컴포넌트 매핑
    ↓
pages/XXXPage.tsx  ← 해당 페이지 렌더링
    ↓
features/products/hooks/useXXX.ts  ← 데이터 요청 훅
    ↓
features/products/api/productApi.ts  ← API 함수
    ↓
lib/api-client.ts  ← 실제 HTTP 요청 (fetch)
    ↓
백엔드 서버 (localhost:3300)  ← 데이터 반환
    ↓
화면에 렌더링
```

**예시: 상품 상세 페이지**
1. `/product/abc123` 접속
2. `routes/index.tsx`에서 `ProductDetailPage` 로드
3. `ProductDetailPage`에서 `useProductDetail('abc123')` 훅 호출
4. 훅이 `getProductDetail('abc123')` API 함수 호출
5. `apiGet('/products/abc123')` → 서버에 요청
6. 서버가 상품 데이터 반환 → 화면에 표시

---

## path alias (경로 별칭)

긴 상대 경로(`../../`) 대신 짧은 절대 경로를 사용한다.

| 별칭 | 실제 경로 |
|------|-----------|
| `@/` | `src/` |
| `@features/` | `src/features/` |
| `@shared/` | `src/shared/` |

```typescript
// 나쁜 예 (상대경로)
import { useAuth } from '../../contexts/AuthContext';

// 좋은 예 (별칭)
import { useAuth } from '@features/auth';
```

---

## 개발 서버 실행

```bash
npm run dev     # 개발 서버 (localhost:5173)
npm run build   # 프로덕션 빌드
npm run preview # 빌드 결과 미리보기
```

환경변수: 프로젝트 루트에 `.env` 파일 생성

```
VITE_API_URL=http://localhost:3300
```

설정 안 하면 자동으로 `http://localhost:3300` 사용.
