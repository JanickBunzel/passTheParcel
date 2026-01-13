create type "public"."parcel_status" as enum ('AWAITING_DELIVERY', 'IN_DELIVERY', 'DELIVERED');

create type "public"."parcel_type" as enum ('NORMAL', 'FOOD', 'FRAGILE');


create table "public"."addresses" (
                                      "id" uuid not null default gen_random_uuid(),
                                      "geodata" json not null,
                                      "country" text,
                                      "city" text,
                                      "street" text,
                                      "house_number" text,
                                      "postal_code" text
);



create table "public"."orders" (
                                   "id" uuid not null default gen_random_uuid(),
                                   "parcel" uuid not null,
                                   "owner" uuid,
                                   "started" timestamp with time zone,
                                   "finished" timestamp with time zone,
                                   "next" uuid,
                                   "from" uuid not null,
                                   "to" uuid
);



create table "public"."parcels" (
                                    "id" uuid not null default gen_random_uuid(),
                                    "sender" uuid not null,
                                    "receiver" uuid,
                                    "owner" uuid not null,
                                    "destination" uuid not null,
                                    "type" public.parcel_type not null default 'NORMAL'::public.parcel_type,
                                    "status" public.parcel_status not null default 'AWAITING_DELIVERY'::public.parcel_status,
                                    "weight" double precision not null,
                                    "description" text
);


alter table "public"."accounts" add column "address" uuid;

CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX parcels_pkey ON public.parcels USING btree (id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."parcels" add constraint "parcels_pkey" PRIMARY KEY using index "parcels_pkey";

alter table "public"."accounts" add constraint "accounts_address_fkey" FOREIGN KEY (address) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."accounts" validate constraint "accounts_address_fkey";

alter table "public"."orders" add constraint "orders_from_fkey" FOREIGN KEY ("from") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_from_fkey";

alter table "public"."orders" add constraint "orders_next_fkey" FOREIGN KEY (next) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_next_fkey";

alter table "public"."orders" add constraint "orders_owner_fkey" FOREIGN KEY (owner) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_owner_fkey";

alter table "public"."orders" add constraint "orders_parcel_fkey" FOREIGN KEY (parcel) REFERENCES public.parcels(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_parcel_fkey";

alter table "public"."orders" add constraint "orders_to_fkey" FOREIGN KEY ("to") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_to_fkey";

alter table "public"."parcels" add constraint "parcels_destination_fkey" FOREIGN KEY (destination) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_destination_fkey";

alter table "public"."parcels" add constraint "parcels_owner_fkey" FOREIGN KEY (owner) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_owner_fkey";

alter table "public"."parcels" add constraint "parcels_receiver_fkey" FOREIGN KEY (receiver) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_receiver_fkey";

alter table "public"."parcels" add constraint "parcels_sender_fkey" FOREIGN KEY (sender) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."parcels" validate constraint "parcels_sender_fkey";

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