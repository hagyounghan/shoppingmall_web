import {
  Radar,
  Navigation,
  Radio,
  Anchor,
  Antenna,
  Battery,
  Cable,
  Package,
} from 'lucide-react';
import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    icon: Navigation,
    label: 'GPS 플로터',
    link: '/category/gps',
  },
  {
    icon: Radar,
    label: '레이더',
    link: '/category/radar',
  },
  {
    icon: Radio,
    label: '통신장비',
    link: '/category/communication',
  },
  {
    icon: Anchor,
    label: '항법장비',
    link: '/category/navigation',
  },
  {
    icon: Antenna,
    label: '안테나',
    link: '/category/antenna',
  },
  {
    icon: Battery,
    label: '배터리',
    link: '/category/battery',
  },
  {
    icon: Cable,
    label: '전기관련',
    link: '/category/electrical',
  },
  {
    icon: Package,
    label: '액세서리',
    link: '/category/accessories',
  },
];

