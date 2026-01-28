import { useParams } from 'react-router-dom';
import ClientLayout from '@/components/client/ClientLayout';
import AllProducts from '@/components/client/AllProducts';

const ProductsPage = () => {
  const { category } = useParams();

  return (
    <ClientLayout>
      <section className="pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {category ? <span className="capitalize">{category}</span> : <>Notre <span className="text-gradient">Magasin</span></>}
            </h1>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <AllProducts />
        </div>
      </section>
    </ClientLayout>
  );
};

export default ProductsPage;