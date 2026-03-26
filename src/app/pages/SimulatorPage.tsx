import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { Product, EquipmentPosition, SelectedEquipment } from '../../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, X, Crown, TrendingUp, Wallet, Sparkles, Ship, Anchor } from 'lucide-react';
import { BRANDS } from '../../constants/brands';

// 전자장비 위치 정의 (이미지 변경에 따라 x, y 좌표를 미세 조정하세요)
const EQUIPMENT_POSITIONS: EquipmentPosition[] = [
  { id: 'gps-plotter', name: 'GPS 플로터', x: 45, y: 25, category: 'GPS' },
  { id: 'radar', name: '레이더', x: 50, y: 15, category: 'Radar' },
  { id: 'vhf-radio', name: 'VHF 무선기', x: 20, y: 30, category: 'VHF' },
  { id: 'trolling-motor', name: '트롤링모터', x: 15, y: 70, category: 'TrollingMotor' },
  { id: 'fishfinder', name: '어군탐지기', x: 75, y: 50, category: 'Fishfinder' },
  { id: 'autopilot', name: '자동조타', x: 60, y: 60, category: 'Autopilot' },
];

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

const SAMPLE_PRODUCTS: Record<string, Product[]> = {
  'GPS': ALL_PRODUCTS.filter(p => p.id === '1' || p.id === '2' || p.id === '3'),
  'Radar': ALL_PRODUCTS.filter(p => p.id === '4' || p.id === '5'),
  'VHF': ALL_PRODUCTS.filter(p => p.id === '6' || p.id === '7'),
  'TrollingMotor': ALL_PRODUCTS.filter(p => p.id === '8'),
  'Fishfinder': ALL_PRODUCTS.filter(p => p.id === '9' || p.id === '10'),
  'Autopilot': ALL_PRODUCTS.filter(p => p.id === '11'),
};

