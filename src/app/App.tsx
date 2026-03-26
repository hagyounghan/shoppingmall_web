import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { QuickButtons } from './components/QuickButtons';
import { AppRoutes } from '@/routes';
import { AppProviders } from './providers';
import { AuthProvider } from '@features/auth';
import { CartProvider } from '@features/cart';
import { WishlistProvider } from '@features/wishlist';
import { CategoryProvider } from '@features/categories';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const visited = sessionStorage.getItem('_visited');
    if (!visited) {
      sessionStorage.setItem('_visited', '1');
      fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.STATS_VISIT}`, { method: 'POST' }).catch(() => {});
    }
  }, []);

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className="flex-1">
        <AppRoutes />
      </main>
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
      <AppProviders>
        <AuthProvider>
          <CategoryProvider>
            <CartProvider>
              <WishlistProvider>
                <AppContent />
              </WishlistProvider>
            </CartProvider>
          </CategoryProvider>
        </AuthProvider>
      </AppProviders>
    </BrowserRouter>
  );
}
