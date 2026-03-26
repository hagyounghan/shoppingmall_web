import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProductDetail, RelatedProduct } from '../../types';
import { formatPrice } from '../../utils/format';
import { getProductDetail } from '../../api/productApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const categoryLabels: Record<string, string> = {
  transducer: '이미지 송수파기',
  'heading-sensor': '헤딩센서',
  antenna: '안테나',
};

const categoryDescriptions: Record<string, string> = {
  transducer: '이미지 송수파기는 선박 하부에 설치되어 수중의 어군이나 지형을 탐지하는 장비입니다.',
  'heading-sensor': '헤딩센서는 선박의 방향(Heading)을 측정하는 장비입니다. 자동조타 시스템과 연동하여 정확한 방향을 유지합니다.',
  antenna: 'GPS 안테나는 위성 신호를 수신하여 정확한 위치 정보를 제공하는 장비입니다.',
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('detail');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<Record<string, string>>({});

  const { addItem } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeByProductId } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductDetail(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError('상품 정보를 불러오지 못했습니다.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-destructive">{error || '상품을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  // relatedProducts를 카테고리별로 그룹핑
  const relatedProductsByCategory = product.relatedProducts.reduce(
    (acc, rp) => {
      const cat = rp.category;
      acc[cat] = [...(acc[cat] || []), rp];
      return acc;
    },
    {} as Record<string, RelatedProduct[]>
  );

  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : [product.image];

  const handleRelatedProductChange = (category: string, productId: string) => {
    setSelectedRelatedProducts((prev) => {
      const next = { ...prev };
      if (productId === '') {
        delete next[category];
      } else {
        next[category] = productId;
      }
      return next;
    });
  };

  const getSelectedRelated = (category: string): RelatedProduct | null => {
    const pid = selectedRelatedProducts[category];
    if (!pid) return null;
    return relatedProductsByCategory[category]?.find((rp) => rp.product.id === pid) || null;
  };

  const getRelatedExtraPrice = () =>
    Object.values(selectedRelatedProducts).reduce((sum, pid) => {
      for (const rps of Object.values(relatedProductsByCategory)) {
        const rp = rps.find((r) => r.product.id === pid);
        if (rp) return sum + rp.product.price;
      }
      return sum;
    }, 0);

  const getTotalPrice = () => product.price * quantity + getRelatedExtraPrice();

  const handleAddToCart = async () => {
    const optionId = product.options.find((o) => o.name === selectedOption)?.id;
    await addItem(product, quantity, optionId);

    for (const pid of Object.values(selectedRelatedProducts)) {
      for (const rps of Object.values(relatedProductsByCategory)) {
        const rp = rps.find((r) => r.product.id === pid);
        if (rp) {
          await addItem(rp.product, 1);
          break;
        }
      }
    }
  };

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      if (inWishlist) {
        await removeByProductId(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch {
      alert('찜 처리 중 오류가 발생했습니다.');
    }
  };

  const reviews = [
    { id: 1, author: '김**', rating: 5, date: '2024.12.20', content: '제품 품질이 매우 우수합니다.' },
    { id: 2, author: '이**', rating: 5, date: '2024.12.18', content: '전문 어선용으로 매우 만족스럽습니다.' },
    { id: 3, author: '박**', rating: 4, date: '2024.12.15', content: '가격대비 성능이 좋습니다.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Product Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-muted border border-border">
              <ImageWithFallback
                src={images[selectedImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`aspect-square bg-muted border cursor-pointer transition-colors ${
                      selectedImageIdx === idx ? 'border-primary' : 'border-border hover:border-primary'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl mb-4">{product.name}</h1>
              <p className="text-3xl text-primary">{product.price.toLocaleString()}원</p>
            </div>

            <div className="border-t border-b border-border py-6 space-y-6">
              {/* 옵션 선택 */}
              {product.options && product.options.length > 0 && (
                <div>
                  <label className="block mb-2 font-semibold">옵션 선택</label>
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full px-4 py-3 border border-border bg-white"
                  >
                    <option value="">옵션을 선택하세요</option>
                    {product.options.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                        {option.price !== 0 && ` (+${formatPrice(option.price)})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 수량 */}
              <div>
                <label className="block mb-2 font-semibold">수량</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-border hover:bg-secondary"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 text-center border border-border"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-border hover:bg-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 연관 상품 선택 */}
              {Object.entries(relatedProductsByCategory).map(([category, rps]) => (
                <RelatedProductSelector
                  key={category}
                  category={category}
                  rps={rps}
                  selected={selectedRelatedProducts[category] || ''}
                  onChange={(pid) => handleRelatedProductChange(category, pid)}
                />
              ))}

              {/* 총 가격 */}
              {Object.keys(selectedRelatedProducts).length > 0 && (
                <div className="pt-4 border-t border-border">
                  {Object.entries(selectedRelatedProducts).map(([category]) => {
                    const rp = getSelectedRelated(category);
                    if (!rp) return null;
                    return (
                      <div key={category} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{categoryLabels[category] || category}:</span>
                        <span className="font-semibold">
                          {rp.product.name} ({formatPrice(rp.product.price)})
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>총 결제금액:</span>
                    <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                구매하기
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-4 border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  장바구니
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`py-4 border transition-colors flex items-center justify-center gap-2 ${
                    inWishlist
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-primary' : ''}`} />
                  {inWishlist ? '찜 취소' : '찜하기'}
                </button>
              </div>
              <button className="w-full py-4 border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                상담신청
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div>
          <div className="border-b border-border">
            <div className="flex">
              {[
                { key: 'detail', label: '상품 상세' },
                { key: 'review', label: '상품 리뷰' },
                { key: 'qna', label: '상품 문의' },
                { key: 'delivery', label: '배송/교환/환불' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-8 py-4 ${
                    selectedTab === tab.key
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {selectedTab === 'detail' && (
              <div className="space-y-6">
                <h3 className="text-xl">제품 상세 정보</h3>
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {selectedTab === 'review' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">상품 리뷰 ({reviews.length})</h3>
                  <button className="px-6 py-2 border border-border hover:bg-secondary">
                    리뷰 작성
                  </button>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-border p-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span>{review.author}</span>
                          <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p>{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'qna' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">상품 문의</h3>
                  <button className="px-6 py-2 border border-border hover:bg-secondary">
                    문의하기
                  </button>
                </div>
                <p className="text-muted-foreground">등록된 문의가 없습니다.</p>
              </div>
            )}

            {selectedTab === 'delivery' && (
              <div className="space-y-6">
                <h3 className="text-xl">배송/교환/환불 안내</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">배송 안내</h4>
                    <p className="text-muted-foreground">• 배송기간: 주문 후 2-3영업일 소요</p>
                    <p className="text-muted-foreground">• 배송비: 무료 (일부 지역 제외)</p>
                  </div>
                  <div>
                    <h4 className="mb-2">교환/환불 안내</h4>
                    <p className="text-muted-foreground">• 제품 수령 후 7일 이내 교환/환불 가능</p>
                    <p className="text-muted-foreground">• 제품 미개봉 시에만 가능</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 연관 상품 선택 컴포넌트 (useState/useEffect를 루프 밖으로 분리)
function RelatedProductSelector({
  category,
  rps,
  selected,
  onChange,
}: {
  category: string;
  rps: RelatedProduct[];
  selected: string;
  onChange: (productId: string) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) return;
    const handlePopState = () => setIsDialogOpen(false);
    window.history.pushState({ dialogOpen: true, category }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDialogOpen, category]);

  const label = categoryLabels[category] || category;
  const description = categoryDescriptions[category] || '';

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block font-semibold">{label}</label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              title="제품 설명 보기"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] h-[90vh] md:w-[90vw] md:h-[85vh] lg:max-w-5xl lg:max-h-[85vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">{label} 제품 안내</DialogTitle>
              <DialogDescription className="text-base mt-2">{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-6">
              {rps.map((rp) => (
                <div
                  key={rp.id}
                  className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-muted rounded border border-border overflow-hidden">
                        <ImageWithFallback
                          src={rp.product.image}
                          alt={rp.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{rp.product.name}</h4>
                      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                        {rp.product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(rp.product.price)}
                        </span>
                        {selected === rp.product.id && (
                          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded">
                            선택됨
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-border bg-white"
      >
        <option value="">선택 안함</option>
        {rps.map((rp) => (
          <option key={rp.id} value={rp.product.id}>
            {rp.product.name} (+{formatPrice(rp.product.price)})
          </option>
        ))}
      </select>
    </div>
  );
}