const EQUIPMENT_SETS = {
  premium: {
    id: 'premium',
    name: '명장세트',
    description: '명장님이 선택한 실용적인 픽으로 구성된 최고급 세트',
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

type BoatType = 'fishing' | 'leisure' | 'low';

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

  useEffect(() => {
    const setParam = searchParams.get('set');
    if (setParam && (setParam === 'premium' || setParam === 'value' || setParam === 'budget')) {
      handleSetSelect(setParam as keyof typeof EQUIPMENT_SETS);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const handlePositionClick = (position: EquipmentPosition) => {
    setSelectedPosition(position);
    setSelectedCategory(position.category);
    setTimeout(() => {
      document.getElementById('product-selection-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleProductSelect = (product: Product) => {
    if (selectedPosition) {
      setSelectedEquipment((prev) => ({
        ...prev,
        [selectedPosition.id]: { positionId: selectedPosition.id, product },
      }));
      setSelectedPosition(null);
      setSelectedCategory('all');
    }
  };

  const handleSetSelect = (setId: keyof typeof EQUIPMENT_SETS) => {
    // 세트에 따라 배경 이미지 타입 변경
    if (setId === 'budget') setBoatType('low');
    else if (setId === 'premium') setBoatType('fishing');
    
    const set = EQUIPMENT_SETS[setId];
    const newSelection: Record<string, SelectedEquipment> = { ...selectedEquipment };

    Object.keys(newSelection).forEach((key) => {
      newSelection[key] = { positionId: key, product: null };
    });

    set.equipment.forEach((eq) => {
      const position = EQUIPMENT_POSITIONS.find((p) => p.id === eq.positionId);
      if (position) {
        const product = SAMPLE_PRODUCTS[position.category]?.find((p) => p.id === eq.productId);
        if (product) {
          newSelection[eq.positionId] = { positionId: eq.positionId, product };
        }
      }
    });

    setSelectedEquipment(newSelection);
  };

  const handleRemoveEquipment = (positionId: string) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      [positionId]: { positionId, product: null },
    }));
  };

  const calculateTotal = (): number => {
    const equipmentTotal = Object.values(selectedEquipment).reduce(
      (sum, eq) => sum + (eq.product?.price || 0),
      0
    );
    return equipmentTotal + (includeInstallation ? 300000 : 0);
  };

  const filteredProducts = useMemo(() => {
    let products = selectedPosition ? SAMPLE_PRODUCTS[selectedPosition.category] || [] : ALL_PRODUCTS;
    if (selectedBrand !== 'all') products = products.filter(p => p.name.toUpperCase().includes(selectedBrand.toUpperCase()));
    if (searchQuery) products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return products;
  }, [selectedBrand, searchQuery, selectedPosition]);

  const selectedProducts = Object.values(selectedEquipment)
    .filter((eq) => eq.product !== null)
    .map((eq) => eq.product!);

  // 보트 타입에 따른 이미지 경로 결정
  const getBoatImagePath = () => {
    if (boatType === 'low') return '/low.png';
    if (boatType === 'fishing') return '/fishing.png';
    return '/leisure.png';
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* 선박 타입 선택 */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-border">
            <div className="flex gap-2">
              <button
                onClick={() => setBoatType('fishing')}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${boatType === 'fishing' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}
              >
                <Anchor className="w-5 h-5" /> 어선용
              </button>
              <button
                onClick={() => setBoatType('leisure')}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${boatType === 'leisure' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}
              >
                <Ship className="w-5 h-5" /> 레저용
              </button>
            </div>
          </div>
        </div>

        {/* 세트 버튼 영역 (명장, 가성비, 가심비) */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => handleSetSelect('premium')} className="group relative bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg"><Crown className="w-6 h-6 text-white" /></div>
                <div><h3 className="text-xl font-bold text-amber-900">명장세트</h3><p className="text-xs text-amber-700 mt-1">프리미엄 구성</p></div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-amber-800 mb-4 line-clamp-2">{EQUIPMENT_SETS.premium.description}</p>
            <p className="text-lg font-bold text-amber-900">{formatPrice(9440000)}</p>
          </button>

          <button onClick={() => handleSetSelect('value')} className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg"><TrendingUp className="w-6 h-6 text-white" /></div>
                <div><h3 className="text-xl font-bold text-blue-900">가성비세트</h3><p className="text-xs text-blue-700 mt-1">추천 구성</p></div>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-blue-800 mb-4 line-clamp-2">{EQUIPMENT_SETS.value.description}</p>
            <p className="text-lg font-bold text-blue-900">{formatPrice(3080000)}</p>
          </button>

          <button onClick={() => handleSetSelect('budget')} className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg"><Wallet className="w-6 h-6 text-white" /></div>
                <div><h3 className="text-xl font-bold text-green-900">가심비세트</h3><p className="text-xs text-green-700 mt-1">경제적 구성</p></div>
              </div>
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-green-800 mb-4 line-clamp-2">{EQUIPMENT_SETS.budget.description}</p>
            <p className="text-lg font-bold text-green-900">{formatPrice(2230000)}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 배 이미지 영역 - PNG 배경 이미지로 교체됨 */}
          {/* 배 이미지 영역 */}
<div className="lg:col-span-2">
  {/* p-4 md:p-8 삭제 -> p-0 으로 변경하여 꽉 채움 */}
  <div className="bg-white rounded-lg p-0 shadow-sm overflow-hidden border border-border">
    <div className="p-6 border-b border-border">
      <h2 className="text-xl md:text-2xl font-bold">선박 장비 배치</h2>
    </div>
    
    <div className="relative bg-white flex items-center justify-center w-full" 
     style={{ minHeight: '400px', height: '60vh' }}> {/* 높이를 화면 높이의 60% 정도로 설정 */}
      
      {/* PNG 배경 이미지 - object-cover로 공간을 꽉 채움 */}
      <img 
        src={getBoatImagePath()} 
        alt="선박 이미지" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
      />
      <div className="absolute inset-0 pointer-events-none" />

      {/* 전자장비 위치 마커 (기존 로직 유지) */}
      {EQUIPMENT_POSITIONS.map((position) => {
        const selected = selectedEquipment[position.id]?.product;
        return (
          <div
            key={position.id}
            className="absolute cursor-pointer group z-10"
            style={{ 
              left: `${position.x}%`, 
              top: `${position.y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
            onClick={() => handlePositionClick(position)}
          >
            {/* ... 마커 렌더링 코드 (동일) ... */}
            {selected ? (
              <div className="relative scale-90 md:scale-100 transition-transform hover:scale-110">
                <div className="w-20 h-20 rounded-lg border-4 border-primary bg-white p-1 shadow-2xl">
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover rounded" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white text-[10px] md:text-xs px-2 py-1 rounded whitespace-nowrap shadow-md font-bold">
                  {position.name}
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="w-7 h-7 rounded-full border-4 bg-white border-primary group-hover:bg-primary transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-800/90 text-white px-2 py-1 rounded text-[10px] md:text-xs z-20 shadow-md">
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
                    const position = EQUIPMENT_POSITIONS.find(p => selectedEquipment[p.id]?.product?.id === product.id);
                    return (
                      <div key={product.id} className="flex justify-between items-start pb-3 border-b border-primary-foreground/20">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{product.name}</p>
                          <p className="text-xs opacity-80 mt-1">{position?.name}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                          <button onClick={() => handleRemoveEquipment(position?.id || '')} className="text-xs opacity-60 hover:opacity-100 mt-1 underline">제거</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeInstallation} onChange={(e) => setIncludeInstallation(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm">설치비 (+{formatPrice(300000)})</span>
                </label>
              </div>
              <div className="border-t border-primary-foreground/20 pt-4 mb-6 flex justify-between items-center">
                <span className="text-lg font-semibold">총 견적</span>
                <span className="text-2xl font-bold">{formatPrice(calculateTotal())}</span>
              </div>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={selectedProducts.length === 0}>
                견적 문의하기
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 제품 선택 영역 */}
        <div id="product-selection-area" className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">{selectedPosition ? `${selectedPosition.name} 선택` : '제품 선택'}</h2>
          {!selectedPosition ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-secondary/50">
              <Search className="w-12 h-12 mx-auto text-primary mb-4 opacity-20" />
              <p className="text-muted-foreground">선박 이미지에서 장비 위치를 클릭하여 제품을 선택하세요.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="제품명 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="px-4 py-2 border border-border rounded-md">
                  <option value="all">전체 브랜드</option>
                  {BRANDS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <Button variant="outline" onClick={() => setSelectedPosition(null)}><X className="w-4 h-4 mr-2" /> 선택 취소</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`cursor-pointer group bg-white border-2 rounded-lg overflow-hidden transition-all ${selectedEquipment[selectedPosition.id]?.product?.id === product.id ? 'border-primary shadow-lg scale-105' : 'border-border hover:border-primary'}`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="aspect-square bg-muted"><img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold line-clamp-2 h-10">{product.name}</h3>
                      <p className="text-lg text-primary font-bold mt-2">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}