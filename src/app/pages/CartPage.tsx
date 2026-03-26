import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/format';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">장바구니</h1>
          <Alert>
            <ShoppingBag className="h-4 w-4" />
            <AlertDescription>
              장바구니가 비어 있습니다.
              <Link to={ROUTES.HOME} className="ml-2 text-primary hover:underline">
                쇼핑하러 가기
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 아이템 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-border"
              >
                <div className="flex gap-4">
                  <Link
                    to={ROUTES.PRODUCT_DETAIL(item.productId)}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded border border-border"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={ROUTES.PRODUCT_DETAIL(item.productId)}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xl font-bold text-primary mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                전체 삭제
              </Button>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-4">
              <h2 className="text-xl font-bold mb-4">주문 요약</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>상품 금액</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>배송비</span>
                  <span>
                    {totalPrice >= 50000 ? '무료' : formatPrice(3000)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice + (totalPrice >= 50000 ? 0 : 3000))}
                  </span>
                </div>
              </div>

              {totalPrice < 50000 && (
                <div className="mb-4 p-3 bg-secondary rounded text-sm text-muted-foreground">
                  {formatPrice(50000 - totalPrice)}원 더 구매하면 무료배송!
                </div>
              )}

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => navigate(ROUTES.ORDER)}>
                  주문하기
                </Button>
                <Link to={ROUTES.HOME}>
                  <Button variant="outline" className="w-full">
                    쇼핑 계속하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
