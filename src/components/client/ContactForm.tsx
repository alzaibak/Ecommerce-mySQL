import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.email || !formData.message) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast({
        title: 'Succès',
        description: 'Votre message a été envoyé avec succès',
      });
      setFormData({ name: '', subject: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Un problème est survenu. Veuillez réessayer plus tard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Contact Info & Map */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
                <span className="text-gradient">Contactez</span> Nous
              </h2>
              <p className="text-muted-foreground max-w-md">
                N'hésitez pas à nous contacter à tout moment. Nous vous répondrons dans les plus brefs délais.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">forhappydays@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">0589745956</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">25 rue de la address, Paris</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-48 bg-secondary/30 rounded-2xl overflow-hidden border border-border">
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <MapPin className="h-8 w-8 mr-2" />
                <span>Carte Interactive</span>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Envoyez-nous un message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Objet</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Sujet du message"
                    value={formData.subject}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Écrivez votre message ici..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="rounded-xl resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
