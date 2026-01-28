import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { productsAPI } from '@/lib/api';

interface Product {
  id: number;
  title: string;
  price: number;
  discountPrice?: number;
  img: string;
  inStock: boolean;
  attributes: Record<string, string[]>;
  stockByVariant: Record<string, number>;
  createdAt: string;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ new: true });
        const productsArray = Array.isArray(response) ? response : response.data || [];
        // Sort by creation date and take first 8
        const sortedProducts = productsArray
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
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
            Nouveautés
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nos <span className="text-gradient">Nouveautés</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos derniers ajouts et produits tendance
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun nouveau produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  img: product.img,
                  inStock: product.inStock,
                  attributes: product.attributes,
                  stockByVariant: product.stockByVariant
                }} 
              />
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