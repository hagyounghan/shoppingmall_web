import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { CartItemUI, Product } from '@shared/types';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@features/auth';

interface CartItemServerResponse {
  id: string;
  productId: string;
  optionId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartContextType {
  items: CartItemUI[];
  addItem: (product: Product, quantity?: number, optionId?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

function loadLocalCart(): CartItemUI[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItemUI[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function serverToUI(item: CartItemServerResponse): CartItemUI {
  return {
    id: item.id,
    productId: item.productId,
    optionId: item.optionId,
    quantity: item.quantity,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItemUI[]>([]);
  const prevAuth = useRef(isAuthenticated);

  // 인증 상태 변경 시 장바구니 동기화
  useEffect(() => {
    const wasAuthenticated = prevAuth.current;
    prevAuth.current = isAuthenticated;

    if (isAuthenticated) {
      // 로그인 전환: 로컬 항목을 서버에 병합 후 서버 목록 fetch
      const localItems = loadLocalCart();
      const mergeAndFetch = async () => {
        for (const item of localItems) {
          try {
            await apiPost(API_ENDPOINTS.CART, {
              productId: item.productId,
              quantity: item.quantity,
              optionId: item.optionId,
            });
          } catch {
            // 이미 있는 항목 등 무시
          }
        }
        if (localItems.length > 0) {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
        try {
          const serverItems = await apiGet<CartItemServerResponse[]>(API_ENDPOINTS.CART);
          setItems(serverItems.map(serverToUI));
        } catch {
          setItems([]);
        }
      };
      mergeAndFetch();
    } else if (wasAuthenticated && !isAuthenticated) {
      // 로그아웃: 서버 상태 비우고 로컬 복원
      setItems(loadLocalCart());
    } else if (!isAuthenticated) {
      // 초기 비로그인
      setItems(loadLocalCart());
    }
  }, [isAuthenticated]);

  const addItem = async (product: Product, quantity = 1, optionId?: string) => {
    if (isAuthenticated) {
      try {
        await apiPost(API_ENDPOINTS.CART, { productId: product.id, quantity, optionId });
        const serverItems = await apiGet<CartItemServerResponse[]>(API_ENDPOINTS.CART);
        setItems(serverItems.map(serverToUI));
      } catch {
        // 실패 시 로컬 처리
      }
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id && i.optionId === optionId);
        let next: CartItemUI[];
        if (existing) {
          next = prev.map((i) =>
            i.productId === product.id && i.optionId === optionId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          next = [
            ...prev,
            {
              id: `local_${product.id}_${Date.now()}`,
              productId: product.id,
              optionId,
              quantity,
              name: product.name,
              price: product.price,
              image: product.image,
            },
          ];
        }
        saveLocalCart(next);
        return next;
      });
    }
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      try {
        await apiDelete(API_ENDPOINTS.CART_ITEM(id));
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch {
        // 실패 무시
      }
    } else {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        saveLocalCart(next);
        return next;
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }
    if (isAuthenticated) {
      try {
        await apiPatch(API_ENDPOINTS.CART_ITEM(id), { quantity });
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
      } catch {
        // 실패 무시
      }
    } else {
      setItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, quantity } : i));
        saveLocalCart(next);
        return next;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        // 서버에서 각 항목 삭제
        await Promise.all(items.map((i) => apiDelete(API_ENDPOINTS.CART_ITEM(i.id))));
      } catch {
        // 실패 무시
      }
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    setItems([]);
  };

  const getTotalPrice = () => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getTotalItems = () => items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
