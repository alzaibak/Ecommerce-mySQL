import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PromoBanner = () => {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent via-accent to-orange-dark p-8 md:p-12">
          {/* Decorative circles */}
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/20 rounded-full transform -translate-y-1/2" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/10 rounded-full transform -translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-accent-foreground/90 font-medium mb-2">
                Offre limitée!
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground">
                50% de réduction <span className="text-primary-foreground">Soldes d'été</span>
              </h2>
            </div>
            
            <Link to="/products">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/90 hover:bg-white text-accent border-0 rounded-full font-semibold px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Acheter maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
