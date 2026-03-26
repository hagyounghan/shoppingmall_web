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
  slug: string;
  name: string;
  icon: LucideIcon;
}

/** 메인 카테고리 정의 — slug가 서버 DB의 slug와 1:1 대응 */
export const CATEGORIES: CategoryItem[] = [
  { slug: 'gps-plotter',      name: 'GPS플로터',       icon: Navigation },
  { slug: 'radar',            name: '레이더',           icon: Radar      },
  { slug: 'vhf-radio',        name: '무선/통신장비',    icon: Radio      },
  { slug: 'autopilot',        name: '항해 조타장비',    icon: Anchor     },
  { slug: 'antenna',          name: '안테나/헤딩센서',  icon: Antenna    },
  { slug: 'trolling-motor',   name: '트롤링모터',       icon: Zap        },
  { slug: 'gyro-stabilizer',  name: '자이로 안정기',    icon: RotateCcw  },
  { slug: 'safety',           name: '항해 안전장비',    icon: Shield     },
  { slug: 'accessories',      name: '부품 및 액세서리', icon: Package    },
];
