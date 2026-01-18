import { ArrowRight, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSlider = () => {
  return (
    <>
      <section className="relative bg-gradient-primary min-h-[500px] lg:min-h-[550px] flex items-center overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-foreground/5 clip-diagonal hidden lg:block" />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="space-y-6 text-center lg:text-left animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Améliorez votre
                <br />
                <span className="text-accent">Style de vie!</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-md mx-auto lg:mx-0">
                Meilleures offres sur les derniers produits
              </p>
              
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  Acheter maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Product Images - Placeholder for visual */}
            <div className="hidden lg:flex items-center justify-center relative animate-slide-in-right">
              <div className="relative w-full max-w-lg">
                {/* Main product showcase area */}
                <div className="aspect-square bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <div className="text-primary-foreground/40 text-center">
                    <p className="text-lg font-medium">Vos produits vedettes</p>
                    <p className="text-sm">Ajoutez des images ici</p>
                  </div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/30 rounded-full blur-xl animate-float" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/20 rounded-full blur-lg animate-float animation-delay-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 52.5C1200 55 1320 50 1380 47.5L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-muted-foreground animate-fade-in-up">
              <div className="p-2 bg-green-100 rounded-full">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">Paiements sécurisés</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground animate-fade-in-up animation-delay-100">
              <div className="p-2 bg-blue-100 rounded-full">
                <RotateCcw className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium">Retours faciles</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground animate-fade-in-up animation-delay-200">
              <div className="p-2 bg-purple-100 rounded-full">
                <Headphones className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-medium">Support 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSlider;
