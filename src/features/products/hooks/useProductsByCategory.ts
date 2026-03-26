import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { PaginatedProducts, Product, Category } from '@shared/types';

async function fetchProductsByCategory(category: Category): Promise<Product[]> {
  const endpoint = category.parentId === null
    ? API_ENDPOINTS.PRODUCTS_BY_MAIN_CATEGORY(category.id)
    : API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category.id);
  const res = await apiGet<PaginatedProducts>(endpoint);
  return Array.isArray(res) ? res : res?.data ?? [];
}

export function useProductsByCategory(category: Category | undefined) {
  return useQuery({
    queryKey: ['products', 'category', category?.id],
    queryFn: () => fetchProductsByCategory(category!),
    enabled: !!category,
    staleTime: 1000 * 60 * 3,
  });
}
