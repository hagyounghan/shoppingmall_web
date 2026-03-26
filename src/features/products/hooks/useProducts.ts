import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/productApi';

interface ProductFilters {
  page?: number;
  take?: number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  tag?: string;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 3,
  });
}
