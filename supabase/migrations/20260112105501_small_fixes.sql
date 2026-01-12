alter table "public"."parcels" alter column "type" drop default;

alter type "public"."parcel_type" rename to "parcel_type__old_version_to_be_dropped";

create type "public"."parcel_type" as enum ('NORMAL', 'FOOD', 'FRAGILE');

alter table "public"."parcels" alter column type type "public"."parcel_type" using type::text::"public"."parcel_type";

alter table "public"."parcels" alter column "type" set default 'NORMAL'::public.parcel_type;

drop type "public"."parcel_type__old_version_to_be_dropped";

alter table "public"."addresses" drop column "hhouse_number";

alter table "public"."addresses" add column "city_name" text not null;

alter table "public"."addresses" add column "house_number" text not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.seed_auth_user(p_email text, p_password text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
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
$function$
;