import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

interface Product {
  _id: string;
  title: string;
  price: number;
  img: string;
  discount?: number;
  inStock?: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch newest/featured products
        const response = await api.get('/products?new=true');
        console.log('FeaturedProducts API response:', response);
        // Handle response - backend returns array directly
        const productsArray = Array.isArray(response) ? response : response.data || [];
        console.log('FeaturedProducts processed array:', productsArray);
        // Take first 8 products
        setProducts(productsArray.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Sélection spéciale
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produits <span className="text-gradient">Vedettes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de produits populaires et tendance
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/products">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8"
            >
              Voir tous les produits
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;