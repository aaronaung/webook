insert into public.user (email)
values
(
  'offstage@gmail.com'
),
(
  'shigeto.nakano@gmail.com'
),
(
  'julian.talens@gmail.com'
);

insert into public.business (title, email, description, handle, owner_id)
values
(
  'Offstage',
  'offstage@gmail.com',
  'Dance studio in the heart of OC offering classes for all ages and skill levels.',
  'offstage',
  (select id from public.user where email = 'offstage@gmail.com')
),
(
  'Shigeto Nakano',
  'shigeto.nakano@gmail.com',
  'Dancer with years experience in openstyle choreography, and is part of a world-renowned dance crew called S-rank.',
  'shiggy',
  (select id from public.user where email = 'shigeto.nakano@gmail.com')
),
(
  'Julian Talens',
  'julian.talens@gmail.com',
  'A personal trainer to help you lead a healthier life.',
  'juliantalens',
  (select id from public.user where email = 'julian.talens@gmail.com')
);

insert into public.service_group (title, priority, business_id, color)
values
(
  'Studio rental',
  1,
  (select id from public.business where handle = 'offstage'),
  '#ffa647'
),
(
  'Classes',
  2,
  (select id from public.business where handle = 'offstage'),
  '#cd93ff'
);

insert into public.service (service_group_id, duration, title, booking_limit, price, image_url)
values
(
  (select id from public.service_group where title = 'Studio rental'),
  3600000, -- 1 hours in milliseconds
  'Small room rental (1-10 people hourly)',
  NULL,
  60000,
  'https://www.inspiredancestudio.com/uploads/4/9/9/6/4996741/studio-3_orig.jpg'
),
(
  (select id from public.service_group where title = 'Studio rental'),
  3600000, -- 1 hours in milliseconds
  'Large room rental (10+ people hourly)',
  NULL,
  80000,
  'https://www.inspiredancestudio.com/uploads/4/9/9/6/4996741/studio-1_orig.jpg'
);

/* Insert service events for studio rental */
WITH schedule_data AS (
  SELECT 
    date,
    service_title
  FROM (
    VALUES 
      ('OCTOBER 2 2023 5:00PM PDT',  'Small room rental (1-10 people hourly)'),
      ('OCTOBER 2 2023 5:00PM PDT',  'Large room rental (10+ people hourly)'),
      ('OCTOBER 2 2023 9:00PM PDT',  'Small room rental (1-10 people hourly)'),
      ('OCTOBER 3 2023 9:30PM PDT',  'Small room rental (1-10 people hourly)'),
      ('OCTOBER 3 2023 10:00PM PDT', 'Large room rental (10+ people hourly)'),
      ('OCTOBER 4 2023 8:30PM PDT',  'Small room rental (1-10 people hourly)'),
      ('OCTOBER 5 2023 9:00PM PDT',  'Small room rental (1-10 people hourly)'),
      ('OCTOBER 5 2023 10:00PM PDT', 'Large room rental (10+ people hourly)'),
      ('OCTOBER 6 2023 5:00PM PDT',  'Large room rental (10+ people hourly)'),
      ('OCTOBER 6 2023 5:00PM PDT',  'Small room rental (1-10 people hourly)')
  ) AS schedule (date, service_title)
)
INSERT INTO service_event (start, recurrence_start, recurrence_interval, recurrence_count, service_id)
SELECT
  date::timestamptz AS start,
  date::timestamptz AS recurrence_start,
  604800000 AS recurrence_interval, -- 7 days in milliseconds
  4 as recurrence_count,
  (select id from service s where s.title = service_title limit 1) AS service_id
FROM 
  schedule_data
ORDER BY start;

