# campus-cafe--matcha-and-coffee--crawl-
A web and app based platform that helps students discover nearby cafes, explore matcha and coffee options, compare prices, and find the perfect places to study, relax, and hang out with friends.

## Supabase authentication setup

The login and signup forms use Supabase Auth. Supabase stores and verifies
accounts in its managed `auth.users` table. The signup name is also saved as
user metadata and copied into `public.profiles` by a database trigger. Row
Level Security restricts profile reads to the signed-in account.

1. Create a Supabase project.
2. In the Supabase dashboard, open **Project Settings → API** and copy the
   **Project URL** and the **anon/public** key (or publishable key).
3. Put those values in `templates/js/supabase-config.js`. Never put a
   service-role or secret key in frontend code.
4. Open the Supabase **SQL Editor**, run `templates/supabase/schema.sql` to
   create the profiles and café reviews tables, their access policies, and the
   signup trigger. Reviews are publicly readable; only signed-in users can
   submit a rating and review.
5. In **Authentication → URL Configuration**, set the Site URL to
   `http://localhost:8000`.
6. Serve the `templates` directory over HTTP and open
   `http://localhost:8000/signup.html`. Supabase email confirmation may need
   to be completed before logging in, depending on the project's Auth settings.
