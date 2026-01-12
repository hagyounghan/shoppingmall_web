import { useState } from 'react';
import { MapPin, Plus, Download, Trash2, Edit } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function FishingPointsPage() {
  const [showAddPoint, setShowAddPoint] = useState(false);

  const sdCards = [
    {
      id: '1',
      name: '서해안 프리미엄 낚시포인트 SD',
      region: '서해',
      points: 150,
      price: 89000,
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      description: '인천, 대부도, 안산 등 서해안 주요 낚시포인트',
    },
    {
      id: '2',
      name: '남해안 황금 낚시포인트 SD',
      region: '남해',
      points: 200,
      price: 99000,
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      description: '여수, 통영, 거제 등 남해안 핵심 포인트',
    },
    {
      id: '3',
      name: '동해안 전문가 낚시포인트 SD',
      region: '동해',
      points: 120,
      price: 79000,
      image: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
      description: '포항, 울산, 강릉 등 동해안 명당 포인트',
    },
    {
      id: '4',
      name: '제주도 특선 낚시포인트 SD',
      region: '제주',
      points: 180,
      price: 95000,
      image: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
      description: '제주도 전역 우수 낚시포인트',
    },
  ];

  const myPoints = [
    {
      id: '1',
      name: '대부도 방아머리',
      lat: '37.2456',
      lon: '126.5789',
      memo: '우럭, 광어 포인트. 만조 2시간 전후 입질 활발',
      date: '2024.12.15',
    },
    {
      id: '2',
      name: '영흥도 북쪽',
      lat: '37.2589',
      lon: '126.4123',
      memo: '봄철 농어 포인트. 갯바위 주변',
      date: '2024.11.28',
    },
    {
      id: '3',
      name: '인천대교 남단',
      lat: '37.3456',
      lon: '126.6234',
      memo: '도다리, 노래미. 야간 조황 좋음',
      date: '2024.10.20',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl mb-4">낚시포인트</h1>
          <p className="text-muted-foreground mb-12">
            검증된 낚시포인트 SD 카드를 구매하거나, 나만의 포인트를 등록하세요
          </p>

          {/* SD Card Purchase Section */}
          <div className="mb-16">
            <h2 className="text-2xl mb-6">낚시포인트 SD 카드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sdCards.map((card) => (
                <div key={card.id} className="border border-border hover:border-primary transition-colors">
                  <div className="aspect-video w-full bg-muted">
                    <ImageWithFallback
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs mb-2">
                        {card.region}
                      </span>
                      <h3 className="text-sm mb-1">{card.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {card.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        포인트 수: {card.points}개
                      </p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="text-lg text-primary mb-3">
                        {card.price.toLocaleString()}원
                      </p>
                      <button className="w-full py-2 bg-primary text-primary-foreground hover:bg-accent transition-colors">
                        구매하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Fishing Points Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">내 낚시포인트</h2>
              <button
                onClick={() => setShowAddPoint(!showAddPoint)}
                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                포인트 추가
              </button>
            </div>

            {/* Add Point Form */}
            {showAddPoint && (
              <div className="mb-6 p-6 border border-primary bg-blue-50">
                <h3 className="text-xl mb-4">새 낚시포인트 추가</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">포인트 이름</label>
                    <input
                      type="text"
                      placeholder="예: 대부도 방아머리"
                      className="w-full px-4 py-3 border border-border bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">위도 (Latitude)</label>
                      <input
                        type="text"
                        placeholder="37.2456"
                        className="w-full px-4 py-3 border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">경도 (Longitude)</label>
                      <input
                        type="text"
                        placeholder="126.5789"
                        className="w-full px-4 py-3 border border-border bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">메모</label>
                    <textarea
                      rows={3}
                      placeholder="어종, 시간대, 특이사항 등을 메모하세요"
                      className="w-full px-4 py-3 border border-border bg-white resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-primary text-primary-foreground hover:bg-accent transition-colors">
                      저장
                    </button>
                    <button
                      onClick={() => setShowAddPoint(false)}
                      className="flex-1 py-3 border border-border hover:bg-secondary transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Points List */}
            <div className="space-y-3">
              {myPoints.map((point) => (
                <div
                  key={point.id}
                  className="border border-border p-6 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg mb-2">{point.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <p>위도: {point.lat} / 경도: {point.lon}</p>
                          <p className="text-foreground">{point.memo}</p>
                          <p>등록일: {point.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="p-2 border border-border hover:bg-secondary transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="p-2 border border-border hover:bg-secondary transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 border border-border hover:bg-red-50 hover:border-destructive text-destructive transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Notice */}
          <div className="mt-12 p-6 bg-secondary border border-border">
            <h4 className="mb-4">낚시포인트 안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• SD 카드 구매 시 GPS 플로터에 즉시 사용 가능한 포인트 데이터가 제공됩니다</li>
              <li>• 구매한 SD 카드는 대부분의 GARMIN, LOWRANCE, FURUNO 기기와 호환됩니다</li>
              <li>• 나만의 포인트는 CSV 파일로 다운로드하여 백업할 수 있습니다</li>
              <li>• 등록한 포인트는 GPS 좌표를 기준으로 자동 저장됩니다</li>
              <li>• 포인트 공유 기능은 준비 중입니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
