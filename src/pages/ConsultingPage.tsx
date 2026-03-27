import { useState, useEffect } from 'react';
import { Ship, Phone, Video, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { ROUTES } from '@shared/constants/routes';
import { ConsultingRequest } from '@shared/types';

const CONSULTING_TYPES = [
  { value: 'leisure', label: '레저/취미용', icon: Ship, desc: '개인 레저 및 취미 활동용' },
  { value: 'fishing', label: '어업용', icon: Ship, desc: '상업적 어업 활동용' },
  { value: 'aquaculture', label: '양식/사육용', icon: Ship, desc: '양식장 및 사육 시설용' },
  { value: 'other', label: '기타 용도', icon: Ship, desc: '기타 특수 용도' },
];

const CONTACT_METHODS = [
  { value: 'phone', label: '전화 상담', icon: Phone, desc: '전문가와 직접 통화' },
  { value: 'visit', label: '방문 상담', icon: Ship, desc: '매장 또는 현장 방문' },
  { value: 'online', label: '온라인 미팅', icon: Video, desc: '화상 상담 진행' },
];

const VESSEL_TYPES = [
  { value: 'yacht', label: '요트' },
  { value: 'fishing-boat', label: '어선' },
  { value: 'cruise', label: '유람선' },
  { value: 'fishing-vessel', label: '낚시선' },
  { value: 'speedboat', label: '스피드보트' },
  { value: 'sailboat', label: '요트(범선)' },
  { value: 'catamaran', label: '카타마란' },
  { value: 'ferry', label: '페리' },
  { value: 'workboat', label: '작업선' },
  { value: 'other', label: '기타' },
];

export function ConsultingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [consultingType, setConsultingType] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [vesselType, setVesselType] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [purpose, setPurpose] = useState('');
  const [budget, setBudget] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('09:00');

  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setContactPhone(prev => prev || user.phone || '');
      setContactEmail(prev => prev || user.email || '');
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
          <LogIn className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground text-sm mb-6">구매 컨설팅 예약은 회원만 이용할 수 있습니다.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-accent transition-colors rounded-lg text-sm font-semibold"
            >
              로그인하기
            </button>
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

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">컨설팅 예약이 완료되었습니다!</h2>
          <p className="text-muted-foreground mb-2">예약 후 24시간 이내에 담당자가 연락드립니다.</p>
          <p className="text-sm text-muted-foreground mb-6">예약 내역은 마이페이지에서 확인하실 수 있습니다.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(ROUTES.MY_PAGE)}
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-accent transition-colors"
            >
              마이페이지에서 확인
            </button>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="px-6 py-3 border border-border hover:bg-secondary transition-colors"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultingType) {
      setError('컨설팅 유형을 선택해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    const typeLabelMap: Record<string, string> = {
      leisure: '레저/취미용',
      fishing: '어업용',
      aquaculture: '양식/사육용',
      other: '기타',
    };

    const title = `[${typeLabelMap[consultingType] || consultingType}] 컨설팅 요청`;

    const contentParts: string[] = [];
    if (vesselType) contentParts.push(`선종: ${VESSEL_TYPES.find(v => v.value === vesselType)?.label || vesselType}`);
    if (tonnage) contentParts.push(`톤수: ${tonnage}`);
    if (purpose) contentParts.push(`사용 목적:\n${purpose}`);
    if (budget) contentParts.push(`예산: ${budget}`);
    if (contactMethod) {
      const method = CONTACT_METHODS.find(m => m.value === contactMethod);
      contentParts.push(`상담 방식: ${method?.label || contactMethod}`);
    }
    if (preferredDate) contentParts.push(`희망 일정: ${preferredDate} ${preferredTime}`);
    if (contactPhone) contentParts.push(`연락처: ${contactPhone}`);
    if (contactEmail) contentParts.push(`이메일: ${contactEmail}`);

    const content = contentParts.join('\n') || '컨설팅을 요청합니다.';

    try {
      await apiPost<ConsultingRequest>(API_ENDPOINTS.CONSULTING, { title, content });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl mb-4 text-center">전문가 컨설팅</h1>
          <p className="text-center text-muted-foreground mb-12">
            선박 / 용도 / 예산에 맞춘 최적의 장비 구성을 제안해드립니다
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Consulting Types */}
            <div>
              <label className="block mb-4">
                컨설팅 유형 <span className="text-destructive">*</span>
                <span className="text-sm text-muted-foreground ml-2">(사용 용도)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CONSULTING_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setConsultingType(type.value)}
                    className={`p-6 border text-center transition-colors ${
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
            <div className="space-y-6">
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
                  {VESSEL_TYPES.map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
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
            <div>
              <label className="block mb-4">상담 방식</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONTACT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setContactMethod(method.value)}
                    className={`p-6 border text-center transition-colors ${
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
            <div className="space-y-4">
              <label className="block">희망 일정</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">날짜</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-3 border border-border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">시간</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-4 py-3 border border-border bg-white"
                  >
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className="space-y-4">
              <label className="block mb-2">연락처 정보</label>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 mb-3">
                <span className="font-semibold">{user?.name}</span>님 ({user?.email}) 계정으로 예약됩니다.
              </div>
              <div>
                <label className="block text-sm mb-2">휴대폰 번호</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 border border-border bg-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">이메일</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-border bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !consultingType}
              className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? '예약 중...' : '컨설팅 예약하기'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-secondary border border-border">
            <h4 className="mb-4">컨설팅 안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 예약 후 24시간 이내에 담당자가 연락드립니다</li>
              <li>• 상담은 약 30분~1시간 정도 소요됩니다</li>
              <li>• 컨설팅 서비스는 무료입니다</li>
              <li>• 필요시 현장 방문 상담도 가능합니다</li>
              <li>• 전문가의 상세한 장비 구성 제안서를 받으실 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
