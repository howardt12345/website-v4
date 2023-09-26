const PATH = '/admin';

export const useAdminStore = defineStore('admin', () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const hasUser = computed<boolean>(() => !!user.value);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.WEBSITE_URL + PATH,
      },
    });
    if (error) console.log(error);
  };

  return {
    user,
    hasUser,
    signIn
  };
});
