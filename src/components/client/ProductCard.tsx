import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch } from '@/redux/hooks';
import { addProduct } from '@/redux/cartSlice';
import { useToast } from '@/hooks/use-toast';

interface Product {
  _id: string;
  title: string;
  price: number;
  img: string;
  discount?: number;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleAddToCart = () => {
    dispatch(addProduct({
      ...product,
      quantity: 1,
      color: '',
      size: '',
    }));
    toast({
      title: "Ajouté au panier",
      description: `${product.title} a été ajouté à votre panier`,
    });
  };

  // Ensure price is a number (MySQL DECIMAL can be returned as string)
  const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0;
  const discount = typeof product.discount === 'string' ? parseFloat(product.discount) : Number(product.discount) || 0;
  
  const discountedPrice = product.discount 
    ? price * (1 - discount / 100) 
    : null;

  return (
    <div 
      className="group bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.discount && (
            <Badge className="bg-accent hover:bg-accent text-accent-foreground font-bold">
              {product.discount}% OFF
            </Badge>
          )}
          {product.inStock && (
            <Badge variant="outline" className="bg-green-500 text-white border-green-500">
              En Stock
            </Badge>
          )}
        </div>

        <img
          src={product.img}
          alt={product.title}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              size="icon" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Link to={`/product/${product._id}`}>
              <Button 
                size="icon" 
                variant="secondary"
                className="rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-foreground">
            €{(discountedPrice ?? price).toFixed(2)}
          </p>
          {discountedPrice && (
            <p className="text-sm text-muted-foreground line-through">
              €{price.toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 pt-1">
          <Button 
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-full text-sm"
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </Button>
          <Link to={`/product/${product._id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full rounded-full text-sm border-border hover:bg-secondary"
            >
              Détails
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
