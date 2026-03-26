import { useEffect } from 'react';
import { User, Package, Wrench, Calendar, CreditCard, LogOut, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export function MyPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // 향후 확장 포인트
  const purchasedDevices: { id: string; name: string; purchaseDate: string; warranty: string; image: string }[] = [];
  const serviceRequests: { id: string; device: string; status: string; date: string }[] = [];
  const consultations: { id: string; type: string; status: string; date: string }[] = [];

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
                  <h2 className="text-2xl mb-2">{user.name}님</h2>
                  <p className="opacity-90">{user.email}</p>
                  {user.phone && <p className="opacity-90">{user.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">등록 낚시포인트</p>
                <p className="text-3xl">{user.fishingPoints ?? 0}개</p>
              </div>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <button
              onClick={() => document.getElementById('section-orders')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2" />
              <p>포인트 관리</p>
            </button>
            <button
              onClick={() => document.getElementById('section-orders')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p>주문 내역</p>
            </button>
            <Link
              to={ROUTES.SERVICE_REQUEST}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Wrench className="w-8 h-8 mx-auto mb-2" />
              <p>A/S 신청</p>
            </Link>
            <Link
              to={ROUTES.CONSULTING_BOOKING}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>컨설팅 예약</p>
            </Link>
          </div>

          {/* Orders Section */}
          <div className="mb-12" id="section-orders">
            <h2 className="text-2xl mb-6">주문 내역</h2>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>서버 데이터베이스 연결 후 이용할 수 있습니다. 주문하신 내역은 연결 완료 시 자동으로 표시됩니다.</p>
            </div>
          </div>

          {/* Purchased Devices */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6">구매한 기기</h2>
            {purchasedDevices.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>서버 데이터베이스 연결 후 구매한 기기 목록이 표시됩니다.</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Service Requests */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6">A/S 신청 내역</h2>
            {serviceRequests.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>서버 데이터베이스 연결 후 A/S 신청 내역이 표시됩니다.</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Consulting History */}
          <div className="mb-12">
            <h2 className="text-2xl mb-6">컨설팅 예약 내역</h2>
            {consultations.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>서버 데이터베이스 연결 후 컨설팅 예약 내역이 표시됩니다.</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Account Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-border">
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive flex items-center gap-2"
            >
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
