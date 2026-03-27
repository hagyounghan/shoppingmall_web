import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, MessageCircle, HelpCircle, ChevronLeft, ChevronRight, Star, LogIn, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '@shared/components/figma/ImageWithFallback';
import { useCart } from '@features/cart';
import { useWishlist } from '@features/wishlist';
import { useAuth } from '@features/auth';
import { RelatedProduct, ReviewItem, PaginatedReviews, InquiryItem, PaginatedInquiries } from '@shared/types';
import { formatPrice } from '@shared/utils/format';
import { useProductDetail } from '@features/products';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/ui/dialog';

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
  const navigate = useNavigate();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedTab, setSelectedTab] = useState('detail');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<Record<string, string>>({});
  const [selectedCompanions, setSelectedCompanions] = useState<Record<string, string>>({});
  const [thumbOffset, setThumbOffset] = useState(0);
  const [cartToast, setCartToast] = useState(false);

  // 개별 수량 관리 (옵션/동반상품 각각)
  const [orderItems, setOrderItems] = useState<{
    key: string;       // 'base' | 'option' | `companion-${groupId}`
    name: string;
    price: number;
    quantity: number;
    productId: string;
    optionId?: string;
  }[]>([]);

  const { addItem } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeByProductId } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const { data: product, isLoading, isError } = useProductDetail(id ?? '');

  // 옵션이 없으면 기본 상품을 orderItems에 초기화 (훅은 early return 위에 있어야 함)
  useEffect(() => {
    if (!product?.options?.length && product) {
      setOrderItems([{ key: 'base', name: product.name, price: product.price, quantity: 1, productId: product.id }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // 옵션 선택 → orderItems 동기화
  const handleOptionSelect = useCallback((optionName: string) => {
    if (!product) return;
    setSelectedOption(optionName);
    if (!optionName) {
      setOrderItems((prev) => prev.filter((i) => i.key !== 'option'));
      return;
    }
    const opt = product.options?.find((o) => o.name === optionName);
    if (!opt) return;
    setOrderItems((prev) => [
      ...prev.filter((i) => i.key !== 'option'),
      { key: 'option', name: opt.name, price: opt.price || product.price, quantity: 1, productId: product.id, optionId: opt.id },
    ]);
  }, [product]);

  // 동반상품 선택 → orderItems 동기화
  const handleCompanionSelect = useCallback((groupId: string, productId: string) => {
    if (!product) return;
    setSelectedCompanions((prev) => {
      const next = { ...prev };
      if (!productId) delete next[groupId];
      else next[groupId] = productId;
      return next;
    });
    const itemKey = `companion-${groupId}`;
    if (!productId) {
      setOrderItems((prev) => prev.filter((i) => i.key !== itemKey));
      return;
    }
    const group = (product.companionGroups ?? []).find((g) => g.id === groupId);
    const cItem = group?.items.find((i) => (i.companionProduct ?? i.product)?.id === productId);
    if (!cItem) return;
    const cp = cItem.companionProduct ?? cItem.product;
    if (!cp) return;
    setOrderItems((prev) => [
      ...prev.filter((i) => i.key !== itemKey),
      { key: itemKey, name: cp.name, price: cp.price, quantity: 1, productId: cp.id },
    ]);
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-destructive">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // relatedProducts를 카테고리별로 그룹핑
  const relatedProductsByCategory = (product.relatedProducts ?? []).reduce(
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

  const useCompanionGroups = (product.companionGroups ?? []).length > 0;

  // 기존 relatedProducts (구형 호환)
  const handleRelatedProductChange = (category: string, productId: string) => {
    setSelectedRelatedProducts((prev) => {
      const next = { ...prev };
      if (productId === '') delete next[category];
      else next[category] = productId;
      return next;
    });
  };

  const getSelectedRelated = (category: string): RelatedProduct | null => {
    const pid = selectedRelatedProducts[category];
    if (!pid) return null;
    return relatedProductsByCategory[category]?.find((rp) => rp.product.id === pid) || null;
  };

  // orderItems 수량 조정
  const updateOrderItemQty = (key: string, delta: number) => {
    setOrderItems((prev) => prev.map((i) => i.key === key ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeOrderItem = (key: string) => {
    setOrderItems((prev) => prev.filter((i) => i.key !== key));
    if (key === 'option') setSelectedOption('');
    if (key.startsWith('companion-')) {
      const groupId = key.replace('companion-', '');
      setSelectedCompanions((prev) => { const next = { ...prev }; delete next[groupId]; return next; });
    }
  };

  // 합계 (orderItems 기준)
  const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = orderItems.reduce((sum, i) => sum + i.quantity, 0);

  // 구형 relatedProducts 합계 (fallback)
  const getRelatedTotal = () =>
    Object.values(selectedRelatedProducts).reduce((sum, pid) => {
      for (const rps of Object.values(relatedProductsByCategory)) {
        const rp = rps.find((r) => r.product.id === pid);
        if (rp) return sum + rp.product.price;
      }
      return sum;
    }, 0);

  const handleAddToCart = async () => {
    if (useCompanionGroups || product.options?.length) {
      if (orderItems.length === 0) { alert('상품을 선택해주세요.'); return; }
      for (const item of orderItems) {
        await addItem({ ...product, id: item.productId, price: item.price }, item.quantity, item.optionId);
      }
    } else {
      // 구형: base item + related
      const baseItem = orderItems.find((i) => i.key === 'base');
      await addItem(product, baseItem?.quantity ?? 1);
      for (const pid of Object.values(selectedRelatedProducts)) {
        for (const rps of Object.values(relatedProductsByCategory)) {
          const rp = rps.find((r) => r.product.id === pid);
          if (rp) { await addItem(rp.product, 1); break; }
        }
      }
    }
    setCartToast(true);
    setTimeout(() => setCartToast(false), 2500);
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

  const THUMB_COUNT = 3;
  const canPrevThumb = thumbOffset > 0;
  const canNextThumb = thumbOffset + THUMB_COUNT < images.length;
  const visibleThumbs = images.slice(thumbOffset, thumbOffset + THUMB_COUNT);

  return (
    <div className="min-h-screen bg-white">
      {cartToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          장바구니에 추가하였습니다 🛒
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Product Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="aspect-square w-full bg-muted border border-border relative">
              <ImageWithFallback
                src={images[selectedImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const prev = selectedImageIdx - 1;
                      if (prev < 0) return;
                      setSelectedImageIdx(prev);
                      if (prev < thumbOffset) setThumbOffset(Math.max(0, thumbOffset - 1));
                    }}
                    disabled={selectedImageIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white border border-border disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const next = selectedImageIdx + 1;
                      if (next >= images.length) return;
                      setSelectedImageIdx(next);
                      if (next >= thumbOffset + THUMB_COUNT) setThumbOffset(thumbOffset + 1);
                    }}
                    disabled={selectedImageIdx === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white border border-border disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* 썸네일 (3개 + 슬라이드) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                {images.length > THUMB_COUNT && (
                  <button
                    onClick={() => setThumbOffset(Math.max(0, thumbOffset - 1))}
                    disabled={!canPrevThumb}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-border hover:bg-secondary disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="flex flex-1 gap-2">
                  {visibleThumbs.map((img, i) => {
                    const idx = thumbOffset + i;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`flex-1 aspect-square bg-muted border cursor-pointer transition-colors ${
                          selectedImageIdx === idx ? 'border-primary' : 'border-border hover:border-primary'
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
                {images.length > THUMB_COUNT && (
                  <button
                    onClick={() => setThumbOffset(Math.min(images.length - THUMB_COUNT, thumbOffset + 1))}
                    disabled={!canNextThumb}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-border hover:bg-secondary disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* 시리즈 모델 선택 */}
            {product.series && product.series.products.length > 1 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">{product.series.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.series.products.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => navigate(`/products/${sp.id}`)}
                      className={`flex flex-col items-center gap-1 p-2 border transition-colors ${
                        sp.id === product.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary'
                      }`}
                      style={{ minWidth: '72px', maxWidth: '88px' }}
                    >
                      <div className="w-14 h-14 bg-muted overflow-hidden">
                        {sp.image ? (
                          <ImageWithFallback src={sp.image} alt={sp.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-100" />
                        )}
                      </div>
                      <span className={`text-[10px] text-center leading-tight break-all ${sp.id === product.id ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                        {sp.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.series && (
                <p className="text-sm text-muted-foreground mb-1">{product.series.name}</p>
              )}
              <h1 className="text-2xl mb-4">{product.name}</h1>
              <p className="text-3xl text-primary">
                {product.price.toLocaleString()}원{product.options?.length > 0 ? '~' : ''}
              </p>
            </div>

            <div className="border-t border-b border-border py-6 space-y-4">
              {/* 본체 선택 (옵션 있으면 드롭다운) */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold w-28 shrink-0">본체</span>
                {product.options && product.options.length > 0 ? (
                  <select
                    value={selectedOption}
                    onChange={(e) => handleOptionSelect(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border bg-white text-sm"
                  >
                    <option value="">모델을 선택하세요</option>
                    {product.options.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}{option.price > 0 ? ` — ${formatPrice(option.price)}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-muted-foreground">{product.name}</span>
                )}
              </div>

              {/* 같이 구매 드롭다운 */}
              {useCompanionGroups
                ? (product.companionGroups ?? []).map((group) => (
                    <div key={group.id} className="flex items-center gap-4">
                      <span className="text-sm font-semibold w-28 shrink-0 flex items-center gap-1">
                        {group.isRequired && <span className="text-red-500 text-xs">✓</span>}
                        {group.label}
                      </span>
                      <select
                        value={selectedCompanions[group.id] || ''}
                        onChange={(e) => handleCompanionSelect(group.id, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border bg-white text-sm"
                      >
                        <option value="">{group.isRequired ? '- [필수] 옵션을 선택해 주세요 -' : '- [선택] 옵션을 선택해 주세요 -'}</option>
                        {group.items.map((item) => {
                          const cp = item.companionProduct ?? item.product;
                          if (!cp) return null;
                          return (
                            <option key={item.id} value={cp.id}>
                              {cp.name}{cp.price > 0 ? ` — ${formatPrice(cp.price)}` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ))
                : Object.entries(relatedProductsByCategory).map(([category, rps]) => (
                    <RelatedProductSelector
                      key={category}
                      category={category}
                      rps={rps}
                      selected={selectedRelatedProducts[category] || ''}
                      onChange={(pid) => handleRelatedProductChange(category, pid)}
                    />
                  ))
              }

              {/* 선택된 상품 목록 테이블 */}
              {(useCompanionGroups || product.options?.length > 0) && orderItems.length > 0 && (
                <div className="mt-2 border border-border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">상품명</th>
                        <th className="px-4 py-2 text-center font-medium text-muted-foreground w-32">상품수</th>
                        <th className="px-4 py-2 text-right font-medium text-muted-foreground w-32">가격</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orderItems.map((item) => (
                        <tr key={item.key} className="bg-white">
                          <td className="px-4 py-3">
                            <span className="inline-block bg-slate-700 text-white text-xs px-2 py-1 rounded">{item.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateOrderItemQty(item.key, -1)}
                                className="w-6 h-6 flex items-center justify-center border border-border rounded hover:bg-secondary text-xs"
                              ><Minus className="w-3 h-3"/></button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateOrderItemQty(item.key, 1)}
                                className="w-6 h-6 flex items-center justify-center border border-border rounded hover:bg-secondary text-xs"
                              ><Plus className="w-3 h-3"/></button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                          <td className="px-2 py-3">
                            <button onClick={() => removeOrderItem(item.key)} className="text-muted-foreground hover:text-destructive">
                              <span className="text-xs">✕</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-end gap-2 text-sm">
                    <span className="text-muted-foreground">총 상품금액(수량):</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                    <span className="text-muted-foreground">({totalCount}개)</span>
                  </div>
                </div>
              )}

              {/* 구형 relatedProducts 합계 (fallback) */}
              {!useCompanionGroups && !product.options?.length && (
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>본체</span>
                    <span>{formatPrice(product.price)} × {orderItems.find(i => i.key === 'base')?.quantity ?? 1}</span>
                  </div>
                  {Object.entries(selectedRelatedProducts).map(([category]) => {
                    const rp = getSelectedRelated(category);
                    if (!rp) return null;
                    return (
                      <div key={category} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{categoryLabels[category] || category}</span>
                        <span>{rp.product.name} ({formatPrice(rp.product.price)})</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between text-xl font-bold pt-2 border-t border-border">
                    <span>합계</span>
                    <span className="text-primary">{formatPrice(product.price * (orderItems.find(i => i.key === 'base')?.quantity ?? 1) + getRelatedTotal())}</span>
                  </div>
                  {/* 기본 상품 수량 (구형) */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm font-medium">수량</span>
                    <button onClick={() => updateOrderItemQty('base', -1)} className="w-8 h-8 flex items-center justify-center border border-border hover:bg-secondary"><Minus className="w-4 h-4"/></button>
                    <span className="w-10 text-center">{orderItems.find(i => i.key === 'base')?.quantity ?? 1}</span>
                    <button onClick={() => updateOrderItemQty('base', 1)} className="w-8 h-8 flex items-center justify-center border border-border hover:bg-secondary"><Plus className="w-4 h-4"/></button>
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
              <div>
                {product.htmlDescription ? (
                  <div
                    className="product-html-detail"
                    dangerouslySetInnerHTML={{ __html: product.htmlDescription }}
                  />
                ) : (
                  <p className="text-muted-foreground">{product.description}</p>
                )}
              </div>
            )}

            {selectedTab === 'review' && (
              <ProductReviews
                productId={product.id}
                isAuthenticated={isAuthenticated}
                currentUserId={user?.id}
              />
            )}

            {selectedTab === 'qna' && (
              <ProductInquiries
                productId={product.id}
                isAuthenticated={isAuthenticated}
                currentUserId={user?.id}
              />
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


// ─────────────────────────────────────────────────────────────
// 상품 리뷰 컴포넌트
// ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-5 h-5 ${n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} ${onChange ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => onChange?.(n)}
        />
      ))}
    </div>
  );
}

function ProductReviews({
  productId,
  currentUserId,
}: {
  productId: string;
  isAuthenticated: boolean;
  currentUserId?: string;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const TAKE = 5;

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await apiGet<PaginatedReviews>(`${API_ENDPOINTS.PRODUCT_REVIEWS(productId)}?page=${p}&take=${TAKE}`);
      setReviews(res.data);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(page); }, [fetchReviews, page]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    try {
      await apiDelete(API_ENDPOINTS.PRODUCT_REVIEW(productId, reviewId));
      fetchReviews(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const totalPages = Math.ceil(total / TAKE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pr-20">
        <h3 className="text-xl">상품 리뷰 <span className="text-muted-foreground text-base">({total})</span></h3>
        <button
          onClick={() => navigate('/my')}
          className="flex items-center gap-1 px-4 py-2 border border-border text-sm hover:bg-secondary transition-colors"
        >
          마이페이지에서 리뷰 작성
        </button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>아직 작성된 리뷰가 없습니다.</p>
          <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <StarRating value={review.rating} />
                  <p className="text-sm font-semibold mt-1">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                {currentUserId === review.userId && (
                  <button onClick={() => handleDelete(review.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">삭제</button>
                )}
              </div>
              <p className="text-sm mt-2 leading-relaxed">{review.content}</p>
              {review.reply && (
                <div className="mt-3 p-3 bg-secondary/50 border-l-2 border-primary text-sm">
                  <p className="text-xs font-semibold text-primary mb-1">판매자 답변</p>
                  <p className="text-muted-foreground">{review.reply.content}</p>
                </div>
              )}
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-border text-sm disabled:opacity-30 hover:bg-secondary transition-colors">이전</button>
              <span className="px-3 py-1 text-sm text-muted-foreground">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-border text-sm disabled:opacity-30 hover:bg-secondary transition-colors">다음</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 상품 문의 컴포넌트
// ─────────────────────────────────────────────────────────────
function ProductInquiries({
  productId,
  isAuthenticated,
  currentUserId,
}: {
  productId: string;
  isAuthenticated: boolean;
  currentUserId?: string;
}) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const TAKE = 10;

  const fetchInquiries = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await apiGet<PaginatedInquiries>(`${API_ENDPOINTS.PRODUCT_INQUIRIES(productId)}?page=${p}&take=${TAKE}`);
      setInquiries(res.data);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchInquiries(page); }, [fetchInquiries, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setSubmitError('문의 제목을 입력해주세요.'); return; }
    if (content.length < 5) { setSubmitError('문의 내용을 5자 이상 입력해주세요.'); return; }
    setSubmitError('');
    setSubmitting(true);
    try {
      await apiPost(API_ENDPOINTS.PRODUCT_INQUIRIES(productId), { title: title.trim(), content });
      setTitle('');
      setContent('');
      setShowForm(false);
      setPage(1);
      fetchInquiries(1);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '문의 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('문의를 삭제하시겠습니까?')) return;
    try {
      await apiDelete(API_ENDPOINTS.PRODUCT_INQUIRY(productId, inquiryId));
      fetchInquiries(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const totalPages = Math.ceil(total / TAKE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pr-20">
        <h3 className="text-xl">상품 문의 <span className="text-muted-foreground text-base">({total})</span></h3>
        {isAuthenticated ? (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-accent transition-colors"
          >
            {showForm ? '취소' : '문의 작성'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1 px-4 py-2 border border-border text-sm hover:bg-secondary transition-colors"
          >
            <LogIn className="w-4 h-4" />
            로그인 후 문의 작성
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border bg-secondary/30">
          <p className="text-sm font-semibold mb-2">문의 제목</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력해주세요"
            className="w-full px-4 py-3 border border-border bg-white text-sm mb-4"
            maxLength={200}
          />
          <p className="text-sm font-semibold mb-2">문의 내용 <span className="text-muted-foreground font-normal">(최소 5자)</span></p>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의 내용을 입력해주세요."
            className="w-full px-4 py-3 border border-border bg-white resize-none text-sm"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{content.length}/2000</p>
          {submitError && <p className="text-sm text-destructive mt-2">{submitError}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-sm hover:bg-secondary transition-colors">취소</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-accent transition-colors disabled:opacity-50">
              {submitting ? '등록 중...' : '문의 등록'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">불러오는 중...</p>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>아직 작성된 문의가 없습니다.</p>
        </div>
      ) : (
        <div className="border-t border-border">
          {inquiries.map((inquiry) => {
            const isOwner = currentUserId === inquiry.userId;
            const isExpanded = expandedId === inquiry.id;
            return (
              <div key={inquiry.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/30 transition-colors text-left"
                >
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${inquiry.isAnswered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {inquiry.isAnswered ? '답변완료' : '답변대기'}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{inquiry.title}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{inquiry.userName}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 bg-secondary/10">
                    <div className="p-4 bg-white border border-border text-sm leading-relaxed">{inquiry.content}</div>
                    {inquiry.answer && (
                      <div className="mt-3 p-4 bg-white border-l-2 border-primary text-sm">
                        <p className="text-xs font-semibold text-primary mb-2">판매자 답변 · {new Date(inquiry.answer.createdAt).toLocaleDateString('ko-KR')}</p>
                        <p className="text-muted-foreground leading-relaxed">{inquiry.answer.content}</p>
                      </div>
                    )}
                    {isOwner && (
                      <div className="flex justify-end mt-2">
                        <button onClick={() => handleDelete(inquiry.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">삭제</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-border text-sm disabled:opacity-30 hover:bg-secondary transition-colors">이전</button>
              <span className="px-3 py-1 text-sm text-muted-foreground">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-border text-sm disabled:opacity-30 hover:bg-secondary transition-colors">다음</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 연관 상품 선택 컴포넌트 (useState/useEffect를 루프 밖으로 분리)
// ─────────────────────────────────────────────────────────────
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
