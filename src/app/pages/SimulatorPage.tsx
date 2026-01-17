import { useState } from 'react';
import { formatPrice } from '../../utils/format';
import { Product, EquipmentPosition, SelectedEquipment } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

// 전자장비 위치 정의
const EQUIPMENT_POSITIONS: EquipmentPosition[] = [
  { id: 'gps-plotter', name: 'GPS 플로터', x: 45, y: 25, category: 'GPS' },
  { id: 'radar', name: '레이더', x: 50, y: 15, category: 'Radar' },
  { id: 'vhf-radio', name: 'VHF 무선기', x: 20, y: 30, category: 'VHF' },
  { id: 'thruster', name: '스러스터', x: 15, y: 70, category: 'Thruster' },
  { id: 'fishfinder', name: '어군탐지기', x: 75, y: 50, category: 'Fishfinder' },
  { id: 'autopilot', name: '자동조타', x: 60, y: 60, category: 'Autopilot' },
];

// 샘플 제품 데이터 (실제로는 API에서 가져와야 함)
const SAMPLE_PRODUCTS: Record<string, Product[]> = {
  'GPS': [
    { id: '1', name: 'GARMIN GPSMAP 1243 (12")', price: 2300000, image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400' },
    { id: '2', name: 'RAYMARINE Axiom 9 (9")', price: 1850000, image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400' },
    { id: '3', name: 'FURUNO GP-1871F (7")', price: 1450000, image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400' },
  ],
  'Radar': [
    { id: '4', name: 'FURUNO DRS4W 4kW 레이더', price: 3800000, image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400' },
    { id: '5', name: 'GARMIN GMR 24 xHD2 레이더', price: 4200000, image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400' },
  ],
  'VHF': [
    { id: '6', name: 'ICOM IC-M506 고정형 VHF', price: 450000, image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400' },
    { id: '7', name: 'STANDARD HORIZON GX2400 VHF', price: 380000, image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400' },
  ],
  'Thruster': [
    { id: '8', name: 'SIDE-POWER SE100/185T 스러스터', price: 3200000, image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400' },
  ],
  'Fishfinder': [
    { id: '9', name: 'LOWRANCE HDS-12 LIVE 어군탐지기', price: 2890000, image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400' },
    { id: '10', name: 'GARMIN STRIKER Plus 7sv', price: 1250000, image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400' },
  ],
  'Autopilot': [
    { id: '11', name: 'RAYMARINE EV-200 자동조타', price: 2800000, image: 'https://images.unsplash.com/photo-1719448081072-8090553a77fe?w=400' },
  ],
};

// 세트 정의
const EQUIPMENT_SETS = {
  premium: {
    id: 'premium',
    name: '명장세트',
    description: '프리미엄 제품으로 구성된 최고급 세트',
    equipment: [
      { positionId: 'gps-plotter', productId: '1' },
      { positionId: 'radar', productId: '4' },
      { positionId: 'vhf-radio', productId: '6' },
      { positionId: 'fishfinder', productId: '9' },
      { positionId: 'autopilot', productId: '11' },
    ],
  },
  value: {
    id: 'value',
    name: '가성비세트',
    description: '합리적인 가격의 실용적인 세트',
    equipment: [
      { positionId: 'gps-plotter', productId: '3' },
      { positionId: 'vhf-radio', productId: '7' },
      { positionId: 'fishfinder', productId: '10' },
    ],
  },
  budget: {
    id: 'budget',
    name: '가심비세트',
    description: '경제적인 가격의 기본 세트',
    equipment: [
      { positionId: 'gps-plotter', productId: '2' },
      { positionId: 'vhf-radio', productId: '7' },
    ],
  },
};

export function SimulatorPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, SelectedEquipment>>(
    EQUIPMENT_POSITIONS.reduce((acc, pos) => {
      acc[pos.id] = { positionId: pos.id, product: null };
      return acc;
    }, {} as Record<string, SelectedEquipment>)
  );
  const [selectedPosition, setSelectedPosition] = useState<EquipmentPosition | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);

  const handlePositionClick = (position: EquipmentPosition) => {
    setSelectedPosition(position);
    setIsDialogOpen(true);
  };

  const handleProductSelect = (product: Product) => {
    if (selectedPosition) {
      setSelectedEquipment((prev: Record<string, SelectedEquipment>) => ({
        ...prev,
        [selectedPosition.id]: {
          positionId: selectedPosition.id,
          product,
        },
      }));
      setIsDialogOpen(false);
      setSelectedPosition(null);
    }
  };

  const handleSetSelect = (setId: keyof typeof EQUIPMENT_SETS) => {
    const set = EQUIPMENT_SETS[setId];
    const newSelection: Record<string, SelectedEquipment> = { ...selectedEquipment };

    // 기존 선택 초기화
    Object.keys(newSelection).forEach((key) => {
      newSelection[key] = { positionId: key, product: null };
    });

    // 세트의 장비 적용
    set.equipment.forEach((eq) => {
      const position = EQUIPMENT_POSITIONS.find((p) => p.id === eq.positionId);
      if (position) {
        const category = position.category;
        const products = SAMPLE_PRODUCTS[category] || [];
        const product = products.find((p) => p.id === eq.productId);
        if (product) {
          newSelection[eq.positionId] = {
            positionId: eq.positionId,
            product,
          };
        }
      }
    });

    setSelectedEquipment(newSelection as Record<string, SelectedEquipment>);
  };

  const handleRemoveEquipment = (positionId: string) => {
    setSelectedEquipment((prev: Record<string, SelectedEquipment>) => ({
      ...prev,
      [positionId]: { positionId, product: null },
    }));
  };

  const calculateTotal = (): number => {
    const equipmentArray: SelectedEquipment[] = Object.values(selectedEquipment) as SelectedEquipment[];
    const equipmentTotal = equipmentArray.reduce(
      (sum: number, eq: SelectedEquipment) => sum + (eq.product?.price || 0),
      0
    );
    const installationFee = includeInstallation ? 300000 : 0;
    return equipmentTotal + installationFee;
  };

  const getAvailableProducts = () => {
    if (!selectedPosition) return [];
    return SAMPLE_PRODUCTS[selectedPosition.category] || [];
  };

  const equipmentArray: SelectedEquipment[] = Object.values(selectedEquipment) as SelectedEquipment[];
  const selectedProducts = equipmentArray
    .filter((eq: SelectedEquipment) => eq.product !== null)
    .map((eq: SelectedEquipment) => eq.product!);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* 세트 버튼 */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => handleSetSelect('premium')}
            variant="outline"
            className="px-6 py-3 text-lg"
          >
            명장세트
          </Button>
          <Button
            onClick={() => handleSetSelect('value')}
            variant="outline"
            className="px-6 py-3 text-lg"
          >
            가성비세트
          </Button>
          <Button
            onClick={() => handleSetSelect('budget')}
            variant="outline"
            className="px-6 py-3 text-lg"
          >
            가심비세트
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 배 이미지 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">선박 장비 배치</h2>
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '500px' }}>
                {/* 배 이미지 배경 */}
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)' }}
                >
                  {/* 바다 파도 */}
                  <path
                    d="M 0 400 Q 200 380 400 400 T 800 400 L 800 450 L 0 450 Z"
                    fill="#3b82f6"
                    opacity="0.3"
                  />
                  
                  {/* 배 본체 (선박 하부) */}
                  <path
                    d="M 120 280 Q 180 240 250 240 L 550 240 Q 620 240 680 280 L 680 360 Q 620 400 550 400 L 250 400 Q 180 400 120 360 Z"
                    fill="#ffffff"
                    stroke="#1e40af"
                    strokeWidth="4"
                  />
                  
                  {/* 배 상부 구조물 (플라이브리지) */}
                  <rect x="280" y="180" width="240" height="80" fill="#f0f9ff" stroke="#1e40af" strokeWidth="2" rx="8" />
                  <rect x="300" y="200" width="200" height="40" fill="#ffffff" stroke="#1e40af" strokeWidth="1" rx="4" />
                  
                  {/* 마스트 */}
                  <line x1="400" y1="180" x2="400" y2="60" stroke="#1e40af" strokeWidth="5" />
                  <circle cx="400" cy="60" r="18" fill="#1e40af" />
                  
                  {/* 선수부 */}
                  <path
                    d="M 120 280 Q 100 260 90 280 Q 100 300 120 320"
                    fill="#e0f2fe"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                  
                  {/* 선미부 */}
                  <path
                    d="M 680 280 Q 700 260 710 280 Q 700 300 680 320"
                    fill="#e0f2fe"
                    stroke="#1e40af"
                    strokeWidth="2"
                  />
                </svg>

                {/* 전자장비 위치 마커 */}
                {EQUIPMENT_POSITIONS.map((position) => {
                  const selected = selectedEquipment[position.id]?.product;
                  return (
                    <div
                      key={position.id}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handlePositionClick(position)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          selected
                            ? 'bg-primary border-primary scale-150'
                            : 'bg-white border-primary hover:scale-125'
                        }`}
                      />
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white px-2 py-1 rounded text-xs">
                        {position.name}
                        {selected && `: ${selected.name}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 견적 요약 영역 */}
          <div className="lg:col-span-1">
            <div className="bg-primary text-primary-foreground rounded-lg p-6 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold mb-6">나의 견적</h2>

              <div className="space-y-4 mb-6">
                {selectedProducts.length === 0 ? (
                  <p className="text-sm opacity-80">선택된 장비가 없습니다.</p>
                ) : (
                  selectedProducts.map((product) => {
                    const position = EQUIPMENT_POSITIONS.find(
                      (p) => selectedEquipment[p.id]?.product?.id === product.id
                    );
                    return (
                      <div key={product.id} className="flex justify-between items-start pb-3 border-b border-primary-foreground/20">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{product.name}</p>
                          {position && (
                            <p className="text-xs opacity-80 mt-1">{position.name}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                          <button
                            onClick={() => handleRemoveEquipment(position?.id || '')}
                            className="text-xs opacity-60 hover:opacity-100 mt-1 underline"
                          >
                            제거
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation((e.target as HTMLInputElement).checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">설치비 (+{formatPrice(300000)})</span>
                </label>
              </div>

              <div className="border-t border-primary-foreground/20 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">총 견적</span>
                  <span className="text-2xl font-bold">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
                disabled={selectedProducts.length === 0}
              >
                견적 문의하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 제품 선택 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPosition?.name} 선택
            </DialogTitle>
            <DialogDescription>
              원하는 제품을 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {getAvailableProducts().map((product) => (
              <div
                key={product.id}
                className="cursor-pointer group block bg-white border border-border hover:border-primary transition-colors"
                onClick={() => handleProductSelect(product)}
              >
                <div className="aspect-square w-full overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg text-primary">{formatPrice(product.price)}</p>
                    {product.tag && (
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

