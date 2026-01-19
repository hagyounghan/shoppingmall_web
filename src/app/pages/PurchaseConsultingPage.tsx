import { useState } from 'react';
import { Ship, Phone, Video } from 'lucide-react';

export function PurchaseConsultingPage() {
  const [consultingType, setConsultingType] = useState('');
  const [contactMethod, setContactMethod] = useState('');

  const types = [
    { value: 'leisure', label: '레저/취미용', icon: Ship, desc: '개인 레저 및 취미 활동용' },
    { value: 'fishing', label: '어업용', icon: Ship, desc: '상업적 어업 활동용' },
    { value: 'aquaculture', label: '양식/사육용', icon: Ship, desc: '양식장 및 사육 시설용' },
    { value: 'other', label: '기타 용도', icon: Ship, desc: '기타 특수 용도' },
  ];

  const contactMethods = [
    { value: 'phone', label: '전화 상담', icon: Phone, desc: '전문가와 직접 통화' },
    { value: 'visit', label: '방문 상담', icon: Ship, desc: '매장 또는 현장 방문' },
    { value: 'online', label: '온라인 미팅', icon: Video, desc: '화상 상담 진행' },
  ];

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
              <select className="w-full px-4 py-3 border border-border bg-white">
                <option value="">선택하세요</option>
                <option value="yacht">요트</option>
                <option value="fishing-boat">어선</option>
                <option value="cruise">유람선</option>
                <option value="fishing-vessel">낚시선</option>
                <option value="speedboat">스피드보트</option>
                <option value="sailboat">요트(범선)</option>
                <option value="catamaran">카타마란</option>
                <option value="ferry">페리</option>
                <option value="workboat">작업선</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">톤수</label>
              <input
                type="text"
                placeholder="예: 5톤"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">사용 목적</label>
              <textarea
                rows={4}
                placeholder="주요 사용 목적과 운항 지역을 입력해주세요"
                className="w-full px-4 py-3 border border-border bg-white resize-none"
              />
            </div>

            <div>
              <label className="block mb-2">예산 (선택)</label>
              <input
                type="text"
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
                  className="w-full px-4 py-3 border border-border bg-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">시간</label>
                <select className="w-full px-4 py-3 border border-border bg-white">
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
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">연락처</label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>

            <div>
              <label className="block mb-2">이메일 (선택)</label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors">
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
        </div>
      </div>
    </div>
  );
}

