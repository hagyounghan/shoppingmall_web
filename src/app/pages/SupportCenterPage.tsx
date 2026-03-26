import { Link } from 'react-router-dom';
import { Megaphone, BookOpen, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export function SupportCenterPage() {
  const menuItems = [
    {
      title: '공지사항',
      description: '서비스 안내, 이벤트, 중요 공지를 확인하세요',
      icon: Megaphone,
      link: ROUTES.SUPPORT_NOTICE,
      color: 'from-red-500 to-red-600',
    },
    {
      title: '강의실',
      description: '제품 사용법 및 기능 설명 동영상 강의',
      icon: BookOpen,
      link: ROUTES.SUPPORT_LECTURE,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: '문의답변',
      description: '상품 문의 목록 및 키워드 검색',
      icon: MessageSquare,
      link: ROUTES.SUPPORT_QNA,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'FAQ',
      description: '자주 묻는 질문 및 답변 모음',
      icon: HelpCircle,
      link: ROUTES.SUPPORT_FAQ,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-center">고객지원</h1>
          <p className="text-center text-muted-foreground mb-12">
            공지사항, 강의, 문의사항 등 다양한 고객 지원 서비스를 이용하세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group bg-white rounded-lg p-8 border border-border hover:border-primary hover:shadow-lg transition-all"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                  <span>바로가기</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
