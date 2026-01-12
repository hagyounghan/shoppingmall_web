// 브랜드 관련 API 함수들

import { apiGet } from '../lib/api-client';
import { API_ENDPOINTS } from '../config/api';
import { Brand } from '../types';

/**
 * 서버에서 받은 Brand 응답 타입
 */
export interface BrandApiResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  logoUrl: string;
  backgroundColor: string | null;
  gradientColor: string;
  hasLogo: boolean;
  hasOverlay: boolean;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 브랜드 목록 조회
 */
export async function getBrands(): Promise<Brand[]> {
  const response = await apiGet<BrandApiResponse[]>(API_ENDPOINTS.BRANDS);
  
  // 서버 응답을 클라이언트 Brand 타입으로 변환
  return response.map((brand) => ({
    id: brand.slug, // slug를 id로 사용
    name: brand.name,
    description: brand.description,
    productCount: brand.productCount,
    logo: brand.logoUrl || brand.logo, // logoUrl 우선 사용
    backgroundColor: brand.backgroundColor,
    gradientColor: brand.gradientColor,
    hasLogo: brand.hasLogo,
    hasOverlay: brand.hasOverlay,
  }));
}

/**
 * 브랜드 상세 조회
 */
export async function getBrand(idOrSlug: string): Promise<Brand> {
  const response = await apiGet<BrandApiResponse>(API_ENDPOINTS.BRAND_DETAIL(idOrSlug));
  
  return {
    id: response.slug,
    name: response.name,
    description: response.description,
    productCount: response.productCount,
    logo: response.logoUrl || response.logo,
    backgroundColor: response.backgroundColor,
    gradientColor: response.gradientColor,
    hasLogo: response.hasLogo,
    hasOverlay: response.hasOverlay,
  };
}

