import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../../constants/categories';
import { Product } from '../../types';

export function CategoryPage() {
  const { categoryId } = useParams();
  
  const category = CATEGORIES.find(cat => cat.link === `/category/${categoryId}`);
  const categoryName = category?.label || '제품';

  // 카테고리별 인기 제품 TOP 5
  const topProducts: (Product & { rank: number })[] = [
    {
      id: 'top-1',
      name: 'GARMIN GPSMAP 8612 12인치 GPS 플로터',
      price: 3450000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      tag: 'BEST',
      rank: 1,
    },
    {
      id: 'top-2',
      name: 'LOWRANCE HDS-12 LIVE 어군탐지기',
      price: 2890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      tag: 'NEW',
      rank: 2,
    },
    {
      id: 'top-3',
      name: 'FURUNO DRS4W 4kW 레이더',
      price: 4250000,
      image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
      tag: 'SALE',
      rank: 3,
    },
    {
      id: 'top-4',
      name: 'SIMRAD NSS12 EVO3 멀티터치 디스플레이',
      price: 5180000,
      image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400',
      tag: 'BEST',
      rank: 4,
    },
    {
      id: 'top-5',
      name: 'ICOM IC-M506 고정형 VHF 무선기',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
      rank: 5,
    },
  ];

  // 카테고리별 제품 데이터 (실제로는 API에서 가져올 데이터)
  const products: Product[] = [
    {
      id: '1',
      name: 'GARMIN GPSMAP 8612 12인치 GPS 플로터',
      price: 3450000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      tag: 'BEST',
    },
    {
      id: '2',
      name: 'LOWRANCE HDS-12 LIVE 어군탐지기',
      price: 2890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      tag: 'NEW',
    },
    {
      id: '3',
      name: 'FURUNO DRS4W 4kW 레이더',
      price: 4250000,
      image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
      tag: 'SALE',
    },
    {
      id: '4',
      name: 'SIMRAD NSS12 EVO3 멀티터치 디스플레이',
      price: 5180000,
      image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400',
      tag: 'BEST',
    },
    {
      id: '5',
      name: 'ICOM IC-M506 고정형 VHF 무선기',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
    },
    {
      id: '6',
      name: 'GARMIN STRIKER Plus 7sv 어군탐지기',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
    },
    {
      id: '7',
      name: 'LOWRANCE Elite FS 9 디스플레이',
      price: 1890000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
    },
    {
      id: '8',
      name: 'STANDARD HORIZON GX2400 VHF',
      price: 720000,
      image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-4xl mb-4">{categoryName}</h1>
            <p className="text-muted-foreground">
              {categoryName} 카테고리의 제품을 확인하세요
            </p>
          </div>

          {/* Top Products Section */}
          <section className="mb-12 bg-secondary py-8 px-6 rounded-lg">
            <h2 className="text-3xl mb-8 text-center">인기 제품 TOP 5</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

