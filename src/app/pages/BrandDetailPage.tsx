import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, PaginatedProducts } from '../../types';
import { apiGet } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { FeaturedProductsSection } from '../components/FeaturedProductsSection';

interface BrandInfo {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string;
  backgroundColor: string | null;
  gradientColor: string | null;
  hasLogo: boolean;
  hasOverlay: boolean;
  productCount: number;
}

export function BrandDetailPage() {
  const { brandId } = useParams<{ brandId: string }>();

  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // 1. 브랜드 정보 조회
  useEffect(() => {
    if (!brandId) return;
    setBrandLoading(true);
    apiGet<BrandInfo>(API_ENDPOINTS.BRAND_DETAIL(brandId))
      .then(setBrand)
      .catch(() => setBrand(null))
      .finally(() => setBrandLoading(false));
  }, [brandId]);

  // 2. 브랜드 UUID 확정 후 상품 조회
  useEffect(() => {
    if (!brand?.id) return;
    setProductsLoading(true);
    apiGet<PaginatedProducts | Product[]>(API_ENDPOINTS.PRODUCTS_BY_BRAND(brand.id))
      .then(res => {
        const list = Array.isArray(res) ? res : (res as PaginatedProducts).data ?? [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [brand?.id]);

  if (brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">브랜드를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const headerBg = brand.backgroundColor
    ? brand.backgroundColor.startsWith('oklch') || brand.backgroundColor.startsWith('#') || brand.backgroundColor.startsWith('rgb')
      ? undefined
      : brand.backgroundColor
    : `bg-gradient-to-br ${brand.gradientColor ?? 'from-primary to-primary/80'}`;

  const headerStyle = brand.backgroundColor?.startsWith('oklch') || brand.backgroundColor?.startsWith('#') || brand.backgroundColor?.startsWith('rgb')
    ? { backgroundColor: brand.backgroundColor }
    : undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* 브랜드 헤더 */}
      <div className={`${headerBg ?? ''} text-white py-16`} style={headerStyle}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {brand.hasLogo && brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="mx-auto max-h-24 object-contain mb-4"
              />
            ) : (
              <h1 className="text-5xl mb-4">{brand.name}</h1>
            )}
            {brand.description && (
              <p className="text-xl opacity-90">{brand.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">

          <FeaturedProductsSection />

          {/* 상품 수 */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{brand.name} 전체 제품</h2>
            <p className="text-muted-foreground">
              총 {productsLoading ? '-' : products.length}개 제품
            </p>
          </div>

          {/* 상품 목록 */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              상품 불러오는 중...
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
              등록된 제품이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          {/* 브랜드 소개 */}
          <div className="p-8 border border-border">
            <h2 className="text-2xl mb-4">{brand.name} 소개</h2>
            <div className="text-muted-foreground space-y-3">
              <p>
                {brand.name}은(는) 해양 전자기기 분야에서 세계적으로 인정받는 브랜드입니다.
                최첨단 기술과 사용자 중심의 디자인으로 전 세계 선박 운영자들에게 신뢰받고 있습니다.
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
