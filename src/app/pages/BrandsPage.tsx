import { Link } from 'react-router-dom';
import { BRANDS } from '../../constants/brands';
import { ROUTES } from '../../constants/routes';

export function BrandsPage() {
  const brands = BRANDS;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl mb-4 text-center">브랜드관</h1>
          <p className="text-center text-muted-foreground mb-12">
            세계 최고의 해양 전자기기 브랜드를 만나보세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={ROUTES.BRAND_DETAIL(brand.id)}
                className="group block border border-border hover:border-primary transition-all duration-300 overflow-hidden"
              >
                {/* Brand Logo Area */}
                <div
                  className={`${brand.backgroundColor && !brand.backgroundColor.startsWith('oklch')
                    ? brand.backgroundColor
                    : brand.backgroundColor?.startsWith('oklch')
                      ? ''
                      : `bg-gradient-to-br ${brand.gradientColor}`
                    } p-6 flex items-center justify-center relative overflow-hidden min-h-[180px]`}
                  style={brand.backgroundColor?.startsWith('oklch') ? { backgroundColor: brand.backgroundColor } : undefined}
                >
                  {brand.hasOverlay && (
                    <div className="absolute inset-0 bg-black/10" />
                  )}
                  {brand.hasLogo ? (
                    <img
                      src={`/${brand.id}_logo.png`}
                      alt={brand.name}
                      className="relative z-10 w-full h-full max-h-[140px] object-contain"
                    />
                  ) : (
                    <h2 className="text-2xl text-white relative z-10 text-center break-words">
                      {brand.logo}
                    </h2>
                  )}
                </div>

                {/* Brand Info */}
                <div className="p-6 bg-white group-hover:bg-secondary/50 transition-colors">
                  <h3 className="text-lg mb-2">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {brand.description}
                  </p>
                  <p className="text-sm text-primary">
                    {brand.productCount}개 제품 →
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Brands Section */}
          <div className="mt-16 p-8 bg-secondary border border-border">
            <h2 className="text-2xl mb-6 text-center">추천 브랜드</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 border border-border">
                <h3 className="text-xl mb-3 text-primary">GARMIN</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  GPS 기술의 선두주자로, 정확한 위치 정보와 직관적인 인터페이스를 제공합니다.
                </p>
                <Link
                  to={ROUTES.BRAND_DETAIL('garmin')}
                  className="inline-block text-primary hover:underline"
                >
                  제품 보기 →
                </Link>
              </div>
              <div className="bg-white p-6 border border-border">
                <h3 className="text-xl mb-3 text-primary">LOWRANCE</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  어군탐지 기술의 혁신을 이끄는 브랜드로, 전문 어부들의 신뢰를 받고 있습니다.
                </p>
                <Link
                  to={ROUTES.BRAND_DETAIL('lowrance')}
                  className="inline-block text-primary hover:underline"
                >
                  제품 보기 →
                </Link>
              </div>
              <div className="bg-white p-6 border border-border">
                <h3 className="text-xl mb-3 text-primary">SIMRAD</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  프로가 신뢰하는 프리미엄 항해 전자장비를 제공합니다.
                </p>
                <Link
                  to={ROUTES.BRAND_DETAIL('simrad')}
                  className="inline-block text-primary hover:underline"
                >
                  제품 보기 →
                </Link>
              </div>
            </div>
          </div>

          {/* Brand Comparison */}
          <div className="mt-16">
            <h2 className="text-2xl mb-6 text-center">브랜드 비교</h2>
            <div className="border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left">브랜드</th>
                    <th className="px-6 py-4 text-left">주력 제품</th>
                    <th className="px-6 py-4 text-left">가격대</th>
                    <th className="px-6 py-4 text-left">특징</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-6 py-4">GARMIN</td>
                    <td className="px-6 py-4">GPS 플로터</td>
                    <td className="px-6 py-4">중~고가</td>
                    <td className="px-6 py-4">직관적 UI</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-6 py-4">LOWRANCE</td>
                    <td className="px-6 py-4">어군탐지기</td>
                    <td className="px-6 py-4">중가</td>
                    <td className="px-6 py-4">고성능 소나</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-6 py-4">SIMRAD</td>
                    <td className="px-6 py-4">멀티디스플레이</td>
                    <td className="px-6 py-4">고가</td>
                    <td className="px-6 py-4">프리미엄</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-6 py-4">CAMEL</td>
                    <td className="px-6 py-4">어선용 전자장비</td>
                    <td className="px-6 py-4">중가</td>
                    <td className="px-6 py-4">현장 검증</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-6 py-4">STANDARD HORIZON</td>
                    <td className="px-6 py-4">해양 무전기</td>
                    <td className="px-6 py-4">중가</td>
                    <td className="px-6 py-4">안전 표준</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-6 py-4">G-ZYRO</td>
                    <td className="px-6 py-4">자이로 장비</td>
                    <td className="px-6 py-4">중~고가</td>
                    <td className="px-6 py-4">안정성</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
