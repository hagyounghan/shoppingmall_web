import { Link, useNavigate } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { CATEGORIES } from "../../constants/categories";
import { ROUTES } from "../../constants/routes";
import { Product } from "../../types";
import { Crown, TrendingUp, Wallet, Sparkles, ArrowRight } from "lucide-react";
import { formatPrice } from "../../utils/format";

export function MainPage() {
  const navigate = useNavigate();

  const handleSetClick = (setId: 'premium' | 'value' | 'budget') => {
    navigate(`${ROUTES.SIMULATOR}?set=${setId}`);
  };

  const bestProducts: Product[] = [
    {
      id: "1",
      name: "GARMIN GPSMAP 8612 12인치 GPS 플로터",
      price: 3450000,
      image:
        "https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400",
      tag: "BEST",
    },
    {
      id: "2",
      name: "LOWRANCE HDS-12 LIVE 어군탐지기",
      price: 2890000,
      image:
        "https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400",
      tag: "NEW",
    },
    {
      id: "3",
      name: "FURUNO DRS4W 4kW 레이더",
      price: 4250000,
      image:
        "https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400",
      tag: "SALE",
    },
    {
      id: "4",
      name: "ICOM IC-M506 고정형 VHF 무선기",
      price: 890000,
      image:
        "https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400",
    },
    {
      id: "5",
      name: "SIMRAD NSS12 EVO3 멀티터치 디스플레이",
      price: 5180000,
      image:
        "https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400",
      tag: "BEST",
    },
  ];

  const recommendedProducts: Product[] = [
    {
      id: "6",
      name: "GARMIN STRIKER Plus 7sv 어군탐지기",
      price: 1250000,
      image:
        "https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400",
    },
    {
      id: "7",
      name: "LOWRANCE Elite FS 9 디스플레이",
      price: 1890000,
      image:
        "https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400",
    },
    {
      id: "8",
      name: "FURUNO GP-39 GPS 수신기",
      price: 650000,
      image:
        "https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400",
    },
    {
      id: "9",
      name: "STANDARD HORIZON GX2400 VHF",
      price: 720000,
      image:
        "https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400",
    },
    {
      id: "10",
      name: "RAYMARINE Axiom+ 12 디스플레이",
      price: 4850000,
      image:
        "https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400",
    },
  ];

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
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.label}
                to={category.link}
                className="flex flex-col items-center gap-3 p-4 bg-white border border-border hover:border-primary transition-colors group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                  <category.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-center">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Products
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
      </section> */}

      {/* Equipment Sets */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 명장세트 */}
            <div
              onClick={() => handleSetClick('premium')}
              className="group relative bg-white border-2 border-amber-300 rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              {/* 배 이미지 영역 */}
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 h-48 overflow-hidden">
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)' }}
                >
                  {/* 바다 파도 */}
                  <path
                    d="M 0 400 Q 100 390 200 395 Q 300 400 400 395 Q 500 390 600 395 Q 700 400 800 395 L 800 450 L 0 450 Z"
                    fill="#3b82f6"
                    opacity="0.4"
                  />
                  {/* 배 본체 */}
                  <path
                    d="M 120 280 Q 180 240 250 240 L 550 240 Q 620 240 680 280 L 680 360 Q 620 400 550 400 L 250 400 Q 180 400 120 360 Z"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="4"
                  />
                  {/* 플라이브리지 */}
                  <rect x="280" y="180" width="240" height="80" fill="#f0f9ff" stroke="#1e40af" strokeWidth="2" rx="8" />
                  {/* 마스트 */}
                  <line x1="400" y1="180" x2="400" y2="60" stroke="#1e40af" strokeWidth="5" />
                  <circle cx="400" cy="60" r="18" fill="#1e40af" />
                  <circle cx="400" cy="50" r="12" fill="#cbd5e1" stroke="#1e40af" strokeWidth="2" />
                </svg>
                {/* 제품 이미지 오버레이 */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GPS 플로터 (플라이브리지) */}
                  <div className="absolute" style={{ left: '45%', top: '49%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400"
                      alt="GPS 플로터"
                      className="w-12 h-12 rounded-lg border-2 border-amber-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* 레이더 (마스트 상단) */}
                  <div className="absolute" style={{ left: '50%', top: '11%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400"
                      alt="레이더"
                      className="w-10 h-10 rounded-lg border-2 border-amber-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* VHF 무선기 (선수부) */}
                  <div className="absolute" style={{ left: '20%', top: '53%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400"
                      alt="VHF 무선기"
                      className="w-10 h-10 rounded-lg border-2 border-amber-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* 어군탐지기 (선미부) */}
                  <div className="absolute" style={{ left: '75%', top: '71%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400"
                      alt="어군탐지기"
                      className="w-10 h-10 rounded-lg border-2 border-amber-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* 자동조타 (선미부 중앙) */}
                  <div className="absolute" style={{ left: '60%', top: '76%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400"
                      alt="자동조타"
                      className="w-10 h-10 rounded-lg border-2 border-amber-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Crown className="w-4 h-4" />
                  명장세트
                </div>
              </div>

              {/* 정보 영역 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-amber-900 mb-2">프리미엄 구성</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  명장님이 선택한 실용적인 픽으로 구성된 최고급 세트
                </p>

                {/* 적용된 장비 목록 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-muted-foreground">GPS 플로터 (12")</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-muted-foreground">레이더 4kW</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-muted-foreground">VHF 무선기</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-muted-foreground">어군탐지기</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-muted-foreground">자동조타</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">예상 가격</p>
                    <p className="text-lg font-bold text-amber-900">
                      {formatPrice(2300000 + 3800000 + 450000 + 2890000 + 2800000)}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 font-semibold text-sm">
                    더보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 가성비세트 */}
            <div
              onClick={() => handleSetClick('value')}
              className="group relative bg-white border-2 border-blue-300 rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              {/* 배 이미지 영역 */}
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 h-48 overflow-hidden">
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)' }}
                >
                  {/* 바다 파도 */}
                  <path
                    d="M 0 400 Q 100 390 200 395 Q 300 400 400 395 Q 500 390 600 395 Q 700 400 800 395 L 800 450 L 0 450 Z"
                    fill="#3b82f6"
                    opacity="0.4"
                  />
                  {/* 배 본체 */}
                  <path
                    d="M 120 280 Q 180 240 250 240 L 550 240 Q 620 240 680 280 L 680 360 Q 620 400 550 400 L 250 400 Q 180 400 120 360 Z"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="4"
                  />
                  {/* 플라이브리지 */}
                  <rect x="280" y="180" width="240" height="80" fill="#f0f9ff" stroke="#1e40af" strokeWidth="2" rx="8" />
                  {/* 마스트 */}
                  <line x1="400" y1="180" x2="400" y2="60" stroke="#1e40af" strokeWidth="5" />
                  <circle cx="400" cy="60" r="18" fill="#1e40af" />
                </svg>
                {/* 제품 이미지 오버레이 */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GPS 플로터 (플라이브리지) */}
                  <div className="absolute" style={{ left: '45%', top: '49%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400"
                      alt="GPS 플로터"
                      className="w-12 h-12 rounded-lg border-2 border-blue-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* VHF 무선기 (선수부) */}
                  <div className="absolute" style={{ left: '20%', top: '53%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400"
                      alt="VHF 무선기"
                      className="w-10 h-10 rounded-lg border-2 border-blue-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* 어군탐지기 (선미부) */}
                  <div className="absolute" style={{ left: '75%', top: '71%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400"
                      alt="어군탐지기"
                      className="w-10 h-10 rounded-lg border-2 border-blue-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  가성비세트
                </div>
              </div>

              {/* 정보 영역 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">추천 구성</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  합리적인 가격의 실용적인 세트
                </p>

                {/* 적용된 장비 목록 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-muted-foreground">GPS 플로터 (7")</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-muted-foreground">VHF 무선기</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-muted-foreground">어군탐지기</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">예상 가격</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatPrice(1450000 + 380000 + 1250000)}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-semibold text-sm">
                    더보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 가심비세트 */}
            <div
              onClick={() => handleSetClick('budget')}
              className="group relative bg-white border-2 border-green-300 rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              {/* 배 이미지 영역 */}
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 h-48 overflow-hidden">
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)' }}
                >
                  {/* 바다 파도 */}
                  <path
                    d="M 0 400 Q 100 390 200 395 Q 300 400 400 395 Q 500 390 600 395 Q 700 400 800 395 L 800 450 L 0 450 Z"
                    fill="#3b82f6"
                    opacity="0.4"
                  />
                  {/* 배 본체 */}
                  <path
                    d="M 120 280 Q 180 240 250 240 L 550 240 Q 620 240 680 280 L 680 360 Q 620 400 550 400 L 250 400 Q 180 400 120 360 Z"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="4"
                  />
                  {/* 플라이브리지 */}
                  <rect x="280" y="180" width="240" height="80" fill="#f0f9ff" stroke="#1e40af" strokeWidth="2" rx="8" />
                  {/* 마스트 */}
                  <line x1="400" y1="180" x2="400" y2="60" stroke="#1e40af" strokeWidth="5" />
                  <circle cx="400" cy="60" r="18" fill="#1e40af" />
                </svg>
                {/* 제품 이미지 오버레이 */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GPS 플로터 (플라이브리지) */}
                  <div className="absolute" style={{ left: '45%', top: '49%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400"
                      alt="GPS 플로터"
                      className="w-12 h-12 rounded-lg border-2 border-green-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                  {/* VHF 무선기 (선수부) */}
                  <div className="absolute" style={{ left: '20%', top: '53%', transform: 'translate(-50%, -50%)' }}>
                    <img
                      src="https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400"
                      alt="VHF 무선기"
                      className="w-10 h-10 rounded-lg border-2 border-green-500 bg-white p-1 shadow-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Wallet className="w-4 h-4" />
                  가심비세트
                </div>
              </div>

              {/* 정보 영역 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-900 mb-2">경제적 구성</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  경제적인 가격의 기본 세트
                </p>

                {/* 적용된 장비 목록 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">GPS 플로터 (9")</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">VHF 무선기</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">예상 가격</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatPrice(1850000 + 380000)}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-semibold text-sm">
                    더보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Bottom Services */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to={ROUTES.CONSULTING}
              className="bg-white p-8 border border-border hover:border-primary transition-colors"
            >
              <h3 className="text-xl mb-2">전문가 컨설팅</h3>
              <p className="text-muted-foreground">
                선박 / 용도 / 예산에 맞춘 장비 구성을 추천해드립니다
              </p>
            </Link>
            <Link
              to={ROUTES.FISHING_POINTS}
              className="bg-white p-8 border border-border hover:border-primary transition-colors"
            >
              <h3 className="text-xl mb-2">낚시포인트 SD</h3>
              <p className="text-muted-foreground">
                검증된 낚시포인트 SD 카드 구매 및 나만의 포인트 등록
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}