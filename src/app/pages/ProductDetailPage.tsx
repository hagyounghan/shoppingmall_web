import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('detail');

  const product = {
    name: 'GARMIN GPSMAP 8612 12인치 GPS 플로터',
    price: 3450000,
    images: [
      'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=800',
      'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=800',
      'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=800',
    ],
    options: ['12인치', '16인치', '19인치'],
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

            <div className="border-t border-b border-border py-6 space-y-4">
              <div>
                <label className="block mb-2">옵션 선택</label>
                <select className="w-full px-4 py-3 border border-border bg-white">
                  {product.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">수량</label>
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
            </div>

            <div className="space-y-3">
              <button className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                구매하기
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-4 border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
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
