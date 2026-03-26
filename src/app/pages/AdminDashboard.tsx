import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, MessageCircle, Megaphone, 
  Plus, Edit, Trash2, CheckCircle, Ship, User, 
  Video, Save, X, Image as ImageIcon, Layout, Settings, ArrowRight, Sparkles, Search
} from 'lucide-react';

// --- 💡 데이터 타입 정의 ---
interface Product { id: string; name: string; price: number; stock: number; status: string; category: string; }
interface Banner { id: number; title: string; subtitle: string; imageUrl: string; isActive: boolean; }
interface RecommendedSet { id: string; title: string; description: string; totalPrice: number; items: string[]; }
interface Consulting { id: number; customerName: string; phone: string; type: string; status: '상담대기' | '상담완료'; date: string; }
interface BoardItem { id: number; category: string; title: string; author: string; date: string; }

// --- 📦 초기 데이터 (명장쇼핑몰 데이터 반영) ---
const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: 'GARMIN GPSMAP 8612 12인치', price: 3450000, stock: 15, status: '판매중', category: 'GPS/플로터' },
  { id: "2", name: 'LOWRANCE HDS-12 LIVE', price: 2890000, stock: 8, status: '판매중', category: '어군탐지기' },
  { id: "3", name: 'FURUNO DRS4W 무선 레이더', price: 1850000, stock: 3, status: '판매중', category: '레이더' },
];

