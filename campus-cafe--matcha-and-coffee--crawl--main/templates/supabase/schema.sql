create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null default '' check (char_length(display_name) <= 100),
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
    on public.profiles
    for select
    to authenticated
    using ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name)
    values (
        new.id,
        left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 100)
    );

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name)
select
    id,
    left(trim(coalesce(raw_user_meta_data ->> 'display_name', '')), 100)
from auth.users
on conflict (id) do nothing;

create table if not exists public.cafe_reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    cafe text not null check (char_length(cafe) between 1 and 100),
    item text not null check (char_length(item) between 1 and 100),
    outlet_available boolean not null,
    rating smallint not null check (rating between 1 and 5),
    review text not null check (char_length(trim(review)) between 1 and 1000),
    author_name text not null default 'Campus Café Student' check (char_length(author_name) between 1 and 100),
    created_at timestamptz not null default now()
);

alter table public.cafe_reviews
    add column if not exists author_name text not null default 'Campus Café Student'
    check (char_length(author_name) between 1 and 100);

update public.cafe_reviews as reviews
set author_name = coalesce(nullif(trim(profiles.display_name), ''), 'Campus Café Student')
from public.profiles as profiles
where profiles.id = reviews.user_id
    and reviews.author_name = 'Campus Café Student';

create or replace function public.set_cafe_review_author_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    select coalesce(nullif(trim(display_name), ''), 'Campus Café Student')
    into new.author_name
    from public.profiles
    where id = new.user_id;

    if new.author_name is null then
        raise exception 'A profile is required to submit a review.';
    end if;

    return new;
end;
$$;

drop trigger if exists set_cafe_review_author_name on public.cafe_reviews;
create trigger set_cafe_review_author_name
    before insert on public.cafe_reviews
    for each row execute procedure public.set_cafe_review_author_name();

alter table public.cafe_reviews enable row level security;

revoke all on table public.cafe_reviews from anon, authenticated;
grant select on table public.cafe_reviews to anon, authenticated;
grant insert on table public.cafe_reviews to authenticated;

drop policy if exists "Anyone can read café reviews" on public.cafe_reviews;
create policy "Anyone can read café reviews"
    on public.cafe_reviews
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Authenticated users can create their own reviews" on public.cafe_reviews;
create policy "Authenticated users can create their own reviews"
    on public.cafe_reviews
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
