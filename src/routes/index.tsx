import { Routes, Route } from 'react-router-dom';
import { MainPage } from '@/pages/MainPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { UsabilityServicePage } from '@/pages/UsabilityServicePage';
import { PurchaseConsultingPage } from '@/pages/PurchaseConsultingPage';
import { SupportCenterPage } from '@/pages/SupportCenterPage';
import { NoticePage } from '@/pages/NoticePage';
import { ResourceLecturePage } from '@/pages/ResourceLecturePage';
import { ResourceQnAPage } from '@/pages/ResourceQnAPage';
import { ResourceFaqPage } from '@/pages/ResourceFaqPage';
import { FishingPointsPage } from '@/pages/FishingPointsPage';
import { MyPage } from '@/pages/MyPage';
import { BrandsPage } from '@/pages/BrandsPage';
import { BrandDetailPage } from '@/pages/BrandDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { CartPage } from '@/pages/CartPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { SimulatorPage } from '@/pages/SimulatorPage';
import { OrderPage } from '@/pages/OrderPage';
import { ServiceRequestPage } from '@/pages/ServiceRequestPage';
import { ConsultingPage } from '@/pages/ConsultingPage';
import AdminDashboard from '@/pages/AdminDashboard';
import { AdminGuard } from '@features/auth';
import { ROUTES } from '@shared/constants/routes';

export function AppRoutes() {
  return (
    <Routes>
      {/* 메인 및 상품 관련 */}
      <Route path={ROUTES.HOME} element={<MainPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />

      {/* 서비스 및 컨설팅 관련 */}
      <Route path={ROUTES.USABILITY_SERVICE} element={<UsabilityServicePage />} />
      <Route path={ROUTES.PURCHASE_CONSULTING} element={<PurchaseConsultingPage />} />

      {/* 고객지원 */}
      <Route path={ROUTES.SUPPORT} element={<SupportCenterPage />} />
      <Route path={ROUTES.SUPPORT_NOTICE} element={<NoticePage />} />
      <Route path={ROUTES.SUPPORT_LECTURE} element={<ResourceLecturePage />} />
      <Route path={ROUTES.SUPPORT_QNA} element={<ResourceQnAPage />} />
      <Route path={ROUTES.SUPPORT_FAQ} element={<ResourceFaqPage />} />
      <Route path={ROUTES.RESOURCE_FISHING_POINTS} element={<FishingPointsPage />} />

      {/* 브랜드 및 정보 관련 */}
      <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
      <Route path="/brands/:brandId" element={<BrandDetailPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />

      {/* 사용자 관련 */}
      <Route path={ROUTES.MY_PAGE} element={<MyPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
      <Route path={ROUTES.SIMULATOR} element={<SimulatorPage />} />
      <Route path={ROUTES.ORDER} element={<OrderPage />} />
      <Route path={ROUTES.SERVICE_REQUEST} element={<ServiceRequestPage />} />
      <Route path={ROUTES.CONSULTING_BOOKING} element={<ConsultingPage />} />

      {/* 관리자 대시보드 */}
      <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
    </Routes>
  );
}