const INITIAL_BANNERS: Banner[] = [
  { id: 1, title: "30년 경력 명장의 선택", subtitle: "최신 해양 장비 특별전", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200", isActive: true }
];

const INITIAL_SETS: RecommendedSet[] = [
  { id: 'premium', title: '프리미엄 전문가 패키지', description: '원거리 항해 및 전문 어업용 최상위 구성', totalPrice: 12500000, items: ['GARMIN 8612', 'DRS4W 레이더', 'VHF 무선기'] },
  { id: 'value', title: '가성비 실속 패키지', description: '레저 보트 입문자를 위한 알짜배기 구성', totalPrice: 4500000, items: ['LOWRANCE HDS-7', '기본 소나'] }
];

const INITIAL_CONSULTING: Consulting[] = [
  { id: 1, customerName: '김철수 선장', phone: '010-1111-2222', type: '어업용', status: '상담대기', date: '2024-03-10' },
  { id: 2, customerName: '이영희 고객', phone: '010-3333-4444', type: '레저용', status: '상담완료', date: '2024-03-09' },
];

const INITIAL_BOARD: BoardItem[] = [
  { id: 1, category: '공지', title: '봄철 선박 점검 이벤트 안내', author: '관리자', date: '2024-03-05' },
  { id: 2, category: '강의', title: '가민 GPS 기초 설정법 영상', author: '명장', date: '2024-03-01' },
];

export default function AdminDashboard() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  
  // 데이터 상태 관리
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [recSets, setRecSets] = useState(INITIAL_SETS);
  const [consultings, setConsultings] = useState(INITIAL_CONSULTING);
  const [boardItems, setBoardItems] = useState(INITIAL_BOARD);
  
  // UI 상태
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans w-full overflow-hidden">
      {/* 1. 사이드바 */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Ship className="mr-2 text-blue-400" size={24} /> 명장 관리자
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="운영 현황" isActive={currentMenu === 'dashboard'} onClick={() => setCurrentMenu('dashboard')} />
          <MenuButton icon={<Package size={20}/>} label="장비/상품 관리" isActive={currentMenu === 'products'} onClick={() => setCurrentMenu('products')} />
          <MenuButton icon={<Layout size={20}/>} label="메인/추천 관리" isActive={currentMenu === 'main_mgmt'} onClick={() => setCurrentMenu('main_mgmt')} />
          <MenuButton icon={<MessageCircle size={20}/>} label="컨설팅 신청 내역" isActive={currentMenu === 'consulting'} onClick={() => setCurrentMenu('consulting')} />
          <MenuButton icon={<Megaphone size={20}/>} label="공지/자료실 관리" isActive={currentMenu === 'notices'} onClick={() => setCurrentMenu('notices')} />
        </nav>
      </aside>

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* [1. 운영 현황] */}
        {currentMenu === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">📊 실시간 운영 지표</h2>
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="등록 장비" value={products.length} unit="종" color="text-blue-600" />
              <StatCard title="상담 신청" value={consultings.filter(c=>c.status==='상담대기').length} unit="건" color="text-orange-500" />
              <StatCard title="오늘 방문" value="1,240" unit="명" color="text-green-600" />
              <StatCard title="자료실 게시글" value={boardItems.length} unit="개" color="text-slate-600" />
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="font-bold mb-4">최근 상담 신청</h3>
                <div className="space-y-3">
                    {consultings.slice(0, 2).map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="font-medium">{c.customerName} ({c.type})</span>
                            <span className="text-xs text-slate-400">{c.date}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* [2. 장비/상품 관리] */}
        {currentMenu === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">⚓ 장비 목록 관리</h2>
              <button onClick={() => setIsAddingProduct(!isAddingProduct)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                {isAddingProduct ? <X size={18} className="mr-1"/> : <Plus size={18} className="mr-1"/>}
                {isAddingProduct ? '취소' : '신규 장비 등록'}
              </button>
            </div>
            {isAddingProduct && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-md animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="장비명" className="p-2 border rounded" />
                    <input type="text" placeholder="카테고리" className="p-2 border rounded" />
                    <input type="number" placeholder="가격" className="p-2 border rounded" />
                    <input type="number" placeholder="재고수량" className="p-2 border rounded" />
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">장비 저장</button>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-sm font-bold">
                  <tr>
                    <th className="p-4 text-slate-500">장비명</th>
                    <th className="p-4 text-slate-500">가격</th>
                    <th className="p-4 text-slate-500">재고</th>
                    <th className="p-4 text-center text-slate-500">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b hover:bg-slate-50 transition text-sm">
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4 font-black text-blue-600">{p.price.toLocaleString()}원</td>
                      <td className="p-4">{p.stock}개</td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                        <button className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* [3. 메인/추천 관리] */}
        {currentMenu === 'main_mgmt' && (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <ImageIcon className="text-blue-500" /> 메인 배너 이미지/문구 변경
              </h2>
              {banners.map(banner => (
                <div key={banner.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex gap-6 items-center shadow-sm">
                  <div className="relative group w-48 h-28 shrink-0">
                    <img src={banner.imageUrl} className="w-full h-full object-cover rounded-xl" alt="banner" />
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-xl text-white text-xs font-bold">이미지 교체</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input defaultValue={banner.title} className="text-lg font-black w-full border-b outline-none focus:border-blue-500" />
                    <input defaultValue={banner.subtitle} className="text-sm text-slate-400 w-full border-b outline-none focus:border-blue-500" />
                  </div>
                  <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold">변경 저장</button>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="text-orange-500" /> 명장 추천 세트 품목 수정
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {recSets.map(set => (
                  <div key={set.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition">
                    <div className="flex justify-between items-center mb-4 text-blue-600 font-black italic">
                      <span>{set.id.toUpperCase()} SET</span>
                      <Settings size={18} className="text-slate-300" />
                    </div>
                    <input defaultValue={set.title} className="w-full font-bold text-lg mb-2 border-none p-0 focus:ring-0" />
                    <textarea defaultValue={set.description} className="w-full text-xs text-slate-400 border-none p-0 focus:ring-0 resize-none h-10" />
                    <div className="bg-slate-50 p-4 rounded-xl mt-4">
                      <p className="text-[10px] font-black text-slate-400 mb-2">포함 장비 리스트</p>
                      {set.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs py-1">
                          <span className="font-medium">• {item}</span>
                          <button className="text-slate-300 hover:text-red-500"><X size={12}/></button>
                        </div>
                      ))}
                      <button className="w-full mt-2 border border-dashed border-slate-300 text-slate-400 py-1 text-[10px] rounded hover:bg-white">+ 장비 추가</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* [4. 컨설팅 신청 내역] */}
        {currentMenu === 'consulting' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">📞 컨설팅 및 상담 현황</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-sm">
                  <tr>
                    <th className="p-4">고객명</th>
                    <th className="p-4">연락처</th>
                    <th className="p-4">유형</th>
                    <th className="p-4 text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {consultings.map(c => (
                    <tr key={c.id} className="border-b text-sm">
                      <td className="p-4 font-bold"><User size={14} className="inline mr-2 text-slate-400"/>{c.customerName}</td>
                      <td className="p-4 text-blue-600 font-medium italic underline underline-offset-4">{c.phone}</td>
                      <td className="p-4">{c.type}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.status === '상담완료' ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* [5. 공지/자료실 관리] */}
        {currentMenu === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">📢 공지 및 자료실 관리</h2>
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <Plus size={16} className="mr-1"/> 새 글 작성
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b font-bold">
                  <tr>
                    <th className="p-4">분류</th>
                    <th className="p-4">제목</th>
                    <th className="p-4">날짜</th>
                    <th className="p-4 text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {boardItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="p-4"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">{item.category}</span></td>
                      <td className="p-4 font-medium">{item.title}</td>
                      <td className="p-4 text-slate-400 text-xs">{item.date}</td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button className="text-slate-300 hover:text-blue-600"><Edit size={16}/></button>
                        <button className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// --- 🛠️ 공통 UI 컴포넌트 ---
function MenuButton({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'hover:bg-slate-800 text-slate-400'}`}>
      <span className="mr-3">{icon}</span><span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function StatCard({ title, value, unit, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-tighter">{title}</h3>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}<span className="text-sm font-medium text-slate-300 ml-1">{unit}</span></p>
    </div>
  );
}