import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { apiPost } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/format';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle } from 'lucide-react';
import {
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  CreateOrderRequest,
  CreateGuestOrderRequest,
  OrderResponse,
} from '../../types';

const PAYMENT_METHODS: PaymentMethod[] = ['CARD', 'BANK_TRANSFER'];

export function OrderPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [note, setNote] = useState('');

  // 비로그인 폼
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 50000 ? 0 : 3000;

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-secondary py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Alert>
            <AlertDescription>
              장바구니가 비어 있습니다.{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.HOME)}
                className="text-primary hover:underline"
              >
                쇼핑하러 가기
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-secondary py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center space-y-4 max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">주문이 완료되었습니다!</h2>
          <p className="text-muted-foreground">주문해 주셔서 감사합니다. 빠르게 처리해 드리겠습니다.</p>
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => navigate(ROUTES.HOME)}>쇼핑 계속하기</Button>
            {isAuthenticated && (
              <Button variant="outline" onClick={() => navigate(ROUTES.MY_PAGE)}>
                주문 내역 보기
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const orderItems = items.map((item) => ({
      productId: item.productId,
      optionId: item.optionId,
      quantity: item.quantity,
    }));

    try {
      if (isAuthenticated) {
        const body: CreateOrderRequest = {
          items: orderItems,
          paymentMethod,
          note: note || undefined,
        };
        await apiPost<OrderResponse>(API_ENDPOINTS.ORDERS, body);
      } else {
        if (!guestName || !guestEmail) {
          setError('이름과 이메일을 입력해 주세요.');
          setLoading(false);
          return;
        }
        const body: CreateGuestOrderRequest = {
          items: orderItems,
          paymentMethod,
          note: note || undefined,
          guestName,
          guestEmail,
          guestPhone: guestPhone || undefined,
        };
        await apiPost<OrderResponse>(API_ENDPOINTS.ORDERS_GUEST, body);
      }

      await clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">주문하기</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 주문 정보 입력 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 비로그인 고객 정보 */}
              {!isAuthenticated && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border space-y-4">
                  <h2 className="text-xl font-bold">주문자 정보</h2>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="guest-name">이름 <span className="text-destructive">*</span></Label>
                    <Input
                      id="guest-name"
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest-email">이메일 <span className="text-destructive">*</span></Label>
                    <Input
                      id="guest-email"
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest-phone">전화번호 (선택)</Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* 로그인 유저 정보 표시 */}
              {isAuthenticated && user && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border space-y-2">
                  <h2 className="text-xl font-bold">주문자 정보</h2>
                  <p className="text-muted-foreground text-sm">이름: <span className="text-foreground font-medium">{user.name}</span></p>
                  <p className="text-muted-foreground text-sm">이메일: <span className="text-foreground font-medium">{user.email}</span></p>
                  {user.phone && (
                    <p className="text-muted-foreground text-sm">전화번호: <span className="text-foreground font-medium">{user.phone}</span></p>
                  )}
                </div>
              )}

              {/* 주문 메모 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-xl font-bold mb-4">주문 메모 (선택)</h2>
                <div>
                  <Label htmlFor="order-note">요청사항</Label>
                  <Input
                    id="order-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="배송 관련 요청사항을 입력하세요"
                    className="mt-1"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 결제 수단 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-xl font-bold mb-4">결제 수단</h2>
                <div className="flex gap-4 flex-wrap">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        disabled={loading}
                        className="accent-primary"
                      />
                      <span className="font-medium">{PAYMENT_METHOD_LABELS[method]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 주문 상품 목록 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-xl font-bold mb-4">주문 상품</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded border border-border"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">수량: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 결제 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-4 space-y-4">
                <h2 className="text-xl font-bold">결제 금액</h2>

                {error && isAuthenticated && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>상품 금액</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>배송비</span>
                    <span>{shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                    <span>총 결제금액</span>
                    <span className="text-primary">{formatPrice(totalPrice + shippingFee)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? '처리 중...' : `${formatPrice(totalPrice + shippingFee)} 결제하기`}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(ROUTES.CART)}
                  disabled={loading}
                >
                  장바구니로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
