insert into public.user (title, description, handle, email)
values
(
  'Offstage Dance Studio',
  'Dance studio in the heart of OC offering classes for all ages and skill levels.',
  'offstage',
  'offstage@gmail.com'
),
(
  'Shigeto Nakano',
  'Dancer with years experience in openstyle choreography, and is part of a world-renowned dance crew called S-rank.',
  'shiggy',
  'shigeto.nakano@gmail.com'
),
(
  'Julian Talens',
  'A personal trainer to help you lead a healthier life.',
  'juliantalens',
  'julian.talens@gmail.com'
);

insert into public.service_group (title, priority, user_id, is_horizontal)
values
(
  'Studio rental',
  1
  (select id from public.user where handle = 'offstage'),
  TRUE
),
(
  'Classes',
  2,
  (select id from public.user where handle = 'offstage'),
  FALSE
);

insert into public.service (service_group_id, title, booking_limit, price)
values
(
  (select id from public.service_group where title = 'Studio rental'),
  'Small room rental (1-10 people hourly)',
  NULL,
  60000
),
(
  (select id from public.service_group where title = 'Studio rental'),
  'Large room rental (10+ people hourly)',
  NULL,
  80000
),
(
  (select id from public.service_group where title = 'Studio rental'),
  'Talk to us!',
  NULL,
  NULL
),
(
  (select id from public.service_group where title = 'Classes'),
  'Beginner',
  100,
  1200
),
(
  (select id from public.service_group where title = 'Classes'),
  'Intermediate/Advanced',
  100,
  1200
),
(
  (select id from public.service_group where title = 'Classes'),
  'K-pop',
  100,
  1200
),
(
  (select id from public.service_group where title = 'Classes'),
  'Contemporary fusion',
  100,
  1200
);