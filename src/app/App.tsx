import { BrowserRouter, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { QuickButtons } from './components/QuickButtons';
import { AppRoutes } from '../routes';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';

// 레이아웃을 결정하는 내부 컴포넌트
function AppContent() {
  const location = useLocation();
  // /admin 으로 시작하는 경로인지 확인
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {/* 관리자 페이지가 아닐 때만 헤더 표시 */}
      {!isAdminPage && <Header />}
      
      <main className="flex-1">
        <AppRoutes />
      </main>

      {/* 관리자 페이지가 아닐 때만 퀵버튼과 푸터 표시 */}
      {!isAdminPage && (
        <>
          <QuickButtons />
          <footer className="bg-foreground text-background py-12">
            <div className="container mx-auto px-4 text-center">
              <p>© 2026 명장쇼핑몰. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}