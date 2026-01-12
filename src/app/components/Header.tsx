import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Heart, Menu, ChevronDown, LogOut } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { CATEGORIES } from '../../constants/categories';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

const navigationItems = [
  { label: '명장소개', to: ROUTES.ABOUT },
  { label: '브랜드관', to: ROUTES.BRANDS },
  { label: 'A/S 신청', to: ROUTES.SERVICE },
  { label: '컨설팅', to: ROUTES.CONSULTING },
  { label: '낚시포인트', to: ROUTES.FISHING_POINTS },
  { label: '마이페이지', to: ROUTES.MY_PAGE },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <Link to={ROUTES.HOME} className="flex items-center">
            <img src="/logo.png" alt="명장쇼핑몰" className="h-8" />
          </Link>

          <div className="flex items-center gap-4">
            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 hover:text-primary transition-colors outline-none">
                    <User className="w-5 h-5" />
                    <span>{user?.name || '사용자'}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.MY_PAGE}>마이페이지</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to={ROUTES.LOGIN} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <User className="w-5 h-5" />
                  <span>로그인</span>
                </Link>
              )}
              <Link to={ROUTES.CART} className="flex items-center gap-2 hover:text-primary transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span>장바구니</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link to={ROUTES.WISHLIST} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
                <span>찜</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile User Actions */}
                  <div className="flex flex-col gap-4 pb-4 border-b">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          <span>{user?.name || '사용자'}</span>
                        </div>
                        <Link
                          to={ROUTES.MY_PAGE}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>마이페이지</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>로그아웃</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to={ROUTES.LOGIN}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>로그인</span>
                      </Link>
                    )}
                    <Link
                      to={ROUTES.CART}
                      className="flex items-center gap-2 hover:text-primary transition-colors relative"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>장바구니</span>
                      {getTotalItems() > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {getTotalItems()}
                        </span>
                      )}
                    </Link>
                    <Link
                      to={ROUTES.WISHLIST}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span>찜</span>
                    </Link>
                  </div>

                  {/* Navigation Menu */}
                  <nav>
                    <ul className="flex flex-col gap-4">
                      {navigationItems.map((item) => (
                        <React.Fragment key={item.label}>
                          <li>
                            <Link
                              to={item.to}
                              className="block py-2 hover:text-primary transition-colors text-lg"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                          {/* Mobile Products Section after 브랜드관 */}
                          {item.label === '브랜드관' && (
                            <li>
                              <div className="py-2">
                                <span className="text-lg font-semibold">제품</span>
                                <ul className="mt-2 ml-4 flex flex-col gap-2">
                                  {CATEGORIES.map((category) => {
                                    const CategoryIcon = category.icon;
                                    return (
                                      <li key={category.label}>
                                        <Link
                                          to={category.link}
                                          className="flex items-center gap-2 py-1 hover:text-primary transition-colors"
                                          onClick={() => setIsOpen(false)}
                                        >
                                          <CategoryIcon className="w-4 h-4" />
                                          <span>{category.label}</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </li>
                          )}
                        </React.Fragment>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-border">
          <ul className="flex items-center justify-center gap-8 py-4">
            {navigationItems.map((item) => (
              <React.Fragment key={item.label}>
                <li>
                  <Link to={item.to} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
                {/* Products Dropdown after 브랜드관 */}
                {item.label === '브랜드관' && (
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
                        제품
                        <ChevronDown className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
                        {CATEGORIES.map((category) => {
                          const CategoryIcon = category.icon;
                          return (
                            <DropdownMenuItem key={category.label} asChild>
                              <Link
                                to={category.link}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <CategoryIcon className="w-4 h-4" />
                                <span>{category.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}