/* Insert staffs and offstage business <> staff */
WITH handle_list AS (
    SELECT DISTINCT regexp_replace(substring(line from '@[^\s]+'), '@', '', 'g') AS instagram_handle
    FROM regexp_split_to_table(
        E'OCTOBER 2 2023 00 - @sexykook (K-pop | “3D” by Jung Kook)\n6:00 - @heymisslauren (Intermediate/Advanced)\n7:30 - @_jellow (Intermediate/Advanced)\n7:30 - @mari_salarda (Beginners)\n7:45 - @deesap (Starter Heels)\n9:00 - @alexus_samone (Intermediate/Advanced)\n9:00 - @deesap (Intermediate/Advanced Heels)\n9:15 - @ethanbaotran (Breaking)\n\OCTOBER 3 2023 00 - @michaelbxrt (Intermediate/Advanced)\n6:00 - @anthonyrayishere (Beginners)\n6:30 - @j4_gaspar (Starter Class)\n7:30 - @lpdavidlee (Beginners)\n7:30 - @lex_ishimoto (Contemporary Fusion)\n7:45 - @lynn.aiko (Starter Heels)\n9:00 - @ethanestandian (Intermediate/Advanced)\n9:00 - @lynn.aiko (Intermediate/Advanced Heels)\n\nWEDNESDAY, OCTOBER 4\n6:00 - @roro_kamion (Beginner Heels)\n6:00 - @aaliflower (K-pop)\n7:30 - @ivxnparedes (Intermediate/Advanced)\n7:30 - @geegtorres (Beginners)\n7:45 - @essencefloriedance (Starter Heels)\n9:00 - @joshvason (Intermediate/Advanced)\n9:15 - @jensine.yu (Starter Class)\n\nTHURSDAY, OCTOBER 5\n6:00 - @dinykim (Intermediate/Advanced)\n6:00 - @boymeetsale (K-pop)\n7:30 - @marktullen (Intermediate/Advanced)\n7:30 - @shigeto.nakano (Beginners)\n7:45 - @julesclairee (Starter Class)\n9:00 - @danyelmoulton (Intermediate/Advanced)\n9:00 - @davidslayme (Intermediate/Advanced Heels)\n9:15 - @hirari.w7 (Whacking Foundations)\n\nFRIDAY, OCTOBER 6\n6:00 - @yerson.8a (K-pop)\n6:00 - @justin_ito (Intermediate/Advanced)\n7:30 - @ethanestandian (Intermediate/Advanced)\n7:30 - @msshimmaayy (Beginners)\n7:45 - @ethanbaotran (Kid’s Breaking Class | Ages 4 to 16)\n9:00 - @jeffreycaluag (Intermediate/Advanced)\n9:00 - @justdestiny (Vogue)\n9:15 - @_asahim_ (Starter Class)\n\nSATURDAY, OCTOBER 7\n6:00 - @grantkaita_ (Intermediate/Advanced)\n6:00 - @j0rdanbautista (Beginner Jazz Funk)\n7:30 - @_claireku (Contemporary Fusion)\n7:30 - @kianatangonan (Intermediate/Advanced)\n7:45- @jeekalua (Whacking Foundations)\n9:00 - @itsfonso (Intermediate/Advanced)\n9:00 - @jeekalua (Whacking Choreography)\n9:15 - @clancyhickson (Starter Class)',
        E'\n'
    ) AS line
    WHERE line ~ '@[^\s]+'
)
INSERT INTO staff (instagram_handle, business_id)
SELECT
    hl.instagram_handle,
    b.id AS business_id
FROM handle_list hl
JOIN business b ON b.handle = 'offstage';

/* Insert offstage class service group <> service */
INSERT INTO service (title, duration, service_group_id, price, booking_limit)
SELECT DISTINCT
  regexp_replace(substring(line from '\(([^\)]+)\)'), '\(', '', 'g') AS title,
  5400000 AS duration, -- 1.5 hours in milliseconds
  sg.id AS service_group_id,
  1200 AS price,
  100 AS booking_limit
