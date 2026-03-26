import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { Product, EquipmentPosition, SelectedEquipment, SimulatorSet, SimulatorType, PaginatedSimulatorSets } from '../../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Search, X, Crown, TrendingUp, Wallet, Sparkles, Ship, Anchor,
  Save, Loader2, Trash2
} from 'lucide-react';
import { BRANDS } from '../../constants/brands';
import { apiGet, apiPost, apiDelete } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoryContext';
import { PaginatedProducts } from '../../types';

// 장비 위치 정의 — id가 서버 category slug와 1:1 대응
const EQUIPMENT_POSITIONS: EquipmentPosition[] = [
  { id: 'gps-plotter',    name: 'GPS플로터',  x: 45, y: 25, category: 'GPS' },
  { id: 'radar',          name: '레이더',      x: 50, y: 15, category: 'Radar' },
  { id: 'vhf-radio',      name: 'VHF 무선기', x: 20, y: 30, category: 'VHF' },
  { id: 'trolling-motor', name: '트롤링모터',  x: 15, y: 70, category: 'TrollingMotor' },
  { id: 'transducer',     name: '송수파기',    x: 75, y: 50, category: 'Transducer' },
  { id: 'autopilot',      name: '자동조타',    x: 60, y: 60, category: 'Autopilot' },
];



const PRESET_SET_KEYS = ['premium', 'value', 'budget'] as const;
type PresetKey = typeof PRESET_SET_KEYS[number];

const PRESET_META: Record<PresetKey, { name: string; description: string; searchKeyword: string }> = {
  premium: { name: '프리미엄 세트', description: '명장님이 선택한 실용적인 픽으로 구성된 최고급 세트', searchKeyword: '프리미엄' },
  value: { name: '가성비 세트', description: '합리적인 가격의 실용적인 세트', searchKeyword: '가성비' },
  budget: { name: '가심비 세트', description: '경제적인 가격의 기본 세트', searchKeyword: '가심비' },
};

const MAX_SETS = 3;

function toApiType(boatType: 'fishing' | 'leisure'): SimulatorType {
  return boatType === 'fishing' ? 'fishing_vessel' : 'leisure';
}

