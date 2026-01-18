import ClientLayout from '@/components/client/ClientLayout';
import HeroSlider from '@/components/client/HeroSlider';
import FeaturedProducts from '@/components/client/FeaturedProducts';
import PromoBanner from '@/components/client/PromoBanner';
import WhyChooseUs from '@/components/client/WhyChooseUs';

const HomePage = () => {
  console.log('HomePage rendering');
  return (
    <ClientLayout>
      {/* Hero Section */}
      <HeroSlider />

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Promo Banner */}
      <PromoBanner />

      {/* Why Choose Us */}
      <WhyChooseUs />
    </ClientLayout>
  );
};

export default HomePage;