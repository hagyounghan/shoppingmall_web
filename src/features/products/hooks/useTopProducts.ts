import { useQuery } from '@tanstack/react-query';
import { getTopProducts } from '../api/productApi';

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ['products', 'top', limit],
    queryFn: () => getTopProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
}
