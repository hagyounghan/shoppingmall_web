import { useParams } from 'react-router-dom';
import { ProductCard } from '@shared/components/ProductCard';
import { useCategories } from '@features/categories';
import { useProductsByCategory } from '@features/products';
import { FeaturedProductsSection } from '@features/products/components/FeaturedProductsSection';

export function CategoryPage() {
  const { categoryId: slugParam } = useParams<{ categoryId: string }>();
  const { getBySlug } = useCategories();

  const category = slugParam ? getBySlug(slugParam) : undefined;
  const categoryName = category?.name ?? slugParam ?? '제품';

  const { data: products = [], isLoading } = useProductsByCategory(category);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl mb-4">{categoryName}</h1>
            <p className="text-muted-foreground">{categoryName} 카테고리의 제품을 확인하세요</p>
          </div>

          <FeaturedProductsSection />

          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 border rounded-md bg-white text-sm">
                <option>정렬: 최신순</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">총 {products.length}개 제품</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
                ))
              : products.map((product) => <ProductCard key={product.id} {...product} />)
            }
          </div>

          {!isLoading && products.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              해당 카테고리에 등록된 상품이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
