import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../../types';
import { useCategories } from '../../contexts/CategoryContext';
import { getProductsByMainCategory, getTopProducts } from '../../api/productApi';
import { apiGet } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { PaginatedProducts } from '../../types';

export function CategoryPage() {
  // URL 파라미터가 slug (예: 'gps-plotter')
  const { categoryId: slugParam } = useParams<{ categoryId: string }>();
  const { getBySlug, loading: catLoading } = useCategories();

  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<(Product & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (catLoading || !slugParam) return;

    const category = getBySlug(slugParam);
    if (!category) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // 메인 카테고리(parentId=null) → /products/main-category/:id
        // 서브 카테고리(parentId≠null) → /products/category/:id
        const endpoint = category.parentId === null
          ? API_ENDPOINTS.PRODUCTS_BY_MAIN_CATEGORY(category.id)
          : API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category.id);

        const [categoryProducts, topProductsData] = await Promise.all([
          apiGet<PaginatedProducts>(endpoint).then(res => Array.isArray(res) ? res : res?.data ?? []),
          getTopProducts(5),
        ]);

        setProducts(categoryProducts);
        setTopProducts(Array.isArray(topProductsData)
          ? topProductsData.map((p, i) => ({ ...p, rank: i + 1 }))
          : []);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slugParam, catLoading]);

  const category = slugParam ? getBySlug(slugParam) : undefined;
  const categoryName = category?.name ?? slugParam ?? '제품';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl mb-4">{categoryName}</h1>
            <p className="text-muted-foreground">{categoryName} 카테고리의 제품을 확인하세요</p>
          </div>

          {/* 인기 제품 TOP 5 */}
          {topProducts.length > 0 && (
            <section className="mb-12 bg-gray-50 py-8 px-6 rounded-lg">
              <h2 className="text-3xl mb-8 text-center font-bold">인기 제품 TOP 5</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {topProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                      {product.rank}
                    </div>
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 전체 제품 목록 */}
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 border rounded-md bg-white text-sm">
                <option>정렬: 최신순</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">총 {products.length}개 제품</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              ))
            ) : (
              products.map((product) => <ProductCard key={product.id} {...product} />)
            )}
          </div>

          {!loading && products.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              해당 카테고리에 등록된 상품이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
