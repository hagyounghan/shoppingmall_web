import { Routes, Route } from 'react-router-dom';
import { MainPage } from '../app/pages/MainPage';
import { ProductDetailPage } from '../app/pages/ProductDetailPage';
import { ServiceRequestPage } from '../app/pages/ServiceRequestPage';
import { ConsultingPage } from '../app/pages/ConsultingPage';
import { FishingPointsPage } from '../app/pages/FishingPointsPage';
import { MyPage } from '../app/pages/MyPage';
import { BrandsPage } from '../app/pages/BrandsPage';
import { BrandDetailPage } from '../app/pages/BrandDetailPage';
import { AboutPage } from '../app/pages/AboutPage';
import { CategoryPage } from '../app/pages/CategoryPage';
import { LoginPage } from '../app/pages/LoginPage';
import { CartPage } from '../app/pages/CartPage';
import { WishlistPage } from '../app/pages/WishlistPage';
import { ROUTES } from '../constants/routes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<MainPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path={ROUTES.SERVICE} element={<ServiceRequestPage />} />
      <Route path={ROUTES.CONSULTING} element={<ConsultingPage />} />
      <Route path={ROUTES.FISHING_POINTS} element={<FishingPointsPage />} />
      <Route path={ROUTES.MY_PAGE} element={<MyPage />} />
      <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
      <Route path="/brands/:brandId" element={<BrandDetailPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
    </Routes>
  );
}