FROM regexp_split_to_table(
    E'OCTOBER 2 2023 00 - @sexykook (K-pop)\n6:00 - @heymisslauren (Intermediate/Advanced)\n7:30 - @_jellow (Intermediate/Advanced)\n7:30 - @mari_salarda (Beginners)\n7:45 - @deesap (Starter Heels)\n9:00 - @alexus_samone (Intermediate/Advanced)\n9:00 - @deesap (Intermediate/Advanced Heels)\n9:15 - @ethanbaotran (Breaking)\n\OCTOBER 3 2023 00 - @michaelbxrt (Intermediate/Advanced)\n6:00 - @anthonyrayishere (Beginners)\n6:30 - @j4_gaspar (Starter Class)\n7:30 - @lpdavidlee (Beginners)\n7:30 - @lex_ishimoto (Contemporary Fusion)\n7:45 - @lynn.aiko (Starter Heels)\n9:00 - @ethanestandian (Intermediate/Advanced)\n9:00 - @lynn.aiko (Intermediate/Advanced Heels)\n\nWEDNESDAY, OCTOBER 4\n6:00 - @roro_kamion (Beginner Heels)\n6:00 - @aaliflower (K-pop)\n7:30 - @ivxnparedes (Intermediate/Advanced)\n7:30 - @geegtorres (Beginners)\n7:45 - @essencefloriedance (Starter Heels)\n9:00 - @joshvason (Intermediate/Advanced)\n9:15 - @jensine.yu (Starter Class)\n\nTHURSDAY, OCTOBER 5\n6:00 - @dinykim (Intermediate/Advanced)\n6:00 - @boymeetsale (K-pop)\n7:30 - @marktullen (Intermediate/Advanced)\n7:30 - @shigeto.nakano (Beginners)\n7:45 - @julesclairee (Starter Class)\n9:00 - @danyelmoulton (Intermediate/Advanced)\n9:00 - @davidslayme (Intermediate/Advanced Heels)\n9:15 - @hirari.w7 (Whacking Foundations)\n\nFRIDAY, OCTOBER 6\n6:00 - @yerson.8a (K-pop)\n6:00 - @justin_ito (Intermediate/Advanced)\n7:30 - @ethanestandian (Intermediate/Advanced)\n7:30 - @msshimmaayy (Beginners)\n7:45 - @ethanbaotran (Kid’s Breaking Class | Ages 4 to 16)\n9:00 - @jeffreycaluag (Intermediate/Advanced)\n9:00 - @justdestiny (Vogue)\n9:15 - @_asahim_ (Starter Class)\n\nSATURDAY, OCTOBER 7\n6:00 - @grantkaita_ (Intermediate/Advanced)\n6:00 - @j0rdanbautista (Beginner Jazz Funk)\n7:30 - @_claireku (Contemporary Fusion)\n7:30 - @kianatangonan (Intermediate/Advanced)\n7:45 - @jeekalua (Whacking Foundations)\n9:00 - @itsfonso (Intermediate/Advanced)\n9:00 - @jeekalua (Whacking Choreography)\n9:15 - @clancyhickson (Starter Class)',
    E'\n'
) AS line
JOIN service_group sg ON sg.title = 'Classes'
WHERE regexp_replace(substring(line from '\(([^\)]+)\)'), '\(', '', 'g') IS NOT NULL; -- Ensure title is not null

