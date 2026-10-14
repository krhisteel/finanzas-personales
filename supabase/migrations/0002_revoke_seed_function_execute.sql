-- La función del trigger no debe poder llamarse desde la API pública.
revoke execute on function public.seed_default_categories() from public, anon, authenticated;
