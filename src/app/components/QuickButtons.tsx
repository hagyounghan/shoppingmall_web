import { Link } from 'react-router-dom';
import { Wrench, MessageSquare, Youtube } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export function QuickButtons() {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      <Link
        to={ROUTES.SERVICE}
        className="group relative bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
        title="A/S 신청"
      >
        <Wrench className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          A/S 신청
        </span>
      </Link>

      <Link
        to={ROUTES.CONSULTING}
        className="group relative bg-accent text-accent-foreground p-4 rounded-full shadow-lg hover:bg-accent/90 transition-all hover:scale-110"
        title="컨설팅"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          컨설팅
        </span>
      </Link>

      <a
        href="https://www.youtube.com/@%EC%96%B4%ED%83%90%EB%AA%85%EC%9E%A5"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110"
        title="YouTube"
      >
        <Youtube className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          YouTube
        </span>
      </a>
    </div>
  );
}