export function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { slugMap } = useCategories();
  const [boatType, setBoatType] = useState<'fishing' | 'leisure'>('leisure');
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // 프리셋 적용용 전체 캐시
  const [apiLoading, setApiLoading] = useState(false);
  const [presetSets, setPresetSets] = useState<Record<PresetKey, SimulatorSet | null>>({
    premium: null,
    value: null,
    budget: null,
  });

  // 내 저장 세트
  const [mySets, setMySets] = useState<{ fishing_vessel: SimulatorSet[]; leisure: SimulatorSet[] }>({
    fishing_vessel: [],
    leisure: [],
  });
  const [setsLoading, setSetsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // 프리셋 적용용 전체 상품 로드 (1회)
  useEffect(() => {
    apiGet<PaginatedProducts>(`${API_ENDPOINTS.PRODUCTS}?take=200`)
      .then(res => setAllProducts(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => {});
  }, []);

  // 위치 선택 시 slug → categoryId 조회 후 상품 로드
  useEffect(() => {
    if (!selectedPosition) {
      setApiProducts([]);
      return;
    }
    const cat = slugMap[selectedPosition.id]; // position.id === slug → Category
    if (!cat) {
      setApiProducts([]);
      return;
    }
    setApiLoading(true);
    // 메인 카테고리(parentId=null) → /products/main-category/:id
    // 서브 카테고리(parentId≠null) → /products/category/:id
    const endpoint = cat.parentId === null
      ? API_ENDPOINTS.PRODUCTS_BY_MAIN_CATEGORY(cat.id)
      : API_ENDPOINTS.PRODUCTS_BY_CATEGORY(cat.id);
    apiGet<PaginatedProducts>(endpoint)
      .then(res => setApiProducts(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => setApiProducts([]))
      .finally(() => setApiLoading(false));
  }, [selectedPosition, slugMap]);

  // 프리셋 세트 (프리미엄/가성비/가심비) 서버에서 로드
  useEffect(() => {
    const apiType = toApiType(boatType);
    apiGet<SimulatorSet[]>(API_ENDPOINTS.SIMULATOR_PRESETS(apiType))
      .then(sets => {
        const list: SimulatorSet[] = Array.isArray(sets) ? sets : [];
        setPresetSets({
          premium: list.find(s => s.name.includes(PRESET_META.premium.searchKeyword)) ?? null,
          value: list.find(s => s.name.includes(PRESET_META.value.searchKeyword)) ?? null,
          budget: list.find(s => s.name.includes(PRESET_META.budget.searchKeyword)) ?? null,
        });
      })
      .catch(() => setPresetSets({ premium: null, value: null, budget: null }));
  }, [boatType]);

  // 내 세트 로드 (로그인 시)
  useEffect(() => {
    if (!isAuthenticated) {
      setMySets({ fishing_vessel: [], leisure: [] });
      return;
    }
    const loadSets = async () => {
      setSetsLoading(true);
      try {
        const [fishingRes, leisureRes] = await Promise.all([
          apiGet<PaginatedSimulatorSets>(`${API_ENDPOINTS.SIMULATOR_SETS}?type=fishing_vessel&take=10`),
          apiGet<PaginatedSimulatorSets>(`${API_ENDPOINTS.SIMULATOR_SETS}?type=leisure&take=10`),
        ]);
        const fishingSets = Array.isArray(fishingRes) ? fishingRes : fishingRes?.data ?? [];
        const leisureSets = Array.isArray(leisureRes) ? leisureRes : leisureRes?.data ?? [];
        // 내 세트만 필터
        setMySets({
          fishing_vessel: fishingSets.filter((s: SimulatorSet) => s.userId === user?.id).slice(0, MAX_SETS),
          leisure: leisureSets.filter((s: SimulatorSet) => s.userId === user?.id).slice(0, MAX_SETS),
        });
      } catch {
        setMySets({ fishing_vessel: [], leisure: [] });
      } finally {
        setSetsLoading(false);
      }
    };
    loadSets();
  }, [isAuthenticated, user?.id]);

  // 프리셋 세트 총 가격 계산 (서버 데이터 기반)
  const calcPresetTotal = (setId: PresetKey): number => {
    const serverSet = presetSets[setId];
    if (!serverSet || allProducts.length === 0) return 0;
    return serverSet.items.reduce((sum, item) => {
      const product = allProducts.find(p => p.id === item.productId);
      return sum + (product?.price ?? 0);
    }, 0);
  };

  // preset set 적용
  useEffect(() => {
    const setParam = searchParams.get('set');
    if (setParam && setParam in EQUIPMENT_SETS) {
      handleSetSelect(setParam as keyof typeof EQUIPMENT_SETS);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const currentTypeSets = mySets[toApiType(boatType)];
  const canSaveMore = currentTypeSets.length < MAX_SETS;

  const handlePositionClick = (position: EquipmentPosition) => {
    setSelectedPosition(position);
    setTimeout(() => {
      document.getElementById('product-selection-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleProductSelect = (product: Product) => {
    if (selectedPosition) {
      setSelectedEquipment(prev => ({
        ...prev,
        [selectedPosition.id]: { positionId: selectedPosition.id, product },
      }));
      setSelectedPosition(null);
    }
  };

  const applyServerSet = (set: SimulatorSet) => {
    // categoryId → slug 역방향 맵 (CategoryContext slugMap에서 생성)
    const idToSlug: Record<string, string> = {};
    Object.entries(slugMap).forEach(([slug, cat]) => { idToSlug[cat.id] = slug; });

    const newSelection: Record<string, SelectedEquipment> = {};
    EQUIPMENT_POSITIONS.forEach(pos => {
      newSelection[pos.id] = { positionId: pos.id, product: null };
    });
    set.items.forEach(item => {
      const positionId = idToSlug[item.categoryId]; // categoryId → slug === positionId
      if (!positionId) return;
      const product = allProducts.find(p => p.id === item.productId);
      if (product) newSelection[positionId] = { positionId, product };
    });
    setSelectedEquipment(newSelection);
  };

  const handleSetSelect = (setId: PresetKey) => {
    const serverSet = presetSets[setId];
    if (serverSet) {
      applyServerSet(serverSet);
      return;
    }
    // 서버 세트가 없으면 비어있는 상태로 초기화
    const newSelection: Record<string, SelectedEquipment> = {};
    EQUIPMENT_POSITIONS.forEach(pos => {
      newSelection[pos.id] = { positionId: pos.id, product: null };
    });
    setSelectedEquipment(newSelection);
  };

  const handleRemoveEquipment = (positionId: string) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [positionId]: { positionId, product: null },
    }));
  };

  const handleSaveSet = async () => {
    if (!isAuthenticated) {
      alert('로그인 후 세트를 저장할 수 있습니다.');
      return;
    }
    const selectedList = Object.values(selectedEquipment).filter(eq => eq.product !== null);
    if (selectedList.length === 0) {
      alert('장비를 선택한 후 저장하세요.');
      return;
    }
    if (!canSaveMore) {
      alert(`${boatType === 'fishing' ? '어선용' : '레저용'} 세트는 최대 ${MAX_SETS}개까지 저장할 수 있습니다.`);
      return;
    }

    const apiType = toApiType(boatType);
    const setName = `${boatType === 'fishing' ? '어선용' : '레저용'} 세트 ${currentTypeSets.length + 1}`;
    const items = selectedList.map(eq => ({
      productId: eq.product!.id,
      categoryId: eq.product!.categoryId || eq.positionId,
    }));

    setSaveLoading(true);
    try {
      const saved = await apiPost<SimulatorSet>(API_ENDPOINTS.SIMULATOR_SETS, {
        type: apiType,
        name: setName,
        description: `총 ${selectedList.length}개 장비 · ${formatPrice(calculateTotal())}`,
        items,
      });
      setMySets(prev => ({
        ...prev,
        [apiType]: [...prev[apiType], saved],
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert('세트 저장에 실패했습니다. 실제 등록된 상품으로 구성해야 저장됩니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSet = async (setId: string, type: SimulatorType) => {
    if (!confirm('저장된 세트를 삭제하시겠습니까?')) return;
    try {
      await apiDelete(API_ENDPOINTS.SIMULATOR_SET(setId));
      setMySets(prev => ({
        ...prev,
        [type]: prev[type].filter(s => s.id !== setId),
      }));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const calculateTotal = () =>
    Object.values(selectedEquipment).reduce((sum, eq) => sum + (eq.product?.price || 0), 0)
    + (includeInstallation ? 300000 : 0);

  const selectedProducts = Object.values(selectedEquipment)
    .filter(eq => eq.product !== null)
    .map(eq => eq.product!);

  const filteredProducts = useMemo(() => {
    let products = apiProducts;
    if (selectedBrand !== 'all') products = products.filter(p => p.name.toUpperCase().includes(selectedBrand.toUpperCase()));
    if (searchQuery) products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return products;
  }, [selectedBrand, searchQuery, apiProducts]);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">

        {/* 선박 타입 탭 */}
        <div className="mb-8 flex items-center justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-border">
            <div className="flex gap-2">
              <button
                onClick={() => setBoatType('fishing')}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${boatType === 'fishing' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Anchor className="w-5 h-5" /> 어선용
              </button>
              <button
                onClick={() => setBoatType('leisure')}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${boatType === 'leisure' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Ship className="w-5 h-5" /> 레저용
              </button>
            </div>
          </div>
        </div>

        {/* 추천 세트 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => handleSetSelect('premium')} className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">{PRESET_META.premium.name}</h3>
                  <p className="text-xs text-amber-700 mt-1">프리미엄 구성 · {presetSets.premium?.items.length ?? 0}개 장비</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-amber-800 mb-4 line-clamp-2">{presetSets.premium?.description ?? PRESET_META.premium.description}</p>
            {calcPresetTotal('premium') > 0
              ? <p className="text-lg font-bold text-amber-900">{formatPrice(calcPresetTotal('premium'))}</p>
              : <p className="text-sm text-amber-600">{presetSets.premium ? '가격 계산 중...' : '서버 데이터 없음'}</p>
            }
          </button>

          <button onClick={() => handleSetSelect('value')} className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{PRESET_META.value.name}</h3>
                  <p className="text-xs text-blue-700 mt-1">추천 구성 · {presetSets.value?.items.length ?? 0}개 장비</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-blue-800 mb-4 line-clamp-2">{presetSets.value?.description ?? PRESET_META.value.description}</p>
            {calcPresetTotal('value') > 0
              ? <p className="text-lg font-bold text-blue-900">{formatPrice(calcPresetTotal('value'))}</p>
              : <p className="text-sm text-blue-600">{presetSets.value ? '가격 계산 중...' : '서버 데이터 없음'}</p>
            }
          </button>

          <button onClick={() => handleSetSelect('budget')} className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">{PRESET_META.budget.name}</h3>
                  <p className="text-xs text-green-700 mt-1">경제적 구성 · {presetSets.budget?.items.length ?? 0}개 장비</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-green-800 mb-4 line-clamp-2">{presetSets.budget?.description ?? PRESET_META.budget.description}</p>
            {calcPresetTotal('budget') > 0
              ? <p className="text-lg font-bold text-green-900">{formatPrice(calcPresetTotal('budget'))}</p>
              : <p className="text-sm text-green-600">{presetSets.budget ? '가격 계산 중...' : '서버 데이터 없음'}</p>
            }
          </button>
        </div>

        {/* 시뮬레이터 본체 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 배 이미지 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl md:text-2xl font-bold">선박 장비 배치</h2>
              </div>
              <div className="relative bg-white flex items-center justify-center w-full" style={{ minHeight: '400px', height: '60vh' }}>
                <img
                  src={boatType === 'fishing' ? '/fishing.png' : '/leisure.png'}
                  alt="선박 이미지"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 pointer-events-none" />
                {EQUIPMENT_POSITIONS.map((position) => {
                  const selected = selectedEquipment[position.id]?.product;
                  return (
                    <div
                      key={position.id}
                      className="absolute cursor-pointer group z-10"
                      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
                      onClick={() => handlePositionClick(position)}
                    >
                      {selected ? (
                        <div className="relative scale-90 md:scale-100 transition-transform hover:scale-110">
                          <div className="w-20 h-20 rounded-lg border-4 border-primary bg-white p-1 shadow-2xl">
                            <img src={selected.image} alt={selected.name} className="w-full h-full object-cover rounded" />
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] md:text-xs px-2 py-1 rounded whitespace-nowrap shadow-md font-bold">
                            {position.name}
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="w-7 h-7 rounded-full border-4 bg-white border-primary group-hover:bg-primary transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800/90 text-white px-2 py-1 rounded text-[10px] md:text-xs z-20 shadow-md">
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

          {/* 견적 요약 */}
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
              <label className="flex items-center gap-2 cursor-pointer mb-6">
                <input type="checkbox" checked={includeInstallation} onChange={e => setIncludeInstallation(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">설치비 (+{formatPrice(300000)})</span>
              </label>
              <div className="border-t border-primary-foreground/20 pt-4 mb-4 flex justify-between items-center">
                <span className="text-lg font-semibold">총 견적</span>
                <span className="text-2xl font-bold">{formatPrice(calculateTotal())}</span>
              </div>

              {/* 저장 상태 표시 */}
              {isAuthenticated && (
                <div className="text-xs opacity-70 text-center mb-2">
                  {boatType === 'fishing' ? '어선용' : '레저용'} 저장 세트: {currentTypeSets.length} / {MAX_SETS}
                </div>
              )}
              {saveSuccess && (
                <div className="text-xs text-green-300 text-center py-1 mb-2">세트가 저장되었습니다!</div>
              )}

              <Button
                className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 mb-3"
                size="sm"
                disabled={selectedProducts.length === 0 || saveLoading || (isAuthenticated && !canSaveMore)}
                onClick={handleSaveSet}
              >
                {saveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {!isAuthenticated ? '로그인 후 저장' : !canSaveMore ? `저장 한도 초과 (${MAX_SETS}개)` : '내 세트 저장'}
              </Button>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={selectedProducts.length === 0}>
                견적 문의하기
              </Button>
            </div>
          </div>
        </div>

        {/* 내 저장 세트 (로그인 시) */}
        {isAuthenticated && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                내 저장 세트 — {boatType === 'fishing' ? '어선용' : '레저용'}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({currentTypeSets.length}/{MAX_SETS})</span>
              </h2>
            </div>
            {setsLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> 불러오는 중...
              </div>
            ) : currentTypeSets.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                저장된 세트가 없습니다. 장비를 구성하고 저장해보세요.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentTypeSets.map((set) => (
                  <div key={set.id} className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{set.name}</h3>
                      <button
                        onClick={() => handleDeleteSet(set.id, toApiType(boatType))}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {set.description && (
                      <p className="text-xs text-muted-foreground mb-3">{set.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      장비 {set.items.length}개 · {new Date(set.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 제품 선택 영역 */}
        <div id="product-selection-area" className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">
            {selectedPosition ? `${selectedPosition.name} 선택` : '제품 선택'}
          </h2>
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
                  <Input placeholder="제품명 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="px-4 py-2 border border-border rounded-md">
                  <option value="all">전체 브랜드</option>
                  {BRANDS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <Button variant="outline" onClick={() => setSelectedPosition(null)}>
                  <X className="w-4 h-4 mr-2" /> 선택 취소
                </Button>
              </div>
              {apiLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> 상품 로딩 중...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`cursor-pointer group bg-white border-2 rounded-lg overflow-hidden transition-all ${selectedEquipment[selectedPosition.id]?.product?.id === product.id
                          ? 'border-primary shadow-lg scale-105'
                          : 'border-border hover:border-primary'
                        }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="aspect-square bg-muted">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold line-clamp-2 h-10">{product.name}</h3>
                        <p className="text-lg text-primary font-bold mt-2">{formatPrice(product.price)}</p>
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
  );
}
