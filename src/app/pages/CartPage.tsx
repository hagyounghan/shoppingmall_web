import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/format';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import {
  Alert,
  AlertDescription,
} from '../components/ui/alert';
import { CartItem } from '../../types';

// 덤프 데이터
const DUMMY_CART_ITEMS: CartItem[] = [
  {
    id: 'cart_1',
    productId: '1',
    name: 'GARMIN GPSMAP 8612 12인치 GPS 플로터',
    price: 3450000,
    image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
    quantity: 1,
  },
  {
    id: 'cart_2',
    productId: '2',
    name: 'LOWRANCE HDS-12 LIVE 어군탐지기',
    price: 2890000,
    image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
    quantity: 2,
  },
  {
    id: 'cart_3',
    productId: '5',
    name: 'ICOM IC-M506 고정형 VHF 무선기',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
    quantity: 1,
  },
];

export function CartPage() {
  // 덤프 데이터 사용
  const items = DUMMY_CART_ITEMS;
  
  // 덤프 데이터용 계산 함수
  const getDummyTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

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
                          onClick={() => {
                            // 덤프 데이터에서는 동작하지 않음 (표시용)
                            console.log('수량 감소:', item.productId);
                          }}
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
                          onClick={() => {
                            // 덤프 데이터에서는 동작하지 않음 (표시용)
                            console.log('수량 증가:', item.productId);
                          }}
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
                          onClick={() => {
                            // 덤프 데이터에서는 동작하지 않음 (표시용)
                            console.log('삭제:', item.productId);
                          }}
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
                onClick={() => {
                  // 덤프 데이터에서는 동작하지 않음 (표시용)
                  console.log('전체 삭제');
                }}
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
                  <span>{formatPrice(getDummyTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>배송비</span>
                  <span>
                    {getDummyTotalPrice() >= 50000 ? '무료' : formatPrice(3000)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-primary">
                    {formatPrice(
                      getDummyTotalPrice() + (getDummyTotalPrice() >= 50000 ? 0 : 3000)
                    )}
                  </span>
                </div>
              </div>

              {getDummyTotalPrice() < 50000 && (
                <div className="mb-4 p-3 bg-secondary rounded text-sm text-muted-foreground">
                  {formatPrice(50000 - getDummyTotalPrice())}원 더 구매하면 무료배송!
                </div>
              )}

              <div className="space-y-3">
                <Button className="w-full" size="lg">
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

