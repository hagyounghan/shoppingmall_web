import { useState } from 'react';
import { Check, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { ROUTES } from '@shared/constants/routes';
import { UsabilityServiceRequest } from '@shared/types';

const SYMPTOMS = [
  '전원이 켜지지 않음',
  '화면이 표시되지 않음',
  '터치 작동 불량',
  '통신 불량',
  '지도 표시 오류',
  '기타',
];

const SERVICE_TYPES = [
  { value: 'visit', label: '방문 서비스', desc: '전문가가 직접 방문합니다' },
  { value: 'shipping', label: '택배 접수', desc: '제품을 센터로 보내주세요' },
];

export function ServiceRequestPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [deviceName, setDeviceName] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <LogIn className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-6">A/S 신청은 회원만 이용할 수 있습니다.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="px-6 py-3 bg-primary text-primary-foreground hover:bg-accent transition-colors"
            >
              로그인하기
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-border hover:bg-secondary transition-colors"
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
          <h2 className="text-2xl font-bold mb-2">A/S 신청이 완료되었습니다!</h2>
          <p className="text-muted-foreground mb-2">1영업일 이내에 담당자가 연락드립니다.</p>
          <p className="text-sm text-muted-foreground mb-6">신청 내역은 마이페이지에서 확인하실 수 있습니다.</p>
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

    if (!deviceName.trim()) {
      setError('기기명을 입력해주세요.');
      return;
    }
    if (!selectedSymptom) {
      setError('증상을 선택해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    const title = `[A/S] ${deviceName} - ${selectedSymptom}`;

    const contentParts: string[] = [`증상: ${selectedSymptom}`];
    if (description) contentParts.push(`상세 설명:\n${description}`);
    if (serviceType) {
      const sType = SERVICE_TYPES.find(t => t.value === serviceType);
      contentParts.push(`서비스 유형: ${sType?.label || serviceType}`);
    }
    if (visitDate && serviceType === 'visit') contentParts.push(`방문 희망일: ${visitDate}`);

    const content = contentParts.join('\n');

    try {
      await apiPost<UsabilityServiceRequest>(API_ENDPOINTS.USABILITY_SERVICES, { title, content });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A/S 신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl mb-8 text-center">A/S 신청</h1>

          {/* Process Steps */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {['기기 정보', '증상 입력', '서비스 선택', '신청 완료'].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground mx-auto mb-2 flex items-center justify-center">
                  {idx + 1}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Device Name */}
            <div>
              <label className="block mb-4">
                고장 기기명 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="예: GARMIN GPSMAP 8612"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            {/* Symptom Selection */}
            <div>
              <label className="block mb-4">
                증상 선택 <span className="text-destructive">*</span>
              </label>
              <div className="space-y-2">
                {SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setSelectedSymptom(symptom)}
                    className={`w-full p-4 border text-left flex items-center justify-between transition-colors ${
                      selectedSymptom === symptom
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <span>{symptom}</span>
                    {selectedSymptom === symptom && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Description */}
            <div>
              <label className="block mb-4">상세 설명</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="증상에 대해 자세히 설명해주세요"
                className="w-full px-4 py-3 border border-border bg-white resize-none"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block mb-4">서비스 유형</label>
              <div className="grid grid-cols-2 gap-4">
                {SERVICE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setServiceType(type.value)}
                    className={`p-6 border text-left transition-colors ${
                      serviceType === type.value
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <p className="mb-1 font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection for visit */}
            {serviceType === 'visit' && (
              <div>
                <label className="block mb-4">방문 희망 날짜</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-white"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? '신청 중...' : 'A/S 신청하기'}
              </button>
            </div>
          </form>

          {/* Notice */}
          <div className="mt-12 p-6 bg-secondary border border-border">
            <h4 className="mb-4">A/S 안내사항</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 신청 후 1영업일 이내에 담당자가 연락드립니다</li>
              <li>• 보증기간 내 무상 A/S가 가능합니다</li>
              <li>• 방문 서비스는 수도권 지역만 가능합니다</li>
              <li>• 택배 접수 시 왕복 배송비가 발생할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
