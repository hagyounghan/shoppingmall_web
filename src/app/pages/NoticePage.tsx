import { useState, useEffect } from 'react';
import { Megaphone, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { apiGet } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { Notice, PaginatedResponse } from '../../types';

export function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const take = 10;

  useEffect(() => {
    setLoading(true);
    apiGet<PaginatedResponse<Notice>>(`${API_ENDPOINTS.NOTICES}?page=${page}&take=${take}`)
      .then((data) => {
        setNotices(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, [page]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Megaphone className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">공지사항</h1>
            {total > 0 && <span className="text-muted-foreground text-sm">({total}건)</span>}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">불러오는 중...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">등록된 공지사항이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`bg-white border rounded-lg overflow-hidden transition-colors hover:border-primary ${
                    notice.isImportant ? 'border-primary/40' : 'border-border'
                  }`}
                >
                  <button
                    onClick={() => toggle(notice.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {notice.isImportant && (
                        <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                          <Pin className="w-3 h-3" />
                          중요
                        </span>
                      )}
                      <span className={`font-medium truncate ${notice.isImportant ? 'text-primary' : ''}`}>
                        {notice.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      {expanded.has(notice.id)
                        ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </button>
                  {expanded.has(notice.id) && (
                    <div className="px-6 pb-6 pt-0 border-t border-border">
                      <p className="pt-4 text-muted-foreground whitespace-pre-line leading-relaxed">
                        {notice.content}
                      </p>
                      <p className="mt-4 text-xs text-muted-foreground">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')} 등록
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
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
