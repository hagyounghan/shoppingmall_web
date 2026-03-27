import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, BookOpen, Video, MessageSquare, Check, Loader2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@features/auth';
import { apiPost, apiGet, apiPatch } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { ROUTES } from '@shared/constants/routes';
import { UsabilityServiceRequest, USABILITY_STATUS_LABELS, PurchasedProduct, PaginatedResponse } from '@shared/types';
import { Button } from '@shared/components/ui/button';

const PRODUCTS_PER_PAGE = 5;

export function UsabilityServicePage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [question, setQuestion] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // 구매 제품 (페이지네이션)
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(0);
  const [productLoading, setProductLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [requests, setRequests] = useState<UsabilityServiceRequest[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const serviceTypes = [
    { value: 'manual', label: '사용 설명서', icon: BookOpen, desc: '제품 사용 방법 및 기능 설명서 제공' },
    { value: 'video', label: '동영상 가이드', icon: Video, desc: '동영상으로 배우는 제품 사용법' },
    { value: 'chat', label: '실시간 문의', icon: MessageSquare, desc: '전문가와 실시간 채팅 상담' },
    { value: 'help', label: '기능 안내', icon: HelpCircle, desc: '특정 기능 사용 방법 안내' },
  ];

  const loadProducts = async (page: number) => {
    setProductLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<PurchasedProduct>>(
        API_ENDPOINTS.ORDERS_ME_PRODUCTS(page, PRODUCTS_PER_PAGE)
      );
      setProducts(res.data ?? []);
      setProductTotal(res.total ?? 0);
      setProductTotalPages(res.totalPages ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const loadRequests = async () => {
    setListLoading(true);
    try {
      const data = await apiGet<UsabilityServiceRequest[]>(API_ENDPOINTS.USABILITY_SERVICES_ME);
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadProducts(1);
      loadRequests();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setContactName(prev => prev || user.name || '');
      setContactPhone(prev => prev || user.phone || '');
      setContactEmail(prev => prev || user.email || '');
    }
  }, [user]);

  const handleProductPageChange = (page: number) => {
    setProductPage(page);
    setSelectedProductId('');
    loadProducts(page);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
          <HelpCircle className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground text-sm mb-6">
            사용성 서비스 이용을 위해 로그인이 필요합니다.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(ROUTES.LOGIN, { state: { from: ROUTES.USABILITY_SERVICE } })}>
              로그인하기
            </Button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-border hover:bg-secondary transition-colors rounded-lg text-sm"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmitError('');
    if (!question.trim()) {
      setSubmitError('문의 내용을 입력해주세요.');
      return;
    }

    const serviceLabel = serviceTypes.find(t => t.value === serviceType)?.label ?? '사용성 서비스';
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const title = selectedProduct
      ? `[${serviceLabel}] ${selectedProduct.name}`
      : `[${serviceLabel}] 문의`;

    const lines: string[] = [];
    if (serviceType) lines.push(`서비스 유형: ${serviceLabel}`);
    if (selectedProduct) lines.push(`제품: ${selectedProduct.name}`);
    lines.push(`\n문의 내용:\n${question.trim()}`);
    if (contactMethod) lines.push(`\n연락 방법: ${contactMethod}`);
    if (contactName) lines.push(`이름: ${contactName}`);
    if (contactPhone) lines.push(`연락처: ${contactPhone}`);
    if (contactEmail) lines.push(`이메일: ${contactEmail}`);

    setSubmitting(true);
    try {
      await apiPost(API_ENDPOINTS.USABILITY_SERVICES, { title, content: lines.join('\n') });
      setSubmitSuccess('서비스가 신청되었습니다. 24시간 이내에 담당자가 연락드립니다.');
      setSelectedProductId('');
      setServiceType('');
      setQuestion('');
      setContactMethod('');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      await loadRequests();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setEditSubmitting(true);
    try {
      await apiPatch(API_ENDPOINTS.USABILITY_SERVICE_ITEM(id), { title: editTitle.trim(), content: editContent.trim() });
      setEditingId(null);
      await loadRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {USABILITY_STATUS_LABELS[status as keyof typeof USABILITY_STATUS_LABELS] ?? status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl mb-4 text-center">사용성 서비스</h1>
          <p className="text-center text-muted-foreground mb-12">
            구매하신 제품을 더 잘 활용할 수 있도록 사용 방법을 안내해드립니다
          </p>

          {/* Service Types */}
          <div className="mb-8">
            <label className="block mb-4">
              서비스 유형 <span className="text-sm text-muted-foreground">(원하는 도움말 형태)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setServiceType(type.value)}
                  className={`p-6 border text-center transition-all ${
                    serviceType === type.value
                      ? 'border-primary bg-blue-50 shadow-md'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <type.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold mb-1">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Device Selection - 구매한 제품 */}
          <div className="mb-8">
            <label className="block mb-4">제품 선택</label>

            {productLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground border border-border">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                불러오는 중...
              </div>
            ) : products.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground border border-dashed border-border">
                구매 완료된 제품이 없습니다.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full p-4 border text-left flex items-center justify-between transition-all ${
                        selectedProductId === product.id
                          ? 'border-primary bg-blue-50'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded border border-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-secondary rounded border border-border flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            구매일: {new Date(product.purchasedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      {selectedProductId === product.id && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {productTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                      총 {productTotal}개 제품 ({productPage}/{productTotalPages} 페이지)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleProductPageChange(productPage - 1)}
                        disabled={productPage <= 1}
                        className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: productTotalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleProductPageChange(p)}
                          className={`w-8 h-8 text-sm border transition-colors ${
                            p === productPage
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:bg-secondary'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => handleProductPageChange(productPage + 1)}
                        disabled={productPage >= productTotalPages}
                        className="p-1.5 border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Question/Request */}
          <div className="mb-8">
            <label className="block mb-4">문의 내용</label>
            <textarea
              rows={6}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="어떤 기능을 사용하고 싶으신가요? 또는 어떤 문제가 있으신가요?"
              className="w-full px-4 py-3 border border-border bg-white resize-none"
            />
          </div>

          {/* Contact Method */}
          <div className="mb-8">
            <label className="block mb-4">연락 방법</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: '이메일', label: '이메일', desc: '이메일로 답변 받기' },
                { value: '전화', label: '전화', desc: '전화로 안내 받기' },
                { value: '채팅', label: '채팅', desc: '실시간 채팅 상담' },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setContactMethod(method.value)}
                  className={`p-4 border transition-colors text-left ${
                    contactMethod === method.value
                      ? 'border-primary bg-blue-50'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <p className="font-semibold mb-1">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-8 space-y-4">
            <h3 className="text-xl">연락처 정보</h3>

            <div>
              <label className="block mb-2">이름</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">연락처</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">이메일</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>
          </div>

          {submitError && (
            <p className="mb-4 text-sm text-destructive">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="mb-4 text-sm text-green-600">{submitSuccess}</p>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            서비스 신청하기
          </button>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-secondary border border-border">
            <h4 className="mb-4">사용성 서비스 안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 신청 후 24시간 이내에 담당자가 연락드립니다</li>
              <li>• 제품 사용 방법에 대한 상세한 안내를 제공합니다</li>
              <li>• 서비스는 무료로 제공됩니다</li>
              <li>• 동영상 가이드 및 사용 설명서를 다운로드 받을 수 있습니다</li>
              <li>• 실시간 채팅 상담은 평일 09:00 - 18:00에 운영됩니다</li>
            </ul>
          </div>

          {/* 내 신청 목록 */}
          <div className="mt-12">
            <h3 className="text-xl mb-4">내 신청 목록</h3>
            {listLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                불러오는 중...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border border-dashed border-border">
                신청 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="border border-border p-4">
                    {editingId === req.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-border bg-white text-sm"
                        />
                        <textarea
                          rows={4}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-border bg-white text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubmit(req.id)}
                            disabled={editSubmitting}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-accent disabled:opacity-50"
                          >
                            {editSubmitting ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-border text-sm hover:bg-secondary"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {statusBadge(req.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="font-medium">{req.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.content}</p>
                        </div>
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => { setEditingId(req.id); setEditTitle(req.title); setEditContent(req.content); }}
                            className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
