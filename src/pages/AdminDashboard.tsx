import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, MessageCircle, Megaphone,
  Plus, Edit, Trash2, Ship, User,
  X, Image as ImageIcon, Layout, Sparkles, Save,
  ShoppingCart, ChevronDown, Star, ChevronUp, Search, Loader2,
  Link2, HelpCircle, BookOpen, FileText
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  Product, Brand, Category, PaginatedProducts, PaginatedResponse,
  OrderResponse, ORDER_STATUS_LABELS, OrderStatus, PAYMENT_METHOD_LABELS,
  FeaturedProduct, Notice, Lecture, Faq, InquiryItem,
  ConsultingRequest, ConsultingStatus, CONSULTING_STATUS_LABELS,
  SimulatorSet
} from '@shared/types';
import { formatPrice } from '@shared/utils/format';

// --- 로컬 타입 정의 ---
interface Stats {
  productCount: number;
  consultingCount: number;
  orderCount: number;
  todayVisitors: number;
  weeklyVisitors: number;
}

interface Recommendation {
  id: string;
  productId: string;
  recommendedProductId: string;
  recommendedProduct: Product;
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

// 시뮬레이터 고정 장비 슬롯 (클라이언트 EQUIPMENT_POSITIONS와 동일)
const SIM_SLOTS = [
  { slug: 'radar',          name: '레이더'    },
  { slug: 'gps-plotter',   name: 'GPS플로터'  },
  { slug: 'vhf-radio',      name: '무선기'    },
  { slug: 'trolling-motor', name: '트롤링모터' },
  { slug: 'transducer',     name: '송수파기'  },
  { slug: 'autopilot',      name: '자동조타'  },
] as const;

type SimSlotSlug = typeof SIM_SLOTS[number]['slug'];
type SimSlotData = { productId: string; productName: string; categoryId: string } | null;
const EMPTY_SIM_SLOTS: Record<SimSlotSlug, SimSlotData> = Object.fromEntries(
  SIM_SLOTS.map(s => [s.slug, null])
) as Record<SimSlotSlug, SimSlotData>;

export default function AdminDashboard() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');

  // 통계
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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

  // 장비 연결 관리
  const [recProductId, setRecProductId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recSearch, setRecSearch] = useState('');
  const [recSearchResults, setRecSearchResults] = useState<Product[]>([]);
  const [recSearchLoading, setRecSearchLoading] = useState(false);

  // 컨설팅
  const [consultings, setConsultings] = useState<ConsultingRequest[]>([]);
  const [consultingLoading, setConsultingLoading] = useState(false);
  const [consultingDetail, setConsultingDetail] = useState<ConsultingRequest | null>(null);
  const [consultingStatusUpdating, setConsultingStatusUpdating] = useState<string | null>(null);

  // 주문 관리
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // 소개 장비
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [featuredSearchResults, setFeaturedSearchResults] = useState<Product[]>([]);
  const [featuredSearchLoading, setFeaturedSearchLoading] = useState(false);

  // 공지사항 관리
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', isImportant: false });
  const [noticeFormLoading, setNoticeFormLoading] = useState(false);

  // 강의 관리
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [lectureForm, setLectureForm] = useState({ title: '', youtubeUrl: '', topic: '' });
  const [lectureFormLoading, setLectureFormLoading] = useState(false);

