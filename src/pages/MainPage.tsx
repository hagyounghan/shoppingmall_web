import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@shared/components/ProductCard";
import { CATEGORIES } from "@shared/constants/categories";
import { ROUTES } from "@shared/constants/routes";
import { Crown, TrendingUp, Wallet, ArrowRight, ChevronLeft, ChevronRight, Ship, Anchor } from "lucide-react";
import { useTopProducts } from "@features/products";
import { apiGet } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api";
import { SimulatorSet, SimulatorType } from "@shared/types";

// SimulatorPage의 EQUIPMENT_POSITIONS와 동일
const EQUIPMENT_POSITIONS = [
  { id: 'radar',          name: '레이더',      x: 48, y: 18 },
  { id: 'gps-plotter',    name: 'GPS플로터',  x: 47, y: 32 },
  { id: 'vhf-radio',      name: 'VHF 무선기', x: 40, y: 38 },
  { id: 'autopilot',      name: '자동조타',    x: 54, y: 40 },
  { id: 'transducer',     name: '송수파기',    x: 70, y: 48 },
  { id: 'trolling-motor', name: '트롤링모터',  x: 18, y: 60 },
] as const;

const PRESET_LABEL: Record<string, { name: string; icon: typeof Crown; badge: string }> = {
  premium: { name: '프리미엄 세트', icon: Crown,      badge: 'bg-amber-500' },
  value:   { name: '가성비 세트',   icon: TrendingUp, badge: 'bg-blue-500'  },
  budget:  { name: '가심비 세트',   icon: Wallet,     badge: 'bg-green-500' },
};

const TYPE_LABEL: Record<SimulatorType, { name: string; icon: typeof Ship }> = {
  fishing_vessel: { name: '어선용', icon: Anchor },
  leisure:        { name: '레저용', icon: Ship   },
};

const SLIDE_INTERVAL = 4000;

