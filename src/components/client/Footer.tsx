import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
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
            <div className="flex w-full md:w-auto gap-2">
              <Input 
                type="email" 
                placeholder="Votre email" 
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 max-w-xs"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                S'inscrire
              </Button>
            </div>
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
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-primary-foreground/10 rounded-full hover:bg-accent transition-all duration-300"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Boutique</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/products" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/vetements" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Vêtements
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/chaussures" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Chaussures
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/accessoires" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Accessoires
                </Link>
              </li>
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Livraison
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Retours
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-accent" />
                <span>25 rue de la Paix, Paris</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="h-4 w-4 text-accent" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="h-4 w-4 text-accent" />
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
              © 2024 ShopStore. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/60 text-sm mr-2">Paiements sécurisés</span>
              <div className="flex gap-2">
                <div className="bg-primary-foreground/10 px-3 py-1 rounded text-xs font-medium">Visa</div>
                <div className="bg-primary-foreground/10 px-3 py-1 rounded text-xs font-medium">Mastercard</div>
                <div className="bg-primary-foreground/10 px-3 py-1 rounded text-xs font-medium">PayPal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
