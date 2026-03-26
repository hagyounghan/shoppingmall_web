import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiPost, apiGet, apiPatch } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { ROUTES } from '../../constants/routes';
import { UsabilityServiceRequest, USABILITY_STATUS_LABELS } from '../../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

type View = 'list' | 'create' | 'edit';

export function UsabilityServicePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<View>('list');
  const [requests, setRequests] = useState<UsabilityServiceRequest[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setListLoading(true);
    try {
      const data = await apiGet<UsabilityServiceRequest[]>(API_ENDPOINTS.USABILITY_SERVICES_ME);
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadRequests();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-3xl mb-4">사용성 서비스</h1>
            <p className="text-muted-foreground mb-8">
              구매하신 제품을 더 잘 활용할 수 있도록 사용 방법을 안내해드립니다.
              <br />서비스 이용을 위해 로그인이 필요합니다.
            </p>
            <Button onClick={() => navigate(ROUTES.LOGIN)}>로그인하기</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost(API_ENDPOINTS.USABILITY_SERVICES, { title: title.trim(), content: content.trim() });
      setSuccess('서비스가 신청되었습니다.');
      setTitle('');
      setContent('');
      setView('list');
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (req: UsabilityServiceRequest) => {
    setEditingId(req.id);
    setTitle(req.title);
    setContent(req.content);
    setError('');
    setSuccess('');
    setView('edit');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await apiPatch(API_ENDPOINTS.USABILITY_SERVICE_ITEM(editingId), { title: title.trim(), content: content.trim() });
      setSuccess('수정되었습니다.');
      setEditingId(null);
      setTitle('');
      setContent('');
      setView('list');
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setError('');
    setView('list');
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {USABILITY_STATUS_LABELS[status as keyof typeof USABILITY_STATUS_LABELS] ?? status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl">사용성 서비스</h1>
              <p className="text-muted-foreground mt-1">
                구매하신 제품의 사용 방법 안내 및 문의
              </p>
            </div>
            {view === 'list' && (
              <Button onClick={() => { setError(''); setSuccess(''); setView('create'); }}>
                <Plus className="w-4 h-4 mr-2" />
                신청하기
              </Button>
            )}
          </div>

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* 신청 / 수정 폼 */}
          {(view === 'create' || view === 'edit') && (
            <div className="border border-border rounded-lg p-6 mb-8 bg-secondary">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {view === 'create' ? '서비스 신청' : '신청 수정'}
                </h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={view === 'create' ? handleCreate : handleEdit} className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="어떤 도움이 필요하신가요? (예: 어탐기 설정 방법 문의)"
                    maxLength={150}
                    className="mt-1"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="content">내용 <span className="text-destructive">*</span></Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="문의하실 내용을 자세히 적어주세요. 제품명, 증상, 원하시는 안내 방법 등을 포함해 주시면 더 빠른 도움을 드릴 수 있습니다."
                    rows={6}
                    disabled={submitting}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {view === 'create' ? '신청하기' : '수정하기'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    취소
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 내 신청 목록 */}
          {view === 'list' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">내 신청 목록</h2>
              {listLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  불러오는 중...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <p className="mb-4">아직 신청 내역이 없습니다.</p>
                  <Button variant="outline" onClick={() => setView('create')}>
                    첫 신청하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-border rounded-lg p-4 bg-white flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {statusBadge(req.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="font-medium truncate">{req.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.content}</p>
                      </div>
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleEditStart(req)}
                          className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 안내 */}
          <div className="mt-12 p-6 bg-secondary border border-border rounded-lg">
            <h4 className="mb-3 font-semibold">사용성 서비스 안내</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 신청 후 24시간 이내에 담당자가 연락드립니다</li>
              <li>• 접수 대기(PENDING) 상태에서만 내용을 수정할 수 있습니다</li>
              <li>• 서비스는 무료로 제공됩니다</li>
              <li>• 평일 09:00 - 18:00에 운영됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
