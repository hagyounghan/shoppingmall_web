import { Link } from 'react-router-dom';
import { Award, Users, Clock, CheckCircle } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-accent text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl mb-6">명장 소개</h1>
            <p className="text-xl opacity-90">
              30년 이상의 경험으로 해양 전자기기의 모든 것을 아는 전문가
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <section className="mb-16">
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop" 
                alt="명장" 
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            <div className="bg-secondary p-8 rounded-lg mb-8">
              <h2 className="text-3xl mb-6">명장을 소개합니다</h2>
              <div className="prose max-w-none text-muted-foreground space-y-4">
                <p className="text-lg">
                  명장은 30년 이상 해양 전자기기 분야에서 활동해온 전문가입니다. 
                  어선, 레저보트, 요트 등 다양한 선박에 최적의 전자장비를 설치하고 
                  유지보수하는 일을 해왔습니다.
                </p>
                <p>
                  수많은 선박과 어부들을 만나며 쌓은 경험과 노하우를 바탕으로, 
                  고객의 선박과 용도에 가장 적합한 장비를 추천하고 설치해드립니다. 
                  단순히 제품을 판매하는 것이 아니라, 고객의 안전하고 효율적인 항해를 
                  위한 최적의 솔루션을 제공하는 것이 명장의 철학입니다.
                </p>
              </div>
            </div>
          </section>

          {/* Experience & Expertise */}
          <section className="mb-16">
            <h2 className="text-3xl mb-8 text-center">경력 및 전문 분야</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <h3 className="text-xl">주요 경력</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>30년 이상 해양 전자기기 설치 및 유지보수</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>1,000대 이상 선박 장비 설치 경험</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>GARMIN, LOWRANCE, SIMRAD 등 주요 브랜드 공인 설치사</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>해양수산부 선박전자장비 설치 자격 보유</span>
                  </li>
                </ul>
              </div>

              <div className="border border-border p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-xl">전문 분야</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>GPS 플로터 설치 및 튜닝</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>어군탐지기 소나 튜닝 및 최적화</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>레이더 설치 및 교정</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>통신장비 및 자동조타장치 설치</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="text-3xl mb-8 text-center">명장이 제공하는 서비스</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl mb-3">전문 컨설팅</h3>
                <p className="text-muted-foreground">
                  선박 종류, 용도, 예산에 맞춘 최적의 장비 구성을 추천해드립니다.
                </p>
              </div>

              <div className="border border-border p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl mb-3">전문 설치</h3>
                <p className="text-muted-foreground">
                  현장에서 직접 설치하고 튜닝하여 최적의 성능을 보장합니다.
                </p>
              </div>

              <div className="border border-border p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl mb-3">A/S 지원</h3>
                <p className="text-muted-foreground">
                  설치 후에도 지속적인 유지보수와 A/S를 제공합니다.
                </p>
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section className="mb-16">
            <div className="bg-primary/5 border-l-4 border-primary p-8 rounded-lg">
              <h2 className="text-2xl mb-4">명장의 철학</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                "바다는 위험할 수 있습니다. 하지만 올바른 장비와 전문적인 설치로 
                그 위험을 최소화할 수 있습니다. 저는 단순히 제품을 파는 것이 아니라, 
                고객의 안전한 항해와 풍요로운 어업을 위한 파트너가 되고자 합니다. 
                30년간 쌓아온 경험과 노하우를 바탕으로, 고객 한 분 한 분에게 최선을 다하겠습니다."
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-3xl mb-6">명장과 함께하세요</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              전문가의 조언이 필요하시거나 장비 설치가 필요하시다면 언제든지 연락주세요.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/consulting"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                컨설팅 신청하기
              </Link>
              <Link
                to="/service"
                className="bg-secondary text-foreground px-8 py-3 rounded-lg hover:bg-secondary/80 transition-colors border border-border"
              >
                A/S 신청하기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

