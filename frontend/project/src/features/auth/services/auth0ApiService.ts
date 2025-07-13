import { useUser } from '@auth0/nextjs-auth0';

export const useAuth0ApiService = () => {
  const { user, isLoading } = useUser();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};