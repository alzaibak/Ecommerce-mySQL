import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Loader2, Sparkles, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsAPI } from '@/lib/api';

interface Product {
  id: number; // Changed from string to number
  title: string;
  description: string;
  price: number;
  discountPrice?: number; // Added discount price
  img: string;
  inStock: boolean;
  attributes: Record<string, string[]>;
  stockByVariant: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        const productsArray = Array.isArray(response) ? response : response.data || [];
        setProducts(productsArray);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          // Sort by discounted price if available
          const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
          const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
          return priceA - priceB;
        case 'price-high':
          const priceAHigh = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
          const priceBHigh = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
          return priceBHigh - priceAHigh;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-80"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Trier par:</span>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'Aucun produit trouvé pour votre recherche.' : 'Aucun produit disponible pour le moment.'}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Effacer la recherche
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
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

      {/* Stock Summary */}
      <div className="mt-8 p-4 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">À propos du stock</h3>
        <p className="text-sm text-muted-foreground">
          Chaque produit peut avoir différentes variations (couleur, taille, etc.) avec des stocks séparés. 
          La disponibilité indiquée est globale pour le produit. 
          Vérifiez la page du produit pour voir les stocks par variation spécifique.
        </p>
      </div>
    </div>
  );
};

export default AllProducts;