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
  Loader2,
  Palette,
  Ruler,
  Tag
} from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addProduct } from '@/redux/cartSlice';
import { useToast } from '@/hooks/use-toast';
import { productsAPI } from '@/lib/api';

interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  img: string;
  inStock?: boolean;
  attributes?: {
    [key: string]: string[];
  };
  stockByVariant?: {
    [key: string]: number;
  };
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(Number(id));
        setProduct(response);
        
        // Initialize selected attributes with first available values
        if (response.attributes) {
          const initialAttributes: Record<string, string> = {};
          Object.entries(response.attributes).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              initialAttributes[key] = value[0];
            }
          });
          setSelectedAttributes(initialAttributes);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Generate variant key from selected attributes
  const generateVariantKey = (attrs: Record<string, string>) => {
    return Object.keys(attrs)
      .sort()
      .map(key => attrs[key])
      .join('_');
  };

  // Get stock for current variant
  const getCurrentVariantStock = () => {
    if (!product || !product.stockByVariant || Object.keys(selectedAttributes).length === 0) {
      return 0;
    }
    const variantKey = generateVariantKey(selectedAttributes);
    return product.stockByVariant[variantKey] || 0;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const currentStock = getCurrentVariantStock();
    
    // Check if variant is in stock
    if (currentStock < quantity) {
      toast({
        title: "Stock insuffisant",
        description: `Il ne reste que ${currentStock} unité(s) de ce variant`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if any variant is selected
    if (Object.keys(selectedAttributes).length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner les options du produit",
        variant: "destructive"
      });
      return;
    }
    
    const variantKey = generateVariantKey(selectedAttributes);
    
    dispatch(addProduct({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      img: product.img,
      quantity,
      attributes: { ...selectedAttributes },
      variantKey,
      productId: product.id
    }));
    
    toast({
      title: "Ajouté au panier",
      description: `${product.title} (${Object.values(selectedAttributes).join(', ')}) a été ajouté à votre panier`,
    });
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName]: value
    };
    setSelectedAttributes(newAttributes);
  };

  const attributeIcons: Record<string, React.ReactNode> = {
    size: <Ruler className="h-4 w-4" />,
    color: <Palette className="h-4 w-4" />,
    material: <Palette className="h-4 w-4" />,
  };

  const attributeLabels: Record<string, string> = {
    size: 'Taille',
    color: 'Couleur',
    material: 'Matériau',
  };

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

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;
  const currentStock = getCurrentVariantStock();
  const isVariantInStock = currentStock > 0;

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
              {hasDiscount && (
                <Badge className="bg-accent text-accent-foreground font-bold flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  -{discountPercentage}%
                </Badge>
              )}
              {product.inStock ? (
                <Badge className="bg-green-500 text-white">En Stock</Badge>
              ) : (
                <Badge className="bg-red-500 text-white">Rupture de stock</Badge>
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
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">
                €{displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    €{product.price.toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-accent border-accent">
                    Économisez {discountPercentage}%
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Dynamic Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-4">
                {Object.entries(product.attributes).map(([attributeName, options]) => {
                  if (!Array.isArray(options) || options.length === 0) return null;
                  
                  const icon = attributeIcons[attributeName] || null;
                  const label = attributeLabels[attributeName] || 
                    attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
                  
                  return (
                    <div key={attributeName} className="space-y-3">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        {icon}
                        {label}: 
                        <span className="text-accent capitalize">
                          {selectedAttributes[attributeName]}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {options.map((option: string) => (
                          <button
                            key={option}
                            onClick={() => handleAttributeChange(attributeName, option)}
                            className={`px-4 py-2 rounded-full border-2 transition-all capitalize text-sm ${
                              selectedAttributes[attributeName] === option
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-accent/50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stock information for selected variant */}
            {Object.keys(selectedAttributes).length > 0 && (
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-sm font-medium">
                  Stock pour {Object.values(selectedAttributes).join(', ')}: 
                  <span className={`ml-2 ${isVariantInStock ? 'text-green-500' : 'text-red-500'}`}>
                    {isVariantInStock ? `${currentStock} disponible(s)` : 'Rupture de stock'}
                  </span>
                </p>
                {!isVariantInStock && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Ce variant n'est actuellement pas disponible
                  </p>
                )}
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
                    disabled={!isVariantInStock}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!isVariantInStock || quantity >= currentStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {isVariantInStock && currentStock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {currentStock} disponible(s)
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold text-lg"
                onClick={handleAddToCart}
                disabled={!isVariantInStock || Object.keys(selectedAttributes).length === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isVariantInStock ? 'Ajouter au panier' : 'Indisponible'}
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