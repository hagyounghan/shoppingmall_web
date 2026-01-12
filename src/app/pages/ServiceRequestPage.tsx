import { useState } from 'react';
import { Check, Upload } from 'lucide-react';

export function ServiceRequestPage() {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [serviceType, setServiceType] = useState('');

  const myDevices = [
    { id: '1', name: 'GARMIN GPSMAP 8612', purchaseDate: '2024.01.15' },
    { id: '2', name: 'LOWRANCE HDS-12 LIVE', purchaseDate: '2023.11.20' },
    { id: '3', name: 'FURUNO DRS4W', purchaseDate: '2024.03.10' },
  ];

  const symptoms = [
    '전원이 켜지지 않음',
    '화면이 표시되지 않음',
    '터치 작동 불량',
    '통신 불량',
    '지도 표시 오류',
    '기타',
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl mb-8 text-center">A/S 신청</h1>

          {/* Process Steps */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {['기기 선택', '증상 입력', '방문 선택', '신청 완료'].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground mx-auto mb-2 flex items-center justify-center">
                  {idx + 1}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-8">
            {/* Device Selection */}
            <div>
              <label className="block mb-4">고장 기기 선택</label>
              <div className="space-y-3">
                {myDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    className={`w-full p-4 border text-left flex items-center justify-between ${
                      selectedDevice === device.id
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div>
                      <p>{device.name}</p>
                      <p className="text-sm text-muted-foreground">구매일: {device.purchaseDate}</p>
                    </div>
                    {selectedDevice === device.id && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Selection */}
            <div>
              <label className="block mb-4">증상 선택</label>
              <select
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-white"
              >
                <option value="">증상을 선택하세요</option>
                {symptoms.map((symptom) => (
                  <option key={symptom} value={symptom}>
                    {symptom}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Description */}
            <div>
              <label className="block mb-4">상세 설명</label>
              <textarea
                rows={5}
                placeholder="증상에 대해 자세히 설명해주세요"
                className="w-full px-4 py-3 border border-border bg-white resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block mb-4">사진 첨부 (선택)</label>
              <div className="border-2 border-dashed border-border p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">클릭하여 사진을 업로드하세요</p>
                <p className="text-sm text-muted-foreground mt-2">최대 5장까지 등록 가능</p>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block mb-4">서비스 유형</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'visit', label: '방문 서비스', desc: '전문가가 직접 방문합니다' },
                  { value: 'shipping', label: '택배 접수', desc: '제품을 센터로 보내주세요' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setServiceType(type.value)}
                    className={`p-6 border text-left ${
                      serviceType === type.value
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <p className="mb-1">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            {serviceType === 'visit' && (
              <div>
                <label className="block mb-4">방문 희망 날짜</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-border bg-white"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button className="w-full py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors">
                A/S 신청하기
              </button>
            </div>
          </div>

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
