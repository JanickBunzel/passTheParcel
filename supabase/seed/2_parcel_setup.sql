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
-- Parcel 1
insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description,
    lat,
    lng
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'NORMAL',
    'AWAITING_DELIVERY',
    2.5,
    'Books shipment',
    48.137154,
    11.576124
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'bob@example.com'
         join public.addresses addr on addr.city = 'Berlin'
where a_sender.email = 'alice@example.com';

-- Parcel 2
insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description,
    lat,
    lng
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'FOOD',
    'IN_DELIVERY',
    1.2,
    'Fresh pasta package',
    48.132554,
    11.566768
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'eva@example.com'
         join public.addresses addr on addr.city = 'Rome'
where a_sender.email = 'carla@example.com';

-- Parcel 3
insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description,
    lat,
    lng
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'FRAGILE',
    'DELIVERED',
    4.8,
    'Glassware set',
    48.142116,
    11.577536
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'alice@example.com'
         join public.addresses addr on addr.city = 'Paris'
where a_sender.email = 'david@example.com';

-- Parcel 4
insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description,
    lat,
    lng
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'NORMAL',
    'AWAITING_DELIVERY',
    3.1,
    'Parcel 4',
    48.135125,
    11.57545
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'bob@example.com'
         join public.addresses addr on addr.city = 'Berlin'
where a_sender.email = 'carla@example.com';

-- Parcel 5
insert into public.parcels (
    sender,
    receiver,
    owner,
    destination,
    type,
    status,
    weight,
    description,
    lat,
    lng
)
select
    a_sender.id,
    a_receiver.id,
    a_sender.id,
    addr.id,
    'FOOD',
    'IN_DELIVERY',
    2.8,
    'Parcel 5',
    48.134,
    11.5842
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'eva@example.com'
         join public.addresses addr on addr.city = 'Rome'
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
    null,
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
    null,
    null,
    addr_from.id,
    addr_to.id
from public.parcels p
    join public.addresses addr_from on addr_from.city = 'Berlin'
    join public.addresses addr_to on addr_to.id = p.destination
where p.description = 'Glassware set';

commit;
