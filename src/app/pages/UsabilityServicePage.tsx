import { useState } from 'react';
import { HelpCircle, BookOpen, Video, MessageSquare, Check } from 'lucide-react';

export function UsabilityServicePage() {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [serviceType, setServiceType] = useState('');

  const myDevices = [
    { id: '1', name: 'GARMIN GPSMAP 8612', purchaseDate: '2024.01.15' },
    { id: '2', name: 'LOWRANCE HDS-12 LIVE', purchaseDate: '2023.11.20' },
    { id: '3', name: 'FURUNO DRS4W', purchaseDate: '2024.03.10' },
  ];

  const serviceTypes = [
    { 
      value: 'manual', 
      label: '사용 설명서', 
      icon: BookOpen, 
      desc: '제품 사용 방법 및 기능 설명서 제공' 
    },
    { 
      value: 'video', 
      label: '동영상 가이드', 
      icon: Video, 
      desc: '동영상으로 배우는 제품 사용법' 
    },
    { 
      value: 'chat', 
      label: '실시간 문의', 
      icon: MessageSquare, 
      desc: '전문가와 실시간 채팅 상담' 
    },
    { 
      value: 'help', 
      label: '기능 안내', 
      icon: HelpCircle, 
      desc: '특정 기능 사용 방법 안내' 
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl mb-4 text-center">사용성 서비스</h1>
          <p className="text-center text-muted-foreground mb-12">
            구매하신 제품을 더 잘 활용할 수 있도록 사용 방법을 안내해드립니다
          </p>

          {/* Service Types */}
          <div className="mb-8">
            <label className="block mb-4">
              서비스 유형 <span className="text-sm text-muted-foreground">(원하는 도움말 형태)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setServiceType(type.value)}
                  className={`p-6 border text-center transition-all ${
                    serviceType === type.value
                      ? 'border-primary bg-blue-50 shadow-md'
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

          {/* Device Selection */}
          <div className="mb-8">
            <label className="block mb-4">제품 선택</label>
            <div className="space-y-3">
              {myDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`w-full p-4 border text-left flex items-center justify-between transition-all ${
                    selectedDevice === device.id
                      ? 'border-primary bg-blue-50'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{device.name}</p>
                    <p className="text-sm text-muted-foreground">구매일: {device.purchaseDate}</p>
                  </div>
                  {selectedDevice === device.id && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question/Request */}
          <div className="mb-8">
            <label className="block mb-4">문의 내용</label>
            <textarea
              rows={6}
              placeholder="어떤 기능을 사용하고 싶으신가요? 또는 어떤 문제가 있으신가요?"
              className="w-full px-4 py-3 border border-border bg-white resize-none"
            />
          </div>

          {/* Contact Method */}
          <div className="mb-8">
            <label className="block mb-4">연락 방법</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'email', label: '이메일', desc: '이메일로 답변 받기' },
                { value: 'phone', label: '전화', desc: '전화로 안내 받기' },
                { value: 'chat', label: '채팅', desc: '실시간 채팅 상담' },
              ].map((method) => (
                <button
                  key={method.value}
                  className="p-4 border border-border hover:border-primary transition-colors text-left"
                >
                  <p className="font-semibold mb-1">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </button>
              ))}
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
              <label className="block mb-2">이메일</label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-border bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors">
            서비스 신청하기
          </button>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-secondary border border-border">
            <h4 className="mb-4">사용성 서비스 안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 신청 후 24시간 이내에 담당자가 연락드립니다</li>
              <li>• 제품 사용 방법에 대한 상세한 안내를 제공합니다</li>
              <li>• 서비스는 무료로 제공됩니다</li>
              <li>• 동영상 가이드 및 사용 설명서를 다운로드 받을 수 있습니다</li>
              <li>• 실시간 채팅 상담은 평일 09:00 - 18:00에 운영됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

