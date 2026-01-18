import { ReactNode } from 'react';
import TopBar from './TopBar';
import Navbar from './Navbar';
import Footer from './Footer';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