  // 고객문의 관리
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiryDetail, setInquiryDetail] = useState<InquiryItem | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);

  // FAQ 관리
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '', order: '' });
  const [faqFormLoading, setFaqFormLoading] = useState(false);

  // 시뮬레이터 세트 관리
  const [simSets, setSimSets] = useState<SimulatorSet[]>([]);
  const [simSetsLoading, setSimSetsLoading] = useState(false);
  const [isAddingSimSet, setIsAddingSimSet] = useState(false);
  const [editingSimSetId, setEditingSimSetId] = useState<string | null>(null);
  const [simSetForm, setSimSetForm] = useState({ type: 'fishing_vessel', name: '', description: '', isActive: true });
  const [simSlots, setSimSlots] = useState<Record<SimSlotSlug, SimSlotData>>({ ...EMPTY_SIM_SLOTS });
  const [simSetFormLoading, setSimSetFormLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState<SimSlotSlug | null>(null);
  const [slotSearch, setSlotSearch] = useState('');
  const [slotResults, setSlotResults] = useState<Product[]>([]);
  const [slotSearchLoading, setSlotSearchLoading] = useState(false);

  // 메인/추천 관리 목업 (배너만 유지)
  const banners = [{ id: 1, title: "30년 경력 명장의 선택", subtitle: "최신 해양 장비 특별전", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200", isActive: true }];

  // 브랜드/카테고리 로드
  useEffect(() => {
    apiGet<Brand[]>(API_ENDPOINTS.BRANDS).then((res) => setBrands(Array.isArray(res) ? res : [])).catch(() => {});
    apiGet<PaginatedResponse<Category> | Category[]>(API_ENDPOINTS.CATEGORIES).then((res) => {
      if (Array.isArray(res)) setCategories(res);
      else if (res && (res as PaginatedResponse<Category>).data) setCategories((res as PaginatedResponse<Category>).data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentMenu === 'dashboard') loadStats();
    if (currentMenu === 'products') loadProducts();
    if (currentMenu === 'consulting') loadConsultings();
    if (currentMenu === 'orders') loadOrders();
    if (currentMenu === 'featured') loadFeaturedProducts();
    if (currentMenu === 'notice_mgmt') loadNotices();
    if (currentMenu === 'lecture_mgmt') loadLectures();
    if (currentMenu === 'inquiry_mgmt') loadInquiries();
    if (currentMenu === 'faq_mgmt') loadFaqs();
    if (currentMenu === 'main_mgmt') { loadSimSets(); loadProducts(); }
  }, [currentMenu]);

  // 통계 로드
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await apiGet<Stats>(API_ENDPOINTS.STATS);
      setStats(res);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

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

  // 주문 목록 로드
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

  // 컨설팅 로드
  const loadConsultings = async () => {
    setConsultingLoading(true);
    try {
      interface PaginatedConsulting { data: ConsultingRequest[]; }
      const res = await apiGet<PaginatedConsulting | ConsultingRequest[]>(API_ENDPOINTS.CONSULTING_ALL);
      const data = Array.isArray(res) ? res : (res as PaginatedConsulting).data;
      setConsultings(data);
    } catch {
      try {
        const res = await apiGet<ConsultingRequest[]>(API_ENDPOINTS.CONSULTING_ME);
        setConsultings(res);
      } catch {
        setConsultings([]);
      }
    } finally {
      setConsultingLoading(false);
    }
  };

  const handleConsultingStatusChange = async (id: string, status: ConsultingStatus) => {
    setConsultingStatusUpdating(id);
    try {
      await apiPatch(API_ENDPOINTS.CONSULTING_STATUS(id), { status });
      setConsultings(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setConsultingStatusUpdating(null);
    }
  };

  // 상품 등록
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.brandId || !productForm.categoryId) return;
    setFormLoading(true);
    try {
      await apiPost(API_ENDPOINTS.PRODUCTS, {
        name: productForm.name,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 0,
        brandId: productForm.brandId,
        categoryId: productForm.categoryId,
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

  // 장비 연결 관리
  const openRecommendations = async (productId: string) => {
    setRecProductId(productId);
    setRecLoading(true);
    try {
      const res = await apiGet<Recommendation[]>(API_ENDPOINTS.PRODUCT_RECOMMENDATIONS(productId));
      setRecommendations(Array.isArray(res) ? res : []);
    } catch {
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  };

  const handleRecSearch = async () => {
    if (!recSearch.trim()) return;
    setRecSearchLoading(true);
    try {
      const res = await apiGet<PaginatedProducts>(`${API_ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(recSearch)}&take=10`);
      setRecSearchResults(res.data ?? []);
    } catch {
      setRecSearchResults([]);
    } finally {
      setRecSearchLoading(false);
    }
  };

  const handleAddRecommendation = async (recommendedProductId: string) => {
    if (!recProductId) return;
    try {
      await apiPost(API_ENDPOINTS.PRODUCT_RECOMMENDATIONS(recProductId), { recommendedProductId });
      await openRecommendations(recProductId);
      setRecSearchResults([]);
      setRecSearch('');
    } catch (err) {
      alert(err instanceof Error ? err.message : '연결 추가에 실패했습니다.');
    }
  };

  const handleDeleteRecommendation = async (recId: string) => {
    if (!recProductId) return;
    if (!confirm('연결을 삭제하시겠습니까?')) return;
    try {
      await apiDelete(API_ENDPOINTS.PRODUCT_RECOMMENDATION(recProductId, recId));
      setRecommendations(prev => prev.filter(r => r.id !== recId));
    } catch (err) {
      alert(err instanceof Error ? err.message : '연결 삭제에 실패했습니다.');
    }
  };

  // 소개 장비
  const loadFeaturedProducts = async () => {
    setFeaturedLoading(true);
    try {
      const res = await apiGet<FeaturedProduct[]>(API_ENDPOINTS.FEATURED_PRODUCTS);
      setFeaturedProducts(Array.isArray(res) ? res : []);
    } catch {
      setFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const handleFeaturedSearch = async () => {
    if (!featuredSearch.trim()) return;
    setFeaturedSearchLoading(true);
    try {
      const res = await apiGet<PaginatedProducts>(`${API_ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(featuredSearch)}&take=10`);
      setFeaturedSearchResults(res.data ?? []);
    } catch {
      setFeaturedSearchResults([]);
    } finally {
      setFeaturedSearchLoading(false);
    }
  };

  const handleAddFeatured = async (productId: string) => {
    try {
      await apiPost(API_ENDPOINTS.FEATURED_PRODUCTS, { productId });
      await loadFeaturedProducts();
      setFeaturedSearchResults([]);
      setFeaturedSearch('');
    } catch (err) {
      alert(err instanceof Error ? err.message : '소개 장비 등록에 실패했습니다.');
    }
  };

  const handleRemoveFeatured = async (id: string, name: string) => {
    if (!confirm(`"${name}"을(를) 소개 장비에서 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(API_ENDPOINTS.FEATURED_PRODUCT(id));
      await loadFeaturedProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleMoveFeatured = async (index: number, direction: 'up' | 'down') => {
    const newList = [...featuredProducts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setFeaturedProducts(newList);
    try {
      await apiPatch(API_ENDPOINTS.FEATURED_PRODUCTS_REORDER, { ids: newList.map(f => f.id) });
    } catch (err) {
      alert(err instanceof Error ? err.message : '순서 변경에 실패했습니다.');
      await loadFeaturedProducts();
    }
  };

  // 공지사항 관리
  const loadNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<Notice>>(`${API_ENDPOINTS.NOTICES}?page=1&take=20`);
      setNotices(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setNotices([]);
    } finally {
      setNoticesLoading(false);
    }
  };

  const handleAddNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) return;
    setNoticeFormLoading(true);
    try {
      await apiPost(API_ENDPOINTS.NOTICES, noticeForm);
      setNoticeForm({ title: '', content: '', isImportant: false });
      setIsAddingNotice(false);
      await loadNotices();
    } catch (err) {
      alert(err instanceof Error ? err.message : '공지 등록에 실패했습니다.');
    } finally {
      setNoticeFormLoading(false);
    }
  };

  const handleEditNotice = async (id: string) => {
    setNoticeFormLoading(true);
    try {
      await apiPatch(API_ENDPOINTS.NOTICE_DETAIL(id), noticeForm);
      setEditingNoticeId(null);
      await loadNotices();
    } catch (err) {
      alert(err instanceof Error ? err.message : '공지 수정에 실패했습니다.');
    } finally {
      setNoticeFormLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    if (!confirm(`"${title}" 공지를 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(API_ENDPOINTS.NOTICE_DETAIL(id));
      await loadNotices();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  // 강의 관리
  const loadLectures = async () => {
    setLecturesLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<Lecture>>(`${API_ENDPOINTS.LECTURES}?page=1&take=20`);
      setLectures(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setLectures([]);
    } finally {
      setLecturesLoading(false);
    }
  };

  const handleAddLecture = async () => {
    if (!lectureForm.title || !lectureForm.youtubeUrl) return;
    setLectureFormLoading(true);
    try {
      await apiPost(API_ENDPOINTS.LECTURES, {
        title: lectureForm.title,
        youtubeUrl: lectureForm.youtubeUrl,
        topic: lectureForm.topic || undefined,
      });
      setLectureForm({ title: '', youtubeUrl: '', topic: '' });
      setIsAddingLecture(false);
      await loadLectures();
    } catch (err) {
      alert(err instanceof Error ? err.message : '강의 등록에 실패했습니다.');
    } finally {
      setLectureFormLoading(false);
    }
  };

  const handleEditLecture = async (id: string) => {
    setLectureFormLoading(true);
    try {
      await apiPatch(API_ENDPOINTS.LECTURE_DETAIL(id), {
        title: lectureForm.title || undefined,
        youtubeUrl: lectureForm.youtubeUrl || undefined,
        topic: lectureForm.topic || undefined,
      });
      setEditingLectureId(null);
      await loadLectures();
    } catch (err) {
      alert(err instanceof Error ? err.message : '강의 수정에 실패했습니다.');
    } finally {
      setLectureFormLoading(false);
    }
  };

  const handleDeleteLecture = async (id: string, title: string) => {
    if (!confirm(`"${title}" 강의를 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(API_ENDPOINTS.LECTURE_DETAIL(id));
      await loadLectures();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  // 고객문의 관리
  const loadInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<InquiryItem>>(`${API_ENDPOINTS.INQUIRIES}?page=1&take=20`);
      setInquiries(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleOpenInquiry = (inquiry: InquiryItem) => {
    setInquiryDetail(inquiry);
    setAnswerContent(inquiry.answer?.content ?? '');
  };

  const handleSaveAnswer = async () => {
    if (!inquiryDetail) return;
    setAnswerLoading(true);
    try {
      if (inquiryDetail.isAnswered) {
        await apiPatch(API_ENDPOINTS.INQUIRY_ANSWER(inquiryDetail.productId, inquiryDetail.id), { content: answerContent });
      } else {
        await apiPost(API_ENDPOINTS.INQUIRY_ANSWER(inquiryDetail.productId, inquiryDetail.id), { content: answerContent });
      }
      setInquiryDetail(null);
      await loadInquiries();
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 저장에 실패했습니다.');
    } finally {
      setAnswerLoading(false);
    }
  };

  // FAQ 관리
  const loadFaqs = async () => {
    setFaqsLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<Faq>>(`${API_ENDPOINTS.FAQS}?page=1&take=50`);
      setFaqs(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setFaqs([]);
    } finally {
      setFaqsLoading(false);
    }
  };

  const handleAddFaq = async () => {
    if (!faqForm.question || !faqForm.answer) return;
    setFaqFormLoading(true);
    try {
      await apiPost(API_ENDPOINTS.FAQS, {
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category || undefined,
        order: faqForm.order ? Number(faqForm.order) : undefined,
      });
      setFaqForm({ question: '', answer: '', category: '', order: '' });
      setIsAddingFaq(false);
      await loadFaqs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'FAQ 등록에 실패했습니다.');
    } finally {
      setFaqFormLoading(false);
    }
  };

  const handleEditFaq = async (id: string) => {
    setFaqFormLoading(true);
    try {
      await apiPatch(`${API_ENDPOINTS.FAQS}/${id}`, {
        question: faqForm.question || undefined,
        answer: faqForm.answer || undefined,
        category: faqForm.category || undefined,
        order: faqForm.order ? Number(faqForm.order) : undefined,
      });
      setEditingFaqId(null);
      await loadFaqs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'FAQ 수정에 실패했습니다.');
    } finally {
      setFaqFormLoading(false);
    }
  };

  const handleDeleteFaq = async (id: string, question: string) => {
    if (!confirm(`"${question}" FAQ를 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(`${API_ENDPOINTS.FAQS}/${id}`);
      await loadFaqs();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  // 시뮬레이터 세트 함수들
  const loadSimSets = async () => {
    setSimSetsLoading(true);
    try {
      const res = await apiGet<{ data: SimulatorSet[] } | SimulatorSet[]>(API_ENDPOINTS.SIMULATOR_SETS);
      const data = Array.isArray(res) ? res : (res as { data: SimulatorSet[] }).data ?? [];
      setSimSets(data);
    } catch {
      setSimSets([]);
    } finally {
      setSimSetsLoading(false);
    }
  };

  const handleSlotSearch = async () => {
    if (!slotSearch.trim() || !activeSlot) return;
    setSlotSearchLoading(true);
    try {
      const catId = categories.find(c => c.slug === activeSlot)?.id;
      const res = await apiGet<PaginatedProducts>(`${API_ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(slotSearch)}&take=30`);
      const all = res.data ?? [];
      setSlotResults(catId ? all.filter(p => p.categoryId === catId) : all);
    } catch {
      setSlotResults([]);
    } finally {
      setSlotSearchLoading(false);
    }
  };

  const assignToSlot = (slug: SimSlotSlug, product: Product) => {
    const catId = categories.find(c => c.slug === slug)?.id ?? product.categoryId;
    setSimSlots(prev => ({ ...prev, [slug]: { productId: product.id, productName: product.name, categoryId: catId } }));
    setActiveSlot(null);
    setSlotSearch('');
    setSlotResults([]);
  };

  const clearSlot = (slug: SimSlotSlug) => {
    setSimSlots(prev => ({ ...prev, [slug]: null }));
    if (activeSlot === slug) { setActiveSlot(null); setSlotSearch(''); setSlotResults([]); }
  };

  const startEditSimSet = (set: SimulatorSet) => {
    setEditingSimSetId(set.id);
    setSimSetForm({ type: set.type, name: set.name, description: set.description ?? '', isActive: set.isActive });
    const newSlots = { ...EMPTY_SIM_SLOTS };
    for (const item of set.items || []) {
      const slot = SIM_SLOTS.find(s => s.slug === item.categorySlug);
      if (slot) {
        newSlots[slot.slug] = {
          productId: item.productId,
          productName: item.productName ?? '(이름 없음)',
          categoryId: item.categoryId,
        };
      }
    }
    setSimSlots(newSlots);
    setActiveSlot(null);
    setSlotSearch('');
    setSlotResults([]);
    setIsAddingSimSet(false);
  };

  const resetSimSetForm = () => {
    setSimSetForm({ type: 'fishing_vessel', name: '', description: '', isActive: true });
    setSimSlots({ ...EMPTY_SIM_SLOTS });
    setActiveSlot(null);
    setSlotSearch('');
    setSlotResults([]);
    setIsAddingSimSet(false);
    setEditingSimSetId(null);
  };

  const handleSaveSimSet = async () => {
    const filledItems = SIM_SLOTS
      .filter(s => simSlots[s.slug] !== null)
      .map(s => ({ productId: simSlots[s.slug]!.productId, categoryId: simSlots[s.slug]!.categoryId }));
    if (!simSetForm.name || filledItems.length === 0) {
      alert('세트명과 장비를 1개 이상 입력해주세요.');
      return;
    }
    setSimSetFormLoading(true);
    try {
      const payload = {
        type: simSetForm.type,
        name: simSetForm.name,
        description: simSetForm.description || undefined,
        isActive: simSetForm.isActive,
        items: filledItems,
      };
      if (editingSimSetId) {
        await apiPatch(`${API_ENDPOINTS.SIMULATOR_SETS}/${editingSimSetId}`, payload);
      } else {
        await apiPost(API_ENDPOINTS.SIMULATOR_SETS, payload);
      }
      resetSimSetForm();
      await loadSimSets();
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSimSetFormLoading(false);
    }
  };

  const handleDeleteSimSet = async (id: string, name: string) => {
    if (!confirm(`"${name}" 세트를 삭제하시겠습니까?`)) return;
    try {
      await apiDelete(`${API_ENDPOINTS.SIMULATOR_SETS}/${id}`);
      await loadSimSets();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const selectedProduct = recProductId ? products.find(p => p.id === recProductId) : null;
  const isProductFormValid = !!productForm.name && !!productForm.price && !!productForm.brandId && !!productForm.categoryId;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans w-full overflow-hidden">
      {/* 사이드바 */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Ship className="mr-2 text-blue-400" size={24} /> 명장 관리자
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="운영 현황" isActive={currentMenu === 'dashboard'} onClick={() => setCurrentMenu('dashboard')} />
          <MenuButton icon={<Package size={20}/>} label="장비/상품 관리" isActive={currentMenu === 'products'} onClick={() => setCurrentMenu('products')} />
          <MenuButton icon={<ShoppingCart size={20}/>} label="주문 관리" isActive={currentMenu === 'orders'} onClick={() => setCurrentMenu('orders')} />
          <MenuButton icon={<Layout size={20}/>} label="메인/추천 관리" isActive={currentMenu === 'main_mgmt'} onClick={() => setCurrentMenu('main_mgmt')} />
          <MenuButton icon={<Star size={20}/>} label="소개 장비 관리" isActive={currentMenu === 'featured'} onClick={() => setCurrentMenu('featured')} />
          <MenuButton icon={<MessageCircle size={20}/>} label="컨설팅 신청 내역" isActive={currentMenu === 'consulting'} onClick={() => setCurrentMenu('consulting')} />
          <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">콘텐츠 관리</div>
          <MenuButton icon={<Megaphone size={20}/>} label="공지사항 관리" isActive={currentMenu === 'notice_mgmt'} onClick={() => setCurrentMenu('notice_mgmt')} />
          <MenuButton icon={<BookOpen size={20}/>} label="강의 관리" isActive={currentMenu === 'lecture_mgmt'} onClick={() => setCurrentMenu('lecture_mgmt')} />
          <MenuButton icon={<FileText size={20}/>} label="고객문의 관리" isActive={currentMenu === 'inquiry_mgmt'} onClick={() => setCurrentMenu('inquiry_mgmt')} />
          <MenuButton icon={<HelpCircle size={20}/>} label="FAQ 관리" isActive={currentMenu === 'faq_mgmt'} onClick={() => setCurrentMenu('faq_mgmt')} />
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* [1. 운영 현황] */}
        {currentMenu === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">실시간 운영 지표</h2>
            {statsLoading ? (
              <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> 통계 불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                <StatCard title="등록 장비" value={stats?.productCount ?? '-'} unit="종" color="text-blue-600" />
                <StatCard title="상담 신청" value={stats?.consultingCount ?? '-'} unit="건" color="text-orange-500" />
                <StatCard title="주문 건수" value={stats?.orderCount ?? '-'} unit="건" color="text-purple-600" />
                <StatCard title="오늘 방문" value={stats?.todayVisitors ?? '-'} unit="명" color="text-teal-600" />
                <StatCard title="주간 방문" value={stats?.weeklyVisitors ?? '-'} unit="명" color="text-indigo-600" />
              </div>
            )}
          </div>
        )}

        {/* [2. 장비/상품 관리] */}
        {currentMenu === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">장비 목록 관리</h2>
              <button
                onClick={() => { setIsAddingProduct(!isAddingProduct); setProductForm(EMPTY_FORM); setRecProductId(null); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
              >
                {isAddingProduct ? <X size={18} className="mr-1"/> : <Plus size={18} className="mr-1"/>}
                {isAddingProduct ? '취소' : '신규 장비 등록'}
              </button>
            </div>

            {productsError && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{productsError}</div>}

            {/* 신규 등록 폼 */}
            {isAddingProduct && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-md">
                <h3 className="font-bold text-lg mb-4">신규 장비 등록</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">장비명 <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="장비명" value={productForm.name}
                      onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))}
                      className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">가격 <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="가격" value={productForm.price}
                      onChange={(e) => setProductForm(f => ({ ...f, price: e.target.value }))}
                      className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">재고수량</label>
                    <input type="number" placeholder="재고수량" value={productForm.stock}
                      onChange={(e) => setProductForm(f => ({ ...f, stock: e.target.value }))}
                      className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">브랜드 <span className="text-red-500">*</span></label>
                    <select value={productForm.brandId}
                      onChange={(e) => setProductForm(f => ({ ...f, brandId: e.target.value }))}
                      className="p-2 border rounded w-full">
                      <option value="">브랜드 선택</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">카테고리 <span className="text-red-500">*</span></label>
                    <select value={productForm.categoryId}
                      onChange={(e) => setProductForm(f => ({ ...f, categoryId: e.target.value }))}
                      className="p-2 border rounded w-full">
                      <option value="">카테고리 선택</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">태그</label>
                    <select value={productForm.tag}
                      onChange={(e) => setProductForm(f => ({ ...f, tag: e.target.value }))}
                      className="p-2 border rounded w-full">
                      <option value="">태그 없음</option>
                      <option value="BEST">BEST</option>
                      <option value="NEW">NEW</option>
                      <option value="SALE">SALE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">할인율 (%)</label>
                    <input type="number" placeholder="할인율" value={productForm.discountRate}
                      onChange={(e) => setProductForm(f => ({ ...f, discountRate: e.target.value }))}
                      className="p-2 border rounded w-full" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">이미지 URL</label>
                    <input type="text" placeholder="이미지 URL" value={productForm.image}
                      onChange={(e) => setProductForm(f => ({ ...f, image: e.target.value }))}
                      className="p-2 border rounded w-full" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">상품 설명</label>
                    <textarea placeholder="상품 설명" value={productForm.description}
                      onChange={(e) => setProductForm(f => ({ ...f, description: e.target.value }))}
                      className="p-2 border rounded w-full h-20 resize-none" />
                  </div>
                </div>
                <button onClick={handleAddProduct}
                  disabled={formLoading || !isProductFormValid}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={16} />
                  {formLoading ? '저장 중...' : '장비 저장'}
                </button>
                {!isProductFormValid && (
                  <p className="text-xs text-red-500 mt-2 text-center">장비명, 가격, 브랜드, 카테고리는 필수입니다.</p>
                )}
              </div>
            )}

            {/* 장비 연결 관리 패널 */}
            {recProductId && selectedProduct && (
              <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-md space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Link2 size={18} className="text-indigo-500"/> 연결 장비 관리
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.name} — A↔B 양방향으로 연결됩니다.</p>
                  </div>
                  <button onClick={() => { setRecProductId(null); setRecSearchResults([]); setRecSearch(''); }}
                    className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>

                {recLoading ? (
                  <div className="text-slate-400 text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin"/> 불러오는 중...</div>
                ) : recommendations.length === 0 ? (
                  <p className="text-sm text-slate-400">연결된 장비가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {recommendations.map(rec => (
                      <div key={rec.id} className="flex items-center justify-between bg-indigo-50 px-4 py-2 rounded-lg text-sm">
                        <span className="font-medium">{rec.recommendedProduct?.name ?? rec.recommendedProductId}</span>
                        <button onClick={() => handleDeleteRecommendation(rec.id)}
                          className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input type="text" placeholder="연결할 장비 검색..." value={recSearch}
                    onChange={(e) => setRecSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRecSearch()}
                    className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <button onClick={handleRecSearch} disabled={recSearchLoading || !recSearch.trim()}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-indigo-600 disabled:opacity-50 text-sm">
                    {recSearchLoading ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>} 검색
                  </button>
                </div>

                {recSearchResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    {recSearchResults.map(p => {
                      const already = recommendations.some(r => r.recommendedProductId === p.id);
                      return (
                        <div key={p.id} className="flex items-center justify-between px-4 py-2 border-b last:border-b-0 hover:bg-slate-50 text-sm">
                          <span>{p.name}</span>
                          {already ? (
                            <span className="text-xs text-indigo-500 font-bold">이미 연결됨</span>
                          ) : (
                            <button onClick={() => handleAddRecommendation(p.id)}
                              className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600 flex items-center gap-1">
                              <Plus size={12}/> 연결
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                            <input type="text" value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="p-1 border rounded w-full text-sm"/>
                          </td>
                          <td className="p-3">
                            <input type="number" value={editForm.price}
                              onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))}
                              className="p-1 border rounded w-full text-sm"/>
                          </td>
                          <td className="p-3">
                            <input type="number" value={editForm.stock}
                              onChange={(e) => setEditForm(f => ({ ...f, stock: e.target.value }))}
                              className="p-1 border rounded w-20 text-sm"/>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditProduct(p.id)} disabled={formLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"><Save size={16}/></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={p.id} className={`border-b hover:bg-slate-50 transition text-sm ${recProductId === p.id ? 'bg-indigo-50' : ''}`}>
                          <td className="p-4 font-bold">{p.name}</td>
                          <td className="p-4 font-black text-blue-600">{p.price.toLocaleString()}원</td>
                          <td className="p-4">{p.stock}개</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => openRecommendations(p.id)}
                                title="연결 장비 관리"
                                className={`text-slate-400 hover:text-indigo-600 ${recProductId === p.id ? 'text-indigo-600' : ''}`}>
                                <Link2 size={16}/>
                              </button>
                              <button onClick={() => startEditing(p)} className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {products.length === 0 && !productsLoading && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">등록된 상품이 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [소개 장비 관리] */}
        {currentMenu === 'featured' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={22}/> 소개 장비 관리
              </h2>
              <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {featuredProducts.length} / 5 등록됨
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-amber-50">
                <h3 className="font-bold text-amber-900">현재 소개 장비 목록</h3>
              </div>
              {featuredLoading ? (
                <div className="p-8 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2"/> 불러오는 중...
                </div>
              ) : featuredProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Star size={32} className="mx-auto mb-2 opacity-20"/>
                  <p>등록된 소개 장비가 없습니다.</p>
                  <p className="text-xs mt-1">아래 검색창에서 제품을 추가해주세요.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-sm font-bold">
                    <tr>
                      <th className="p-4 text-slate-500 w-12">순서</th>
                      <th className="p-4 text-slate-500">장비명</th>
                      <th className="p-4 text-slate-500">가격</th>
                      <th className="p-4 text-center text-slate-500">순서 변경</th>
                      <th className="p-4 text-center text-slate-500">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredProducts.map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-slate-50 transition text-sm">
                        <td className="p-4">
                          <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.product.image && (
                              <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded border"/>
                            )}
                            <span className="font-medium">{item.product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-blue-600">{formatPrice(item.product.price)}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleMoveFeatured(index, 'up')} disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20" title="위로 이동">
                              <ChevronUp size={16}/>
                            </button>
                            <button onClick={() => handleMoveFeatured(index, 'down')} disabled={index === featuredProducts.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20" title="아래로 이동">
                              <ChevronDown size={16}/>
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleRemoveFeatured(item.id, item.product.name)}
                            className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {featuredProducts.length < 5 && (
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <h3 className="font-bold text-slate-700">소개 장비 추가</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="장비명으로 검색..." value={featuredSearch}
                    onChange={(e) => setFeaturedSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFeaturedSearch()}
                    className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/>
                  <button onClick={handleFeaturedSearch} disabled={featuredSearchLoading || !featuredSearch.trim()}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-600 disabled:opacity-50">
                    {featuredSearchLoading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>} 검색
                  </button>
                </div>

                {featuredSearchResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 border-b">
                      검색 결과 ({featuredSearchResults.length}건)
                    </div>
                    <table className="w-full text-left text-sm">
                      <tbody>
                        {featuredSearchResults.map(p => {
                          const alreadyAdded = featuredProducts.some(f => f.productId === p.id);
                          return (
                            <tr key={p.id} className="border-b hover:bg-slate-50 transition">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded border"/>}
                                  <span className="font-medium">{p.name}</span>
                                </div>
                              </td>
                              <td className="p-3 text-blue-600 font-bold">{formatPrice(p.price)}</td>
                              <td className="p-3 text-center">
                                {alreadyAdded ? (
                                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-bold">등록됨</span>
                                ) : (
                                  <button onClick={() => handleAddFeatured(p.id)}
                                    className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full hover:bg-amber-600 flex items-center gap-1 mx-auto">
                                    <Plus size={12}/> 추가
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {featuredProducts.length >= 5 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                소개 장비는 최대 5개까지 등록할 수 있습니다. 기존 항목을 삭제한 후 새 장비를 추가할 수 있습니다.
              </div>
            )}
          </div>
        )}

        {/* [3. 메인/추천 관리] */}
        {currentMenu === 'main_mgmt' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <ImageIcon className="text-blue-500"/> 메인 배너 이미지/문구 변경
              </h2>
              {banners.map(banner => (
                <div key={banner.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex gap-6 items-center shadow-sm">
                  <div className="relative group w-48 h-28 shrink-0">
                    <img src={banner.imageUrl} className="w-full h-full object-cover rounded-xl" alt="banner"/>
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-xl text-white text-xs font-bold">이미지 교체</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input defaultValue={banner.title} className="text-lg font-black w-full border-b outline-none focus:border-blue-500"/>
                    <input defaultValue={banner.subtitle} className="text-sm text-slate-400 w-full border-b outline-none focus:border-blue-500"/>
                  </div>
                  <div className="text-xs text-slate-400 text-center"><p>배너 API</p><p>미지원</p></div>
                </div>
              ))}
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="text-orange-500"/> 시뮬레이터 세트 관리
                </h2>
                <button
                  onClick={() => { resetSimSetForm(); setIsAddingSimSet(true); }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-orange-600 text-sm font-bold"
                >
                  <Plus size={16}/> 새 세트 등록
                </button>
              </div>

              {/* 등록/수정 폼 */}
              {(isAddingSimSet || editingSimSetId) && (
                <div className="bg-white border-2 border-orange-100 rounded-2xl p-6 mb-6 space-y-4 shadow-md">
                  <h3 className="font-bold text-lg">{editingSimSetId ? '세트 수정' : '새 세트 등록'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">타입 <span className="text-red-500">*</span></label>
                      <select value={simSetForm.type}
                        onChange={e => setSimSetForm(f => ({ ...f, type: e.target.value }))}
                        className="p-2 border rounded w-full text-sm">
                        <option value="fishing_vessel">어선용</option>
                        <option value="leisure">레저용</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">세트명 <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="예: 프리미엄 어선 세트" value={simSetForm.name}
                        onChange={e => setSimSetForm(f => ({ ...f, name: e.target.value }))}
                        className="p-2 border rounded w-full text-sm"/>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">설명</label>
                      <input type="text" placeholder="세트 설명" value={simSetForm.description}
                        onChange={e => setSimSetForm(f => ({ ...f, description: e.target.value }))}
                        className="p-2 border rounded w-full text-sm"/>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="simActive" checked={simSetForm.isActive}
                        onChange={e => setSimSetForm(f => ({ ...f, isActive: e.target.checked }))}
                        className="w-4 h-4"/>
                      <label htmlFor="simActive" className="text-sm font-medium">활성화 (공개 노출)</label>
                    </div>
                  </div>

                  {/* 장비 슬롯 (6개 고정) */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">구성 장비 <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                      {SIM_SLOTS.map(slot => {
                        const assigned = simSlots[slot.slug];
                        const isActive = activeSlot === slot.slug;
                        return (
                          <div key={slot.slug} className="border rounded-lg overflow-hidden">
                            {/* 슬롯 행 */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-white">
                              <span className="shrink-0 text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-[72px] text-center">{slot.name}</span>
                              <span className={`flex-1 text-sm truncate ${assigned ? 'font-medium text-slate-800' : 'text-slate-300 italic'}`}>
                                {assigned ? assigned.productName : '비어있음'}
                              </span>
                              <button
                                onClick={() => { setActiveSlot(isActive ? null : slot.slug); setSlotSearch(''); setSlotResults([]); }}
                                className="text-xs px-2 py-1 rounded border border-slate-300 hover:border-blue-400 hover:text-blue-600 shrink-0">
                                {assigned ? '교체' : '선택'}
                              </button>
                              {assigned && (
                                <button onClick={() => clearSlot(slot.slug)} className="text-red-300 hover:text-red-500 shrink-0"><X size={14}/></button>
                              )}
                            </div>
                            {/* 슬롯별 검색 (활성 시) */}
                            {isActive && (
                              <div className="border-t bg-slate-50 p-2">
                                <div className="flex gap-1 mb-1">
                                  <input type="text" placeholder={`${slot.name} 장비 검색...`} value={slotSearch}
                                    onChange={e => setSlotSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSlotSearch()}
                                    className="flex-1 px-2 py-1 border rounded text-xs" autoFocus/>
                                  <button onClick={handleSlotSearch} disabled={slotSearchLoading}
                                    className="bg-slate-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 disabled:opacity-50">
                                    {slotSearchLoading ? <Loader2 size={12} className="animate-spin"/> : <Search size={12}/>}
                                  </button>
                                </div>
                                {slotResults.length > 0 && (
                                  <div className="max-h-36 overflow-y-auto border rounded bg-white">
                                    {slotResults.map(p => (
                                      <div key={p.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 border-b last:border-0">
                                        <span className="text-xs">{p.name}</span>
                                        <button onClick={() => assignToSlot(slot.slug, p)}
                                          className="text-[11px] bg-orange-500 text-white px-2 py-0.5 rounded shrink-0">선택</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {slotResults.length === 0 && slotSearch && !slotSearchLoading && (
                                  <p className="text-[11px] text-slate-400 text-center py-1">검색 결과 없음</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSaveSimSet} disabled={simSetFormLoading || !simSetForm.name}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                      <Save size={15}/> {simSetFormLoading ? '저장 중...' : (editingSimSetId ? '수정 완료' : '세트 저장')}
                    </button>
                    <button onClick={resetSimSetForm} className="px-4 py-2 border rounded-lg text-sm text-slate-500 hover:bg-slate-50">
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 세트 목록 */}
              {simSetsLoading ? (
                <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={24}/> 불러오는 중...</div>
              ) : simSets.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed p-8 text-center text-slate-400">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-20"/>
                  <p>등록된 시뮬레이터 세트가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {simSets.map(set => (
                    <div key={set.id} className="bg-white rounded-xl border shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${set.type === 'fishing_vessel' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {set.type === 'fishing_vessel' ? '어선용' : '레저용'}
                            </span>
                            {!set.isActive && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">비활성</span>}
                            <span className="font-bold text-base">{set.name}</span>
                          </div>
                          {set.description && <p className="text-xs text-slate-400 mb-2">{set.description}</p>}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                            {SIM_SLOTS.map(slot => {
                              const item = (set.items || []).find(i => i.categorySlug === slot.slug);
                              return (
                                <div key={slot.slug} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="shrink-0 bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded w-[58px] text-center">{slot.name}</span>
                                  <span className={item ? 'text-slate-700 truncate' : 'text-slate-300 italic'}>
                                    {item ? (item.productName ?? '(이름 없음)') : '비어있음'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => startEditSimSet(set)}
                            className="text-slate-400 hover:text-blue-600 p-1"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteSimSet(set.id, set.name)}
                            className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* [주문 관리] */}
        {currentMenu === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">주문 관리</h2>

            {ordersError && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{ordersError}</div>}

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
                          <OrderStatusBadge status={order.status}/>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{formatDate(order.createdAt)}</td>
                        <td className="p-4 text-center">
                          <select value={order.status} disabled={statusUpdating === order.id}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-xs border rounded px-2 py-1 bg-white pr-6 disabled:opacity-50">
                            <option value="PENDING">결제대기</option>
                            <option value="PAID">결제완료</option>
                            <option value="CONFIRMED">주문확인</option>
                            <option value="SHIPPING">배송중</option>
                            <option value="DELIVERED">배송완료</option>
                            <option value="CANCELLED">취소됨</option>
                            <option value="REFUNDING">환불신청</option>
                            <option value="REFUNDED">환불완료</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [컨설팅 신청 내역] */}
        {currentMenu === 'consulting' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">컨설팅 및 상담 현황</h2>

            {/* 상세 모달 */}
            {consultingDetail && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{consultingDetail.title}</h3>
                    <button onClick={() => setConsultingDetail(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>사용자 ID: {consultingDetail.userId}</p>
                    <p>상태: {CONSULTING_STATUS_LABELS[consultingDetail.status]}</p>
                    <p>신청일: {formatDate(consultingDetail.createdAt)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap">{consultingDetail.content}</div>
                  <button onClick={() => setConsultingDetail(null)}
                    className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold">닫기</button>
                </div>
              </div>
            )}

            {consultingLoading ? (
              <div className="p-8 text-center text-slate-400">불러오는 중...</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {consultings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="font-medium">컨설팅 내역이 없거나 서버 API가 지원되지 않습니다.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-sm">
                      <tr>
                        <th className="p-4">제목</th>
                        <th className="p-4">사용자 ID</th>
                        <th className="p-4 text-center">상태</th>
                        <th className="p-4">신청일</th>
                        <th className="p-4 text-center">상태 변경</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultings.map(c => (
                        <tr key={c.id} className="border-b text-sm hover:bg-slate-50 cursor-pointer" onClick={() => setConsultingDetail(c)}>
                          <td className="p-4 font-bold"><User size={14} className="inline mr-2 text-slate-400"/>{c.title}</td>
                          <td className="p-4 text-slate-500 font-mono text-xs">{c.userId?.slice(0, 8)}...</td>
                          <td className="p-4 text-center">
                            <ConsultingStatusBadge status={c.status as ConsultingStatus}/>
                          </td>
                          <td className="p-4 text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <select value={c.status} disabled={consultingStatusUpdating === c.id}
                              onChange={(e) => handleConsultingStatusChange(c.id, e.target.value as ConsultingStatus)}
                              className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50">
                              <option value="PENDING">대기중</option>
                              <option value="IN_PROGRESS">진행중</option>
                              <option value="COMPLETED">완료</option>
                              <option value="CANCELLED">취소</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* [공지사항 관리] */}
        {currentMenu === 'notice_mgmt' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">공지사항 관리</h2>
              <button onClick={() => { setIsAddingNotice(!isAddingNotice); setNoticeForm({ title: '', content: '', isImportant: false }); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                {isAddingNotice ? <X size={18} className="mr-1"/> : <Plus size={18} className="mr-1"/>}
                {isAddingNotice ? '취소' : '새 공지 작성'}
              </button>
            </div>

            {isAddingNotice && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-md space-y-3">
                <h3 className="font-bold text-lg">새 공지 작성</h3>
                <input type="text" placeholder="제목 *" value={noticeForm.title}
                  onChange={(e) => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                  className="p-2 border rounded w-full"/>
                <textarea placeholder="내용 *" value={noticeForm.content}
                  onChange={(e) => setNoticeForm(f => ({ ...f, content: e.target.value }))}
                  className="p-2 border rounded w-full h-28 resize-none"/>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={noticeForm.isImportant}
                    onChange={(e) => setNoticeForm(f => ({ ...f, isImportant: e.target.checked }))}/>
                  중요 공지
                </label>
                <button onClick={handleAddNotice} disabled={noticeFormLoading || !noticeForm.title || !noticeForm.content}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={16}/> {noticeFormLoading ? '저장 중...' : '공지 등록'}
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {noticesLoading ? (
                <div className="p-8 text-center text-slate-400">불러오는 중...</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b font-bold">
                    <tr>
                      <th className="p-4 text-slate-500">제목</th>
                      <th className="p-4 text-slate-500 text-center">중요</th>
                      <th className="p-4 text-slate-500">등록일</th>
                      <th className="p-4 text-center text-slate-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map(n => (
                      editingNoticeId === n.id ? (
                        <tr key={n.id} className="border-b bg-blue-50">
                          <td className="p-3" colSpan={2}>
                            <input type="text" value={noticeForm.title}
                              onChange={(e) => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                              className="p-1 border rounded w-full text-sm mb-1"/>
                            <textarea value={noticeForm.content}
                              onChange={(e) => setNoticeForm(f => ({ ...f, content: e.target.value }))}
                              className="p-1 border rounded w-full text-sm h-16 resize-none"/>
                          </td>
                          <td className="p-3 text-xs text-slate-400">{formatDate(n.createdAt)}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditNotice(n.id)} disabled={noticeFormLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"><Save size={16}/></button>
                              <button onClick={() => setEditingNoticeId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={n.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-medium">{n.title}</td>
                          <td className="p-4 text-center">
                            {n.isImportant && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">중요</span>}
                          </td>
                          <td className="p-4 text-slate-400 text-xs">{formatDate(n.createdAt)}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => { setEditingNoticeId(n.id); setNoticeForm({ title: n.title, content: n.content, isImportant: n.isImportant }); }}
                                className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteNotice(n.id, n.title)}
                                className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {notices.length === 0 && !noticesLoading && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">등록된 공지사항이 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [강의 관리] */}
        {currentMenu === 'lecture_mgmt' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">강의 관리</h2>
              <button onClick={() => { setIsAddingLecture(!isAddingLecture); setLectureForm({ title: '', youtubeUrl: '', topic: '' }); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                {isAddingLecture ? <X size={18} className="mr-1"/> : <Plus size={18} className="mr-1"/>}
                {isAddingLecture ? '취소' : '새 강의 등록'}
              </button>
            </div>

            {isAddingLecture && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-md space-y-3">
                <h3 className="font-bold text-lg">새 강의 등록</h3>
                <input type="text" placeholder="강의 제목 *" value={lectureForm.title}
                  onChange={(e) => setLectureForm(f => ({ ...f, title: e.target.value }))}
                  className="p-2 border rounded w-full"/>
                <input type="text" placeholder="유튜브 URL *" value={lectureForm.youtubeUrl}
                  onChange={(e) => setLectureForm(f => ({ ...f, youtubeUrl: e.target.value }))}
                  className="p-2 border rounded w-full"/>
                <input type="text" placeholder="주제 (선택)" value={lectureForm.topic}
                  onChange={(e) => setLectureForm(f => ({ ...f, topic: e.target.value }))}
                  className="p-2 border rounded w-full"/>
                <button onClick={handleAddLecture} disabled={lectureFormLoading || !lectureForm.title || !lectureForm.youtubeUrl}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={16}/> {lectureFormLoading ? '저장 중...' : '강의 등록'}
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {lecturesLoading ? (
                <div className="p-8 text-center text-slate-400">불러오는 중...</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b font-bold">
                    <tr>
                      <th className="p-4 text-slate-500">제목</th>
                      <th className="p-4 text-slate-500">주제</th>
                      <th className="p-4 text-slate-500">조회수</th>
                      <th className="p-4 text-slate-500">등록일</th>
                      <th className="p-4 text-center text-slate-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lectures.map(lec => (
                      editingLectureId === lec.id ? (
                        <tr key={lec.id} className="border-b bg-blue-50">
                          <td className="p-3" colSpan={3}>
                            <input type="text" value={lectureForm.title}
                              onChange={(e) => setLectureForm(f => ({ ...f, title: e.target.value }))}
                              className="p-1 border rounded w-full text-sm mb-1" placeholder="제목"/>
                            <input type="text" value={lectureForm.youtubeUrl}
                              onChange={(e) => setLectureForm(f => ({ ...f, youtubeUrl: e.target.value }))}
                              className="p-1 border rounded w-full text-sm mb-1" placeholder="유튜브 URL"/>
                            <input type="text" value={lectureForm.topic}
                              onChange={(e) => setLectureForm(f => ({ ...f, topic: e.target.value }))}
                              className="p-1 border rounded w-full text-sm" placeholder="주제"/>
                          </td>
                          <td className="p-3 text-xs text-slate-400">{formatDate(lec.createdAt)}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditLecture(lec.id)} disabled={lectureFormLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"><Save size={16}/></button>
                              <button onClick={() => setEditingLectureId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={lec.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-medium">{lec.title}</td>
                          <td className="p-4 text-slate-500">{lec.topic ?? '-'}</td>
                          <td className="p-4">{lec.views}</td>
                          <td className="p-4 text-slate-400 text-xs">{formatDate(lec.createdAt)}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => { setEditingLectureId(lec.id); setLectureForm({ title: lec.title, youtubeUrl: lec.youtubeUrl, topic: lec.topic ?? '' }); }}
                                className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteLecture(lec.id, lec.title)}
                                className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {lectures.length === 0 && !lecturesLoading && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">등록된 강의가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [고객문의 관리] */}
        {currentMenu === 'inquiry_mgmt' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">고객문의 관리</h2>

            {/* 상세 모달 */}
            {inquiryDetail && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{inquiryDetail.title}</h3>
                    <button onClick={() => setInquiryDetail(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="text-xs text-slate-400">
                    <p>작성자: {inquiryDetail.userName} | 상품ID: {inquiryDetail.productId}</p>
                    <p>등록일: {formatDate(inquiryDetail.createdAt)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap">{inquiryDetail.content}</div>
                  {inquiryDetail.isAnswered && inquiryDetail.answer && (
                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                      <p className="font-bold text-blue-700 mb-1">기존 답변</p>
                      <p className="whitespace-pre-wrap">{inquiryDetail.answer.content}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      {inquiryDetail.isAnswered ? '답변 수정' : '답변 작성'}
                    </label>
                    <textarea value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      className="p-2 border rounded w-full h-24 resize-none text-sm"
                      placeholder="답변 내용을 입력하세요..."/>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveAnswer} disabled={answerLoading || !answerContent.trim()}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                      <Save size={16}/> {answerLoading ? '저장 중...' : '답변 저장'}
                    </button>
                    <button onClick={() => setInquiryDetail(null)}
                      className="px-4 py-2 border rounded-lg text-slate-500 hover:bg-slate-50">닫기</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {inquiriesLoading ? (
                <div className="p-8 text-center text-slate-400">불러오는 중...</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b font-bold">
                    <tr>
                      <th className="p-4 text-slate-500">제목</th>
                      <th className="p-4 text-slate-500 text-center">답변여부</th>
                      <th className="p-4 text-slate-500">등록일</th>
                      <th className="p-4 text-slate-500">상품ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map(iq => (
                      <tr key={iq.id} className="border-b hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleOpenInquiry(iq)}>
                        <td className="p-4 font-medium">{iq.title}</td>
                        <td className="p-4 text-center">
                          {iq.isAnswered ? (
                            <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">답변완료</span>
                          ) : (
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">미답변</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{formatDate(iq.createdAt)}</td>
                        <td className="p-4 text-slate-400 font-mono text-xs">{iq.productId.slice(0, 8)}...</td>
                      </tr>
                    ))}
                    {inquiries.length === 0 && !inquiriesLoading && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">등록된 문의가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* [FAQ 관리] */}
        {currentMenu === 'faq_mgmt' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">FAQ 관리</h2>
              <button onClick={() => { setIsAddingFaq(!isAddingFaq); setFaqForm({ question: '', answer: '', category: '', order: '' }); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                {isAddingFaq ? <X size={18} className="mr-1"/> : <Plus size={18} className="mr-1"/>}
                {isAddingFaq ? '취소' : '새 FAQ'}
              </button>
            </div>

            {isAddingFaq && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-md space-y-3">
                <h3 className="font-bold text-lg">새 FAQ 등록</h3>
                <input type="text" placeholder="질문 *" value={faqForm.question}
                  onChange={(e) => setFaqForm(f => ({ ...f, question: e.target.value }))}
                  className="p-2 border rounded w-full"/>
                <textarea placeholder="답변 *" value={faqForm.answer}
                  onChange={(e) => setFaqForm(f => ({ ...f, answer: e.target.value }))}
                  className="p-2 border rounded w-full h-24 resize-none"/>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="카테고리 (선택)" value={faqForm.category}
                    onChange={(e) => setFaqForm(f => ({ ...f, category: e.target.value }))}
                    className="p-2 border rounded"/>
                  <input type="number" placeholder="순서 (선택)" value={faqForm.order}
                    onChange={(e) => setFaqForm(f => ({ ...f, order: e.target.value }))}
                    className="p-2 border rounded"/>
                </div>
                <button onClick={handleAddFaq} disabled={faqFormLoading || !faqForm.question || !faqForm.answer}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={16}/> {faqFormLoading ? '저장 중...' : 'FAQ 등록'}
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {faqsLoading ? (
                <div className="p-8 text-center text-slate-400">불러오는 중...</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b font-bold">
                    <tr>
                      <th className="p-4 text-slate-500">질문</th>
                      <th className="p-4 text-slate-500">카테고리</th>
                      <th className="p-4 text-slate-500">순서</th>
                      <th className="p-4 text-center text-slate-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map(faq => (
                      editingFaqId === faq.id ? (
                        <tr key={faq.id} className="border-b bg-blue-50">
                          <td className="p-3" colSpan={2}>
                            <input type="text" value={faqForm.question}
                              onChange={(e) => setFaqForm(f => ({ ...f, question: e.target.value }))}
                              className="p-1 border rounded w-full text-sm mb-1" placeholder="질문"/>
                            <textarea value={faqForm.answer}
                              onChange={(e) => setFaqForm(f => ({ ...f, answer: e.target.value }))}
                              className="p-1 border rounded w-full text-sm h-16 resize-none" placeholder="답변"/>
                          </td>
                          <td className="p-3">
                            <input type="number" value={faqForm.order}
                              onChange={(e) => setFaqForm(f => ({ ...f, order: e.target.value }))}
                              className="p-1 border rounded w-16 text-sm" placeholder="순서"/>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditFaq(faq.id)} disabled={faqFormLoading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"><Save size={16}/></button>
                              <button onClick={() => setEditingFaqId(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={faq.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-medium">{faq.question}</td>
                          <td className="p-4 text-slate-500">{faq.category ?? '-'}</td>
                          <td className="p-4">{faq.order}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => { setEditingFaqId(faq.id); setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category ?? '', order: String(faq.order) }); }}
                                className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteFaq(faq.id, faq.question)}
                                className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {faqs.length === 0 && !faqsLoading && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">등록된 FAQ가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
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

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const colorMap: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-600',
    PAID: 'bg-green-100 text-green-600',
    CONFIRMED: 'bg-blue-100 text-blue-600',
    SHIPPING: 'bg-yellow-100 text-yellow-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
    REFUNDING: 'bg-slate-100 text-slate-500',
    REFUNDED: 'bg-slate-100 text-slate-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${colorMap[status] ?? 'bg-slate-100 text-slate-400'}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ConsultingStatusBadge({ status }: { status: ConsultingStatus }) {
  const colorMap: Record<ConsultingStatus, string> = {
    PENDING: 'bg-orange-100 text-orange-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-600',
    COMPLETED: 'bg-slate-100 text-slate-400',
    CANCELLED: 'bg-red-100 text-red-500',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${colorMap[status] ?? 'bg-slate-100 text-slate-400'}`}>
      {CONSULTING_STATUS_LABELS[status] ?? status}
    </span>
  );
}
