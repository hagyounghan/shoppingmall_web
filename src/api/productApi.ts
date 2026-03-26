import axios from 'axios';
import { Product, PaginatedProducts } from '../types';

const API_BASE_URL = 'http://192.168.10.135:3500'; // http 프로토콜 추가

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const productApi = {
  // 제품 목록 조회 (카테고리별 페이지네이션)
  getProducts: async (categoryId?: string) => {
    const response = await apiClient.get<PaginatedProducts>('/products', {
      params: { categoryId, take: 20 }
    });
    // PaginatedProducts 인터페이스 구조에 따라 response.data를 그대로 반환합니다.
    return response.data;
  },

  // 카테고리 목록 조회
  getCategories: async () => {
    const response = await apiClient.get<any>('/categories');
    // 배열인지 확인 후 데이터 반환
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  // 인기 제품 조회 (에러 발생 지점 수정)
  getTopProducts: async (limit: number = 5) => {
    const response = await apiClient.get<any>('/products/top', {
      params: { limit, sortBy: 'salesCount' }
    });
    
    // 서버 응답이 { data: [] } 형태이거나 바로 [] 형태인 경우를 모두 대응합니다.
    const data = Array.isArray(response.data) ? response.data : response.data.data || [];
    return data;
  }
};