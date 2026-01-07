begin;

-- for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Helper to create auth user (and identity) if missing
create or replace function public.seed_auth_user(
  p_email text,
  p_password text
) returns uuid
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = p_email
  limit 1;

  if v_user_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      p_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',array['email']),
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    returning id into v_user_id;
  end if;

  if not exists (
    select 1
    from auth.identities
    where provider = 'email'
      and user_id = v_user_id
  ) then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', p_email),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  return v_user_id;
end;
$$;

-- Seed 5 example users + accounts, password for all: 123
do $$
declare
  r record;
  v_id uuid;
begin
  for r in
    select * from (values
      ('alice@example.com', 'Alice Example'),
      ('bob@example.com',   'Bob Example'),
      ('carla@example.com', 'Carla Example'),
      ('david@example.com', 'David Example'),
      ('eva@example.com',   'Eva Example')
    ) as t(email, name)
  loop
    v_id := public.seed_auth_user(r.email, '123');

    insert into public.accounts (id, name, email, created_at)
    values (v_id, r.name, r.email, now())
    on conflict (id) do update set
      name = excluded.name,
      email = excluded.email;
  end loop;
end $$;

commit;
