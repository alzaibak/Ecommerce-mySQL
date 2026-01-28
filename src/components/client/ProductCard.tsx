// src/components/client/ProductCard.tsx - UPDATED VERSION
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/redux/hooks';
import { addProduct } from '@/redux/cartSlice';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    discountPrice?: number | null;
    img: string;
    inStock: boolean;
    attributes: Record<string, string[]>;
    stockByVariant: Record<string, number>;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Handle discount price - make sure it's a valid number
  const discountPrice = product.discountPrice 
    ? (typeof product.discountPrice === 'string' 
        ? parseFloat(product.discountPrice) 
        : product.discountPrice)
    : null;
    
  const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < product.price;
  const displayPrice = hasDiscount ? discountPrice : product.price;
  
  const discountPercentage = hasDiscount && discountPrice 
    ? Math.round((1 - discountPrice / product.price) * 100)
    : 0;

  // Check if product has variants
  const hasVariants = product.attributes && Object.keys(product.attributes).length > 0;
  
  // Calculate total stock
  const totalStock = product.stockByVariant 
    ? Object.values(product.stockByVariant).reduce((sum, qty) => sum + qty, 0)
    : 0;

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('Ce produit n\'est pas en stock');
      return;
    }

    if (hasVariants) {
      // If product has variants, redirect to product page
      window.location.href = `/product/${product.id}`;
      return;
    }

    setIsAddingToCart(true);
    
    // Add to cart with default attributes
    dispatch(addProduct({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPrice: discountPrice || undefined,
      quantity: 1,
      img: product.img,
      attributes: {},
      variantKey: '',
      productId: product.id
    }));

    setTimeout(() => {
      setIsAddingToCart(false);
      toast.success(`${product.title} ajouté au panier`);
    }, 300);
  };

  return (
    <div 
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            -{discountPercentage}%
          </div>
        </div>
      )}

      {/* Out of Stock Badge */}
      {!product.inStock && (
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
            Rupture
          </div>
        </div>
      )}

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-square bg-muted">
          <img
            src={product.img || '/placeholder-product.jpg'}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          
          {/* Quick View Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button 
              size="icon" 
              variant="secondary"
              className="rounded-full bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              asChild
            >
              <Link to={`/product/${product.id}`}>
                <Eye className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-accent transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">€{displayPrice?.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              €{product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Variant Indicator */}
        {hasVariants && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span>{Object.keys(product.attributes).length} options</span>
          </div>
        )}

        {/* Stock Indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-1 ${
            product.inStock ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              product.inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span>{product.inStock ? 'En stock' : 'Rupture'}</span>
          </div>
          {product.inStock && totalStock > 0 && (
            <span className="text-muted-foreground">
              {totalStock} dispo.
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            className="flex-1 gap-2"
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
          >
            <ShoppingCart className={`h-4 w-4 ${isAddingToCart ? 'animate-ping' : ''}`} />
            {hasVariants ? 'Choisir' : 'Ajouter'}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground"
            asChild
          >
            <Link to={`/product/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;