/* Insert service events based on some schedule */
WITH schedule_data AS (
  SELECT
    date,
    staff_handle,
    service_title
  FROM (
    VALUES
      ('OCTOBER 2 2023 6:00PM PDT', 'sexykook', 'K-pop'),
      ('OCTOBER 2 2023 6:00PM PDT', 'heymisslauren', 'Intermediate/Advanced'),
      ('OCTOBER 2 2023 7:30PM PDT', '_jellow', 'Intermediate/Advanced'),
      ('OCTOBER 2 2023 7:30PM PDT', 'mari_salarda', 'Beginners'),
      ('OCTOBER 2 2023 7:45PM PDT', 'deesap', 'Starter Heels'),
      ('OCTOBER 2 2023 9:00PM PDT', 'alexus_samone', 'Intermediate/Advanced'),
      ('OCTOBER 2 2023 9:00PM PDT', 'deesap', 'Intermediate/Advanced Heels'),
      ('OCTOBER 2 2023 9:15PM PDT', 'ethanbaotran', 'Breaking'),
      ('OCTOBER 3 2023 6:00PM PDT', 'michaelbxrt', 'Intermediate/Advanced'),
      ('OCTOBER 3 2023 6:00PM PDT', 'anthonyrayishere', 'Beginners'),
      ('OCTOBER 3 2023 6:30PM PDT', 'j4_gaspar', 'Starter Class'),
      ('OCTOBER 3 2023 7:30PM PDT', 'lpdavidlee', 'Beginners'),
      ('OCTOBER 3 2023 7:30PM PDT', 'lex_ishimoto', 'Contemporary Fusion'),
      ('OCTOBER 3 2023 7:45PM PDT', 'lynn.aiko', 'Starter Heels'),
      ('OCTOBER 3 2023 9:00PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
      ('OCTOBER 3 2023 9:00PM PDT', 'lynn.aiko', 'Intermediate/Advanced Heels'),
      ('OCTOBER 4 2023 6:00PM PDT', 'roro_kamion', 'Beginner Heels'),
      ('OCTOBER 4 2023 6:00PM PDT', 'aaliflower', 'K-pop'),
      ('OCTOBER 4 2023 7:30PM PDT', 'ivxnparedes', 'Intermediate/Advanced'),
      ('OCTOBER 4 2023 7:30PM PDT', 'geegtorres', 'Beginners'),
      ('OCTOBER 4 2023 7:45PM PDT', 'essencefloriedance', 'Starter Heels'),
      ('OCTOBER 4 2023 9:00PM PDT', 'joshvason', 'Intermediate/Advanced'),
      ('OCTOBER 4 2023 9:15PM PDT', 'jensine.yu', 'Starter Class'),
      ('OCTOBER 5 2023 6:00PM PDT', 'dinykim', 'Intermediate/Advanced'),
      ('OCTOBER 5 2023 6:00PM PDT', 'boymeetsale', 'K-pop'),
      ('OCTOBER 5 2023 7:30PM PDT', 'marktullen', 'Intermediate/Advanced'),
      ('OCTOBER 5 2023 7:30PM PDT', 'shigeto.nakano', 'Beginners'),
      ('OCTOBER 5 2023 7:45PM PDT', 'julesclairee', 'Starter Class'),
      ('OCTOBER 5 2023 9:00PM PDT', 'danyelmoulton', 'Intermediate/Advanced'),
      ('OCTOBER 5 2023 9:00PM PDT', 'davidslayme', 'Intermediate/Advanced Heels'),
      ('OCTOBER 5 2023 9:15PM PDT', 'hirari.w7', 'Whacking Foundations'),
      ('OCTOBER 6 2023 6:00PM PDT', 'yerson.8a', 'K-pop'),
      ('OCTOBER 6 2023 6:00PM PDT', 'justin_ito', 'Intermediate/Advanced'),
      ('OCTOBER 6 2023 7:30PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
      ('OCTOBER 6 2023 7:30PM PDT', 'msshimmaayy', 'Beginners'),
      ('OCTOBER 6 2023 7:45PM PDT', 'ethanbaotran', 'Kid’s Breaking Class | Ages 4 to 16'),
      ('OCTOBER 6 2023 9:00PM PDT', 'jeffreycaluag', 'Intermediate/Advanced'),
      ('OCTOBER 6 2023 9:00PM PDT', 'justdestiny', 'Vogue'),
      ('OCTOBER 6 2023 9:15PM PDT', '_asahim_', 'Starter Class'),
      ('OCTOBER 7 2023 6:00PM PDT', 'grantkaita_', 'Intermediate/Advanced'),
      ('OCTOBER 7 2023 6:00PM PDT', 'j0rdanbautista', 'Beginner Jazz Funk'),
      ('OCTOBER 7 2023 7:30PM PDT', '_claireku', 'Contemporary Fusion'),
      ('OCTOBER 7 2023 7:30PM PDT', 'kianatangonan', 'Intermediate/Advanced'),
      ('OCTOBER 7 2023 7:45PM PDT', 'jeekalua', 'Whacking Foundations'),
      ('OCTOBER 7 2023 9:00PM PDT', 'itsfonso', 'Intermediate/Advanced'),
      ('OCTOBER 7 2023 9:00PM PDT', 'jeekalua', 'Whacking Choreography'),
      ('OCTOBER 7 2023 9:15PM PDT', 'clancyhickson', 'Starter Class')
  ) AS schedule (date, staff_handle, service_title)
)
INSERT INTO service_event (start, recurrence_start, recurrence_interval, recurrence_count, service_id)
SELECT
  date::timestamptz AS start,
  date::timestamptz AS recurrence_start,
  604800000 AS recurrence_interval, -- 7 days in milliseconds
  4 as recurrence_count,
  (select id from service s where s.title = service_title limit 1) AS service_id
FROM 
  schedule_data
ORDER BY start;

/* assign staffs to the service events */
WITH schedule_data AS (
  SELECT
    date,
    staff_handle,
    service_title
  FROM (
    VALUES
      ('OCTOBER 2 2023 6:00PM PDT', 'sexykook', 'K-pop'),
      ('OCTOBER 2 2023 6:00PM PDT', 'heymisslauren', 'Intermediate/Advanced'),
      ('OCTOBER 2 2023 7:30PM PDT', '_jellow', 'Intermediate/Advanced'),
      ('OCTOBER 2 2023 7:30PM PDT', 'mari_salarda', 'Beginners'),
      ('OCTOBER 2 2023 7:45PM PDT', 'deesap', 'Starter Heels'),
      ('OCTOBER 2 2023 9:00PM PDT', 'alexus_samone', 'Intermediate/Advanced'),
      ('OCTOBER 2 2023 9:00PM PDT', 'deesap', 'Intermediate/Advanced Heels'),
      ('OCTOBER 2 2023 9:15PM PDT', 'ethanbaotran', 'Breaking'),
      ('OCTOBER 3 2023 6:00PM PDT', 'michaelbxrt', 'Intermediate/Advanced'),
      ('OCTOBER 3 2023 6:00PM PDT', 'anthonyrayishere', 'Beginners'),
      ('OCTOBER 3 2023 6:30PM PDT', 'j4_gaspar', 'Starter Class'),
      ('OCTOBER 3 2023 7:30PM PDT', 'lpdavidlee', 'Beginners'),
      ('OCTOBER 3 2023 7:30PM PDT', 'lex_ishimoto', 'Contemporary Fusion'),
      ('OCTOBER 3 2023 7:45PM PDT', 'lynn.aiko', 'Starter Heels'),
      ('OCTOBER 3 2023 9:00PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
      ('OCTOBER 3 2023 9:00PM PDT', 'lynn.aiko', 'Intermediate/Advanced Heels'),
      ('OCTOBER 4 2023 6:00PM PDT', 'roro_kamion', 'Beginner Heels'),
      ('OCTOBER 4 2023 6:00PM PDT', 'aaliflower', 'K-pop'),
      ('OCTOBER 4 2023 7:30PM PDT', 'ivxnparedes', 'Intermediate/Advanced'),
      ('OCTOBER 4 2023 7:30PM PDT', 'geegtorres', 'Beginners'),
      ('OCTOBER 4 2023 7:45PM PDT', 'essencefloriedance', 'Starter Heels'),
      ('OCTOBER 4 2023 9:00PM PDT', 'joshvason', 'Intermediate/Advanced'),
      ('OCTOBER 4 2023 9:15PM PDT', 'jensine.yu', 'Starter Class'),
      ('OCTOBER 5 2023 6:00PM PDT', 'dinykim', 'Intermediate/Advanced'),
      ('OCTOBER 5 2023 6:00PM PDT', 'boymeetsale', 'K-pop'),
      ('OCTOBER 5 2023 7:30PM PDT', 'marktullen', 'Intermediate/Advanced'),
      ('OCTOBER 5 2023 7:30PM PDT', 'shigeto.nakano', 'Beginners'),
      ('OCTOBER 5 2023 7:45PM PDT', 'julesclairee', 'Starter Class'),
      ('OCTOBER 5 2023 9:00PM PDT', 'danyelmoulton', 'Intermediate/Advanced'),
      ('OCTOBER 5 2023 9:00PM PDT', 'davidslayme', 'Intermediate/Advanced Heels'),
      ('OCTOBER 5 2023 9:15PM PDT', 'hirari.w7', 'Whacking Foundations'),
      ('OCTOBER 6 2023 6:00PM PDT', 'yerson.8a', 'K-pop'),
      ('OCTOBER 6 2023 6:00PM PDT', 'justin_ito', 'Intermediate/Advanced'),
      ('OCTOBER 6 2023 7:30PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
      ('OCTOBER 6 2023 7:30PM PDT', 'msshimmaayy', 'Beginners'),
      ('OCTOBER 6 2023 7:45PM PDT', 'ethanbaotran', 'Kid’s Breaking Class | Ages 4 to 16'),
      ('OCTOBER 6 2023 9:00PM PDT', 'jeffreycaluag', 'Intermediate/Advanced'),
      ('OCTOBER 6 2023 9:00PM PDT', 'justdestiny', 'Vogue'),
      ('OCTOBER 6 2023 9:15PM PDT', '_asahim_', 'Starter Class'),
      ('OCTOBER 7 2023 6:00PM PDT', 'grantkaita_', 'Intermediate/Advanced'),
      ('OCTOBER 7 2023 6:00PM PDT', 'j0rdanbautista', 'Beginner Jazz Funk'),
      ('OCTOBER 7 2023 7:30PM PDT', '_claireku', 'Contemporary Fusion'),
      ('OCTOBER 7 2023 7:30PM PDT', 'kianatangonan', 'Intermediate/Advanced'),
      ('OCTOBER 7 2023 7:45PM PDT', 'jeekalua', 'Whacking Foundations'),
      ('OCTOBER 7 2023 9:00PM PDT', 'itsfonso', 'Intermediate/Advanced'),
      ('OCTOBER 7 2023 9:00PM PDT', 'jeekalua', 'Whacking Choreography'),
      ('OCTOBER 7 2023 9:15PM PDT', 'clancyhickson', 'Starter Class')
  ) AS schedule (date, staff_handle, service_title)
)
INSERT INTO service_event_staff (service_event_id, staff_id)
SELECT
  ss.id AS service_event_id,
  st.id AS staff_id
FROM schedule_data
JOIN staff st ON st.instagram_handle = staff_handle
JOIN service s ON s.title = service_title
JOIN service_event ss ON ss.service_id = s.id
WHERE ss.start = date::timestamptz AND
      ss.service_id = s.id;

/* Add random image_urls to staffs */
WITH cte AS (
  SELECT id, 'https://i.pravatar.cc/250?u=mail@' || row_number() OVER () || '.co.uk' AS new_image_url
  FROM staff
)
UPDATE staff AS t
SET image_url = cte.new_image_url
FROM cte
WHERE t.id = cte.id;

/* Insert staff names */
WITH schedule_data AS (
  SELECT
    date,
    staff_handle,
    service_title,
    first_name,
    last_name
  FROM (
    VALUES 
      ('OCTOBER 2 2023 6:00PM PDT', 'sexykook', 'K-pop', 'Miriya', 'Lee'),
('OCTOBER 2 2023 6:00PM PDT', 'heymisslauren', 'Intermediate/Advanced', 'Miss', 'Lauren'),
('OCTOBER 2 2023 7:30PM PDT', '_jellow', 'Intermediate/Advanced', 'Jellow', ''),
('OCTOBER 2 2023 7:30PM PDT', 'mari_salarda', 'Beginners', 'Mari', 'Salarda'),
('OCTOBER 2 2023 7:45PM PDT', 'deesap', 'Starter Heels', 'Deesap', ''),
('OCTOBER 2 2023 9:00PM PDT', 'alexus_samone', 'Intermediate/Advanced', 'Alexus', 'Samone'),
('OCTOBER 2 2023 9:00PM PDT', 'deesap', 'Intermediate/Advanced Heels', 'Deesap', ''),
('OCTOBER 2 2023 9:15PM PDT', 'ethanbaotran', 'Breaking', 'Ethan', 'Tran'),
('OCTOBER 3 2023 6:00PM PDT', 'michaelbxrt', 'Intermediate/Advanced', 'Michael', 'Burt'),
('OCTOBER 3 2023 6:00PM PDT', 'anthonyrayishere', 'Beginners', 'Anthony', 'Martinez'),
('OCTOBER 3 2023 6:30PM PDT', 'j4_gaspar', 'Starter Class', 'J4', 'Gaspar'),
('OCTOBER 3 2023 7:30PM PDT', 'lpdavidlee', 'Beginners', 'David', 'Lee'),
('OCTOBER 3 2023 7:30PM PDT', 'lex_ishimoto', 'Contemporary Fusion', 'Lex', 'Ishimoto'),
('OCTOBER 3 2023 7:45PM PDT', 'lynn.aiko', 'Starter Heels', 'Lynn', 'Aiko'),
('OCTOBER 3 2023 9:00PM PDT', 'ethanestandian', 'Intermediate/Advanced', 'Ethan', 'Estandian'),
('OCTOBER 3 2023 9:00PM PDT', 'lynn.aiko', 'Intermediate/Advanced Heels', 'Lynn', 'Aiko'),
('OCTOBER 4 2023 6:00PM PDT', 'roro_kamion', 'Beginner Heels', 'Roro', 'Kamion'),
('OCTOBER 4 2023 6:00PM PDT', 'aaliflower', 'K-pop', 'Aliyah', 'Flower'),
('OCTOBER 4 2023 7:30PM PDT', 'ivxnparedes', 'Intermediate/Advanced', 'Ivan', 'Parades'),
('OCTOBER 4 2023 7:30PM PDT', 'geegtorres', 'Beginners', 'GeeGee', 'Torres'),
('OCTOBER 4 2023 7:45PM PDT', 'essencefloriedance', 'Starter Heels','Essence', 'Florie'),
('OCTOBER 4 2023 9:00PM PDT', 'joshvason', 'Intermediate/Advanced', 'Joshua', 'Son'),
('OCTOBER 4 2023 9:15PM PDT', 'jensine.yu', 'Starter Class', 'Jensine', 'Yu'),
('OCTOBER 5 2023 6:00PM PDT', 'dinykim', 'Intermediate/Advanced', 'Diny', 'Kim'),
('OCTOBER 5 2023 6:00PM PDT', 'boymeetsale', 'K-pop', 'Boymeet', 'Sale'),
('OCTOBER 5 2023 7:30PM PDT', 'marktullen', 'Intermediate/Advanced', 'Mark', 'Tullen'),
('OCTOBER 5 2023 7:30PM PDT', 'shigeto.nakano', 'Beginners', 'Shigeto', 'Nakano'),
('OCTOBER 5 2023 7:45PM PDT', 'julesclairee', 'Starter Class', 'Julia', 'Claire'),
('OCTOBER 5 2023 9:00PM PDT', 'danyelmoulton', 'Intermediate/Advanced', 'Danyel', 'Moulton'),
('OCTOBER 5 2023 9:00PM PDT', 'davidslayme', 'Intermediate/Advanced Heels', 'David', 'Slaney'),
('OCTOBER 5 2023 9:15PM PDT', 'hirari.w7', 'Whacking Foundations', 'Hirari', ''),
('OCTOBER 6 2023 6:00PM PDT', 'yerson.8a', 'K-pop', 'Yerson', ''),
('OCTOBER 6 2023 6:00PM PDT', 'justin_ito', 'Intermediate/Advanced', 'Justin', 'Ito'),
('OCTOBER 6 2023 7:30PM PDT', 'ethanestandian', 'Intermediate/Advanced', 'Ethan', 'Estandian' ),
('OCTOBER 6 2023 7:30PM PDT', 'msshimmaayy', 'Beginners', 'Michelle', 'Shimmy'),
('OCTOBER 6 2023 7:45PM PDT', 'ethanbaotran', 'Kid’s Breaking Class | Ages 4 to 16', 'Ethan', 'Tran'),
('OCTOBER 6 2023 9:00PM PDT', 'jeffreycaluag', 'Intermediate/Advanced', 'Jeffrey', 'Caluag'),
('OCTOBER 6 2023 9:00PM PDT', 'justdestiny', 'Vogue', 'Just', 'Destiny'),
('OCTOBER 6 2023 9:15PM PDT', '_asahim_', 'Starter Class', 'Asahi', 'Matsumoto'),
('OCTOBER 7 2023 6:00PM PDT', 'grantkaita_', 'Intermediate/Advanced', 'Grant' , 'Kaita'),
('OCTOBER 7 2023 6:00PM PDT', 'j0rdanbautista', 'Beginner Jazz Funk', 'Jordan', 'Bautista'),
('OCTOBER 7 2023 7:30PM PDT', '_claireku', 'Contemporary Fusion', 'Claire', 'Ku'),
('OCTOBER 7 2023 7:30PM PDT', 'kianatangonan', 'Intermediate/Advanced', 'Kiana', 'Tong'),
('OCTOBER 7 2023 7:45PM PDT', 'jeekalua', 'Whacking Foundations', 'Jeeka', 'Lua'),
('OCTOBER 7 2023 9:00PM PDT', 'itsfonso', 'Intermediate/Advanced', 'Fonso', ''),
('OCTOBER 7 2023 9:00PM PDT', 'jeekalua', 'Whacking Choreography', 'Jeeka', 'Lua'),
('OCTOBER 7 2023 9:15PM PDT', 'clancyhickson', 'Starter Class', 'Clancy', 'Hickson')
    )  AS schedule (date, staff_handle, service_title, first_name, last_name)
)
UPDATE staff
SET first_name = schedule_data.first_name,
    last_name = schedule_data.last_name
FROM schedule_data
WHERE staff.instagram_handle = schedule_data.staff_handle;