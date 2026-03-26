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

export interface CategoryItem {
  slug: string;
  label: string;
  icon: LucideIcon;
  link: string;
  // 서버 카테고리 name과 매칭할 키워드 (직접 관리)
  serverName: string;
}

export const CATEGORIES: CategoryItem[] = [
  { slug: 'gps-plotter', label: 'GPS 플로터', icon: Navigation, link: '/category/gps-plotter', serverName: 'GPS 플로터' },
  { slug: 'radar', label: '레이더', icon: Radar, link: '/category/radar', serverName: '레이더' },
  { slug: 'vhf', label: 'VHF 무선기', icon: Radio, link: '/category/vhf', serverName: 'VHF 무선기' },
  { slug: 'autopilot', label: '자동조타', icon: Anchor, link: '/category/autopilot', serverName: '자동조타' },
  { slug: 'antenna', label: '안테나', icon: Antenna, link: '/category/antenna', serverName: '안테나' },
  { slug: 'battery', label: '배터리/전원', icon: Battery, link: '/category/battery', serverName: '배터리' },
  { slug: 'cable', label: '전장/전선', icon: Cable, link: '/category/cable', serverName: '전장' },
  { slug: 'etc', label: '기타', icon: Package, link: '/category/etc', serverName: '기타' },
];
