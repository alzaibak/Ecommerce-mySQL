import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/redux/userSlice';

const LoginFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isFetching } = useAppSelector((state) => state.user);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    dispatch(loginStart());
    try {
      const response = await api.post('/auth/login', formData);
      // Transform user data to match frontend expectations (firstName -> firstname, lastName -> lastname, id -> _id)
      const transformedUser = {
        ...response.user,
        _id: String(response.user.id || response.user._id),
        firstname: response.user.firstName || response.user.firstname || '',
        lastname: response.user.lastName || response.user.lastname || '',
      };
      dispatch(loginSuccess({
        userInfo: transformedUser,
        token: response.token,
      }));
      toast({
        title: 'Succès',
        description: 'Connexion réussie!',
      });
      navigate('/');
    } catch (error: any) {
      dispatch(loginFailure());
      toast({
        title: 'Erreur',
        description: error.message || 'Identifiants invalides',
        variant: 'destructive',
      });
    }
  };

  return (
    <ClientLayout>
      <section className="py-16 px-4 min-h-[70vh] flex items-center bg-secondary/30">
        <div className="container mx-auto max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 card-shadow animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Connexion
              </h1>
              <p className="text-muted-foreground">
                Connectez-vous à votre compte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isFetching}
                className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
              >
                {isFetching ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                Se connecter
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Pas encore de compte?{' '}
                <Link to="/signup" className="text-accent hover:underline font-medium">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
};

export default LoginFormPage;
