import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItemUI, Product } from '@shared/types';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@features/auth';

interface WishlistItemServerResponse {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    tag?: 'BEST' | 'NEW' | 'SALE' | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface WishlistContextType {
  items: WishlistItemUI[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeByProductId: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function serverToUI(item: WishlistItemServerResponse): WishlistItemUI {
  return {
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
    tag: item.product.tag,
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    apiGet<WishlistItemServerResponse[]>(API_ENDPOINTS.WISHLIST)
      .then((res) => { if (isMounted) setItems(res.map(serverToUI)); })
      .catch(() => { if (isMounted) setItems([]); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const addItem = async (product: Product) => {
    if (!isAuthenticated) throw new Error('로그인이 필요합니다');
    const res = await apiPost<WishlistItemServerResponse>(API_ENDPOINTS.WISHLIST, {
      productId: product.id,
    });
    setItems((prev) => [...prev, serverToUI(res)]);
  };

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) throw new Error('로그인이 필요합니다');
    await apiDelete(API_ENDPOINTS.WISHLIST_ITEM(itemId));
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const removeByProductId = async (productId: string) => {
    if (!isAuthenticated) throw new Error('로그인이 필요합니다');
    await apiDelete(API_ENDPOINTS.WISHLIST_PRODUCT(productId));
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const isInWishlist = (productId: string) => items.some((i) => i.productId === productId);

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, removeByProductId, isInWishlist, isLoading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
