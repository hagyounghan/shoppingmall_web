import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { Product, PaginatedProducts } from '@shared/types';

async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const res = await apiGet<PaginatedProducts | Product[]>(API_ENDPOINTS.PRODUCTS_BY_BRAND(brandId));
  return Array.isArray(res) ? res : (res as PaginatedProducts).data ?? [];
}

export function useBrandProducts(brandId: string | undefined) {
  return useQuery({
    queryKey: ['products', 'brand', brandId],
    queryFn: () => getProductsByBrand(brandId!),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 5,
  });
}
