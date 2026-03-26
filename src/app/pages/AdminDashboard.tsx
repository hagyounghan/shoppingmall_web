import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, MessageCircle, Megaphone,
  Plus, Edit, Trash2, Ship, User,
  X, Image as ImageIcon, Layout, Settings, Sparkles, Save,
  ShoppingCart, ChevronDown
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { Product, Brand, Category, PaginatedProducts, OrderResponse, ORDER_STATUS_LABELS, OrderStatus, PAYMENT_METHOD_LABELS } from '../../types';
import { formatPrice } from '../../utils/format';

// --- 타입 정의 ---
interface Banner { id: number; title: string; subtitle: string; imageUrl: string; isActive: boolean; }
interface RecommendedSet { id: string; title: string; description: string; totalPrice: number; items: string[]; }
interface Consulting { id: string; userId: string; title: string; content: string; status: string; createdAt: string; updatedAt: string; }
interface BoardItem { id: number; category: string; title: string; author: string; date: string; }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

interface ProductForm {
  name: string;
  price: string;
  stock: string;
  brandId: string;
  categoryId: string;
  tag: string;
  discountRate: string;
  image: string;
  description: string;
}

const EMPTY_FORM: ProductForm = {
  name: '', price: '', stock: '', brandId: '', categoryId: '',
  tag: '', discountRate: '', image: '', description: '',
};

