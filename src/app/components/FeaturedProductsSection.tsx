import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { FeaturedProduct } from '../../types';
import { apiGet } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';

export function FeaturedProductsSection() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<FeaturedProduct[]>(API_ENDPOINTS.FEATURED_PRODUCTS)
      .then(res => setFeatured(Array.isArray(res) ? res : []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-12 bg-secondary border border-border rounded-lg py-8 px-6">
      <h2 className="text-2xl font-bold mb-8 text-center">명장픽 장비</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          불러오는 중...
        </div>
      ) : featured.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
          명장픽 장비가 아직 등록되지 않았습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featured.map((item, index) => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2 -left-2 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs z-10 shadow">
                {index + 1}
              </div>
              <ProductCard {...item.product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
