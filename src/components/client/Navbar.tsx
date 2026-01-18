import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const Navbar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const cartQuantity = useAppSelector((state) => state.cart.quantity);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { 
      label: 'Boutique',
      dropdown: true,
      items: [
        { path: '/products', label: 'Tous les produits' },
        { path: '/products/vetements', label: 'Vêtements' },
        { path: '/products/chaussures', label: 'Chaussures' },
        { path: '/products/accessoires', label: 'Accessoires' },
      ]
    },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
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
                    {link.items?.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link 
                          to={item.path}
                          className={cn(
                            "w-full cursor-pointer",
                            isActive(item.path) && "bg-accent/10 text-accent"
                          )}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
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
                          {link.items?.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "block py-2 px-4 rounded-md transition-colors",
                                isActive(item.path) 
                                  ? "bg-accent text-accent-foreground" 
                                  : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-primary-foreground border-0 rounded-full"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
