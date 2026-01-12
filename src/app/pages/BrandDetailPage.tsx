import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../../types';

export function BrandDetailPage() {
  const { brandId } = useParams();

  const brandInfo: Record<string, { name: string; description: string; backgroundColor: string; textColor: string }> = {
    garmin: {
      name: 'GARMIN',
      description: '세계적인 GPS 및 항해 장비 리더. 정확한 위치 정보와 직관적인 사용자 인터페이스를 제공합니다.',
      backgroundColor: 'bg-black',
      textColor: 'text-white',
    },
    lowrance: {
      name: 'LOWRANCE',
      description: '어군탐지기 및 GPS 플로터 전문 브랜드. 최첨단 소나 기술로 전문 어부들의 신뢰를 받고 있습니다.',
      backgroundColor: 'bg-blue-600',
      textColor: 'text-white',
    },
    simrad: {
      name: 'SIMRAD',
      description: '프로가 신뢰하는 프리미엄 항해 전자장비. 최고급 기술과 품질로 전문 선박 운영자들에게 인정받고 있습니다.',
      backgroundColor: 'bg-red-600',
      textColor: 'text-white',
    },
    camel: {
      name: 'CAMEL',
      description: '현장에서 검증된 어선용 전자장비. 실용적이고 내구성이 뛰어난 제품으로 어업 현장의 신뢰를 받고 있습니다.',
      backgroundColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
      textColor: 'text-white',
    },
    'standard-horizon': {
      name: 'STANDARD HORIZON',
      description: '바다 위 안전을 지켜주는 해양 무전기의 표준. 신뢰성 높은 통신 장비로 선박 안전을 책임집니다.',
      backgroundColor: 'bg-gradient-to-br from-orange-600 to-orange-800',
      textColor: 'text-white',
    },
    'g-zyro': {
      name: 'G-ZYRO',
      description: '흔들림 없는 항해를 만드는 자이로 기술. 정밀한 자세 제어로 안정적인 항해를 지원합니다.',
      backgroundColor: 'bg-gradient-to-br from-teal-600 to-teal-800',
      textColor: 'text-white',
    },
  };

  const brand = brandInfo[brandId as string] || brandInfo.garmin;

  const topProducts: (Product & { rank: number })[] = [
    {
      id: 'top-1',
      name: `${brand.name} GPSMAP 8612 12인치 GPS 플로터`,
      price: 3450000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      tag: 'BEST',
      rank: 1,
    },
    {
      id: 'top-2',
      name: `${brand.name} HDS-12 LIVE 어군탐지기`,
      price: 2890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      tag: 'NEW',
      rank: 2,
    },
    {
      id: 'top-3',
      name: `${brand.name} NSS12 EVO3 멀티터치`,
      price: 5180000,
      image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400',
      tag: 'BEST',
      rank: 3,
    },
    {
      id: 'top-4',
      name: `${brand.name} STRIKER Plus 7sv`,
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      rank: 4,
    },
    {
      id: 'top-5',
      name: `${brand.name} Elite FS 9 디스플레이`,
      price: 1890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      rank: 5,
    },
  ];

  const products: Product[] = [
    {
      id: '1',
      name: `${brand.name} GPSMAP 8612 12인치 GPS 플로터`,
      price: 3450000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      tag: 'BEST',
    },
    {
      id: '2',
      name: `${brand.name} HDS-12 LIVE 어군탐지기`,
      price: 2890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      tag: 'NEW',
    },
    {
      id: '3',
      name: `${brand.name} DRS4W 4kW 레이더`,
      price: 4250000,
      image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
    },
    {
      id: '4',
      name: `${brand.name} NSS12 EVO3 멀티터치`,
      price: 5180000,
      image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400',
      tag: 'BEST',
    },
    {
      id: '5',
      name: `${brand.name} STRIKER Plus 7sv`,
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
    },
    {
      id: '6',
      name: `${brand.name} Elite FS 9 디스플레이`,
      price: 1890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
    },
    {
      id: '7',
      name: `${brand.name} GP-39 GPS 수신기`,
      price: 650000,
      image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
    },
    {
      id: '8',
      name: `${brand.name} VHF 무선기`,
      price: 720000,
      image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Brand Header */}
      <div className={`${brand.backgroundColor} ${brand.textColor} py-16`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-4">{brand.name}</h1>
            <p className="text-xl opacity-90">{brand.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Top Products Section */}
          <section className="mb-12">
            <h2 className="text-3xl mb-6 text-center">인기 제품 TOP 5</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {topProducts.map((product) => (
                <div key={product.id} className="relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm z-10">
                    {product.rank}
                  </div>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </section>

          {/* Filter Section */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 border border-border bg-white">
                <option>전체 카테고리</option>
                <option>GPS 플로터</option>
                <option>어군탐지기</option>
                <option>레이더</option>
                <option>통신장비</option>
                <option>기타</option>
              </select>
              <select className="px-4 py-2 border border-border bg-white">
                <option>정렬: 인기순</option>
                <option>정렬: 최신순</option>
                <option>정렬: 낮은 가격순</option>
                <option>정렬: 높은 가격순</option>
              </select>
            </div>
            <p className="text-muted-foreground">
              총 {products.length}개 제품
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Brand Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-secondary border border-border">
              <h3 className="text-xl mb-3">품질 보증</h3>
              <p className="text-sm text-muted-foreground">
                {brand.name} 정품 제품으로 공식 A/S 지원 및 품질을 보증합니다.
              </p>
            </div>
            <div className="p-6 bg-secondary border border-border">
              <h3 className="text-xl mb-3">전문 상담</h3>
              <p className="text-sm text-muted-foreground">
                {brand.name} 전문가가 제품 선택부터 설치까지 도와드립니다.
              </p>
            </div>
            <div className="p-6 bg-secondary border border-border">
              <h3 className="text-xl mb-3">빠른 배송</h3>
              <p className="text-sm text-muted-foreground">
                재고 보유 제품은 익일 배송이 가능합니다.
              </p>
            </div>
          </div>

          {/* About Brand */}
          <div className="p-8 border border-border">
            <h2 className="text-2xl mb-4">{brand.name} 소개</h2>
            <div className="prose max-w-none text-muted-foreground">
              <p className="mb-4">
                {brand.name}은(는) 해양 전자기기 분야에서 세계적으로 인정받는 브랜드입니다.
                최첨단 기술과 사용자 중심의 디자인으로 전 세계 선박 운영자들에게 신뢰받고 있습니다.
              </p>
              <p className="mb-4">
                GPS, 어군탐지기, 레이더, 자동조타장치 등 다양한 제품군을 통해
                안전하고 효율적인 항해를 지원합니다.
              </p>
              <p>
                명장몰은 {brand.name}의 공식 파트너로서 정품 제품만을 취급하며,
                전문적인 설치 및 A/S 서비스를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
