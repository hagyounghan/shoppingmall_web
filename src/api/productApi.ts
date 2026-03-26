import { apiGet } from '../lib/api-client';
import { API_ENDPOINTS } from '../config/api';
import { Product, ProductDetail, PaginatedProducts, Category } from '../types';

export async function getProducts(params?: {
  page?: number;
  take?: number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  tag?: string;
}): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.take) query.set('take', String(params.take));
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.brandId) query.set('brandId', params.brandId);
  if (params?.search) query.set('search', params.search);
  if (params?.tag) query.set('tag', params.tag);
  const qs = query.toString();
  return apiGet<PaginatedProducts>(`${API_ENDPOINTS.PRODUCTS}${qs ? `?${qs}` : ''}`);
}

export async function getTopProducts(limit = 5): Promise<Product[]> {
  const data = await apiGet<Product[] | { data: Product[] }>(
    `${API_ENDPOINTS.TOP_PRODUCTS}?limit=${limit}`
  );
  return Array.isArray(data) ? data : data.data || [];
}

export async function getProductDetail(id: string): Promise<ProductDetail> {
  return apiGet<ProductDetail>(API_ENDPOINTS.PRODUCT_DETAIL(id));
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiGet<Category[] | { data: Category[] }>(API_ENDPOINTS.CATEGORIES);
  return Array.isArray(data) ? data : data.data || [];
}
