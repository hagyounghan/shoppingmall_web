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
import { ROUTES } from '../constants/routes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<MainPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path={ROUTES.USABILITY_SERVICE} element={<UsabilityServicePage />} />
      <Route path={ROUTES.PURCHASE_CONSULTING} element={<PurchaseConsultingPage />} />
      <Route path={ROUTES.USABILITY_CONSULTING} element={<UsabilityConsultingPage />} />
      <Route path={ROUTES.RESOURCE_CENTER} element={<ResourceCenterPage />} />
      <Route path={ROUTES.RESOURCE_LECTURE} element={<ResourceLecturePage />} />
      <Route path={ROUTES.RESOURCE_QNA} element={<ResourceQnAPage />} />
      <Route path={ROUTES.RESOURCE_FISHING_POINTS} element={<FishingPointsPage />} />
      <Route path={ROUTES.MY_PAGE} element={<MyPage />} />
      <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
      <Route path="/brands/:brandId" element={<BrandDetailPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
      <Route path={ROUTES.SIMULATOR} element={<SimulatorPage />} />
    </Routes>
  );
}

