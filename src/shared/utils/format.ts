// 유틸리티 함수들

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()}원`;
};

/**
 * 날짜를 한국 형식으로 포맷팅
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ko-KR');
};

