import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { Faq } from '@shared/types';

export function ResourceFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiGet<string[]>(API_ENDPOINTS.FAQ_CATEGORIES)
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    apiGet<Faq[]>(`${API_ENDPOINTS.FAQS}${params}`)
      .then((data) => setFaqs(data))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, [category]);

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
            <HelpCircle className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">FAQ</h1>
          </div>

          {/* 카테고리 필터 */}
          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-3">
              <button
                onClick={() => setCategory('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  category === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border border-border hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">불러오는 중...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">등록된 FAQ가 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      {faq.category && (
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded mb-2">
                          {faq.category}
                        </span>
                      )}
                      <h3 className="font-semibold">{faq.question}</h3>
                    </div>
                    <div className="flex-shrink-0">
                      {expanded.has(faq.id)
                        ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </button>
                  {expanded.has(faq.id) && (
                    <div className="px-5 pb-5 pt-0 border-t border-border">
                      <p className="pt-4 text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
