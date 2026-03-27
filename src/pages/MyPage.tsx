import { useEffect, useState, useCallback } from 'react';
import { User, Package, Wrench, Calendar, CreditCard, LogOut, Star, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { apiGet, apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { ROUTES } from '@shared/constants/routes';
import { formatPrice } from '@shared/utils/format';
import { ImageWithFallback } from '@shared/components/figma/ImageWithFallback';
import {
  OrderResponse,
  ORDER_STATUS_LABELS,
  ConsultingRequest,
  CONSULTING_STATUS_LABELS,
  UsabilityServiceRequest,
  USABILITY_STATUS_LABELS,
} from '@shared/types';

interface PurchasedProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  purchasedAt: string;
}

interface PaginatedPurchased {
  data: PurchasedProduct[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-7 h-7 cursor-pointer transition-colors ${n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`}
          onClick={() => onChange(n)}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export function MyPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [serviceRequests, setServiceRequests] = useState<UsabilityServiceRequest[]>([]);
  const [serviceLoading, setServiceLoading] = useState(false);

  const [consultations, setConsultations] = useState<ConsultingRequest[]>([]);
  const [consultingLoading, setConsultingLoading] = useState(false);

  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [purchasedTotal, setPurchasedTotal] = useState(0);
  const [purchasedPage, setPurchasedPage] = useState(1);
  const [purchasedLoading, setPurchasedLoading] = useState(false);
  const PURCHASED_TAKE = 5;

  const [reviewModal, setReviewModal] = useState<PurchasedProduct | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const fetchPurchased = useCallback(async (page: number) => {
    setPurchasedLoading(true);
    try {
      const res = await apiGet<PaginatedPurchased>(API_ENDPOINTS.ORDERS_ME_PRODUCTS(page, PURCHASED_TAKE));
      setPurchasedProducts(res.data);
      setPurchasedTotal(res.total);
    } catch {
      setPurchasedProducts([]);
    } finally {
      setPurchasedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    setOrdersLoading(true);
    apiGet<OrderResponse[]>(API_ENDPOINTS.ORDERS_ME)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    setServiceLoading(true);
    apiGet<UsabilityServiceRequest[]>(API_ENDPOINTS.USABILITY_SERVICES_ME)
      .then(setServiceRequests)
      .catch(() => setServiceRequests([]))
      .finally(() => setServiceLoading(false));

    setConsultingLoading(true);
    apiGet<ConsultingRequest[]>(API_ENDPOINTS.CONSULTING_ME)
      .then(setConsultations)
      .catch(() => setConsultations([]))
      .finally(() => setConsultingLoading(false));

    fetchPurchased(1);
  }, [isAuthenticated, fetchPurchased]);

  const handlePurchasedPageChange = (newPage: number) => {
    setPurchasedPage(newPage);
    fetchPurchased(newPage);
  };

  const openReviewModal = (product: PurchasedProduct) => {
    setReviewModal(product);
    setReviewRating(5);
    setReviewContent('');
    setReviewError('');
    setReviewSuccess('');
  };

  const closeReviewModal = () => {
    setReviewModal(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal) return;
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await apiPost(API_ENDPOINTS.PRODUCT_REVIEWS(reviewModal.id), { rating: reviewRating, content: reviewContent });
      setReviewSuccess('리뷰가 등록되었습니다!');
      setTimeout(() => closeReviewModal(), 1500);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : '리뷰 작성 중 오류가 발생했습니다.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl mb-8">마이페이지</h1>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-primary to-accent text-white p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl mb-2">{user.name}님</h2>
                  <p className="opacity-90">{user.email}</p>
                  {user.phone && <p className="opacity-90">{user.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">등록 낚시포인트</p>
                <p className="text-3xl">{user.fishingPoints ?? 0}개</p>
              </div>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <button
              onClick={() => document.getElementById('section-orders')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p>주문 내역</p>
            </button>
            <button
              onClick={() => document.getElementById('section-reviews')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p>리뷰 작성</p>
            </button>
            <button
              onClick={() => document.getElementById('section-service')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Wrench className="w-8 h-8 mx-auto mb-2" />
              <p>A/S 내역</p>
            </button>
            <button
              onClick={() => document.getElementById('section-consulting')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>컨설팅 내역</p>
            </button>
            <button
              onClick={() => document.getElementById('section-points')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2" />
              <p>포인트</p>
            </button>
          </div>

          {/* Orders Section */}
          <div className="mb-12" id="section-orders">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">주문 내역</h2>
              <Link to={ROUTES.ORDER} className="text-sm text-primary hover:underline">
                주문하기 →
              </Link>
            </div>
            {ordersLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                주문 내역이 없습니다.
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">주문번호</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상품 수</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">결제금액</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">주문일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm">{order.items.length}개</td>
                        <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Purchased Products / Reviews */}
          <div className="mb-12" id="section-reviews">
            <h2 className="text-2xl mb-6">구매한 상품 리뷰</h2>
            {purchasedLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : purchasedProducts.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                구매한 상품이 없습니다.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {purchasedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 border border-border hover:border-primary transition-colors cursor-pointer"
                      onClick={() => openReviewModal(product)}
                    >
                      <div className="w-16 h-16 bg-muted border border-border flex-shrink-0 overflow-hidden">
                        <ImageWithFallback src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">구매일: {new Date(product.purchasedAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); openReviewModal(product); }}
                        className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-accent transition-colors flex-shrink-0"
                      >
                        <Star className="w-4 h-4" />
                        리뷰 작성
                      </button>
                    </div>
                  ))}
                </div>
                {Math.ceil(purchasedTotal / PURCHASED_TAKE) > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button disabled={purchasedPage === 1} onClick={() => handlePurchasedPageChange(purchasedPage - 1)} className="px-3 py-1 border border-border text-sm disabled:opacity-30 hover:bg-secondary transition-colors">이전</button>
                    <span className="px-3 py-1 text-sm text-muted-foreground">{purchasedPage} / {Math.ceil(purchasedTotal / PURCHASED_TAKE)}</span>
                    <button disabled={purchasedPage === Math.ceil(purchasedTotal / PURCHASED_TAKE)} onClick={() => handlePurchasedPageChange(purchasedPage + 1)} className="px-3 py-1 border border-border text-sm disabled:opacity-30 hover:bg-secondary transition-colors">다음</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Service Requests */}
          <div className="mb-12" id="section-service">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">A/S 신청 내역</h2>
              <Link to={ROUTES.SERVICE_REQUEST} className="text-sm text-primary hover:underline">
                A/S 신청 →
              </Link>
            </div>
            {serviceLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : serviceRequests.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                A/S 신청 내역이 없습니다.
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">제목</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">신청일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((req) => (
                      <tr key={req.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{req.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {USABILITY_STATUS_LABELS[req.status] || req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(req.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Consulting History */}
          <div className="mb-12" id="section-consulting">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">컨설팅 예약 내역</h2>
              <Link to={ROUTES.CONSULTING_BOOKING} className="text-sm text-primary hover:underline">
                컨설팅 예약 →
              </Link>
            </div>
            {consultingLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : consultations.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                컨설팅 예약 내역이 없습니다.
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">제목</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">예약일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((c) => (
                      <tr key={c.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{c.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            c.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                            c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            c.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {CONSULTING_STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fishing Points */}
          <div className="mb-12" id="section-points">
            <h2 className="text-2xl mb-6">낚시포인트</h2>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-4xl font-bold text-primary mb-2">{user.fishingPoints ?? 0}개</p>
              <p className="text-sm text-muted-foreground">등록된 낚시포인트 수입니다.</p>
              <Link to={ROUTES.RESOURCE_FISHING_POINTS} className="mt-4 inline-block text-sm text-primary hover:underline">
                낚시포인트 관리 →
              </Link>
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-border">
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted border border-border flex-shrink-0 overflow-hidden rounded">
                  <ImageWithFallback src={reviewModal.image ?? ''} alt={reviewModal.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{reviewModal.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(reviewModal.price)}</p>
                </div>
              </div>
              <button onClick={closeReviewModal} className="text-muted-foreground hover:text-foreground transition-colors ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center">
                <Star className="w-12 h-12 mx-auto mb-3 text-yellow-400 fill-yellow-400" />
                <p className="font-semibold text-green-600">{reviewSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <p className="text-sm font-semibold mb-3">평점을 선택해주세요</p>
                <StarSelector value={reviewRating} onChange={setReviewRating} />
                <p className="text-sm font-semibold mt-5 mb-2">리뷰 내용</p>
                <textarea
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="상품에 대한 솔직한 후기를 남겨주세요."
                  className="w-full px-4 py-3 border border-border bg-white resize-none text-sm"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{reviewContent.length}/1000</p>
                {reviewError && <p className="text-sm text-destructive mt-2">{reviewError}</p>}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={closeReviewModal} className="flex-1 py-2.5 border border-border text-sm hover:bg-secondary transition-colors">취소</button>
                  <button type="submit" disabled={reviewSubmitting} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm hover:bg-accent transition-colors disabled:opacity-50">
                    {reviewSubmitting ? '등록 중...' : '리뷰 등록'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
