// src/components/Footer.tsx - Updated with dynamic categories
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { categoriesAPI } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoriesAPI.getAll();
        // Take only first 3 categories for footer
        setCategories(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Handle newsletter subscription
      console.log('Subscribing email:', email);
      setEmail('');
      // Add your newsletter logic here
    }
  };

  if (loading) {
    return (
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Inscrivez-vous à notre newsletter</h3>
              <p className="text-primary-foreground/70">Recevez les dernières offres et nouveautés</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2">
              <Input 
                type="email" 
                placeholder="Votre email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 max-w-xs"
                required
              />
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                S'inscrire
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              SHOP<span className="text-accent">STORE</span>
            </h2>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Votre destination pour les meilleurs produits. Qualité, style et service exceptionnels.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Dynamic Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Catégories</h3>
            {categories.length > 0 ? (
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/products" 
                    className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Tous les produits
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/products?category=${category.id}`}
                      className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-primary-foreground/50 text-sm">Chargement des catégories...</p>
            )}
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Livraison
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Retours
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/70 group">
                <div className="p-2 bg-primary-foreground/10 rounded-full group-hover:bg-accent transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>25 rue de la Paix, Paris</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70 group">
                <div className="p-2 bg-primary-foreground/10 rounded-full group-hover:bg-accent transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70 group">
                <div className="p-2 bg-primary-foreground/10 rounded-full group-hover:bg-accent transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span>contact@shopstore.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} ShopStore. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/60 text-sm">Paiements sécurisés</span>
              <div className="flex gap-2">
                <div className="bg-primary-foreground/10 px-3 py-1 rounded text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Visa
                </div>
                <div className="bg-primary-foreground/10 px-3 py-1 rounded text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Mastercard
                </div>
                <div className="bg-primary-foreground/10 px-3 py-1 rounded text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;