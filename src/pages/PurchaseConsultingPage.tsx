import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Phone, Video, Loader2, Edit2, LogIn } from 'lucide-react';
import { useAuth } from '@features/auth';
import { apiPost, apiGet, apiPatch } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { ROUTES } from '@shared/constants/routes';
import { ConsultingRequest, CONSULTING_STATUS_LABELS } from '@shared/types';
import { Button } from '@shared/components/ui/button';

export function PurchaseConsultingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [consultingType, setConsultingType] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [vesselType, setVesselType] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [purpose, setPurpose] = useState('');
  const [budget, setBudget] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [requests, setRequests] = useState<ConsultingRequest[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // 수정 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const types = [
    { value: 'leisure', label: '레저/취미용', icon: Ship, desc: '개인 레저 및 취미 활동용' },
    { value: 'fishing', label: '어업용', icon: Ship, desc: '상업적 어업 활동용' },
    { value: 'aquaculture', label: '양식/사육용', icon: Ship, desc: '양식장 및 사육 시설용' },
    { value: 'other', label: '기타 용도', icon: Ship, desc: '기타 특수 용도' },
  ];

  const contactMethods = [
    { value: '전화 상담', label: '전화 상담', icon: Phone, desc: '전문가와 직접 통화' },
    { value: '방문 상담', label: '방문 상담', icon: Ship, desc: '매장 또는 현장 방문' },
    { value: '온라인 미팅', label: '온라인 미팅', icon: Video, desc: '화상 상담 진행' },
  ];

  const loadRequests = async () => {
    setListLoading(true);
    try {
      const data = await apiGet<ConsultingRequest[]>(API_ENDPOINTS.CONSULTING_ME);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
          <LogIn className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground text-sm mb-6">
            구매 컨설팅 서비스 이용을 위해 로그인이 필요합니다.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(ROUTES.LOGIN, { state: { from: ROUTES.PURCHASE_CONSULTING } })}>
              로그인하기
            </Button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-border hover:bg-secondary transition-colors rounded-lg text-sm"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmitError('');
    if (!purpose.trim()) {
      setSubmitError('사용 목적을 입력해주세요.');
      return;
    }

    const typeLabel = types.find(t => t.value === consultingType)?.label ?? '구매';
    const title = `[${typeLabel}] 컨설팅 신청`;

    const lines: string[] = [];
    if (consultingType) lines.push(`컨설팅 유형: ${typeLabel}`);
    if (vesselType) lines.push(`선종: ${vesselType}`);
    if (tonnage) lines.push(`톤수: ${tonnage}`);
    lines.push(`\n사용 목적:\n${purpose.trim()}`);
    if (budget) lines.push(`\n예산: ${budget}`);
    if (contactMethod) lines.push(`\n상담 방식: ${contactMethod}`);
    if (scheduleDate) lines.push(`희망 일정: ${scheduleDate} ${scheduleTime}`);
    if (contactName) lines.push(`\n이름: ${contactName}`);
    if (contactPhone) lines.push(`연락처: ${contactPhone}`);
    if (contactEmail) lines.push(`이메일: ${contactEmail}`);

    setSubmitting(true);
    try {
      await apiPost(API_ENDPOINTS.CONSULTING, { title, content: lines.join('\n') });
      setSubmitSuccess('컨설팅이 신청되었습니다. 24시간 이내에 담당자가 연락드립니다.');
      setConsultingType('');
      setContactMethod('');
      setVesselType('');
      setTonnage('');
      setPurpose('');
      setBudget('');
      setScheduleDate('');
      setScheduleTime('09:00');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      await loadRequests();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setEditSubmitting(true);
    try {
      await apiPatch(API_ENDPOINTS.CONSULTING_ITEM(id), { title: editTitle.trim(), content: editContent.trim() });
      setEditingId(null);
      await loadRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {CONSULTING_STATUS_LABELS[status as keyof typeof CONSULTING_STATUS_LABELS] ?? status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl mb-4 text-center">구매 컨설팅</h1>
          <p className="text-center text-muted-foreground mb-12">
            선박 / 용도 / 예산에 맞춘 최적의 장비 구성을 제안해드립니다
          </p>

          {/* Consulting Types */}
          <div className="mb-8">
            <label className="block mb-4">
              컨설팅 유형 <span className="text-sm text-muted-foreground">(사용 용도)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {types.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setConsultingType(type.value)}
                  className={`p-6 border text-center transition-all ${
                    consultingType === type.value
                      ? 'border-primary bg-blue-50'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <type.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold mb-1">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Vessel Information */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl">선박 정보</h3>

            <div>
              <label className="block mb-2">
                선종 <span className="text-sm text-muted-foreground">(선박 형태)</span>
              </label>
              <select
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-white"
              >
                <option value="">선택하세요</option>
                <option value="요트">요트</option>
                <option value="어선">어선</option>
                <option value="유람선">유람선</option>
                <option value="낚시선">낚시선</option>
                <option value="스피드보트">스피드보트</option>
                <option value="요트(범선)">요트(범선)</option>
                <option value="카타마란">카타마란</option>
                <option value="페리">페리</option>
                <option value="작업선">작업선</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">톤수</label>
              <input
                type="text"
                value={tonnage}
                onChange={(e) => setTonnage(e.target.value)}
                placeholder="예: 5톤"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">사용 목적</label>
              <textarea
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="주요 사용 목적과 운항 지역을 입력해주세요"
                className="w-full px-4 py-3 border border-border bg-white resize-none"
              />
            </div>

            <div>
              <label className="block mb-2">예산 (선택)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="희망 예산을 입력해주세요"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>
          </div>

          {/* Contact Method */}
          <div className="mb-8">
            <label className="block mb-4">상담 방식</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setContactMethod(method.value)}
                  className={`p-6 border text-center transition-all ${
                    contactMethod === method.value
                      ? 'border-primary bg-blue-50'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <method.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="mb-1">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-8 space-y-4">
            <label className="block">희망 일정</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">날짜</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">시간</label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-white"
                >
                  <option>09:00</option>
                  <option>10:00</option>
                  <option>11:00</option>
                  <option>14:00</option>
                  <option>15:00</option>
                  <option>16:00</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-8 space-y-4">
            <h3 className="text-xl">연락처 정보</h3>

            <div>
              <label className="block mb-2">이름</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">연락처</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">이메일 (선택)</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>
          </div>

          {submitError && (
            <p className="mb-4 text-sm text-destructive">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="mb-4 text-sm text-green-600">{submitSuccess}</p>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            구매 컨설팅 예약하기
          </button>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-secondary border border-border">
            <h4 className="mb-4">구매 컨설팅 안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 예약 후 24시간 이내에 담당자가 연락드립니다</li>
              <li>• 상담은 약 30분~1시간 정도 소요됩니다</li>
              <li>• 컨설팅 서비스는 무료입니다</li>
              <li>• 필요시 현장 방문 상담도 가능합니다</li>
              <li>• 전문가의 상세한 장비 구성 제안서를 받으실 수 있습니다</li>
            </ul>
          </div>

          {/* 내 신청 목록 */}
          <div className="mt-12">
            <h3 className="text-xl mb-4">내 신청 목록</h3>
            {listLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                불러오는 중...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border border-dashed border-border">
                신청 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="border border-border p-4">
                    {editingId === req.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-border bg-white text-sm"
                        />
                        <textarea
                          rows={4}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-border bg-white text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubmit(req.id)}
                            disabled={editSubmitting}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-accent disabled:opacity-50"
                          >
                            {editSubmitting ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-border text-sm hover:bg-secondary"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {statusBadge(req.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="font-medium">{req.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.content}</p>
                        </div>
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => { setEditingId(req.id); setEditTitle(req.title); setEditContent(req.content); }}
                            className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
