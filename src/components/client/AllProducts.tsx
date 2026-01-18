import { useEffect, useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Loader2, Package, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Product {
  _id: string;
  title: string;
  price: number;
  img: string;
  size?: string[];
  color?: string[];
  createdAt?: string;
  discount?: number;
  inStock?: boolean;
}

interface AllProductsProps {
  category?: string;
  showFilters?: boolean;
}

const COLORS = ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Jaune'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const AllProducts = ({ category, showFilters = true }: AllProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<string>('newest');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          category ? `/products?category=${category}` : '/products'
        );
        setProducts(Array.isArray(response) ? response : response.data || []);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply color filter
    if (selectedColors.length > 0) {
      result = result.filter((item) =>
        item.color?.some((c) => selectedColors.includes(c))
      );
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      result = result.filter((item) =>
        item.size?.some((s) => selectedSizes.includes(s))
      );
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter((item) => {
        if (max) {
          return item.price >= min && item.price <= max;
        }
        return item.price >= min;
      });
    }

    // Apply sorting
    if (sort === 'newest') {
      result.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } else if (sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedColors, selectedSizes, priceRange, sort]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange('all');
  };

  const activeFiltersCount = selectedColors.length + selectedSizes.length + (priceRange !== 'all' ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Prix</h4>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les prix" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les prix</SelectItem>
            <SelectItem value="0-25">Moins de 25€</SelectItem>
            <SelectItem value="25-50">25€ - 50€</SelectItem>
            <SelectItem value="50-100">50€ - 100€</SelectItem>
            <SelectItem value="100-">Plus de 100€</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Couleurs</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <Badge
              key={color}
              variant={selectedColors.includes(color) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedColors.includes(color) 
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => toggleColor(color)}
            >
              {color}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Tailles</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Badge
              key={size}
              variant={selectedSizes.includes(size) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedSizes.includes(size) 
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </Badge>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Effacer les filtres ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        {/* Controls Bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-accent text-accent-foreground ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-muted-foreground text-sm">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          {showFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl p-6 card-shadow">
                <h3 className="font-bold text-lg mb-6 text-foreground">Filtres</h3>
                <FilterContent />
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="h-16 w-16 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-muted-foreground mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearFilters} variant="outline">
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
