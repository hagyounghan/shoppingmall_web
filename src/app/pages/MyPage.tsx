import { User, Package, Wrench, Calendar, CreditCard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyPage() {
  const userInfo = {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    fishingPoints: 23,
  };

  const purchasedDevices = [
    {
      id: '1',
      name: 'GARMIN GPSMAP 8612',
      purchaseDate: '2024.01.15',
      warranty: '2025.01.15',
      image: 'https://images.unsplash.com/photo-1723883077281-85d8c2d4e5fc?w=200',
    },
    {
      id: '2',
      name: 'LOWRANCE HDS-12 LIVE',
      purchaseDate: '2023.11.20',
      warranty: '2024.11.20',
      image: 'https://images.unsplash.com/photo-1742232106501-6aa0b1fdaab3?w=200',
    },
  ];

  const serviceRequests = [
    { id: '1', device: 'GARMIN GPSMAP 8612', status: '접수완료', date: '2024.12.15' },
    { id: '2', device: 'FURUNO DRS4W', status: '수리완료', date: '2024.11.28' },
  ];

  const consultations = [
    { id: '1', type: '어선 장비 구성', status: '상담완료', date: '2024.12.10' },
    { id: '2', type: '레저선 장비 업그레이드', status: '예약대기', date: '2024.12.22' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl mb-8">마이페이지</h1>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-primary to-accent text-white p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl mb-2">{userInfo.name}님</h2>
                  <p className="opacity-90">{userInfo.email}</p>
                  <p className="opacity-90">{userInfo.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">등록 낚시포인트</p>
                <p className="text-3xl">{userInfo.fishingPoints}개</p>
              </div>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Link
              to="/points"
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2" />
              <p>포인트 관리</p>
            </Link>
            <Link
              to="/orders"
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p>주문 내역</p>
            </Link>
            <Link
              to="/service"
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Wrench className="w-8 h-8 mx-auto mb-2" />
              <p>A/S 신청</p>
            </Link>
            <Link
              to="/consulting"
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>컨설팅 예약</p>
            </Link>
          </div>

          {/* Purchased Devices */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6">구매한 기기</h2>
            <div className="space-y-4">
              {purchasedDevices.map((device) => (
                <div key={device.id} className="border border-border p-6 flex items-center gap-6">
                  <div className="w-24 h-24 bg-muted flex-shrink-0">
                    <img
                      src={device.image}
                      alt={device.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2">{device.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      구매일: {device.purchaseDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      보증기간: {device.warranty}까지
                    </p>
                  </div>
                  <Link
                    to={`/service?device=${device.id}`}
                    className="px-6 py-3 border border-border hover:bg-secondary transition-colors"
                  >
                    A/S 신청
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Service Requests */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6">A/S 신청 내역</h2>
            <div className="border border-border">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left">기기명</th>
                    <th className="px-6 py-4 text-left">상태</th>
                    <th className="px-6 py-4 text-left">신청일</th>
                    <th className="px-6 py-4 text-left">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((request) => (
                    <tr key={request.id} className="border-t border-border">
                      <td className="px-6 py-4">{request.device}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-sm ${
                            request.status === '수리완료'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{request.date}</td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:underline">상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consulting History */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6">컨설팅 예약 내역</h2>
            <div className="border border-border">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left">컨설팅 유형</th>
                    <th className="px-6 py-4 text-left">상태</th>
                    <th className="px-6 py-4 text-left">예약일</th>
                    <th className="px-6 py-4 text-left">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation) => (
                    <tr key={consultation.id} className="border-t border-border">
                      <td className="px-6 py-4">{consultation.type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-sm ${
                            consultation.status === '상담완료'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {consultation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{consultation.date}</td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:underline">상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-border">
            <button className="text-muted-foreground hover:text-destructive flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
            <button className="px-6 py-3 border border-border hover:bg-secondary transition-colors">
              회원정보 수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}