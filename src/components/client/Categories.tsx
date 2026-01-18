import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: number;
  title: string;
  cat: string;
  image: string;
}

interface CategoriesProps {
  categories: Category[];
}

const Categories = ({ categories }: CategoriesProps) => {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products/${category.cat}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 text-center">
                  {category.title}
                </h3>
                <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2 rounded-full font-medium text-sm group-hover:bg-white group-hover:text-foreground transition-all duration-300">
                  Découvrir
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
