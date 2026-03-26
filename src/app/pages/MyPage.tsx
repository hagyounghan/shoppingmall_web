import { useEffect, useState } from 'react';
import { User, Package, Wrench, Calendar, CreditCard, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet } from '../../lib/api-client';
import { API_ENDPOINTS } from '../../config/api';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/format';
import {
  OrderResponse,
  ORDER_STATUS_LABELS,
  ConsultingRequest,
  CONSULTING_STATUS_LABELS,
  UsabilityServiceRequest,
  USABILITY_STATUS_LABELS,
} from '../../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export function MyPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [serviceRequests, setServiceRequests] = useState<UsabilityServiceRequest[]>([]);
  const [serviceLoading, setServiceLoading] = useState(false);

  const [consultations, setConsultations] = useState<ConsultingRequest[]>([]);
  const [consultingLoading, setConsultingLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setOrdersLoading(true);
    apiGet<OrderResponse[]>(API_ENDPOINTS.ORDERS_ME)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    setServiceLoading(true);
    apiGet<UsabilityServiceRequest[]>(API_ENDPOINTS.USABILITY_SERVICES_ME)
      .then(setServiceRequests)
      .catch(() => setServiceRequests([]))
      .finally(() => setServiceLoading(false));

    setConsultingLoading(true);
    apiGet<ConsultingRequest[]>(API_ENDPOINTS.CONSULTING_ME)
      .then(setConsultations)
      .catch(() => setConsultations([]))
      .finally(() => setConsultingLoading(false));
  }, [isAuthenticated]);

  if (loading || !user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p>주문 내역</p>
            </button>
            <button
              onClick={() => document.getElementById('section-service')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Wrench className="w-8 h-8 mx-auto mb-2" />
              <p>A/S 내역</p>
            </button>
            <button
              onClick={() => document.getElementById('section-consulting')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>컨설팅 내역</p>
            </button>
            <button
              onClick={() => document.getElementById('section-points')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 border border-border hover:border-primary transition-colors text-center"
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2" />
              <p>포인트</p>
            </button>
          </div>

          {/* Orders Section */}
          <div className="mb-12" id="section-orders">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">주문 내역</h2>
              <Link to={ROUTES.ORDER} className="text-sm text-primary hover:underline">
                주문하기 →
              </Link>
            </div>
            {ordersLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                주문 내역이 없습니다.
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">주문번호</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상품 수</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">결제금액</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">주문일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm">{order.items.length}개</td>
                        <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Service Requests */}
          <div className="mb-12" id="section-service">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">A/S 신청 내역</h2>
              <Link to={ROUTES.SERVICE_REQUEST} className="text-sm text-primary hover:underline">
                A/S 신청 →
              </Link>
            </div>
            {serviceLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : serviceRequests.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                A/S 신청 내역이 없습니다.
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">제목</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">신청일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((req) => (
                      <tr key={req.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{req.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {USABILITY_STATUS_LABELS[req.status] || req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(req.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Consulting History */}
          <div className="mb-12" id="section-consulting">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">컨설팅 예약 내역</h2>
              <Link to={ROUTES.CONSULTING_BOOKING} className="text-sm text-primary hover:underline">
                컨설팅 예약 →
              </Link>
            </div>
            {consultingLoading ? (
              <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
            ) : consultations.length === 0 ? (
              <div className="p-6 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
                컨설팅 예약 내역이 없습니다.
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">제목</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">상태</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">예약일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((c) => (
                      <tr key={c.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{c.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            c.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                            c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            c.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {CONSULTING_STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fishing Points */}
          <div className="mb-12" id="section-points">
            <h2 className="text-2xl mb-6">낚시포인트</h2>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-4xl font-bold text-primary mb-2">{user.fishingPoints ?? 0}개</p>
              <p className="text-sm text-muted-foreground">등록된 낚시포인트 수입니다.</p>
              <Link to={ROUTES.RESOURCE_FISHING_POINTS} className="mt-4 inline-block text-sm text-primary hover:underline">
                낚시포인트 관리 →
              </Link>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
