import { useState, useEffect } from 'react';
import { Loader2, Star } from 'lucide-react';
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

  if (loading) {
    return (
      <section className="mb-12 bg-amber-50 border border-amber-200 rounded-lg py-8 px-6">
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          소개 장비 불러오는 중...
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="mb-12 bg-amber-50 border border-amber-200 rounded-lg py-8 px-6">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-2xl font-bold text-amber-900">명장 추천 소개 장비</h2>
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
      </div>
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
    </section>
  );
}
