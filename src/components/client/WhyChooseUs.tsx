import { Truck, ShieldCheck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Expédition sous 24h pour toutes vos commandes',
  },
  {
    icon: ShieldCheck,
    title: 'Qualité garantie',
    description: 'Tous nos produits sont soigneusement sélectionnés',
  },
  {
    icon: Headphones,
    title: 'Support amical',
    description: 'Notre équipe est disponible 7j/7 pour vous aider',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 px-4 bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi nous choisir?
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
