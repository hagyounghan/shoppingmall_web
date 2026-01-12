import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { CATEGORIES } from "../../constants/categories";
import { ROUTES } from "../../constants/routes";
import { Product } from "../../types";

export function MainPage() {
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

      {/* Expert Recommended */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-center">
            명장이 추천하는 상품
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Banners */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to={ROUTES.BRAND_DETAIL('lowrance')} className="bg-white p-8 border border-border hover:border-primary transition-colors flex items-center justify-center h-32">
              <img src="/lowrance_logo.png" alt="LOWRANCE" className="w-full h-full max-h-20 object-contain" />
            </Link>
            <Link to={ROUTES.BRAND_DETAIL('garmin')} className="bg-black p-8 border border-border hover:border-primary transition-colors flex items-center justify-center h-32">
              <img src="/garmin_logo.png" alt="GARMIN" className="w-full h-full max-h-20 object-contain" />
            </Link>
            <Link
              to={ROUTES.BRAND_DETAIL('simrad')}
              className="p-8 border border-border hover:border-primary transition-colors flex items-center justify-center h-32"
              style={{ backgroundColor: 'oklch(0.56 0.23 27.53)' }}
            >
              <img src="/simrad_logo.png" alt="SIMRAD" className="w-full h-full max-h-20 object-contain" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-center">
            이달의 인기 상품
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {bestProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
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