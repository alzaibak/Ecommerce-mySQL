import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  ChevronLeft, 
  Truck, 
  RotateCcw, 
  Shield,
  Loader2
} from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addProduct } from '@/redux/cartSlice';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Product {
  _id: string;
  title: string;
  desc?: string;
  price: number;
  img: string;
  categories?: string[];
  size?: string[];
  color?: string[];
  discount?: number;
  inStock?: boolean;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/find/${id}`);
        setProduct(response);
        if (response.size?.length) setSelectedSize(response.size[0]);
        if (response.color?.length) setSelectedColor(response.color[0]);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    dispatch(addProduct({
      ...product,
      quantity,
      color: selectedColor,
      size: selectedSize,
    }));
    
    toast({
      title: "Ajouté au panier",
      description: `${product.title} a été ajouté à votre panier`,
    });
  };

  const discountedPrice = product?.discount 
    ? product.price * (1 - product.discount / 100) 
    : null;

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </ClientLayout>
    );
  }

  if (!product) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Link to="/products">
            <Button className="bg-accent hover:bg-accent/90">
              Retour aux produits
            </Button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative bg-card rounded-2xl overflow-hidden card-shadow">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.discount && (
                <Badge className="bg-accent hover:bg-accent text-accent-foreground font-bold text-sm px-3 py-1">
                  -{product.discount}%
                </Badge>
              )}
              {product.inStock && (
                <Badge className="bg-green-500 text-white">En Stock</Badge>
              )}
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute top-4 right-4 z-10 rounded-full bg-background/80 hover:bg-background hover:text-accent"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <div className="aspect-square p-8">
              <img 
                src={product.img} 
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {product.categories?.length && (
              <div className="flex gap-2">
                {product.categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs capitalize">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">
                €{(discountedPrice ?? product.price).toFixed(2)}
              </span>
              {discountedPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  €{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.desc && (
              <p className="text-muted-foreground leading-relaxed">
                {product.desc}
              </p>
            )}

            {/* Color Selection */}
            {product.color && product.color.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Couleur: <span className="text-accent capitalize">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border-2 transition-all capitalize text-sm ${
                        selectedColor === color
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.size && product.size.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Taille: <span className="text-accent">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Quantité</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold text-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <span className="text-xs text-muted-foreground">Livraison gratuite</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-accent" />
                </div>
                <span className="text-xs text-muted-foreground">Retour 30 jours</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <span className="text-xs text-muted-foreground">Paiement sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductDetailPage;