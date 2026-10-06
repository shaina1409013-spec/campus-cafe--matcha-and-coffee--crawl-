CREATE TABLE public.profiles (id uuid PRIMARY KEY, name text NOT NULL DEFAULT '' CHECK (char_length(name) <= 100), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO public.profiles (id, name) VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'name',''),100)); RETURN NEW; END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.cafes (id serial PRIMARY KEY, name text NOT NULL UNIQUE, location text NOT NULL, wifi boolean NOT NULL DEFAULT true, rating numeric(2,1) NOT NULL DEFAULT 0, categories text[] NOT NULL DEFAULT '{}', icon text NOT NULL DEFAULT '☕', description text NOT NULL DEFAULT '');
GRANT SELECT ON public.cafes TO anon, authenticated; GRANT ALL ON public.cafes TO service_role;
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cafes public" ON public.cafes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.drinks (id serial PRIMARY KEY, cafe_id int NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE, name text NOT NULL, icon text NOT NULL DEFAULT '☕', price int NOT NULL CHECK (price >= 0));
GRANT SELECT ON public.drinks TO anon, authenticated; GRANT ALL ON public.drinks TO service_role;
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drinks public" ON public.drinks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), cafe_name text NOT NULL CHECK (char_length(cafe_name) BETWEEN 1 AND 100), item text NOT NULL CHECK (char_length(item) BETWEEN 1 AND 100), outlet boolean NOT NULL, rating int NOT NULL CHECK (rating BETWEEN 1 AND 5), body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 1000), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.reviews TO anon; GRANT SELECT, INSERT, DELETE ON public.reviews TO authenticated; GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews own insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews own delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.favorites (user_id uuid NOT NULL DEFAULT auth.uid(), cafe_id int NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, cafe_id));
CREATE TABLE public.visits (user_id uuid NOT NULL DEFAULT auth.uid(), cafe_id int NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE, visited_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, cafe_id));
GRANT SELECT, INSERT, DELETE ON public.favorites, public.visits TO authenticated; GRANT ALL ON public.favorites, public.visits TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY; ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav own" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visit own" ON public.visits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.cafes (id,name,location,rating,categories,icon,description) VALUES
(1,'Campus Brew','Near Main Gate',4.5,'{wifi,coffee}','☕','A comfortable café near campus suitable for students.'),
(2,'Matcha House','University Road',4.7,'{wifi,matcha}','🍵','A calm matcha bar loved by students.'),
(3,'Bean Corner','Student Market',4.3,'{coffee,wifi}','🥤','Budget-friendly coffee in the student market.'),
(4,'Green Cup','College Road',4.6,'{matcha,coffee}','🍵','Cosy spot for matcha and coffee.');
SELECT setval('public.cafes_id_seq', 4);
INSERT INTO public.drinks (cafe_id,name,icon,price) VALUES
(1,'Matcha Latte','🍵',180),(1,'Cold Brew','🥤',160),(1,'Iced Coffee','🧊',120),
(2,'Matcha Latte','🍵',170),(2,'Iced Coffee','🧊',150),
(3,'Cold Brew','🥤',140),(3,'Iced Coffee','🧊',90),
(4,'Matcha Latte','🍵',175),(4,'Iced Coffee','🧊',110);