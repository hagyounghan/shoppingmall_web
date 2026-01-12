import React from 'react';

// 공통 타입 정의
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  tag?: 'BEST' | 'NEW' | 'SALE';
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  productCount: number;
  logo: string;
  backgroundColor: string | null;
  gradientColor: string;
  hasLogo: boolean;
  hasOverlay: boolean;
}

export interface Category {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  link: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  fishingPoints: number;
}

export interface ServiceRequest {
  id: string;
  device: string;
  status: string;
  date: string;
}

export interface Consultation {
  id: string;
  type: string;
  status: string;
  date: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  tag?: 'BEST' | 'NEW' | 'SALE';
}

