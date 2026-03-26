import { Link } from 'react-router-dom';
import { ROUTES } from '@shared/constants/routes';
import { Button } from '@shared/components/ui/button';
import { ProductCard } from '@shared/components/ProductCard';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { useWishlist } from '@features/wishlist';
import { useCart } from '@features/cart';
import { useAuth } from '@features/auth';

export function WishlistPage() {
  const { items, removeByProductId, isLoading } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">찜 목록</h1>
          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              찜 목록을 보려면 로그인이 필요합니다.
              <Link to="/login" className="ml-2 text-primary hover:underline">
                로그인하기
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary py-12 px-4 flex items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

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

  const handleAddAllToCart = async () => {
    for (const item of items) {
      await addToCart({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
      } as any);
    }
  };

  const handleRemoveAll = async () => {
    for (const item of items) {
      await removeByProductId(item.productId);
    }
  };

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
                    addToCart({
                      id: item.productId,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                    } as any);
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
                    removeByProductId(item.productId);
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
            onClick={handleRemoveAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            전체 삭제
          </Button>
          <Button onClick={handleAddAllToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            전체 장바구니 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
