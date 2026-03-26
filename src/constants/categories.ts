import {
  Radar,
  Navigation,
  Radio,
  Anchor,
  Antenna,
  Battery,
  Cable,
  Package,
  type LucideIcon,
} from 'lucide-react';

// 카테고리 이름 키워드 → 아이콘 매핑 규칙
const ICON_RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ['GPS', '플로터', 'PLOTTER'], icon: Navigation },
  { keywords: ['레이더', 'RADAR'], icon: Radar },
  { keywords: ['통신', '무선', 'VHF', 'RADIO', '방송'], icon: Radio },
  { keywords: ['항법', '나침반', '자동조타', 'AUTOPILOT', 'COMPASS'], icon: Anchor },
  { keywords: ['안테나', 'ANTENNA'], icon: Antenna },
  { keywords: ['배터리', 'BATTERY', '전원', 'POWER'], icon: Battery },
  { keywords: ['전기', '전선', 'CABLE', '전장', '전자'], icon: Cable },
];

/**
 * 서버 카테고리 이름을 기반으로 아이콘을 반환합니다.
 */
export function getCategoryIcon(name: string): LucideIcon {
  const upper = name.toUpperCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw) => upper.includes(kw.toUpperCase()))) {
      return rule.icon;
    }
  }
  return Package;
}

// 카테고리 UUID → 링크 경로 생성 헬퍼
export function getCategoryLink(categoryId: string): string {
  return `/category/${categoryId}`;
}
