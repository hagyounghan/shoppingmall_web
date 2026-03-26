/**
 * CategoryContext — 홈/카테고리 페이지용
 *
 * 앱 시작 시 GET /categories/main 1회 호출
 * → slug → Category 맵 빌드
 * → 카테고리 클릭 시 UUID 조회 → 제품 API 호출
 *
 * 시뮬레이터는 메인+서브 카테고리가 필요하므로 SimulatorPage에서 별도 로드
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Category } from '../types';
import { apiGet } from '../lib/api-client';
import { API_ENDPOINTS } from '../config/api';

interface CategoryContextValue {
  slugMap: Record<string, Category>;
  mainCategories: Category[];
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
    apiGet<Category[]>(API_ENDPOINTS.CATEGORIES_MAIN)
      .then(res => {
        const list: Category[] = Array.isArray(res) ? res : [];
        const map: Record<string, Category> = {};
        list.forEach(c => { if (c.slug) map[c.slug] = c; });
        setMainCategories(list);
        setSlugMap(map);
      })
      .catch(e => console.error('[CategoryContext] 메인 카테고리 로드 실패:', e))
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
