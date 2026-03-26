import { Routes, Route } from 'react-router-dom';
import { MainPage } from '../app/pages/MainPage';
import { ProductDetailPage } from '../app/pages/ProductDetailPage';
import { UsabilityServicePage } from '../app/pages/UsabilityServicePage';
import { PurchaseConsultingPage } from '../app/pages/PurchaseConsultingPage';
import { UsabilityConsultingPage } from '../app/pages/UsabilityConsultingPage';
import { ResourceCenterPage } from '../app/pages/ResourceCenterPage';
import { ResourceLecturePage } from '../app/pages/ResourceLecturePage';
import { ResourceQnAPage } from '../app/pages/ResourceQnAPage';
import { FishingPointsPage } from '../app/pages/FishingPointsPage';
import { MyPage } from '../app/pages/MyPage';
import { BrandsPage } from '../app/pages/BrandsPage';
import { BrandDetailPage } from '../app/pages/BrandDetailPage';
import { AboutPage } from '../app/pages/AboutPage';
import { CategoryPage } from '../app/pages/CategoryPage';
import { LoginPage } from '../app/pages/LoginPage';
import { CartPage } from '../app/pages/CartPage';
import { WishlistPage } from '../app/pages/WishlistPage';
import { SimulatorPage } from '../app/pages/SimulatorPage';
import { OrderPage } from '../app/pages/OrderPage';
import { ServiceRequestPage } from '../app/pages/ServiceRequestPage';
import { ConsultingPage } from '../app/pages/ConsultingPage';
import AdminDashboard from '../app/pages/AdminDashboard';
import { AdminGuard } from '../app/components/AdminGuard';
import { ROUTES } from '../constants/routes';

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
      <Route path={ROUTES.USABILITY_CONSULTING} element={<UsabilityConsultingPage />} />
      
      {/* 자료실 관련 */}
      <Route path={ROUTES.RESOURCE_CENTER} element={<ResourceCenterPage />} />
      <Route path={ROUTES.RESOURCE_LECTURE} element={<ResourceLecturePage />} />
      <Route path={ROUTES.RESOURCE_QNA} element={<ResourceQnAPage />} />
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

      {/* 관리자 대시보드 (로그인 필요) */}
      <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
    </Routes>
  );
}