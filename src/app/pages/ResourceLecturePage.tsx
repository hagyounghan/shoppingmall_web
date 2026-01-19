import { useState } from 'react';
import { Play, Clock, BookOpen } from 'lucide-react';

export function ResourceLecturePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'gps', label: 'GPS 플로터' },
    { value: 'fishfinder', label: '어군탐지기' },
    { value: 'radar', label: '레이더' },
    { value: 'vhf', label: 'VHF 무선기' },
  ];

  const lectures = [
    {
      id: '1',
      title: 'GARMIN GPSMAP 8612 기본 사용법',
      category: 'gps',
      duration: '15:30',
      thumbnail: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=400',
      views: 1234,
      date: '2024.12.01',
    },
    {
      id: '2',
      title: 'LOWRANCE HDS-12 어군탐지기 설정',
      category: 'fishfinder',
      duration: '22:15',
      thumbnail: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=400',
      views: 856,
      date: '2024.11.25',
    },
    {
      id: '3',
      title: 'FURUNO 레이더 초기 설정 가이드',
      category: 'radar',
      duration: '18:45',
      thumbnail: 'https://images.unsplash.com/photo-1758248421325-6f3a1d92075a?w=400',
      views: 642,
      date: '2024.11.20',
    },
    {
      id: '4',
      title: 'VHF 무선기 채널 설정 및 사용법',
      category: 'vhf',
      duration: '12:20',
      thumbnail: 'https://images.unsplash.com/photo-1761768611884-383b80ea582d?w=400',
      views: 432,
      date: '2024.11.15',
    },
  ];

  const filteredLectures = selectedCategory === 'all' 
    ? lectures 
    : lectures.filter(lecture => lecture.category === selectedCategory);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">강의실</h1>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Lectures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-white rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lecture.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {lecture.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>조회 {lecture.views.toLocaleString()}</span>
                    <span>{lecture.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLectures.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              해당 카테고리의 강의가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

