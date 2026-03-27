import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatPrice } from '@shared/utils/format';
import { Product, EquipmentPosition, SelectedEquipment, SimulatorSet, SimulatorType, PaginatedSimulatorSets, Category, PaginatedProducts } from '@shared/types';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import {
  Search, X, Crown, TrendingUp, Wallet, Sparkles, Ship, Anchor,
  Save, Loader2, Trash2, Edit2
} from 'lucide-react';
import { BRANDS } from '@shared/constants/brands';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@features/auth';

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

const PRESET_META: Record<PresetKey, { name: string; description: string }> = {
  premium: { name: '프리미엄 세트', description: '명장님이 선택한 실용적인 픽으로 구성된 최고급 세트' },
  value:   { name: '가성비 세트',   description: '합리적인 가격의 실용적인 세트' },
  budget:  { name: '가심비 세트',   description: '경제적인 가격의 기본 세트' },
};

const MAX_SETS = 3;

function toApiType(boatType: 'fishing' | 'leisure'): SimulatorType {
  return boatType === 'fishing' ? 'fishing_vessel' : 'leisure';
}

export function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  // 메인+서브 카테고리 모두 포함한 slug 맵 (transducer 등 서브 카테고리 포함)
  const [slugMap, setSlugMap] = useState<Record<string, Category>>({});
  const [boatType, setBoatType] = useState<'fishing' | 'leisure'>('leisure');
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [presetApplying, setPresetApplying] = useState(false);
  const [presetsLoaded, setPresetsLoaded] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<PresetKey | null>(null);
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
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [applyingSetId, setApplyingSetId] = useState<string | null>(null);

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

  // 메인+서브 카테고리 전체 로드 (transducer 등 서브 카테고리 포함)
  useEffect(() => {
    apiGet<{ data: Category[] } | Category[]>(`${API_ENDPOINTS.CATEGORIES}?take=100`)
      .then(res => {
        const list: Category[] = Array.isArray(res) ? res : (res as { data: Category[] }).data ?? [];
        const map: Record<string, Category> = {};
        list.forEach(c => { if (c.slug) map[c.slug] = c; });
        setSlugMap(map);
      })
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
      console.warn(
        `[Simulator] ⚠ slug 매핑 실패\n` +
        `  클릭한 위치: ${selectedPosition.name} (slug: "${selectedPosition.id}")\n` +
        `  slugMap 키 목록: [${Object.keys(slugMap).join(', ')}]`
      );
      setApiProducts([]);
      return;
    }
    setApiLoading(true);
    // 메인 카테고리(parentId=null) → /products/main-category/:id
    // 서브 카테고리(parentId≠null) → /products/category/:id
    const catType = cat.parentId === null ? '메인' : '서브';
    const endpoint = cat.parentId === null
      ? API_ENDPOINTS.PRODUCTS_BY_MAIN_CATEGORY(cat.id)
      : API_ENDPOINTS.PRODUCTS_BY_CATEGORY(cat.id);
    console.log(
      `[Simulator] 장비 클릭 → 상품 조회\n` +
      `  위치: ${selectedPosition.name} (slug: "${selectedPosition.id}")\n` +
      `  카테고리: ${cat.name} (id: ${cat.id}, 타입: ${catType}, parentId: ${cat.parentId ?? 'null'})\n` +
      `  API: GET ${endpoint}`
    );
    apiGet<PaginatedProducts>(endpoint)
      .then(res => {
        const products = Array.isArray(res) ? res : res?.data ?? [];
        console.log(
          `[Simulator] 상품 조회 결과\n` +
          `  위치: ${selectedPosition.name}\n` +
          `  상품 수: ${products.length}개\n` +
          `  상품 목록:`, products.map(p => `${p.name} (id: ${p.id})`)
        );
        setApiProducts(products);
      })
      .catch(err => {
        console.error(
          `[Simulator] 상품 조회 실패\n` +
          `  위치: ${selectedPosition.name}\n` +
          `  API: GET ${endpoint}\n` +
          `  에러:`, err
        );
        setApiProducts([]);
      })
      .finally(() => setApiLoading(false));
  }, [selectedPosition, slugMap]);

  // 프리셋 세트 (프리미엄/가성비/가심비) 서버에서 로드
  useEffect(() => {
    const apiType = toApiType(boatType);
    setPresetsLoaded(false);
    apiGet<SimulatorSet[]>(API_ENDPOINTS.SIMULATOR_PRESETS(apiType))
      .then(sets => {
        const list: SimulatorSet[] = Array.isArray(sets) ? sets : [];
        setPresetSets({
          premium: list.find(s => s.presetKey === 'premium') ?? null,
          value:   list.find(s => s.presetKey === 'value')   ?? null,
          budget:  list.find(s => s.presetKey === 'budget')  ?? null,
        });
      })
      .catch(() => setPresetSets({ premium: null, value: null, budget: null }))
      .finally(() => setPresetsLoaded(true));
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

  // URL type + set 파라미터 → boatType 설정 + pendingPreset 저장
  useEffect(() => {
    const setParam = searchParams.get('set');
    const typeParam = searchParams.get('type');
    if (typeParam === 'fishing') setBoatType('fishing');
    else if (typeParam === 'leisure') setBoatType('leisure');
    if (setParam && PRESET_SET_KEYS.includes(setParam as PresetKey)) {
      setPendingPreset(setParam as PresetKey);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // pendingPreset: slugMap + presetSets 모두 준비된 후 적용
  useEffect(() => {
    if (!pendingPreset) return;
    if (Object.keys(slugMap).length === 0) return; // slugMap 미로드
    if (!presetsLoaded) return;                    // presetSets 미로드

    const serverSet = presetSets[pendingPreset];
    if (serverSet) {
      applyServerSet(serverSet);
    } else {
      // 서버에 프리셋 없으면 장비 초기화만
      const empty: Record<string, SelectedEquipment> = {};
      EQUIPMENT_POSITIONS.forEach(pos => {
        empty[pos.id] = { positionId: pos.id, product: null };
      });
      setSelectedEquipment(empty);
    }
    setPendingPreset(null);
  // applyServerSet은 slugMap 클로저에 의존 — slugMap이 dep에 있으므로 항상 최신값 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPreset, slugMap, presetsLoaded]);

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

  const applyServerSet = async (set: SimulatorSet) => {
    // categoryId → slug 역방향 맵
    const idToSlug: Record<string, string> = {};
    Object.entries(slugMap).forEach(([slug, cat]) => { idToSlug[cat.id] = slug; });

    const newSelection: Record<string, SelectedEquipment> = {};
    EQUIPMENT_POSITIONS.forEach(pos => {
      newSelection[pos.id] = { positionId: pos.id, product: null };
    });

    // 각 아이템을 개별 API 요청으로 조회 (bulk load 대신)
    setPresetApplying(true);
    try {
      await Promise.all(set.items.map(async (item) => {
        const positionId = idToSlug[item.categoryId];
        if (!positionId) return;
        try {
          const product = await apiGet<Product>(API_ENDPOINTS.PRODUCT_DETAIL(item.productId));
          if (product) newSelection[positionId] = { positionId, product };
        } catch {
          // 개별 제품 조회 실패 시 해당 위치 건너뜀
        }
      }));
      setSelectedEquipment(newSelection);
    } finally {
      setPresetApplying(false);
    }
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

    const apiType = toApiType(boatType);
    const items = selectedList.map(eq => ({
      productId: eq.product!.id,
      categoryId: eq.product!.categoryId || eq.positionId,
    }));

    setSaveLoading(true);
    try {
      if (editingSetId) {
        // ── 수정 모드: PATCH ──────────────────────────────────────────
        const updated = await apiPatch<SimulatorSet>(API_ENDPOINTS.SIMULATOR_SET(editingSetId), {
          items,
          description: `총 ${selectedList.length}개 장비 · ${formatPrice(calculateTotal())}`,
        });
        setMySets(prev => ({
          ...prev,
          [apiType]: prev[apiType].map(s => s.id === editingSetId ? { ...s, ...updated } : s),
        }));
        setEditingSetId(null);
      } else {
        // ── 신규 저장: POST ───────────────────────────────────────────
        if (!canSaveMore) {
          alert(`${boatType === 'fishing' ? '어선용' : '레저용'} 세트는 최대 ${MAX_SETS}개까지 저장할 수 있습니다.`);
          return;
        }
        const setName = `${boatType === 'fishing' ? '어선용' : '레저용'} 세트 ${currentTypeSets.length + 1}`;
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
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert(editingSetId ? '세트 수정에 실패했습니다.' : '세트 저장에 실패했습니다. 실제 등록된 상품으로 구성해야 저장됩니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  /** 내 세트를 배치도에 불러오기 (수정 없이 적용만) */
  const handleLoadMySet = async (set: SimulatorSet) => {
    setApplyingSetId(set.id);
    await applyServerSet(set);
    setApplyingSetId(null);
    // 상단 배치도로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** 내 세트 수정 모드 진입 — 배치도에 적용 + editingSetId 설정 */
  const handleEditMySet = async (set: SimulatorSet) => {
    setApplyingSetId(set.id);
    await applyServerSet(set);
    setApplyingSetId(null);
    setEditingSetId(set.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** 수정 모드 취소 */
  const handleCancelEdit = () => {
    setEditingSetId(null);
    // 배치도 초기화
    const empty: Record<string, SelectedEquipment> = {};
    EQUIPMENT_POSITIONS.forEach(pos => { empty[pos.id] = { positionId: pos.id, product: null }; });
    setSelectedEquipment(empty);
  };

  const handleDeleteSet = async (setId: string, type: SimulatorType) => {
    if (!confirm('저장된 세트를 삭제하시겠습니까?')) return;
    try {
      await apiDelete(API_ENDPOINTS.SIMULATOR_SET(setId));
      setMySets(prev => ({
        ...prev,
        [type]: prev[type].filter(s => s.id !== setId),
      }));
      if (editingSetId === setId) setEditingSetId(null);
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
          <button onClick={() => handleSetSelect('premium')} disabled={presetApplying} className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left disabled:opacity-70 disabled:cursor-not-allowed">
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
            {presetApplying
              ? <p className="text-sm text-amber-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> 적용 중...</p>
              : <p className="text-sm text-amber-600">{presetSets.premium ? '클릭하여 적용' : '서버 데이터 없음'}</p>
            }
          </button>

          <button onClick={() => handleSetSelect('value')} disabled={presetApplying} className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left disabled:opacity-70 disabled:cursor-not-allowed">
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
            {presetApplying
              ? <p className="text-sm text-blue-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> 적용 중...</p>
              : <p className="text-sm text-blue-600">{presetSets.value ? '클릭하여 적용' : '서버 데이터 없음'}</p>
            }
          </button>

          <button onClick={() => handleSetSelect('budget')} disabled={presetApplying} className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left disabled:opacity-70 disabled:cursor-not-allowed">
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
            {presetApplying
              ? <p className="text-sm text-green-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> 적용 중...</p>
              : <p className="text-sm text-green-600">{presetSets.budget ? '클릭하여 적용' : '서버 데이터 없음'}</p>
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
              {isAuthenticated && !editingSetId && (
                <div className="text-xs opacity-70 text-center mb-2">
                  {boatType === 'fishing' ? '어선용' : '레저용'} 저장 세트: {currentTypeSets.length} / {MAX_SETS}
                </div>
              )}
              {isAuthenticated && editingSetId && (
                <div className="text-xs text-yellow-300 text-center py-1 mb-2 flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> 세트 수정 중 — 장비를 변경하고 저장하세요
                </div>
              )}
              {saveSuccess && (
                <div className="text-xs text-green-300 text-center py-1 mb-2">
                  {editingSetId ? '세트가 수정되었습니다!' : '세트가 저장되었습니다!'}
                </div>
              )}

              <Button
                className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 mb-2"
                size="sm"
                disabled={selectedProducts.length === 0 || saveLoading || (isAuthenticated && !editingSetId && !canSaveMore)}
                onClick={handleSaveSet}
              >
                {saveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {!isAuthenticated ? '로그인 후 저장' : editingSetId ? '수정 완료' : !canSaveMore ? `저장 한도 초과 (${MAX_SETS}개)` : '내 세트 저장'}
              </Button>
              {editingSetId && (
                <Button
                  className="w-full bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 mb-1"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4 mr-2" /> 수정 취소
                </Button>
              )}
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
                {currentTypeSets.map((set) => {
                  const isApplying = applyingSetId === set.id;
                  const isEditing = editingSetId === set.id;
                  return (
                    <div
                      key={set.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isEditing
                          ? 'border-amber-400 bg-amber-50 shadow-md'
                          : 'border-border hover:border-primary hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm flex items-center gap-1">
                          {isEditing && <Edit2 className="w-3 h-3 text-amber-500 shrink-0" />}
                          {set.name}
                        </h3>
                        <button
                          onClick={() => handleDeleteSet(set.id, toApiType(boatType))}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0"
                          title="세트 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {set.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{set.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mb-3">
                        장비 {set.items.length}개 · {new Date(set.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadMySet(set)}
                          disabled={isApplying || presetApplying}
                          className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                          불러오기
                        </button>
                        <button
                          onClick={() => handleEditMySet(set)}
                          disabled={isApplying || presetApplying}
                          className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit2 className="w-3 h-3" />}
                          수정
                        </button>
                      </div>
                    </div>
                  );
                })}
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
