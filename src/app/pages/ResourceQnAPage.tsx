import { useState } from 'react';
import { MessageSquare, Search, ChevronDown, ChevronUp } from 'lucide-react';

export function ResourceQnAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqs = [
    {
      id: 1,
      category: 'GPS 플로터',
      question: 'GPS 플로터 화면이 안 나와요',
      answer: 'GPS 플로터 화면이 표시되지 않는 경우 다음을 확인해주세요:\n\n1. 전원 연결 상태 확인\n2. 안테나 연결 확인\n3. 화면 밝기 설정 확인\n4. 소프트웨어 업데이트 필요 여부 확인\n\n위 사항을 확인해도 해결되지 않으면 고객센터로 문의해주세요.',
    },
    {
      id: 2,
      category: '어군탐지기',
      question: '어군탐지기에서 물고기가 안 보여요',
      answer: '어군탐지기에서 물고기가 표시되지 않는 경우:\n\n1. 트랜스듀서 설치 위치 및 각도 확인\n2. 깊이 설정 확인\n3. 감도 조절\n4. 주파수 설정 확인\n5. 트랜스듀서와 디스플레이 간 연결 확인',
    },
    {
      id: 3,
      category: '레이더',
      question: '레이더가 작동하지 않아요',
      answer: '레이더 작동 문제 해결 방법:\n\n1. 전원 공급 확인\n2. 안테나 회전 확인\n3. 안테나 연결 상태 확인\n4. 레이더 돔 내부 청소\n5. 설정 메뉴에서 레이더 활성화 확인',
    },
    {
      id: 4,
      category: 'VHF 무선기',
      question: 'VHF 무선기 통신이 안 돼요',
      answer: 'VHF 무선기 통신 문제:\n\n1. 안테나 연결 확인\n2. 채널 설정 확인\n3. 전원 공급 확인\n4. 안테나 임피던스 확인\n5. 다른 기기와의 간섭 확인',
    },
    {
      id: 5,
      category: '일반',
      question: '제품을 어떻게 설치하나요?',
      answer: '제품 설치 방법은 제품별로 다릅니다. 각 제품의 설치 매뉴얼을 참고하시거나, 시뮬레이터에서 배치 방법을 확인하실 수 있습니다. 전문 설치가 필요하시면 구매 컨설팅을 통해 안내받으실 수 있습니다.',
    },
    {
      id: 6,
      category: '일반',
      question: '제품 보증 기간은 얼마인가요?',
      answer: '제품별 보증 기간이 다릅니다. 일반적으로 1년에서 2년의 보증 기간이 제공됩니다. 정확한 보증 기간은 구매 시 제공되는 보증서를 확인해주세요.',
    },
  ];

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">문의답변</h1>
          </div>

          {/* Search */}
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="질문을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedItems.has(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedItems.has(faq.id) && (
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <div className="pt-4 text-muted-foreground whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-white border border-border rounded-lg">
            <h3 className="text-xl font-bold mb-4">추가 문의가 있으신가요?</h3>
            <p className="text-muted-foreground mb-4">
              자주 묻는 질문에서 답을 찾지 못하셨다면, 고객센터로 문의해주세요.
            </p>
            <button className="px-6 py-3 bg-primary text-primary-foreground hover:bg-accent transition-colors rounded-lg">
              고객센터 문의하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

