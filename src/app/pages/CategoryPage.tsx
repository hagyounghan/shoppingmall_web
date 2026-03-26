import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { getMainCategories, getProductsByCategory, getTopProducts } from '../../api/productApi';

export function CategoryPage() {
  const { categoryId: urlId } = useParams<{ categoryId: string }>();

  const localCategory = CATEGORIES.find((c) => c.id === urlId);
  const [categoryName, setCategoryName] = useState(localCategory?.name || '제품');

  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<(Product & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localCategory) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 서버 카테고리 목록 조회 → 이름으로 ID 추출
        const serverCategories = await getMainCategories();
        const matched = serverCategories.find((c) => c.name === localCategory.name);
        const serverId = matched?.id ?? urlId!;

        setCategoryName(matched?.name ?? localCategory.name);

        const [categoryProducts, topProductsData] = await Promise.all([
          getProductsByCategory(serverId),
          getTopProducts(5),
        ]);

        setProducts(categoryProducts);

        if (Array.isArray(topProductsData)) {
          setTopProducts(topProductsData.map((p, i) => ({ ...p, rank: i + 1 })));
        } else {
          setTopProducts([]);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlId]);

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