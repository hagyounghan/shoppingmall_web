import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { Product, EquipmentPosition, SelectedEquipment } from '../../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, X, Crown, TrendingUp, Wallet, Sparkles, Ship, Anchor } from 'lucide-react';
import { BRANDS } from '../../constants/brands';

// 전자장비 위치 정의
const EQUIPMENT_POSITIONS: EquipmentPosition[] = [
  { id: 'gps-plotter', name: 'GPS 플로터', x: 45, y: 25, category: 'GPS' },
  { id: 'radar', name: '레이더', x: 50, y: 15, category: 'Radar' },
  { id: 'vhf-radio', name: 'VHF 무선기', x: 20, y: 30, category: 'VHF' },
  { id: 'trolling-motor', name: '트롤링모터', x: 15, y: 70, category: 'TrollingMotor' },
  { id: 'fishfinder', name: '어군탐지기', x: 75, y: 50, category: 'Fishfinder' },
  { id: 'autopilot', name: '자동조타', x: 60, y: 60, category: 'Autopilot' },
];

// 샘플 제품 데이터 (실제로는 API에서 가져와야 함)
const ALL_PRODUCTS: Product[] = [
  { id: '1', name: 'GARMIN GPSMAP 1243 (12")', price: 2300000, image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400', tag: 'BEST' },
  { id: '2', name: 'RAYMARINE Axiom 9 (9")', price: 1850000, image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400' },
  { id: '3', name: 'FURUNO GP-1871F (7")', price: 1450000, image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400' },
  { id: '4', name: 'FURUNO DRS4W 4kW 레이더', price: 3800000, image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400' },
  { id: '5', name: 'GARMIN GMR 24 xHD2 레이더', price: 4200000, image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400' },
  { id: '6', name: 'ICOM IC-M506 고정형 VHF', price: 450000, image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400' },
  { id: '7', name: 'STANDARD HORIZON GX2400 VHF', price: 380000, image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400' },
  { id: '8', name: 'MINN KOTA TERROVA 트롤링모터', price: 3200000, image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400' },
  { id: '9', name: 'LOWRANCE HDS-12 LIVE 어군탐지기', price: 2890000, image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400', tag: 'NEW' },
  { id: '10', name: 'GARMIN STRIKER Plus 7sv', price: 1250000, image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400' },
  { id: '11', name: 'RAYMARINE EV-200 자동조타', price: 2800000, image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400' },
];

// 카테고리별 제품 매핑
const SAMPLE_PRODUCTS: Record<string, Product[]> = {
  'GPS': ALL_PRODUCTS.filter(p => p.id === '1' || p.id === '2' || p.id === '3'),
  'Radar': ALL_PRODUCTS.filter(p => p.id === '4' || p.id === '5'),
  'VHF': ALL_PRODUCTS.filter(p => p.id === '6' || p.id === '7'),
  'TrollingMotor': ALL_PRODUCTS.filter(p => p.id === '8'),
  'Fishfinder': ALL_PRODUCTS.filter(p => p.id === '9' || p.id === '10'),
  'Autopilot': ALL_PRODUCTS.filter(p => p.id === '11'),
};

// 세트 정의
const EQUIPMENT_SETS = {
  premium: {
    id: 'premium',
    name: '명장세트',
    description: '프리미엄 제품으로 구성된 최고급 세트',
    equipment: [
      { positionId: 'gps-plotter', productId: '1' },
      { positionId: 'radar', productId: '4' },
      { positionId: 'vhf-radio', productId: '6' },
      { positionId: 'fishfinder', productId: '9' },
      { positionId: 'autopilot', productId: '11' },
    ],
  },
  value: {
    id: 'value',
    name: '가성비세트',
    description: '합리적인 가격의 실용적인 세트',
    equipment: [
      { positionId: 'gps-plotter', productId: '3' },
      { positionId: 'vhf-radio', productId: '7' },
      { positionId: 'fishfinder', productId: '10' },
    ],
  },
  budget: {
    id: 'budget',
    name: '가심비세트',
    description: '경제적인 가격의 기본 세트',
    equipment: [
      { positionId: 'gps-plotter', productId: '2' },
      { positionId: 'vhf-radio', productId: '7' },
    ],
  },
};

type BoatType = 'fishing' | 'leisure';

export function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const [boatType, setBoatType] = useState<BoatType>('leisure');
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, SelectedEquipment>>(
    EQUIPMENT_POSITIONS.reduce((acc, pos) => {
      acc[pos.id] = { positionId: pos.id, product: null };
      return acc;
    }, {} as Record<string, SelectedEquipment>)
  );
  const [selectedPosition, setSelectedPosition] = useState<EquipmentPosition | null>(null);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // URL 파라미터에서 세트 정보 읽기
  useEffect(() => {
    const setParam = searchParams.get('set');
    if (setParam && (setParam === 'premium' || setParam === 'value' || setParam === 'budget')) {
      handleSetSelect(setParam);
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePositionClick = (position: EquipmentPosition) => {
    setSelectedPosition(position);
    setSelectedCategory(position.category);
    // 하단으로 스크롤
    setTimeout(() => {
      document.getElementById('product-selection-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleProductSelect = (product: Product) => {
    if (selectedPosition) {
      setSelectedEquipment((prev: Record<string, SelectedEquipment>) => ({
        ...prev,
        [selectedPosition.id]: {
          positionId: selectedPosition.id,
          product,
        },
      }));
      setSelectedPosition(null);
      setSelectedCategory('all');
    }
  };

  const handleSetSelect = (setId: keyof typeof EQUIPMENT_SETS) => {
    const set = EQUIPMENT_SETS[setId];
    const newSelection: Record<string, SelectedEquipment> = { ...selectedEquipment };

    // 기존 선택 초기화
    Object.keys(newSelection).forEach((key) => {
      newSelection[key] = { positionId: key, product: null };
    });

    // 세트의 장비 적용
    set.equipment.forEach((eq) => {
      const position = EQUIPMENT_POSITIONS.find((p) => p.id === eq.positionId);
      if (position) {
        const category = position.category;
        const products = SAMPLE_PRODUCTS[category] || [];
        const product = products.find((p) => p.id === eq.productId);
        if (product) {
          newSelection[eq.positionId] = {
            positionId: eq.positionId,
            product,
          };
        }
      }
    });

    setSelectedEquipment(newSelection as Record<string, SelectedEquipment>);
  };

  const handleRemoveEquipment = (positionId: string) => {
    setSelectedEquipment((prev: Record<string, SelectedEquipment>) => ({
      ...prev,
      [positionId]: { positionId, product: null },
    }));
  };

  const calculateTotal = (): number => {
    const equipmentArray: SelectedEquipment[] = Object.values(selectedEquipment) as SelectedEquipment[];
    const equipmentTotal = equipmentArray.reduce(
      (sum: number, eq: SelectedEquipment) => sum + (eq.product?.price || 0),
      0
    );
    const installationFee = includeInstallation ? 300000 : 0;
    return equipmentTotal + installationFee;
  };

  // 필터링된 제품 목록
  const filteredProducts = useMemo(() => {
    let products: Product[] = [];

    // 카테고리 필터
    if (selectedCategory === 'all') {
      // 선택된 위치가 있으면 해당 카테고리만, 없으면 모든 제품
      if (selectedPosition) {
        products = SAMPLE_PRODUCTS[selectedPosition.category] || [];
      } else {
        products = ALL_PRODUCTS;
      }
    } else {
      products = SAMPLE_PRODUCTS[selectedCategory] || [];
    }

    // 브랜드 필터
    if (selectedBrand !== 'all') {
      products = products.filter(p => 
        p.name.toUpperCase().includes(selectedBrand.toUpperCase())
      );
    }

    // 검색 필터
    if (searchQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return products;
  }, [selectedCategory, selectedBrand, searchQuery, selectedPosition]);

  const equipmentArray: SelectedEquipment[] = Object.values(selectedEquipment) as SelectedEquipment[];
  const selectedProducts = equipmentArray
    .filter((eq: SelectedEquipment) => eq.product !== null)
    .map((eq: SelectedEquipment) => eq.product!);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* 선박 타입 선택 */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-border">
            <div className="flex gap-2">
              <button
                onClick={() => setBoatType('fishing')}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  boatType === 'fishing'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Anchor className="w-5 h-5" />
                어선용
              </button>
              <button
                onClick={() => setBoatType('leisure')}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  boatType === 'leisure'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Ship className="w-5 h-5" />
                레저용
              </button>
            </div>
          </div>
        </div>

        {/* 세트 버튼 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 명장세트 */}
          <button
            onClick={() => handleSetSelect('premium')}
            className="group relative bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">명장세트</h3>
                  <p className="text-xs text-amber-700 mt-1">프리미엄 구성</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-amber-800 mb-4 line-clamp-2">
              프리미엄 제품으로 구성된 최고급 세트
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700 mb-1">예상 가격</p>
                <p className="text-lg font-bold text-amber-900">
                  {formatPrice(2300000 + 3800000 + 450000 + 2890000 + 2800000)}
                </p>
              </div>
              <div className="px-3 py-1 bg-amber-200 rounded-full">
                <span className="text-xs font-semibold text-amber-900">5개 장비</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            </div>
          </button>

          {/* 가성비세트 */}
          <button
            onClick={() => handleSetSelect('value')}
            className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">가성비세트</h3>
                  <p className="text-xs text-blue-700 mt-1">추천 구성</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-blue-800 mb-4 line-clamp-2">
              합리적인 가격의 실용적인 세트
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 mb-1">예상 가격</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatPrice(1450000 + 380000 + 1250000)}
                </p>
              </div>
              <div className="px-3 py-1 bg-blue-200 rounded-full">
                <span className="text-xs font-semibold text-blue-900">3개 장비</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            </div>
          </button>

          {/* 가심비세트 */}
          <button
            onClick={() => handleSetSelect('budget')}
            className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">가심비세트</h3>
                  <p className="text-xs text-green-700 mt-1">경제적 구성</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-green-800 mb-4 line-clamp-2">
              경제적인 가격의 기본 세트
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 mb-1">예상 가격</p>
                <p className="text-lg font-bold text-green-900">
                  {formatPrice(1850000 + 380000)}
                </p>
              </div>
              <div className="px-3 py-1 bg-green-200 rounded-full">
                <span className="text-xs font-semibold text-green-900">2개 장비</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 배 이미지 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">선박 장비 배치</h2>
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '500px' }}>
                {/* 배 이미지 배경 */}
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)' }}
                >
                  {/* 바다 파도 - 더 디테일하게 */}
                  <path
                    d="M 0 400 Q 100 390 200 395 Q 300 400 400 395 Q 500 390 600 395 Q 700 400 800 395 L 800 450 L 0 450 Z"
                    fill="#3b82f6"
                    opacity="0.4"
                  />
                  <path
                    d="M 0 410 Q 150 400 300 405 Q 450 410 600 405 Q 750 400 800 405 L 800 450 L 0 450 Z"
                    fill="#2563eb"
                    opacity="0.3"
                  />
                  
                  {/* 배 본체 (선박 하부) - 더 디테일하게 */}
                  <path
                    d="M 120 280 Q 180 240 250 240 L 550 240 Q 620 240 680 280 L 680 360 Q 620 400 550 400 L 250 400 Q 180 400 120 360 Z"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="4"
                  />
                  
                  {/* 배 측면 구조 라인 */}
                  <line x1="250" y1="240" x2="250" y2="400" stroke="#1e40af" strokeWidth="2" opacity="0.5" />
                  <line x1="550" y1="240" x2="550" y2="400" stroke="#1e40af" strokeWidth="2" opacity="0.5" />
                  
                  {/* 선박 측면 패널 */}
                  <rect x="260" y="260" width="280" height="120" fill="#f8fafc" stroke="#1e40af" strokeWidth="1" opacity="0.3" rx="4" />
                  
                  {/* 배 상부 구조물 (플라이브리지) */}
                  <rect x="280" y="180" width="240" height="80" fill="#f0f9ff" stroke="#1e40af" strokeWidth="2" rx="8" />
                  <rect x="300" y="200" width="200" height="40" fill="#ffffff" stroke="#1e40af" strokeWidth="1" rx="4" />
                  
                  {/* 플라이브리지 창문 - 더 디테일하게 */}
                  <rect x="320" y="210" width="30" height="20" fill="#87ceeb" stroke="#1e40af" strokeWidth="1" rx="2" />
                  <rect x="360" y="210" width="30" height="20" fill="#87ceeb" stroke="#1e40af" strokeWidth="1" rx="2" />
                  <rect x="400" y="210" width="30" height="20" fill="#87ceeb" stroke="#1e40af" strokeWidth="1" rx="2" />
                  <rect x="440" y="210" width="30" height="20" fill="#87ceeb" stroke="#1e40af" strokeWidth="1" rx="2" />
                  
                  {/* 창문 프레임 */}
                  <line x1="335" y1="210" x2="335" y2="230" stroke="#1e40af" strokeWidth="0.5" />
                  <line x1="375" y1="210" x2="375" y2="230" stroke="#1e40af" strokeWidth="0.5" />
                  <line x1="415" y1="210" x2="415" y2="230" stroke="#1e40af" strokeWidth="0.5" />
                  <line x1="455" y1="210" x2="455" y2="230" stroke="#1e40af" strokeWidth="0.5" />
                  
                  {/* 마스트 */}
                  <line x1="400" y1="180" x2="400" y2="60" stroke="#1e40af" strokeWidth="5" />
                  <line x1="395" y1="180" x2="395" y2="60" stroke="#1e3a8a" strokeWidth="2" opacity="0.5" />
                  <line x1="405" y1="180" x2="405" y2="60" stroke="#1e3a8a" strokeWidth="2" opacity="0.5" />
                  
                  {/* 마스트 상단 */}
                  <circle cx="400" cy="60" r="18" fill="#1e40af" />
                  <circle cx="400" cy="60" r="12" fill="#3b82f6" />
                  
                  {/* 레이더 돔 (마스트 위) */}
                  <circle cx="400" cy="50" r="12" fill="#cbd5e1" stroke="#1e40af" strokeWidth="2" />
                  <circle cx="400" cy="50" r="8" fill="#94a3b8" />
                  <line x1="392" y1="50" x2="408" y2="50" stroke="#1e40af" strokeWidth="1" />
                  <line x1="400" y1="42" x2="400" y2="58" stroke="#1e40af" strokeWidth="1" />
                  
                  {/* 어선용 특수 구조물 */}
                  {boatType === 'fishing' && (
                    <>
                      {/* 어선 갑판 구조물 */}
                      <rect x="150" y="300" width="100" height="60" fill="#e2e8f0" stroke="#1e40af" strokeWidth="2" rx="4" />
                      <rect x="550" y="300" width="100" height="60" fill="#e2e8f0" stroke="#1e40af" strokeWidth="2" rx="4" />
                      {/* 어선 갑판 문 */}
                      <rect x="170" y="320" width="20" height="30" fill="#64748b" stroke="#1e40af" strokeWidth="1" />
                      <rect x="570" y="320" width="20" height="30" fill="#64748b" stroke="#1e40af" strokeWidth="1" />
                      {/* 어선 갑판 창문 */}
                      <rect x="190" y="310" width="15" height="15" fill="#87ceeb" stroke="#1e40af" strokeWidth="1" />
                      <rect x="590" y="310" width="15" height="15" fill="#87ceeb" stroke="#1e40af" strokeWidth="1" />
                    </>
                  )}
                  
                  {/* 레저용 특수 구조물 */}
                  {boatType === 'leisure' && (
                    <>
                      {/* 선미 데크 */}
                      <rect x="550" y="280" width="100" height="80" fill="#f1f5f9" stroke="#1e40af" strokeWidth="2" rx="4" />
                      {/* 선미 난간 */}
                      <line x1="550" y1="280" x2="650" y2="280" stroke="#1e40af" strokeWidth="2" />
                      <line x1="550" y1="360" x2="650" y2="360" stroke="#1e40af" strokeWidth="2" />
                      <line x1="550" y1="280" x2="550" y2="360" stroke="#1e40af" strokeWidth="2" />
                      <line x1="650" y1="280" x2="650" y2="360" stroke="#1e40af" strokeWidth="2" />
                      {/* 선미 난간 지지대 */}
                      <line x1="570" y1="280" x2="570" y2="360" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
                      <line x1="590" y1="280" x2="590" y2="360" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
                      <line x1="610" y1="280" x2="610" y2="360" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
                      <line x1="630" y1="280" x2="630" y2="360" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
                    </>
                  )}
                  
                  {/* 선수부 - 더 디테일하게 */}
                  <path
                    d="M 120 280 Q 100 260 90 280 Q 100 300 120 320"
                    fill="#e0f2fe"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <path
                    d="M 120 280 Q 110 270 100 280"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="1"
                  />
                  {/* 선수부 앵커 */}
                  <circle cx="95" cy="290" r="4" fill="#64748b" />
                  <line x1="95" y1="290" x2="100" y2="285" stroke="#64748b" strokeWidth="1" />
                  
                  {/* 선미부 - 더 디테일하게 */}
                  <path
                    d="M 680 280 Q 700 260 710 280 Q 700 300 680 320"
                    fill="#e0f2fe"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  <path
                    d="M 680 280 Q 690 270 700 280"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="1"
                  />
                  
                  {/* 선박 측면 장식 라인 */}
                  <line x1="200" y1="280" x2="600" y2="280" stroke="#1e40af" strokeWidth="2" opacity="0.3" />
                  <line x1="200" y1="360" x2="600" y2="360" stroke="#1e40af" strokeWidth="2" opacity="0.3" />
                  
                  {/* 선박 이름/번호 */}
                  <text x="400" y="350" textAnchor="middle" fontSize="16" fill="#1e40af" fontWeight="bold" opacity="0.6">
                    {boatType === 'fishing' ? '어선' : '레저선'}
                  </text>
                  
                  {/* 선박 그림자 */}
                  <ellipse cx="400" cy="420" rx="280" ry="15" fill="#1e40af" opacity="0.2" />
                </svg>

                {/* 전자장비 위치 마커 및 제품 이미지 */}
                {EQUIPMENT_POSITIONS.map((position) => {
                  const selected = selectedEquipment[position.id]?.product;
                  return (
                    <div
                      key={position.id}
                      className="absolute cursor-pointer group z-10"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handlePositionClick(position)}
                    >
                      {/* 선택된 제품 이미지 표시 */}
                      {selected ? (
                        <div className="relative">
                          <div className="w-20 h-20 rounded-lg border-4 border-primary bg-white p-1 shadow-lg">
                            <img
                              src={selected.image}
                              alt={selected.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-md">
                            {position.name}
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              'bg-white border-primary hover:scale-125 shadow-md'
                            }`}
                          />
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-primary text-white px-2 py-1 rounded text-xs z-20 shadow-md">
                            {position.name}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 견적 요약 영역 */}
          <div className="lg:col-span-1">
            <div className="bg-primary text-primary-foreground rounded-lg p-6 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold mb-6">나의 견적</h2>

              <div className="space-y-4 mb-6">
                {selectedProducts.length === 0 ? (
                  <p className="text-sm opacity-80">선택된 장비가 없습니다.</p>
                ) : (
                  selectedProducts.map((product) => {
                    const position = EQUIPMENT_POSITIONS.find(
                      (p) => selectedEquipment[p.id]?.product?.id === product.id
                    );
                    return (
                      <div key={product.id} className="flex justify-between items-start pb-3 border-b border-primary-foreground/20">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{product.name}</p>
                          {position && (
                            <p className="text-xs opacity-80 mt-1">{position.name}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                          <button
                            onClick={() => handleRemoveEquipment(position?.id || '')}
                            className="text-xs opacity-60 hover:opacity-100 mt-1 underline"
                          >
                            제거
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation((e.target as HTMLInputElement).checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">설치비 (+{formatPrice(300000)})</span>
                </label>
              </div>

              <div className="border-t border-primary-foreground/20 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">총 견적</span>
                  <span className="text-2xl font-bold">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
                disabled={selectedProducts.length === 0}
              >
                견적 문의하기
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 제품 선택 영역 */}
        <div id="product-selection-area" className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedPosition ? `${selectedPosition.name} 선택` : '제품 선택'}
            </h2>
            
            {/* 장비 기기 선택 안내 */}
            {!selectedPosition ? (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-secondary/50">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">장비 기기를 선택해주세요</h3>
                  <p className="text-muted-foreground">
                    위의 선박 이미지에서 장비 위치를 클릭하면<br />
                    해당 장비에 맞는 제품 목록이 표시됩니다.
                  </p>
                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {EQUIPMENT_POSITIONS.map((pos) => (
                        <span
                          key={pos.id}
                          className="px-3 py-1 bg-background border border-border rounded-md text-sm text-muted-foreground"
                        >
                          {pos.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 필터 영역 */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* 검색 */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="제품명 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 브랜드 필터 */}
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-4 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="all">전체 브랜드</option>
                    {BRANDS.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>

                  {/* 선택 취소 버튼 */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPosition(null);
                      setSearchQuery('');
                      setSelectedBrand('all');
                      setSelectedCategory('all');
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    선택 취소
                  </Button>
                </div>

                {/* 제품 목록 */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>선택한 조건에 맞는 제품이 없습니다.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedBrand('all');
                      }}
                    >
                      필터 초기화
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`cursor-pointer group block bg-white border-2 rounded-lg overflow-hidden transition-all ${
                          selectedEquipment[selectedPosition.id]?.product?.id === product.id
                            ? 'border-primary shadow-lg scale-105'
                            : 'border-border hover:border-primary hover:shadow-md'
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="aspect-square w-full overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm line-clamp-2 min-h-[2.5rem] font-semibold">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-lg text-primary font-bold">{formatPrice(product.price)}</p>
                            {product.tag && (
                              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                                {product.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
