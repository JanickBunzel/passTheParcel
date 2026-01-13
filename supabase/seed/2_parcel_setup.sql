begin;

-- -------------------------------------------------------------------
-- Addresses
-- -------------------------------------------------------------------
insert into public.addresses (id, geodata, country, city, street, house_number, postal_code)
values
    (
        gen_random_uuid(),
        '{"lat":52.5200,"lng":13.4050}',
        'Germany',
        'Berlin',
        'Alexanderplatz',
        '1',
        '10178'
    ),
    (
        gen_random_uuid(),
        '{"lat":48.8566,"lng":2.3522}',
        'France',
        'Paris',
        'Rue de Rivoli',
        '99',
        '75001'
    ),
    (
        gen_random_uuid(),
        '{"lat":41.9028,"lng":12.4964}',
        'Italy',
        'Rome',
        'Via del Corso',
        '45',
        '00186'
    ),
    (
        gen_random_uuid(),
        '{"lat":40.7128,"lng":-74.0060}',
        'USA',
        'New York',
        'Broadway',
        '500',
        '10012'
    );

-- -------------------------------------------------------------------
-- Parcels
-- -------------------------------------------------------------------
-- We look up account + address IDs dynamically so this seed is re-runnable
insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'NORMAL',
    'AWAITING_DELIVERY',
    2.5,
    'Books shipment'
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'bob@example.com'
         join public.addresses addr on addr.city = 'Berlin'
where a_sender.email = 'alice@example.com';

insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'FOOD',
    'IN_DELIVERY',
    1.2,
    'Fresh pasta package'
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'eva@example.com'
         join public.addresses addr on addr.city = 'Rome'
where a_sender.email = 'carla@example.com';

insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'FRAGILE',
    'DELIVERED',
    4.8,
    'Glassware set'
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'alice@example.com'
         join public.addresses addr on addr.city = 'Paris'
where a_sender.email = 'david@example.com';

-- -------------------------------------------------------------------
-- Orders
-- -------------------------------------------------------------------
insert into public.orders (
    parcel,
    owner,
    started,
    finished,
    "from",
    "to"
)
select
    p.id,
    null,
    now() - interval '2 days',
    null,
    addr_from.id,
    addr_to.id
from public.parcels p
    join public.addresses addr_from on addr_from.city = 'New York'
    join public.addresses addr_to on addr_to.id = p.destination
where p.description = 'Books shipment';

insert into public.orders (
    parcel,
    owner,
    started,
    finished,
    "from",
    "to"
)
select
    p.id,
    null,
    now() - interval '5 days',
    now() - interval '1 day',
    addr_from.id,
    addr_to.id
from public.parcels p
    join public.addresses addr_from on addr_from.city = 'Berlin'
    join public.addresses addr_to on addr_to.id = p.destination
where p.description = 'Glassware set';

commit;
