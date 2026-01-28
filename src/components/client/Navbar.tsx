// components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Menu, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/userSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categoriesAPI } from '@/lib/api'; // Import categoriesAPI

interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate
  const dispatch = useAppDispatch();
  const cartQuantity = useAppSelector((state) => state.cart.quantity);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // State for categories
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category click - navigate to products with category filter
  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?category=${categoryId}`);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  // Base nav links
  const navLinks = [
    { path: '/', label: 'Accueil' },
    { 
      label: 'Boutique',
      dropdown: true,
      // We'll handle dropdown items separately
    },
    { path: '/contact', label: 'Contact' },
  ];

  // Create dropdown items with categories
  const boutiqueItems = [
    { path: '/products', label: 'Tous les produits' },
    ...categories.map(category => ({
      onClick: () => handleCategoryClick(category.id),
      label: category.name
    }))
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground tracking-wide">
              SHOP<span className="text-accent">STORE</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, idx) => 
              link.dropdown ? (
                <DropdownMenu key={idx}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 font-medium gap-1"
                    >
                      {link.label}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {loadingCategories ? (
                      <DropdownMenuItem className="justify-center">
                        <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/products" className="cursor-pointer">
                            Tous les produits
                          </Link>
                        </DropdownMenuItem>
                        {categories.map(category => (
                          <DropdownMenuItem 
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className="cursor-pointer"
                          >
                            {category.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.path}
                  to={link.path!}
                  className={cn(
                    "px-4 py-2 font-medium rounded-md transition-colors",
                    isActive(link.path!) 
                      ? "text-primary-foreground bg-primary-foreground/10" 
                      : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary-foreground hover:bg-primary-foreground/10 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse-soft">
                    {cartQuantity}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-primary border-primary">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-col gap-2">
                    {navLinks.map((link, idx) => 
                      link.dropdown ? (
                        <div key={idx} className="space-y-2">
                          <span className="text-lg font-semibold text-primary-foreground px-2">
                            {link.label}
                          </span>
                          <Link
                            to="/products"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 px-4 rounded-md transition-colors text-primary-foreground/80 hover:bg-primary-foreground/10"
                          >
                            Tous les produits
                          </Link>
                          {loadingCategories ? (
                            <div className="py-2 px-4 text-center">
                              <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full mx-auto" />
                            </div>
                          ) : (
                            categories.map(category => (
                              <button
                                key={category.id}
                                onClick={() => {
                                  handleCategoryClick(category.id);
                                  setMobileMenuOpen(false);
                                }}
                                className="block w-full text-left py-2 px-4 rounded-md transition-colors text-primary-foreground/80 hover:bg-primary-foreground/10"
                              >
                                {category.name}
                              </button>
                            ))
                          )}
                        </div>
                      ) : (
                        <Link
                          key={link.path}
                          to={link.path!}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "text-lg font-semibold py-2 px-2 rounded-md transition-colors",
                            isActive(link.path!) 
                              ? "text-accent" 
                              : "text-primary-foreground hover:text-accent"
                          )}
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>

                  {currentUser ? (
                    <div className="flex flex-col gap-2 pt-4 border-t border-primary-foreground/20">
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                          <User className="h-4 w-4" />
                          Mon Profil
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" 
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-primary-foreground/20">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                          Connexion
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          searchOpen ? "max-h-16 opacity-100 mt-3" : "max-h-0 opacity-0"
        )}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-primary-foreground border-0 rounded-full"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <Button 
                type="submit"
                size="icon" 
                variant="ghost"
                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;