import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../../types';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/format';

interface ProductCardProps extends Product {}

export function ProductCard({ id, name, price, image, tag }: ProductCardProps) {
  return (
    <Link to={ROUTES.PRODUCT_DETAIL(id)} className="group block bg-white border border-border hover:border-primary transition-colors">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="text-sm line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-lg text-primary">{formatPrice(price)}</p>
          {tag && (
            <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground">
              {tag}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
