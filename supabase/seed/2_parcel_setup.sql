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
    ),
    (
        gen_random_uuid(),
        '{"lat":48.1351,"lng":11.5820}',
        'Germany',
        'Munich',
        'Marienplatz',
        '8',
        '80331'
    ),
    (
        gen_random_uuid(),
        '{"lat":50.1109,"lng":8.6821}',
        'Germany',
        'Frankfurt am Main',
        'Zeil',
        '110',
        '60313'
    ),
    (
        gen_random_uuid(),
        '{"lat":53.5511,"lng":9.9937}',
        'Germany',
        'Hamburg',
        'Reeperbahn',
        '25',
        '20359'
    ),
    (
        gen_random_uuid(),
        '{"lat":50.9375,"lng":6.9603}',
        'Germany',
        'Cologne',
        'Hohe Strasse',
        '85',
        '50667'
    ),
    (
        gen_random_uuid(),
        '{"lat":48.7758,"lng":9.1829}',
        'Germany',
        'Stuttgart',
        'Königstrasse',
        '40',
        '70173'
    ),
    (
        gen_random_uuid(),
        '{"lat":51.2277,"lng":6.7735}',
        'Germany',
        'Düsseldorf',
        'Schadowstrasse',
        '60',
        '40212'
    ),
    (
        gen_random_uuid(),
        '{"lat":51.0504,"lng":13.7373}',
        'Germany',
        'Dresden',
        'Prager Strasse',
        '15',
        '01069'
    ),
    (
        gen_random_uuid(),
        '{"lat":52.3759,"lng":9.7320}',
        'Germany',
        'Hanover',
        'Georgstrasse',
        '22',
        '30159'
    ),
    (
        gen_random_uuid(),
        '{"lat":49.4521,"lng":11.0767}',
        'Germany',
        'Nuremberg',
        'Königstrasse',
        '70',
        '90402'
    ),
    (
        gen_random_uuid(),
        '{"lat":49.0069,"lng":8.4037}',
        'Germany',
        'Karlsruhe',
        'Kaiserstrasse',
        '120',
        '76133'
    ),
    (
        gen_random_uuid(),
        '{"lat":51.4556,"lng":7.0116}',
        'Germany',
        'Essen',
        'Limbecker Platz',
        '1',
        '45127'
    ),
    (
        gen_random_uuid(),
        '{"lat":51.4818,"lng":7.2162}',
        'Germany',
        'Bochum',
        'Kortumstrasse',
        '55',
        '44787'
    ),
    (
        gen_random_uuid(),
        '{"lat":51.5136,"lng":7.4653}',
        'Germany',
        'Dortmund',
        'Westenhellweg',
        '102',
        '44137'
    ),
    (
        gen_random_uuid(),
        '{"lat":52.0302,"lng":8.5325}',
        'Germany',
        'Bielefeld',
        'Bahnhofstrasse',
        '28',
        '33602'
    ),
    (
        gen_random_uuid(),
        '{"lat":53.8655,"lng":10.6866}',
        'Germany',
        'Lübeck',
        'Breite Strasse',
        '12',
        '23552'
    ),
    (
        gen_random_uuid(),
        '{"lat":54.3233,"lng":10.1228}',
        'Germany',
        'Kiel',
        'Holstenstrasse',
        '5',
        '24103'
    ),
    (
        gen_random_uuid(),
        '{"lat":52.2689,"lng":10.5268}',
        'Germany',
        'Braunschweig',
        'Damm',
        '18',
        '38100'
    ),
    (
        gen_random_uuid(),
        '{"lat":49.4875,"lng":8.4660}',
        'Germany',
        'Mannheim',
        'Planken',
        '90',
        '68161'
    ),
    (
        gen_random_uuid(),
        '{"lat":47.9990,"lng":7.8421}',
        'Germany',
        'Freiburg im Breisgau',
        'Kaiser-Joseph-Strasse',
        '200',
        '79098'
    ),
    (
        gen_random_uuid(),
        '{"lat":52.1205,"lng":11.6276}',
        'Germany',
        'Magdeburg',
        'Ernst-Reuter-Allee',
        '10',
        '39104'
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
    'AWAITING_DELIVERY',
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
    'AWAITING_DELIVERY',
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
    'AWAITING_DELIVERY',
    2.8,
    'Parcel 5',
    48.134,
    11.5842
from public.accounts a_sender
         join public.accounts a_receiver on a_receiver.email = 'eva@example.com'
         join public.addresses addr on addr.city = 'Rome'
where a_sender.email = 'david@example.com';

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
    s.id  as sender,
    r.id  as receiver,
    s.id  as owner,
    addr.id as destination,
    'NORMAL',
    'AWAITING_DELIVERY',
    p.weight,
    p.description,
    p.lat,
    p.lng
from (
         values
             ('alice@example.com', 'bob@example.com',   'Berlin',     52.5200, 13.4050, 1.2, 'Electronics'),
             ('bob@example.com',   'carla@example.com', 'Munich',     48.1351, 11.5820, 3.5, 'Clothing'),
             ('carla@example.com', 'david@example.com', 'Hamburg',    53.5511, 9.9937,  2.0, 'Books'),
             ('david@example.com', 'eva@example.com',   'Cologne',    50.9375, 6.9603,  5.0, 'Kitchenware'),
             ('eva@example.com',   'alice@example.com', 'Frankfurt am Main', 50.1109, 8.6821, 0.8, 'Documents'),

             ('alice@example.com', 'carla@example.com', 'Stuttgart',  48.7758, 9.1829,  4.3, 'Spare parts'),
             ('bob@example.com',   'david@example.com', 'Düsseldorf', 51.2277, 6.7735,  2.7, 'Shoes'),
             ('carla@example.com', 'eva@example.com',   'Dresden',    51.0504, 13.7373, 1.9, 'Toys'),
             ('david@example.com', 'alice@example.com', 'Hanover',    52.3759, 9.7320,  3.0, 'Office supplies'),
             ('eva@example.com',   'bob@example.com',   'Nuremberg',  49.4521, 11.0767, 2.4, 'Gadgets'),

             ('alice@example.com', 'david@example.com', 'Karlsruhe',  49.0069, 8.4037,  2.6, 'Textiles'),
             ('bob@example.com',   'eva@example.com',   'Essen',      51.4556, 7.0116,  7.2, 'Tools'),
             ('carla@example.com', 'alice@example.com', 'Bochum',     51.4818, 7.2162,  1.1, 'Letters'),
             ('david@example.com', 'bob@example.com',   'Dortmund',   51.5136, 7.4653,  4.9, 'Home decor'),
             ('eva@example.com',   'carla@example.com', 'Bielefeld',  52.0302, 8.5325,  3.3, 'Outdoor gear'),

             ('alice@example.com', 'eva@example.com',   'Lübeck',     53.8655, 10.6866, 2.2, 'Shoes'),
             ('bob@example.com',   'alice@example.com', 'Kiel',       54.3233, 10.1228, 5.4, 'Books'),
             ('carla@example.com', 'bob@example.com',   'Braunschweig', 52.2689, 10.5268, 1.7, 'Electronics'),
             ('david@example.com', 'carla@example.com', 'Mannheim',   49.4875, 8.4660,  2.8, 'Parcel supplies'),
             ('eva@example.com',   'david@example.com', 'Freiburg im Breisgau', 47.9990, 7.8421, 6.8, 'Machine parts')
     ) as p(sender_email, receiver_email, city, lat, lng, weight, description)
         join public.accounts s on s.email = p.sender_email
         join public.accounts r on r.email = p.receiver_email
         join lateral (
    select a.id
    from public.addresses a
    where a.country = 'Germany'
      and a.city = p.city
    order by random()
        limit 1
) addr on true;

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
    p.id              as parcel,
    null              as owner,
    null              as started,
    null              as finished,
    a_rand.id         as "from",
    p.destination     as "to"
from public.parcels p
         cross join lateral (
    select a.id
    from public.addresses a
    order by random()
        limit 1
) a_rand
where not exists (
    select 1
    from public.orders o
    where o.parcel = p.id
    );
commit;
