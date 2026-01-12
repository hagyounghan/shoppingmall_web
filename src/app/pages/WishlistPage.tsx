import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/format';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import {
  Alert,
  AlertDescription,
} from '../components/ui/alert';
import { WishlistItem } from '../../types';

// 덤프 데이터
const DUMMY_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: 'wish_1',
    productId: '1',
    name: 'GARMIN GPSMAP 8612 12인치 GPS 플로터',
    price: 3450000,
    image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
    tag: 'BEST',
  },
  {
    id: 'wish_2',
    productId: '2',
    name: 'LOWRANCE HDS-12 LIVE 어군탐지기',
    price: 2890000,
    image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
    tag: 'NEW',
  },
  {
    id: 'wish_3',
    productId: '3',
    name: 'FURUNO DRS4W 4kW 레이더',
    price: 4250000,
    image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
    tag: 'SALE',
  },
  {
    id: 'wish_4',
    productId: '4',
    name: 'SIMRAD NSS12 EVO3 멀티터치 디스플레이',
    price: 5180000,
    image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400',
    tag: 'BEST',
  },
  {
    id: 'wish_5',
    productId: '6',
    name: 'GARMIN STRIKER Plus 7sv 어군탐지기',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
  },
  {
    id: 'wish_6',
    productId: '10',
    name: 'RAYMARINE Axiom+ 12 디스플레이',
    price: 4850000,
    image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400',
  },
];

export function WishlistPage() {
  const items = DUMMY_WISHLIST_ITEMS;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">찜 목록</h1>
          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              찜한 상품이 없습니다.
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">찜 목록</h1>
          <div className="text-sm text-muted-foreground">
            총 {items.length}개의 상품
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow relative group"
            >
              <Link to={ROUTES.PRODUCT_DETAIL(item.productId)}>
                <ProductCard
                  id={item.productId}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  tag={item.tag}
                />
              </Link>
              
              {/* 액션 버튼들 */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/90 hover:bg-white shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    // 덤프 데이터에서는 동작하지 않음 (표시용)
                    console.log('장바구니 추가:', item.productId);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/90 hover:bg-white shadow-md text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    // 덤프 데이터에서는 동작하지 않음 (표시용)
                    console.log('찜 삭제:', item.productId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => {
              // 덤프 데이터에서는 동작하지 않음 (표시용)
              console.log('전체 삭제');
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            전체 삭제
          </Button>
          <Button
            onClick={() => {
              // 덤프 데이터에서는 동작하지 않음 (표시용)
              console.log('전체 장바구니 추가');
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            전체 장바구니 추가
          </Button>
        </div>
      </div>
    </div>
  );
}

