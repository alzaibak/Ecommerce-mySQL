// src/pages/ProductsPage.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '@/components/client/ProductCard';
import { Loader2, Sparkles, Filter, Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ClientLayout from '@/components/client/ClientLayout';


interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  img: string;
  inStock: boolean;
  attributes: Record<string, string[]>;
  stockByVariant: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

const ProductsPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Check if there's a category in URL (for navigation from navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll()
        ]);

        const productsArray = Array.isArray(productsData) ? productsData : productsData.data || [];
        setProducts(productsArray);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      // Search filter
      const matchesSearch = 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || 
        product.categoryId?.toString() === selectedCategory;
      
      // Stock filter
      const matchesStock = !inStockOnly || product.inStock;
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
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

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setInStockOnly(false);
    setSearchTerm('');
    setSortBy('newest');
  };

  const getActiveCategoryName = () => {
    if (selectedCategory === 'all') return null;
    const category = categories.find(c => c.id.toString() === selectedCategory);
    return category?.name;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <ClientLayout>
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Tous les Produits
        </h1>
        <p className="text-muted-foreground">
          Découvrez notre collection complète
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="space-y-6 sticky top-24">
            {/* Categories Filter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Catégories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/10'
                  }`}
                >
                  Toutes les catégories
                  <Badge variant="secondary" className="ml-2">
                    {products.length}
                  </Badge>
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.id.toString()
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/10'
                    }`}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {products.filter(p => p.categoryId === category.id).length}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div className="space-y-3">
              <h3 className="font-semibold">Disponibilité</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    inStockOnly
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'hover:bg-accent/10'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border ${inStockOnly ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                  En stock seulement
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || inStockOnly) && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full justify-between"
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Mobile Filters Dropdown */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                {/* Categories Filter */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Catégories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/10'
                      }`}
                    >
                      Toutes les catégories
                      <Badge variant="secondary" className="ml-2">
                        {products.length}
                      </Badge>
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id.toString())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === category.id.toString()
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/10'
                        }`}
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {products.filter(p => p.categoryId === category.id).length}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Disponibilité</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        inStockOnly
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'hover:bg-accent/10'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border ${inStockOnly ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                      En stock seulement
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedCategory !== 'all' || inStockOnly) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleClearFilters();
                      setShowFilters(false);
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Top Bar - Search and Sort */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-80"
                />
              </div>
              
              {/* Sort */}
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
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || inStockOnly || searchTerm) && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>
              
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getActiveCategoryName()}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {inStockOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  En stock
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Recherche: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                Tout effacer
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <Badge variant="outline" className="text-sm">
              {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length !== 1 ? 's' : ''} trouvé{filteredAndSortedProducts.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Aucun produit ne correspond à vos critères de recherche.
                Essayez de modifier vos filtres ou utilisez d'autres termes de recherche.
              </p>
              <Button onClick={handleClearFilters}>
                Effacer tous les filtres
              </Button>
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
      </div>
    </div>
    </ClientLayout>
  );
};

export default ProductsPage;