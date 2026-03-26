import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '../api/productApi';

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => getProductDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
