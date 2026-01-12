import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/Header';
import { QuickButtons } from './components/QuickButtons';
import { AppRoutes } from '../routes';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <QuickButtons />
            <footer className="bg-foreground text-background py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl mb-4">명장쇼핑몰</h3>
                <p className="text-sm opacity-80">
                  한국 최고의 해양 · 항해 장비 전문 쇼핑몰
                </p>
              </div>
              <div>
                <h4 className="mb-4">고객센터</h4>
                <ul className="space-y-2 text-sm opacity-80">
                  <li>전화: 02-1234-5678</li>
                  <li>평일: 09:00 - 18:00</li>
                  <li>주말 및 공휴일 휴무</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4">쇼핑 정보</h4>
                <ul className="space-y-2 text-sm opacity-80">
                  <li>이용약관</li>
                  <li>개인정보처리방침</li>
                  <li>배송/교환/반품</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4">회사 정보</h4>
                <ul className="space-y-2 text-sm opacity-80">
                  <li>대표: 홍길동</li>
                  <li>사업자등록번호: 123-45-67890</li>
                  <li>주소: 서울시 강남구</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-background/20 text-center text-sm opacity-60">
              <p>© 2024 명장쇼핑몰. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}