// --- 목업 데이터 (API 없는 섹션용) ---
const INITIAL_BANNERS: Banner[] = [
  { id: 1, title: "30년 경력 명장의 선택", subtitle: "최신 해양 장비 특별전", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200", isActive: true }
];

const INITIAL_SETS: RecommendedSet[] = [
  { id: 'premium', title: '프리미엄 전문가 패키지', description: '원거리 항해 및 전문 어업용 최상위 구성', totalPrice: 12500000, items: ['GARMIN 8612', 'DRS4W 레이더', 'VHF 무선기'] },
  { id: 'value', title: '가성비 실속 패키지', description: '레저 보트 입문자를 위한 알짜배기 구성', totalPrice: 4500000, items: ['LOWRANCE HDS-7', '기본 소나'] }
];

const INITIAL_BOARD: BoardItem[] = [
  { id: 1, category: '공지', title: '봄철 선박 점검 이벤트 안내', author: '관리자', date: '2024-03-05' },
  { id: 2, category: '강의', title: '가민 GPS 기초 설정법 영상', author: '명장', date: '2024-03-01' },
];

export default function AdminDashboard() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');

  // 상품 관련 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // 컨설팅
  const [consultings, setConsultings] = useState<Consulting[]>([]);
  const [consultingLoading, setConsultingLoading] = useState(false);

  // 주문 관리
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // 기타 목업
  const [banners] = useState(INITIAL_BANNERS);
  const [recSets] = useState(INITIAL_SETS);
  const [boardItems] = useState(INITIAL_BOARD);

  // 상품 목록 로드
  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const res = await apiGet<PaginatedProducts>(`${API_ENDPOINTS.PRODUCTS}?take=100`);
      setProducts(res.data);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : '상품 목록을 불러오지 못했습니다.');
    } finally {
      setProductsLoading(false);
    }
  };

  // 브랜드/카테고리 로드
  useEffect(() => {
    apiGet<Brand[]>(API_ENDPOINTS.BRANDS).then(setBrands).catch(() => {});
    apiGet<Category[]>(API_ENDPOINTS.CATEGORIES).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentMenu === 'products') {
      loadProducts();
    }
    if (currentMenu === 'consulting') {
      loadConsultings();
    }
    if (currentMenu === 'orders') {
      loadOrders();
    }
  }, [currentMenu]);

  // 주문 목록 로드 (관리자)
  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      interface PaginatedOrders { data: OrderResponse[]; total: number; }
      const res = await apiGet<PaginatedOrders | OrderResponse[]>(`${API_ENDPOINTS.ORDERS}?take=100`);
      const data = Array.isArray(res) ? res : (res as PaginatedOrders).data;
      setOrders(data);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : '주문 목록을 불러오지 못했습니다.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // 주문 상태 변경
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setStatusUpdating(orderId);
    try {
      await apiPatch(API_ENDPOINTS.ORDER_STATUS(orderId), { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setStatusUpdating(null);
    }
  };

  // 컨설팅 로드 (관리자: 전체, 일반: 내 목록)
  const loadConsultings = async () => {
    setConsultingLoading(true);
    try {
      interface PaginatedConsulting { data: Consulting[]; }
      const res = await apiGet<PaginatedConsulting | Consulting[]>(API_ENDPOINTS.CONSULTING_ALL);
      const data = Array.isArray(res) ? res : (res as PaginatedConsulting).data;
      setConsultings(data);
    } catch {
      try {
        const res = await apiGet<Consulting[]>(API_ENDPOINTS.CONSULTING_ME);
        setConsultings(res);
      } catch {
        setConsultings([]);
      }
    } finally {
      setConsultingLoading(false);
    }
  };

  // 상품 등록
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) return;
    setFormLoading(true);
    try {
      await apiPost(API_ENDPOINTS.PRODUCTS, {
        name: productForm.name,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 0,
        brandId: productForm.brandId || undefined,
        categoryId: productForm.categoryId || undefined,
        tag: productForm.tag || undefined,
        discountRate: Number(productForm.discountRate) || 0,
        image: productForm.image || undefined,
        description: productForm.description || undefined,
      });
      setProductForm(EMPTY_FORM);
      setIsAddingProduct(false);
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '상품 등록에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 상품 수정
  const handleEditProduct = async (id: string) => {
    setFormLoading(true);
    try {
      await apiPatch(API_ENDPOINTS.PRODUCT_DETAIL(id), {
        name: editForm.name || undefined,
        price: editForm.price ? Number(editForm.price) : undefined,
        stock: editForm.stock ? Number(editForm.stock) : undefined,
        brandId: editForm.brandId || undefined,
        categoryId: editForm.categoryId || undefined,
        tag: editForm.tag || undefined,
        discountRate: editForm.discountRate ? Number(editForm.discountRate) : undefined,
        image: editForm.image || undefined,
        description: editForm.description || undefined,
      });
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '상품 수정에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 상품 삭제
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(API_ENDPOINTS.PRODUCT_DETAIL(id));
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '상품 삭제에 실패했습니다.');
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      brandId: product.brandId,
      categoryId: product.categoryId,
      tag: product.tag || '',
      discountRate: String(product.discountRate),
      image: product.image,
      description: product.description,
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans w-full overflow-hidden">
      {/* 사이드바 */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Ship className="mr-2 text-blue-400" size={24} /> 명장 관리자
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="운영 현황" isActive={currentMenu === 'dashboard'} onClick={() => setCurrentMenu('dashboard')} />
          <MenuButton icon={<Package size={20}/>} label="장비/상품 관리" isActive={currentMenu === 'products'} onClick={() => setCurrentMenu('products')} />
          <MenuButton icon={<ShoppingCart size={20}/>} label="주문 관리" isActive={currentMenu === 'orders'} onClick={() => setCurrentMenu('orders')} />
          <MenuButton icon={<Layout size={20}/>} label="메인/추천 관리" isActive={currentMenu === 'main_mgmt'} onClick={() => setCurrentMenu('main_mgmt')} />
          <MenuButton icon={<MessageCircle size={20}/>} label="컨설팅 신청 내역" isActive={currentMenu === 'consulting'} onClick={() => setCurrentMenu('consulting')} />
          <MenuButton icon={<Megaphone size={20}/>} label="공지/자료실 관리" isActive={currentMenu === 'notices'} onClick={() => setCurrentMenu('notices')} />
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* [1. 운영 현황] */}
        {currentMenu === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">📊 실시간 운영 지표</h2>
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="등록 장비" value={products.length || '-'} unit="종" color="text-blue-600" />
              <StatCard title="전체 주문" value={orders.length} unit="건" color="text-purple-600" />
              <StatCard title="상담 신청" value={consultings.filter(c=>c.status==='PENDING').length} unit="건" color="text-orange-500" />
              <StatCard title="자료실 게시글" value={boardItems.length} unit="개" color="text-slate-600" />
            </div>
          </div>
        )}

        {/* [2. 장비/상품 관리] */}
        {currentMenu === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">⚓ 장비 목록 관리</h2>
              <button
                onClick={() => { setIsAddingProduct(!isAddingProduct); setProductForm(EMPTY_FORM); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
              >
                {isAddingProduct ? <X size={18} className="mr-1"/> : <Plus size={18} className="mr-1"/>}
                {isAddingProduct ? '취소' : '신규 장비 등록'}
              </button>
            </div>

            {productsError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{productsError}</div>
            )}

            {/* 신규 등록 폼 */}
            {isAddingProduct && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-md">
                <h3 className="font-bold text-lg mb-4">신규 장비 등록</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="장비명 *"
                    value={productForm.name}
                    onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))}
                    className="p-2 border rounded col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="가격 *"
                    value={productForm.price}
                    onChange={(e) => setProductForm(f => ({ ...f, price: e.target.value }))}
                    className="p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="재고수량"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(f => ({ ...f, stock: e.target.value }))}
                    className="p-2 border rounded"
                  />
                  <select
                    value={productForm.brandId}
                    onChange={(e) => setProductForm(f => ({ ...f, brandId: e.target.value }))}
                    className="p-2 border rounded"
                  >
                    <option value="">브랜드 선택</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="p-2 border rounded"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select
                    value={productForm.tag}
                    onChange={(e) => setProductForm(f => ({ ...f, tag: e.target.value }))}
                    className="p-2 border rounded"
                  >
                    <option value="">태그 없음</option>
                    <option value="BEST">BEST</option>
                    <option value="NEW">NEW</option>
                    <option value="SALE">SALE</option>
                  </select>
                  <input
                    type="number"
                    placeholder="할인율 (%)"
                    value={productForm.discountRate}
                    onChange={(e) => setProductForm(f => ({ ...f, discountRate: e.target.value }))}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="이미지 URL"
                    value={productForm.image}
                    onChange={(e) => setProductForm(f => ({ ...f, image: e.target.value }))}
                    className="p-2 border rounded col-span-2"
                  />
                  <textarea
                    placeholder="상품 설명"
                    value={productForm.description}
                    onChange={(e) => setProductForm(f => ({ ...f, description: e.target.value }))}
                    className="p-2 border rounded col-span-2 h-20 resize-none"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={formLoading || !productForm.name || !productForm.price}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {formLoading ? '저장 중...' : '장비 저장'}
                </button>
              </div>
            )}

            {/* 상품 목록 테이블 */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {productsLoading ? (
                <div className="p-8 text-center text-slate-400">불러오는 중...</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-sm font-bold">
                    <tr>
                      <th className="p-4 text-slate-500">장비명</th>
                      <th className="p-4 text-slate-500">가격</th>
                      <th className="p-4 text-slate-500">재고</th>
                      <th className="p-4 text-center text-slate-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      editingId === p.id ? (
                        <tr key={p.id} className="border-b bg-blue-50">
                          <td className="p-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="p-1 border rounded w-full text-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))}
                              className="p-1 border rounded w-full text-sm"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={editForm.stock}
                              onChange={(e) => setEditForm(f => ({ ...f, stock: e.target.value }))}
                              className="p-1 border rounded w-20 text-sm"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditProduct(p.id)}
                                disabled={formLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                <Save size={16}/>
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={p.id} className="border-b hover:bg-slate-50 transition text-sm">
                          <td className="p-4 font-bold">{p.name}</td>
                          <td className="p-4 font-black text-blue-600">{p.price.toLocaleString()}원</td>
                          <td className="p-4">{p.stock}개</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => startEditing(p)} className="text-slate-400 hover:text-blue-600">
                                <Edit size={16}/>
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-slate-400 hover:text-red-500">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {products.length === 0 && !productsLoading && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">등록된 상품이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [3. 메인/추천 관리] */}
        {currentMenu === 'main_mgmt' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <ImageIcon className="text-blue-500" /> 메인 배너 이미지/문구 변경
              </h2>
              {banners.map(banner => (
                <div key={banner.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex gap-6 items-center shadow-sm">
                  <div className="relative group w-48 h-28 shrink-0">
                    <img src={banner.imageUrl} className="w-full h-full object-cover rounded-xl" alt="banner" />
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-xl text-white text-xs font-bold">이미지 교체</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input defaultValue={banner.title} className="text-lg font-black w-full border-b outline-none focus:border-blue-500" />
                    <input defaultValue={banner.subtitle} className="text-sm text-slate-400 w-full border-b outline-none focus:border-blue-500" />
                  </div>
                  <div className="text-xs text-slate-400 text-center">
                    <p>배너 API</p>
                    <p>미지원</p>
                  </div>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="text-orange-500" /> 명장 추천 세트 품목 수정
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {recSets.map(set => (
                  <div key={set.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition">
                    <div className="flex justify-between items-center mb-4 text-blue-600 font-black italic">
                      <span>{set.id.toUpperCase()} SET</span>
                      <Settings size={18} className="text-slate-300" />
                    </div>
                    <input defaultValue={set.title} className="w-full font-bold text-lg mb-2 border-none p-0 focus:ring-0" />
                    <textarea defaultValue={set.description} className="w-full text-xs text-slate-400 border-none p-0 focus:ring-0 resize-none h-10" />
                    <div className="bg-slate-50 p-4 rounded-xl mt-4">
                      <p className="text-[10px] font-black text-slate-400 mb-2">포함 장비 리스트</p>
                      {set.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs py-1">
                          <span className="font-medium">• {item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* [주문 관리] */}
        {currentMenu === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">🛒 주문 관리</h2>

            {ordersError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{ordersError}</div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {ordersLoading ? (
                <div className="p-8 text-center text-slate-400">불러오는 중...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="font-medium">주문 내역이 없거나 관리자 권한이 필요합니다.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-sm font-bold">
                    <tr>
                      <th className="p-4 text-slate-500">주문번호</th>
                      <th className="p-4 text-slate-500">주문자</th>
                      <th className="p-4 text-slate-500">결제금액</th>
                      <th className="p-4 text-slate-500">결제수단</th>
                      <th className="p-4 text-center text-slate-500">상태</th>
                      <th className="p-4 text-slate-500">주문일</th>
                      <th className="p-4 text-center text-slate-500">상태변경</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-slate-50 transition text-sm">
                        <td className="p-4 font-mono text-xs text-slate-400">{order.id.slice(0, 8)}...</td>
                        <td className="p-4">
                          {order.userId ? (
                            <span className="text-blue-600 text-xs">회원</span>
                          ) : (
                            <span className="text-slate-500 text-xs">
                              {order.guestName || '비회원'}
                              {order.guestEmail && <span className="block text-slate-400">{order.guestEmail}</span>}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-black text-blue-600">{formatPrice(order.totalAmount)}</td>
                        <td className="p-4 text-xs">
                          {PAYMENT_METHOD_LABELS[order.payment?.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || order.payment?.paymentMethod || '-'}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-600' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-500' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{formatDate(order.createdAt)}</td>
                        <td className="p-4 text-center">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              disabled={statusUpdating === order.id}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="text-xs border rounded px-2 py-1 bg-white pr-6 disabled:opacity-50"
                            >
                              <option value="PENDING">결제대기</option>
                              <option value="PAID">결제완료</option>
                              <option value="CANCELLED">취소</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [4. 컨설팅 신청 내역] */}
        {currentMenu === 'consulting' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">📞 컨설팅 및 상담 현황</h2>
            {consultingLoading ? (
              <div className="p-8 text-center text-slate-400">불러오는 중...</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {consultings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="font-medium">컨설팅 내역이 없거나 서버 API가 지원되지 않습니다.</p>
                    <p className="text-xs mt-1">관리자 계정으로 로그인 후 전체 목록이 표시됩니다.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-sm">
                      <tr>
                        <th className="p-4">제목</th>
                        <th className="p-4">사용자 ID</th>
                        <th className="p-4 text-center">상태</th>
                        <th className="p-4">신청일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultings.map(c => (
                        <tr key={c.id} className="border-b text-sm">
                          <td className="p-4 font-bold"><User size={14} className="inline mr-2 text-slate-400"/>{c.title}</td>
                          <td className="p-4 text-slate-500 font-mono text-xs">{c.userId?.slice(0, 8)}...</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              c.status === 'COMPLETED' ? 'bg-slate-100 text-slate-400' :
                              c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              {c.status === 'PENDING' ? '대기중' :
                               c.status === 'IN_PROGRESS' ? '진행중' :
                               c.status === 'COMPLETED' ? '완료' : c.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* [5. 공지/자료실 관리] */}
        {currentMenu === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">📢 공지 및 자료실 관리</h2>
              <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                <Plus size={16} className="mr-1"/> 새 글 작성
              </button>
            </div>
            <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
              공지/자료실 CRUD API는 현재 서버에서 지원되지 않습니다.
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b font-bold">
                  <tr>
                    <th className="p-4">분류</th>
                    <th className="p-4">제목</th>
                    <th className="p-4">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {boardItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="p-4"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">{item.category}</span></td>
                      <td className="p-4 font-medium">{item.title}</td>
                      <td className="p-4 text-slate-400 text-xs">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// --- 공통 UI 컴포넌트 ---
function MenuButton({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'hover:bg-slate-800 text-slate-400'}`}>
      <span className="mr-3">{icon}</span><span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function StatCard({ title, value, unit, color }: { title: string; value: string | number; unit: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-tighter">{title}</h3>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}<span className="text-sm font-medium text-slate-300 ml-1">{unit}</span></p>
    </div>
  );
}
