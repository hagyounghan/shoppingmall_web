import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, Heart, MessageCircle, Check, X, HelpCircle, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../../contexts/CartContext';
import { RelatedProduct } from '../../types';
import { formatPrice } from '../../utils/format';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('detail');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<Record<string, string>>({});
  const { addItem } = useCart();

  const product = {
    id: '1',
    name: 'GARMIN GPSMAP 8612 12인치 GPS 플로터',
    price: 3450000,
    images: [
      'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=800',
      'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=800',
      'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=800',
    ],
    options: ['12인치', '16인치', '19인치'],
  };

  // 연관 상품 데이터 (실제로는 API에서 가져와야 함)
  const relatedProductsByCategory: Record<string, RelatedProduct[]> = {
    transducer: [
      {
        id: 'transducer-1',
        name: 'GARMIN GT56UHD 이미지 송수파기',
        price: 890000,
        image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
        description: '고해상도 이미지 송수파기로 선명한 수중 영상을 제공합니다. 최대 1,200피트 깊이까지 탐지 가능하며, CHIRP 기술을 사용하여 어군 탐지 정확도가 뛰어납니다.',
        category: 'transducer',
      },
      {
        id: 'transducer-2',
        name: 'GARMIN GT54 이미지 송수파기',
        price: 650000,
        image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
        description: '표준 이미지 송수파기로 일반적인 낚시와 어업에 적합합니다. 최대 800피트 깊이까지 탐지 가능하며, 가성비가 우수한 제품입니다.',
        category: 'transducer',
      },
      {
        id: 'transducer-3',
        name: 'GARMIN GT52 이미지 송수파기',
        price: 450000,
        image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
        description: '경제형 이미지 송수파기로 소형 선박이나 레저용에 적합합니다. 최대 600피트 깊이까지 탐지 가능하며, 기본적인 어군 탐지 기능을 제공합니다.',
        category: 'transducer',
      },
    ],
    'heading-sensor': [
      {
        id: 'heading-1',
        name: 'GARMIN GHC 50 헤딩센서',
        price: 450000,
        image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
        description: '자동조타 시스템용 고정밀 헤딩센서입니다. GPS와 연동하여 정확한 방향 정보를 제공하며, 자동조타 기능의 핵심 부품입니다. 10Hz 업데이트 속도로 빠른 반응성을 제공합니다.',
        category: 'heading-sensor',
      },
      {
        id: 'heading-2',
        name: 'GARMIN GHC 20 헤딩센서',
        price: 320000,
        image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
        description: '경제형 헤딩센서로 기본적인 방향 정보를 제공합니다. 소형 선박이나 레저용에 적합하며, 5Hz 업데이트 속도를 지원합니다.',
        category: 'heading-sensor',
      },
      {
        id: 'heading-3',
        name: 'GARMIN GHC 10 헤딩센서',
        price: 280000,
        image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
        description: '기본 헤딩센서로 방향 정보를 제공합니다. 간단한 항해에 필요한 기본 기능을 제공하며, 가격이 저렴합니다.',
        category: 'heading-sensor',
      },
    ],
    antenna: [
      {
        id: 'antenna-1',
        name: 'GARMIN GPS 19x 안테나',
        price: 320000,
        image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
        description: '고정밀 GPS 안테나로 정확한 위치 정보를 제공합니다. WAAS/EGNOS 지원으로 3미터 이내의 정확도를 보장하며, 빠른 위성 신호 수신이 가능합니다.',
        category: 'antenna',
      },
      {
        id: 'antenna-2',
        name: 'GARMIN GPS 18x 안테나',
        price: 250000,
        image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
        description: '표준 GPS 안테나로 일반적인 항해에 적합합니다. 5미터 이내의 정확도를 제공하며, 안정적인 신호 수신이 가능합니다.',
        category: 'antenna',
      },
      {
        id: 'antenna-3',
        name: 'GARMIN GPS 17x 안테나',
        price: 180000,
        image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
        description: '경제형 GPS 안테나로 기본적인 위치 정보를 제공합니다. 소형 선박이나 레저용에 적합하며, 가격이 저렴합니다.',
        category: 'antenna',
      },
    ],
  };

  const categoryDescriptions: Record<string, string> = {
    transducer: '이미지 송수파기는 선박 하부에 설치되어 수중의 어군이나 지형을 탐지하는 장비입니다. 고주파 신호를 발사하고 반사된 신호를 받아 수중 영상을 생성합니다.',
    'heading-sensor': '헤딩센서는 선박의 방향(Heading)을 측정하는 장비입니다. 자동조타 시스템과 연동하여 선박이 정확한 방향을 유지하도록 도와줍니다.',
    antenna: 'GPS 안테나는 위성 신호를 수신하여 정확한 위치 정보를 제공하는 장비입니다. GPS 플로터와 연결하여 실시간 위치 추적이 가능합니다.',
  };

  const categoryLabels: Record<string, string> = {
    transducer: '이미지 송수파기',
    'heading-sensor': '헤딩센서',
    antenna: '안테나',
  };

  const handleRelatedProductChange = (category: string, productId: string) => {
    setSelectedRelatedProducts((prev) => {
      const newSelected = { ...prev };
      if (productId === '') {
        delete newSelected[category];
      } else {
        newSelected[category] = productId;
      }
      return newSelected;
    });
  };

  const getSelectedProduct = (category: string): RelatedProduct | null => {
    const productId = selectedRelatedProducts[category];
    if (!productId) return null;
    return relatedProductsByCategory[category]?.find((p) => p.id === productId) || null;
  };

  const getTotalPrice = () => {
    const basePrice = product.price * quantity;
    const relatedPrice = Object.values(selectedRelatedProducts).reduce((sum, productId) => {
      // 모든 카테고리에서 선택된 제품 찾기
      for (const products of Object.values(relatedProductsByCategory)) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          return sum + product.price;
        }
      }
      return sum;
    }, 0);
    return basePrice + relatedPrice;
  };

  const handleAddToCart = () => {
    // 메인 제품 추가
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      },
      quantity
    );

    // 선택된 연관 상품 추가
    Object.values(selectedRelatedProducts).forEach((productId) => {
      // 모든 카테고리에서 선택된 제품 찾기
      for (const products of Object.values(relatedProductsByCategory)) {
        const relatedProduct = products.find((p) => p.id === productId);
        if (relatedProduct) {
          addItem(
            {
              id: relatedProduct.id,
              name: relatedProduct.name,
              price: relatedProduct.price,
              image: relatedProduct.image,
            },
            1
          );
          break;
        }
      }
    });
  };

  const reviews = [
    { id: 1, author: '김**', rating: 5, date: '2024.12.20', content: '제품 품질이 매우 우수합니다. 해상도가 선명하고 조작이 간편해요.' },
    { id: 2, author: '이**', rating: 5, date: '2024.12.18', content: '전문 어선용으로 구매했는데 매우 만족스럽습니다.' },
    { id: 3, author: '박**', rating: 4, date: '2024.12.15', content: '가격대비 성능이 좋습니다. A/S도 신속하게 처리해주셨어요.' },
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
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square bg-muted border border-border cursor-pointer hover:border-primary transition-colors">
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl mb-4">{product.name}</h1>
              <p className="text-3xl text-primary">{product.price.toLocaleString()}원</p>
            </div>

            <div className="border-t border-b border-border py-6 space-y-6">
              <div>
                <label className="block mb-2 font-semibold">옵션 선택</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-white"
                >
                  <option value="">옵션을 선택하세요</option>
                  {product.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

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
              {Object.entries(relatedProductsByCategory).map(([category, products]) => {
                const [isDialogOpen, setIsDialogOpen] = useState(false);

                // Dialog 상태 변경 핸들러
                const handleDialogChange = (open: boolean) => {
                  setIsDialogOpen(open);
                  
                  if (open) {
                    // 팝업이 열릴 때 history에 state 추가
                    window.history.pushState({ dialogOpen: true, category }, '');
                  }
                };

                // 뒤로가기 버튼 처리
                useEffect(() => {
                  if (!isDialogOpen) return;

                  const handlePopState = (event: PopStateEvent) => {
                    // 뒤로가기 버튼이 눌렸을 때 팝업만 닫기
                    if (isDialogOpen) {
                      setIsDialogOpen(false);
                    }
                  };

                  window.addEventListener('popstate', handlePopState);

                  return () => {
                    window.removeEventListener('popstate', handlePopState);
                  };
                }, [isDialogOpen]);

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block font-semibold">{categoryLabels[category]}</label>
                      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
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
                            <DialogTitle className="text-2xl">{categoryLabels[category]} 제품 안내</DialogTitle>
                            <DialogDescription className="text-base mt-2">
                              {categoryDescriptions[category]}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-6">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                              >
                                <div className="flex gap-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-24 h-24 bg-muted rounded border border-border overflow-hidden">
                                      <ImageWithFallback
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                                    <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                                      {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-bold text-primary">
                                        {formatPrice(product.price)}
                                      </span>
                                      {selectedRelatedProducts[category] === product.id && (
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
                      value={selectedRelatedProducts[category] || ''}
                      onChange={(e) => handleRelatedProductChange(category, e.target.value)}
                      className="w-full px-4 py-3 border border-border bg-white"
                    >
                      <option value="">선택 안함</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.description} (+{formatPrice(product.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {/* 총 가격 표시 */}
              {Object.keys(selectedRelatedProducts).length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="space-y-2 mb-3">
                    {Object.entries(selectedRelatedProducts).map(([category, productId]) => {
                      const selectedProduct = getSelectedProduct(category);
                      if (!selectedProduct) return null;
                      return (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {categoryLabels[category]}:
                          </span>
                          <span className="font-semibold">
                            {selectedProduct.name} ({formatPrice(selectedProduct.price)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">추가 옵션 합계:</span>
                    <span className="text-sm font-semibold">
                      {formatPrice(
                        Object.values(selectedRelatedProducts).reduce((sum, productId) => {
                          for (const products of Object.values(relatedProductsByCategory)) {
                            const product = products.find((p) => p.id === productId);
                            if (product) return sum + product.price;
                          }
                          return sum;
                        }, 0)
                      )}
                    </span>
                  </div>
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
                <button className="py-4 border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  상담신청
                </button>
              </div>
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
                  <p>GARMIN GPSMAP 8612는 12인치 고해상도 디스플레이를 탑재한 프리미엄 GPS 플로터입니다.</p>
                  <ul>
                    <li>12인치 터치스크린 디스플레이</li>
                    <li>높은 밝기와 선명한 화질</li>
                    <li>방수 및 내구성 설계</li>
                    <li>NMEA 2000 네트워크 지원</li>
                    <li>다양한 차트 호환</li>
                  </ul>
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
