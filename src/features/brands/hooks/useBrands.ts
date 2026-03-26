import { useQuery } from '@tanstack/react-query';
import { getBrands, getBrand } from '../api/brandsApi';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 1000 * 60 * 10,
  });
}

export function useBrand(idOrSlug: string) {
  return useQuery({
    queryKey: ['brands', idOrSlug],
    queryFn: () => getBrand(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 10,
  });
}
