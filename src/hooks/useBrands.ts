// 브랜드 데이터를 가져오는 커스텀 훅

import { useState, useEffect } from 'react';
import { getBrands, getBrand } from '../api/brands';
import { Brand } from '../types';

interface UseBrandsResult {
  brands: Brand[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 브랜드 목록을 가져오는 훅
 */
export function useBrands(): UseBrandsResult {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('브랜드를 불러오는데 실패했습니다.'));
      console.error('브랜드 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    refetch: fetchBrands,
  };
}

interface UseBrandResult {
  brand: Brand | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 단일 브랜드를 가져오는 훅
 */
export function useBrand(idOrSlug: string): UseBrandResult {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBrand(idOrSlug);
      setBrand(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('브랜드를 불러오는데 실패했습니다.'));
      console.error('브랜드 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, [idOrSlug]);

  return {
    brand,
    loading,
    error,
    refetch: fetchBrand,
  };
}