export function MainPage() {
  const navigate = useNavigate();
  const { data: bestProducts = [] } = useTopProducts(5);
  const [allSets, setAllSets] = useState<SimulatorSet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiGet<SimulatorSet[]>(API_ENDPOINTS.SIMULATOR_PRESETS('fishing_vessel')),
      apiGet<SimulatorSet[]>(API_ENDPOINTS.SIMULATOR_PRESETS('leisure')),
    ]).then(([fishing, leisure]) => {
      if (!isMounted) return;
      const f = Array.isArray(fishing) ? fishing : [];
      const l = Array.isArray(leisure) ? leisure : [];
      setAllSets([...f, ...l]);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (allSets.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allSets.length);
    }, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [allSets.length]);

  const goTo = (index: number) => {
    setCurrentIndex((index + allSets.length) % allSets.length);
    if (timerRef.current) clearInterval(timerRef.current);
    if (allSets.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % allSets.length);
      }, SLIDE_INTERVAL);
    }
  };

  const handleSetClick = (set: SimulatorSet) => {
    const type = set.type === 'fishing_vessel' ? 'fishing' : 'leisure';
    navigate(`${ROUTES.SIMULATOR}?type=${type}&set=${set.presetKey ?? 'premium'}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[500px] bg-gradient-to-r from-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <img
          src="https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=1920"
          alt="Marine Equipment"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white space-y-6">
            <h2 className="text-5xl">프리미엄 해양 전자기기</h2>
            <p className="text-xl">
              선박용 GPS, 레이더, 어군탐지기 전문
            </p>
            <button className="bg-white text-primary px-8 py-3 hover:bg-gray-100 transition-colors">
              제품 둘러보기
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 md:grid-cols-9 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-3 p-4 bg-white border border-border hover:border-primary transition-colors group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                  <category.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Products */}
      {bestProducts.length > 0 && (
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl mb-8 text-center">인기 제품 TOP 5</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bestProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm z-10">
                    {index + 1}
                  </div>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Equipment Sets Carousel */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">명장 추천 세트</h2>
            <Link
              to={ROUTES.SIMULATOR}
              className="text-primary hover:text-primary/80 flex items-center gap-2 font-semibold"
            >
              시뮬레이터 바로가기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {allSets.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              등록된 추천 세트가 없습니다.
            </div>
          ) : (
            <div className="relative">
              {/* 카드 */}
              <div className="overflow-hidden">
                {allSets.map((set, index) => {
                  const meta = set.presetKey ? PRESET_LABEL[set.presetKey] : PRESET_LABEL.premium;
                  const typeMeta = TYPE_LABEL[set.type];
                  const Icon = meta.icon;
                  const TypeIcon = typeMeta.icon;
                  const isVisible = index === currentIndex;
                  // categorySlug → 세트 아이템 매핑
                  const itemBySlug = Object.fromEntries(set.items.map(item => [item.categorySlug, item]));

                  return (
                    <div
                      key={set.id}
                      className={`transition-all duration-500 ${isVisible ? 'block' : 'hidden'}`}
                    >
                      <div
                        onClick={() => handleSetClick(set)}
                        className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer transition-shadow border border-border"
                      >
                        {/* 타이틀 바 */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                          <span className={`flex items-center gap-1.5 ${meta.badge} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                            <Icon className="w-3.5 h-3.5" />
                            {meta.name}
                          </span>
                          <span className="flex items-center gap-1 bg-secondary text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                            <TypeIcon className="w-3 h-3" />
                            {typeMeta.name}
                          </span>
                          <h3 className="text-lg font-bold ml-1">{set.name}</h3>
                        </div>

                        {/* 배 + 장비 배치도 */}
                        <div
                          className="relative w-full bg-white flex items-center justify-center"
                          style={{ height: '600px' }}
                        >
                          <img
                            src={set.type === 'fishing_vessel' ? '/fishing.png' : '/leisure.png'}
                            alt="선박"
                            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                          />
                          {EQUIPMENT_POSITIONS.map(pos => {
                            const item = itemBySlug[pos.id];
                            return (
                              <div
                                key={pos.id}
                                className="absolute z-10 pointer-events-none"
                                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                              >
                                {item ? (
                                  <div className="relative">
                                    <div className="w-20 h-20 rounded-lg border-4 border-primary bg-white p-1 shadow-2xl">
                                      {item.productImage ? (
                                        <img
                                          src={item.productImage}
                                          alt={item.productName ?? pos.name}
                                          className="w-full h-full object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-full h-full rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                                          {item.productName ?? pos.name}
                                        </div>
                                      )}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-md font-bold">
                                      {pos.name}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative group">
                                    <div className="w-7 h-7 rounded-full border-4 bg-white border-primary/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800/80 text-white px-2 py-1 rounded text-[10px] shadow-md">
                                      {pos.name}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 이전/다음 버튼 */}
              {allSets.length > 1 && (
                <>
                  <button
                    onClick={() => goTo(currentIndex - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-md border border-border flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => goTo(currentIndex + 1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-md border border-border flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* 도트 인디케이터 */}
              {allSets.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {allSets.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goTo(index)}
                      className={`rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-6 h-2.5 bg-primary'
                          : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>


      {/* Bottom Services */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to={ROUTES.PURCHASE_CONSULTING}
              className="bg-white p-8 border border-border hover:border-primary transition-colors"
            >
              <h3 className="text-xl mb-2">컨설팅</h3>
              <p className="text-muted-foreground">
                선박 / 용도 / 예산에 맞춘 장비 구성을 추천해드립니다
              </p>
            </Link>
            <Link
              to={ROUTES.USABILITY_SERVICE}
              className="bg-white p-8 border border-border hover:border-primary transition-colors"
            >
              <h3 className="text-xl mb-2">사용성 서비스</h3>
              <p className="text-muted-foreground">
                제품 사용 중 불편사항 및 A/S 신청을 접수해드립니다
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}