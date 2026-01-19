import { useState } from 'react';
import { HelpCircle, BookOpen, Video, MessageSquare, Check, Ship } from 'lucide-react';

export function UsabilityConsultingPage() {
    const [consultingScope, setConsultingScope] = useState<'device' | 'all'>('device');
    const [selectedDevice, setSelectedDevice] = useState('');
    const [consultingType, setConsultingType] = useState('');

    const myDevices = [
        { id: '1', name: 'GARMIN GPSMAP 8612', purchaseDate: '2024.01.15' },
        { id: '2', name: 'LOWRANCE HDS-12 LIVE', purchaseDate: '2023.11.20' },
        { id: '3', name: 'FURUNO DRS4W', purchaseDate: '2024.03.10' },
    ];

    const consultingTypes = [
        {
            value: 'function',
            label: '기능 사용법',
            icon: HelpCircle,
            desc: '특정 기능을 어떻게 사용하는지 안내'
        },
        {
            value: 'setup',
            label: '설정 방법',
            icon: BookOpen,
            desc: '제품 초기 설정 및 환경 구성'
        },
        {
            value: 'troubleshooting',
            label: '문제 해결',
            icon: MessageSquare,
            desc: '사용 중 발생한 문제 해결 방법'
        },
        {
            value: 'advanced',
            label: '고급 활용',
            icon: Video,
            desc: '제품의 고급 기능 활용 방법'
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl mb-4 text-center">사용성 컨설팅</h1>
                    <p className="text-center text-muted-foreground mb-12">
                        이미 구매하신 제품을 더 효과적으로 활용할 수 있도록 도와드립니다
                    </p>

                    {/* Consulting Scope Selection */}
                    <div className="mb-8">
                        <label className="block mb-4">컨설팅 범위</label>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => {
                                    setConsultingScope('device');
                                    setSelectedDevice('');
                                }}
                                className={`p-6 border text-center transition-all ${consultingScope === 'device'
                                        ? 'border-primary bg-blue-50 shadow-md'
                                        : 'border-border hover:border-primary'
                                    }`}
                            >
                                <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-semibold mb-1">특정 제품</p>
                                <p className="text-xs text-muted-foreground">개별 제품 사용법 안내</p>
                            </button>
                            <button
                                onClick={() => {
                                    setConsultingScope('all');
                                    setSelectedDevice('');
                                }}
                                className={`p-6 border text-center transition-all ${consultingScope === 'all'
                                        ? 'border-primary bg-blue-50 shadow-md'
                                        : 'border-border hover:border-primary'
                                    }`}
                            >
                                <Ship className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-semibold mb-1">전체 선박 장비</p>
                                <p className="text-xs text-muted-foreground">선박의 모든 장비 통합 안내</p>
                            </button>
                        </div>
                    </div>

                    {/* Device Selection - Only show when consultingScope is 'device' */}
                    {consultingScope === 'device' && (
                        <div className="mb-8">
                            <label className="block mb-4">제품 선택</label>
                            <div className="space-y-3">
                                {myDevices.map((device) => (
                                    <button
                                        key={device.id}
                                        onClick={() => setSelectedDevice(device.id)}
                                        className={`w-full p-4 border text-left flex items-center justify-between transition-all ${selectedDevice === device.id
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
                    )}

                    {/* Vessel Information - Only show when consultingScope is 'all' */}
                    {consultingScope === 'all' && (
                        <div className="mb-8 space-y-4">
                            <h3 className="text-xl">선박 정보</h3>
                            <div>
                                <label className="block mb-2">선종</label>
                                <select className="w-full px-4 py-3 border border-border bg-white">
                                    <option value="">선택하세요</option>
                                    <option value="yacht">요트</option>
                                    <option value="fishing-boat">어선</option>
                                    <option value="cruise">유람선</option>
                                    <option value="fishing-vessel">낚시선</option>
                                    <option value="speedboat">스피드보트</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">보유 장비 목록</label>
                                <textarea
                                    rows={4}
                                    placeholder="보유하고 계신 장비들을 입력해주세요 (예: GPS 플로터, 어군탐지기, 레이더 등)"
                                    className="w-full px-4 py-3 border border-border bg-white resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Consulting Types */}
                    <div className="mb-8">
                        <label className="block mb-4">
                            컨설팅 유형 <span className="text-sm text-muted-foreground">(원하는 도움말 형태)</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {consultingTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setConsultingType(type.value)}
                                    className={`p-6 border text-center transition-all ${consultingType === type.value
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

                    {/* Question/Request */}
                    <div className="mb-8">
                        <label className="block mb-4">문의 내용</label>
                        <textarea
                            rows={6}
                            placeholder={
                                consultingScope === 'device'
                                    ? '어떤 기능을 사용하고 싶으신가요? 또는 어떤 문제가 있으신가요?'
                                    : '선박의 장비들을 어떻게 활용하고 싶으신가요? 또는 어떤 부분에 도움이 필요하신가요?'
                            }
                            className="w-full px-4 py-3 border border-border bg-white resize-none"
                        />
                    </div>

                    {/* Contact Method */}
                    <div className="mb-8">
                        <label className="block mb-4">상담 방식</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'phone', label: '전화 상담', desc: '전문가와 직접 통화' },
                                { value: 'visit', label: '방문 상담', desc: '매장 또는 현장 방문' },
                                { value: 'online', label: '온라인 미팅', desc: '화상 상담 진행' },
                            ].map((method) => (
                                <button
                                    key={method.value}
                                    className="p-6 border border-border hover:border-primary transition-colors text-center"
                                >
                                    <p className="font-semibold mb-1">{method.label}</p>
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
                        사용성 컨설팅 예약하기
                    </button>

                    {/* Info Box */}
                    <div className="mt-12 p-6 bg-secondary border border-border">
                        <h4 className="mb-4">사용성 컨설팅 안내</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• 예약 후 24시간 이내에 담당자가 연락드립니다</li>
                            <li>• 상담은 약 30분~1시간 정도 소요됩니다</li>
                            <li>• 컨설팅 서비스는 무료입니다</li>
                            <li>• 제품 사용 방법에 대한 상세한 안내를 제공합니다</li>
                            <li>• 필요시 현장 방문 상담도 가능합니다</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

