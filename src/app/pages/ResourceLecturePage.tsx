import { useState, useEffect } from 'react';
import { Play, BookOpen, Eye, Calendar } from 'lucide-react';
import { apiGet } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { Lecture, PaginatedResponse } from '../../types';

function getYoutubeThumbnail(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return '';
}

function getYoutubeUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (match) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return url;
}

export function ResourceLecturePage() {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [topics, setTopics] = useState<string[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const take = 12;

  useEffect(() => {
    apiGet<string[]>(API_ENDPOINTS.LECTURE_TOPICS)
      .then((data) => setTopics(data))
      .catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedTopic]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), take: String(take) });
    if (selectedTopic !== 'all') params.set('topic', selectedTopic);
    apiGet<PaginatedResponse<Lecture>>(`${API_ENDPOINTS.LECTURES}?${params.toString()}`)
      .then((data) => {
        setLectures(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => setLectures([]))
      .finally(() => setLoading(false));
  }, [selectedTopic, page]);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">강의실</h1>
            {total > 0 && <span className="text-muted-foreground text-sm">({total}개)</span>}
          </div>

          {/* Topic Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedTopic === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white border border-border hover:border-primary'
              }`}
            >
              전체
            </button>
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTopic === topic
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Lectures Grid */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">불러오는 중...</div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              해당 주제의 강의가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lecture) => {
                const thumbnail = getYoutubeThumbnail(lecture.youtubeUrl);
                return (
                  <a
                    key={lecture.id}
                    href={getYoutubeUrl(lecture.youtubeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-video bg-muted">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={lecture.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Play className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-primary ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {lecture.topic && (
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded mb-2">
                          {lecture.topic}
                        </span>
                      )}
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {lecture.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {lecture.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lecture.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-border bg-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    p === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-white hover:border-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-border bg-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
