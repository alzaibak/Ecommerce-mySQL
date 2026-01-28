import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Tag } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addProduct } from '@/redux/cartSlice';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    discountPrice?: number;
    img: string;
    inStock?: boolean;
    attributes?: Record<string, any>;
    stockByVariant?: Record<string, number>;
  };
  index?: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // For card quick-add, use default attributes or none
    const defaultAttributes: Record<string, string> = {};
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          defaultAttributes[key] = values[0];
        }
      });
    }

    dispatch(addProduct({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      img: product.img,
      quantity: 1,
      attributes: defaultAttributes,
      productId: product.id
    }));

    toast({
      title: "Ajouté au panier",
      description: `${product.title} a été ajouté à votre panier`,
    });
  };

  // Calculate total stock across all variants
  const totalStock = product.stockByVariant 
    ? Object.values(product.stockByVariant).reduce((sum, stock) => sum + stock, 0)
    : 0;

  const isInStock = product.inStock !== false && totalStock > 0;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;

  // Safely get attribute values for preview
  const getAttributePreview = () => {
    if (!product.attributes) return [];
    
    const previewItems = [];
    let itemCount = 0;
    
    for (const [key, values] of Object.entries(product.attributes)) {
      // Check if values is an array
      if (Array.isArray(values)) {
        // Take first 2 values from each attribute
        for (let i = 0; i < Math.min(values.length, 2); i++) {
          if (itemCount < 3) { // Show max 3 preview items total
            previewItems.push({
              key,
              value: values[i],
              index: i
            });
            itemCount++;
          }
        }
      }
    }
    
    return previewItems;
  };

  const attributePreview = getAttributePreview();
  const totalAttributeItems = product.attributes 
    ? Object.values(product.attributes).flat().filter(v => Array.isArray(v) ? v.length : 1).length
    : 0;

  return (
    <div 
      className="group relative bg-card rounded-2xl overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      style={{ animationDelay: `${(index || 0) * 100}ms` }}
      onClick={handleViewDetails}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetails(e as any);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.img}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={!isInStock}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={handleViewDetails}
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-4 left-4 z-10">
          {isInStock ? (
            <Badge className="bg-green-500 text-white">
              En Stock
            </Badge>
          ) : (
            <Badge className="bg-red-500 text-white">
              Rupture
            </Badge>
          )}
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-accent text-accent-foreground font-bold flex items-center gap-1">
              <Tag className="h-3 w-3" />
              -{discountPercentage}%
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent">
              €{displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Variant Count */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <span className="text-xs text-muted-foreground">
              {Object.keys(product.attributes).length} option(s)
            </span>
          )}
        </div>

        {/* Attributes Preview */}
        {attributePreview.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {attributePreview.map((attr) => (
              <span
                key={`${attr.key}-${attr.value}-${attr.index}`}
                className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent"
              >
                {attr.value}
              </span>
            ))}
            {totalAttributeItems > attributePreview.length && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{totalAttributeItems - attributePreview.length}
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(e);
          }}
          disabled={!isInStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInStock ? 'Ajouter au panier' : 'Rupture de stock'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;