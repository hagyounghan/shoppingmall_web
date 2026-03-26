import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, ChevronDown, ChevronUp, BadgeCheck } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { InquiryItem, PaginatedResponse } from '@shared/types';
import { useAuth } from '@features/auth';

type Tab = 'all' | 'mine';

export function ResourceQnAPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // ─── 전체 문의 상태 ────────────────────────────────────────────────────────
  const [inputKeyword, setInputKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryTotalPages, setInquiryTotalPages] = useState(0);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [expandedInquiry, setExpandedInquiry] = useState<Set<string>>(new Set());

  // ─── 내 문의 상태 ──────────────────────────────────────────────────────────
  const [myInquiries, setMyInquiries] = useState<InquiryItem[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [expandedMine, setExpandedMine] = useState<Set<string>>(new Set());

  // 전체 문의 fetch
  const fetchInquiries = useCallback((page: number, kw: string) => {
    setInquiryLoading(true);
    const params = new URLSearchParams({ page: String(page), take: '10' });
    if (kw) params.set('keyword', kw);
    apiGet<PaginatedResponse<InquiryItem>>(`${API_ENDPOINTS.INQUIRIES}?${params.toString()}`)
      .then((data) => {
        setInquiries(data.data);
        setInquiryTotal(data.total);
        setInquiryTotalPages(data.totalPages);
      })
      .catch(() => setInquiries([]))
      .finally(() => setInquiryLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'all') fetchInquiries(inquiryPage, keyword);
  }, [activeTab, inquiryPage, keyword, fetchInquiries]);

  // 내 문의 fetch
  useEffect(() => {
    if (activeTab === 'mine' && isAuthenticated) {
      setMyLoading(true);
      apiGet<InquiryItem[]>(API_ENDPOINTS.INQUIRIES_ME)
        .then((data) => setMyInquiries(data))
        .catch(() => setMyInquiries([]))
        .finally(() => setMyLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputKeyword.trim());
    setInquiryPage(1);
  };

  const toggleSet = (set: Set<string>, id: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const tabClass = (tab: Tab) =>
    `px-5 py-2.5 font-semibold border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-primary text-primary'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">문의답변</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-8 bg-white rounded-t-lg">
            <button className={tabClass('all')} onClick={() => setActiveTab('all')}>
              전체 문의
            </button>
            {isAuthenticated && (
              <button className={tabClass('mine')} onClick={() => setActiveTab('mine')}>
                내 문의
              </button>
            )}
          </div>

          {/* ─── 전체 문의 탭 ─────────────────────────────────────────────── */}
          {activeTab === 'all' && (
            <div>
              <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="제목 또는 내용으로 검색..."
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  검색
                </button>
              </form>

              {keyword && (
                <p className="mb-4 text-sm text-muted-foreground">
                  "{keyword}" 검색 결과 {inquiryTotal}건
                </p>
              )}

              {inquiryLoading ? (
                <div className="text-center py-12 text-muted-foreground">불러오는 중...</div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">문의가 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((item) => (
                    <div key={item.id} className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
                      <button
                        onClick={() => toggleSet(expandedInquiry, item.id, setExpandedInquiry)}
                        className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {item.isAnswered ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                답변완료
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded">
                                답변대기
                              </span>
                            )}
                            {user?.id === item.userId && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                                내 문의
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.userName} · {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedInquiry.has(item.id)
                            ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedInquiry.has(item.id) && (
                        <div className="px-5 pb-5 pt-0 border-t border-border">
                          <p className="pt-4 text-muted-foreground whitespace-pre-line">{item.content}</p>
                          {item.answer && (
                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                              <p className="text-xs font-semibold text-primary mb-2">관리자 답변</p>
                              <p className="text-sm whitespace-pre-line">{item.answer.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(item.answer.createdAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 페이지네이션 */}
              {inquiryTotalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}
                    disabled={inquiryPage === 1}
                    className="px-4 py-2 rounded-lg border border-border bg-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    이전
                  </button>
                  {Array.from({ length: inquiryTotalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setInquiryPage(p)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        p === inquiryPage
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-white hover:border-primary'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setInquiryPage((p) => Math.min(inquiryTotalPages, p + 1))}
                    disabled={inquiryPage === inquiryTotalPages}
                    className="px-4 py-2 rounded-lg border border-border bg-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── 내 문의 탭 ───────────────────────────────────────────────── */}
          {activeTab === 'mine' && (
            <div>
              {!isAuthenticated ? (
                <div className="text-center py-12 text-muted-foreground">
                  로그인 후 이용 가능합니다.
                </div>
              ) : myLoading ? (
                <div className="text-center py-12 text-muted-foreground">불러오는 중...</div>
              ) : myInquiries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">내가 작성한 문의가 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {myInquiries.map((item) => (
                    <div key={item.id} className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
                      <button
                        onClick={() => toggleSet(expandedMine, item.id, setExpandedMine)}
                        className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {item.isAnswered ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                답변완료
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded">
                                답변대기
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedMine.has(item.id)
                            ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedMine.has(item.id) && (
                        <div className="px-5 pb-5 pt-0 border-t border-border">
                          <p className="pt-4 text-muted-foreground whitespace-pre-line">{item.content}</p>
                          {item.answer && (
                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                              <p className="text-xs font-semibold text-primary mb-2">관리자 답변</p>
                              <p className="text-sm whitespace-pre-line">{item.answer.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(item.answer.createdAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
