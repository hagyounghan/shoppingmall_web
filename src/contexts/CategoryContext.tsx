import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Category } from '../types';
import { apiGet } from '../lib/api-client';
import { API_ENDPOINTS } from '../config/api';

interface CategoryContextValue {
  /** slug → Category 맵 (전체) */
  slugMap: Record<string, Category>;
  /** 메인 카테고리 목록 (parentId === null) */
  mainCategories: Category[];
  /** slug로 카테고리 조회 */
  getBySlug: (slug: string) => Category | undefined;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextValue>({
  slugMap: {},
  mainCategories: [],
  getBySlug: () => undefined,
  loading: true,
});

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [slugMap, setSlugMap] = useState<Record<string, Category>>({});
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: Category[] }>(`${API_ENDPOINTS.CATEGORIES}?take=200`)
      .then(res => {
        const list: Category[] = Array.isArray(res) ? res : res?.data ?? [];
        const map: Record<string, Category> = {};
        list.forEach(c => { if (c.slug) map[c.slug] = c; });
        setSlugMap(map);
        setMainCategories(list.filter(c => c.parentId === null));
      })
      .catch((e) => console.error('[CategoryContext] 카테고리 로드 실패:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CategoryContext.Provider value={{
      slugMap,
      mainCategories,
      getBySlug: (slug) => slugMap[slug],
      loading,
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
