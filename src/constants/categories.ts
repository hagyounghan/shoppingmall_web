import {
  Radar,
  Navigation,
  Radio,
  Anchor,
  Antenna,
  Package,
  Shield,
  RotateCcw,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  icon: LucideIcon;
  link: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'aab0233c-0ca2-45da-800a-661db9264f59',
    name: 'GPS플로터',
    icon: Navigation,
    link: '/category/aab0233c-0ca2-45da-800a-661db9264f59',
  },
  {
    id: 'e300e901-0e6f-412b-94e2-9377cbdcd1fe',
    name: '레이더',
    icon: Radar,
    link: '/category/e300e901-0e6f-412b-94e2-9377cbdcd1fe',
  },
  {
    id: 'f087bf5e-b9c4-4635-8001-5e03502c07db',
    name: '무선/통신장비',
    icon: Radio,
    link: '/category/f087bf5e-b9c4-4635-8001-5e03502c07db',
  },
  {
    id: '48a9917e-ce2b-45ea-9582-50c57402f32b',
    name: '항해 조타장비',
    icon: Anchor,
    link: '/category/48a9917e-ce2b-45ea-9582-50c57402f32b',
  },
  {
    id: 'f318d31f-797e-4cba-8088-70429352ca90',
    name: '해상용 안테나/헤딩센서',
    icon: Antenna,
    link: '/category/f318d31f-797e-4cba-8088-70429352ca90',
  },
  {
    id: '2104eb29-9c36-41f0-b03d-4764350a7c01',
    name: '트롤링모터',
    icon: Zap,
    link: '/category/2104eb29-9c36-41f0-b03d-4764350a7c01',
  },
  {
    id: '46ac42c9-90f5-41af-8803-5debcfa0ac95',
    name: '자이로 안정기',
    icon: RotateCcw,
    link: '/category/46ac42c9-90f5-41af-8803-5debcfa0ac95',
  },
  {
    id: '80a6a1f4-61ee-414f-99bb-251cd2d800b0',
    name: '항해 안전장비',
    icon: Shield,
    link: '/category/80a6a1f4-61ee-414f-99bb-251cd2d800b0',
  },
  {
    id: 'd447d9c6-960a-44da-b934-7ec79d5cd645',
    name: '부품 및 액세서리',
    icon: Package,
    link: '/category/d447d9c6-960a-44da-b934-7ec79d5cd645',
  },
];
