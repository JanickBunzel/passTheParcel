create type "public"."parcel_type" as enum ('NORMAL', 'FOOD');

create type "public"."user_type" as enum ('END_USER', 'COURIER', 'DISTRIBUTOR');


create table "public"."addresses" (
                                      "id" uuid not null default gen_random_uuid(),
                                      "country" text not null,
                                      "postal_code" text not null,
                                      "street_name" text not null,
                                      "hhouse_number" text not null,
                                      "coordinates" json not null
);



create table "public"."orders" (
                                   "id" uuid not null default gen_random_uuid(),
                                   "parcel" uuid not null,
                                   "from" uuid not null,
                                   "to" uuid not null,
                                   "started" timestamp with time zone,
                                   "finished" timestamp with time zone,
                                   "owner" uuid,
                                   "next" uuid
);



create table "public"."parcels" (
                                    "id" uuid not null default gen_random_uuid(),
                                    "sender" uuid not null,
                                    "receiver" uuid not null,
                                    "owner" uuid not null,
                                    "destination" uuid,
                                    "size" json,
                                    "weight" double precision,
                                    "description" text,
                                    "type" public.parcel_type not null default 'NORMAL'::public.parcel_type
);



create table "public"."users" (
                                  "id" uuid not null default gen_random_uuid(),
                                  "account" uuid not null default gen_random_uuid(),
                                  "address" uuid not null,
                                  "type" public.user_type not null default 'END_USER'::public.user_type
);


CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX parcels_pkey ON public.parcels USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."parcels" add constraint "parcels_pkey" PRIMARY KEY using index "parcels_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."orders" add constraint "orders_from_fkey" FOREIGN KEY ("from") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_from_fkey";

alter table "public"."orders" add constraint "orders_next_fkey" FOREIGN KEY (next) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."orders" validate constraint "orders_next_fkey";

alter table "public"."orders" add constraint "orders_owner_fkey" FOREIGN KEY (owner) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_owner_fkey";

alter table "public"."orders" add constraint "orders_parcel_fkey" FOREIGN KEY (parcel) REFERENCES public.parcels(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_parcel_fkey";

alter table "public"."orders" add constraint "orders_to_fkey" FOREIGN KEY ("to") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_to_fkey";

alter table "public"."parcels" add constraint "parcels_destination_fkey" FOREIGN KEY (destination) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_destination_fkey";

alter table "public"."parcels" add constraint "parcels_owner_fkey" FOREIGN KEY (owner) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_owner_fkey";

alter table "public"."parcels" add constraint "parcels_receiver_fkey" FOREIGN KEY (receiver) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_receiver_fkey";

alter table "public"."parcels" add constraint "parcels_sender_fkey" FOREIGN KEY (sender) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_sender_fkey";

alter table "public"."users" add constraint "users_account_fkey" FOREIGN KEY (account) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_account_fkey";

alter table "public"."users" add constraint "users_address_fkey" FOREIGN KEY (address) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_address_fkey";

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

grant delete on table "public"."addresses" to "anon";

grant insert on table "public"."addresses" to "anon";

grant references on table "public"."addresses" to "anon";

grant select on table "public"."addresses" to "anon";

grant trigger on table "public"."addresses" to "anon";

grant truncate on table "public"."addresses" to "anon";

grant update on table "public"."addresses" to "anon";

grant delete on table "public"."addresses" to "authenticated";

grant insert on table "public"."addresses" to "authenticated";

grant references on table "public"."addresses" to "authenticated";

grant select on table "public"."addresses" to "authenticated";

grant trigger on table "public"."addresses" to "authenticated";

grant truncate on table "public"."addresses" to "authenticated";

grant update on table "public"."addresses" to "authenticated";

grant delete on table "public"."addresses" to "postgres";

grant insert on table "public"."addresses" to "postgres";

grant references on table "public"."addresses" to "postgres";

grant select on table "public"."addresses" to "postgres";

grant trigger on table "public"."addresses" to "postgres";

grant truncate on table "public"."addresses" to "postgres";

grant update on table "public"."addresses" to "postgres";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant references on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant trigger on table "public"."addresses" to "service_role";

grant truncate on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "postgres";

grant insert on table "public"."orders" to "postgres";

grant references on table "public"."orders" to "postgres";

grant select on table "public"."orders" to "postgres";

grant trigger on table "public"."orders" to "postgres";

grant truncate on table "public"."orders" to "postgres";

grant update on table "public"."orders" to "postgres";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."parcels" to "anon";

grant insert on table "public"."parcels" to "anon";

grant references on table "public"."parcels" to "anon";

grant select on table "public"."parcels" to "anon";

grant trigger on table "public"."parcels" to "anon";

grant truncate on table "public"."parcels" to "anon";

grant update on table "public"."parcels" to "anon";

grant delete on table "public"."parcels" to "authenticated";

grant insert on table "public"."parcels" to "authenticated";

grant references on table "public"."parcels" to "authenticated";

grant select on table "public"."parcels" to "authenticated";

grant trigger on table "public"."parcels" to "authenticated";

grant truncate on table "public"."parcels" to "authenticated";

grant update on table "public"."parcels" to "authenticated";

grant delete on table "public"."parcels" to "postgres";

grant insert on table "public"."parcels" to "postgres";

grant references on table "public"."parcels" to "postgres";

grant select on table "public"."parcels" to "postgres";

grant trigger on table "public"."parcels" to "postgres";

grant truncate on table "public"."parcels" to "postgres";

grant update on table "public"."parcels" to "postgres";

grant delete on table "public"."parcels" to "service_role";

grant insert on table "public"."parcels" to "service_role";

grant references on table "public"."parcels" to "service_role";

grant select on table "public"."parcels" to "service_role";

grant trigger on table "public"."parcels" to "service_role";

grant truncate on table "public"."parcels" to "service_role";

grant update on table "public"."parcels" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "postgres";

grant insert on table "public"."users" to "postgres";

grant references on table "public"."users" to "postgres";

grant select on table "public"."users" to "postgres";

grant trigger on table "public"."users" to "postgres";

grant truncate on table "public"."users" to "postgres";

grant update on table "public"."users" to "postgres";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";