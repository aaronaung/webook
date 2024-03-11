insert into public.users (email)
values
(
  'offstage@gmail.com'
),
(
  'shigeto.nakano@gmail.com'
),
(
  'aaron.didi@gmail.com'
);

insert into public.businesses (title, email, description, handle, owner_id)
values
(
  'Offstage',
  'offstage@gmail.com',
  'Dance studio in the heart of OC offering classes for all ages and skill levels.',
  'offstage',
  (select id from public.users where email = 'offstage@gmail.com')
),
(
  'Shigeto Nakano',
  'shigeto.nakano@gmail.com',
  'Dancer with years experience in openstyle choreography, and is part of a world-renowned dance crew called S-rank.',
  'shiggy',
  (select id from public.users where email = 'shigeto.nakano@gmail.com')
),
(
  'Aaron Didi',
  'aaron.didi@gmail.com',
  'Dancer with iso focus',
  'aarondidi',
  (select id from public.users where email = 'aaron.didi@gmail.com')
);

-- insert into public.services (business_id, duration, title, booking_limit, price)
-- values
-- (
--   (select id from public.businesses where title = 'Offstage'),
--   3600000, -- 1 hours in milliseconds
--   'Small room rental',
--   10,
--   60000
-- ),
-- (
--   (select id from public.businesses where title = 'Offstage'),
--   3600000, -- 1 hours in milliseconds
--   'Large room rental',
--   10,
--   80000
-- );

-- /* Insert staffs and offstage business <> staffs */
-- WITH handle_list AS (
--     SELECT DISTINCT regexp_replace(substring(line from '@[^\s]+'), '@', '', 'g') AS instagram_handle
--     FROM regexp_split_to_table(
--         E'DECEMBER 2 2023 00 - @sexykook (K-pop | “3D” by Jung Kook)\n6:00 - @heymisslauren (Intermediate/Advanced)\n7:30 - @_jellow (Intermediate/Advanced)\n7:30 - @mari_salarda (Beginners)\n7:45 - @deesap (Starter Heels)\n9:00 - @alexus_samone (Intermediate/Advanced)\n9:00 - @deesap (Intermediate/Advanced Heels)\n9:15 - @ethanbaotran (Breaking)\n\DECEMBER 3 2023 00 - @michaelbxrt (Intermediate/Advanced)\n6:00 - @anthonyrayishere (Beginners)\n6:30 - @j4_gaspar (Starter Class)\n7:30 - @lpdavidlee (Beginners)\n7:30 - @lex_ishimoto (Contemporary Fusion)\n7:45 - @lynn.aiko (Starter Heels)\n9:00 - @ethanestandian (Intermediate/Advanced)\n9:00 - @lynn.aiko (Intermediate/Advanced Heels)\n\nWEDNESDAY, DECEMBER 4\n6:00 - @roro_kamion (Beginner Heels)\n6:00 - @aaliflower (K-pop)\n7:30 - @ivxnparedes (Intermediate/Advanced)\n7:30 - @geegtorres (Beginners)\n7:45 - @essencefloriedance (Starter Heels)\n9:00 - @joshvason (Intermediate/Advanced)\n9:15 - @jensine.yu (Starter Class)\n\nTHURSDAY, DECEMBER 5\n6:00 - @dinykim (Intermediate/Advanced)\n6:00 - @boymeetsale (K-pop)\n7:30 - @marktullen (Intermediate/Advanced)\n7:30 - @shigeto.nakano (Beginners)\n7:45 - @julesclairee (Starter Class)\n9:00 - @danyelmoulton (Intermediate/Advanced)\n9:00 - @davidslayme (Intermediate/Advanced Heels)\n9:15 - @hirari.w7 (Whacking Foundations)\n\nFRIDAY, DECEMBER 6\n6:00 - @yerson.8a (K-pop)\n6:00 - @justin_ito (Intermediate/Advanced)\n7:30 - @ethanestandian (Intermediate/Advanced)\n7:30 - @msshimmaayy (Beginners)\n7:45 - @ethanbaotran (Kid’s Breaking Class | Ages 4 to 16)\n9:00 - @jeffreycaluag (Intermediate/Advanced)\n9:00 - @justdestiny (Vogue)\n9:15 - @_asahim_ (Starter Class)\n\nSATURDAY, DECEMBER 7\n6:00 - @grantkaita_ (Intermediate/Advanced)\n6:00 - @j0rdanbautista (Beginner Jazz Funk)\n7:30 - @_claireku (Contemporary Fusion)\n7:30 - @kianatangonan (Intermediate/Advanced)\n7:45- @jeekalua (Whacking Foundations)\n9:00 - @itsfonso (Intermediate/Advanced)\n9:00 - @jeekalua (Whacking Choreography)\n9:15 - @clancyhickson (Starter Class)',
--         E'\n'
--     ) AS line
--     WHERE line ~ '@[^\s]+'
-- )
-- INSERT INTO staffs (instagram_handle, business_id)
-- SELECT
--     hl.instagram_handle,
--     b.id AS business_id
-- FROM handle_list hl
-- JOIN businesses b ON b.handle = 'offstage';

-- /* Insert offstage business <> services */
-- INSERT INTO services (title, duration, business_id, price, booking_limit)
-- SELECT DISTINCT
--   regexp_replace(substring(line from '\(([^\)]+)\)'), '\(', '', 'g') AS title,
--   5400000 AS duration, -- 1.5 hours in milliseconds
--   b.id AS business_id,
--   1200 AS price,
--   100 AS booking_limit
-- FROM regexp_split_to_table(
--     E'DECEMBER 2 2023 00 - @sexykook (K-pop)\n6:00 - @heymisslauren (Intermediate/Advanced)\n7:30 - @_jellow (Intermediate/Advanced)\n7:30 - @mari_salarda (Beginners)\n7:45 - @deesap (Starter Heels)\n9:00 - @alexus_samone (Intermediate/Advanced)\n9:00 - @deesap (Intermediate/Advanced Heels)\n9:15 - @ethanbaotran (Breaking)\n\DECEMBER 3 2023 00 - @michaelbxrt (Intermediate/Advanced)\n6:00 - @anthonyrayishere (Beginners)\n6:30 - @j4_gaspar (Starter Class)\n7:30 - @lpdavidlee (Beginners)\n7:30 - @lex_ishimoto (Contemporary Fusion)\n7:45 - @lynn.aiko (Starter Heels)\n9:00 - @ethanestandian (Intermediate/Advanced)\n9:00 - @lynn.aiko (Intermediate/Advanced Heels)\n\nWEDNESDAY, DECEMBER 4\n6:00 - @roro_kamion (Beginner Heels)\n6:00 - @aaliflower (K-pop)\n7:30 - @ivxnparedes (Intermediate/Advanced)\n7:30 - @geegtorres (Beginners)\n7:45 - @essencefloriedance (Starter Heels)\n9:00 - @joshvason (Intermediate/Advanced)\n9:15 - @jensine.yu (Starter Class)\n\nTHURSDAY, DECEMBER 5\n6:00 - @dinykim (Intermediate/Advanced)\n6:00 - @boymeetsale (K-pop)\n7:30 - @marktullen (Intermediate/Advanced)\n7:30 - @shigeto.nakano (Beginners)\n7:45 - @julesclairee (Starter Class)\n9:00 - @danyelmoulton (Intermediate/Advanced)\n9:00 - @davidslayme (Intermediate/Advanced Heels)\n9:15 - @hirari.w7 (Whacking Foundations)\n\nFRIDAY, DECEMBER 6\n6:00 - @yerson.8a (K-pop)\n6:00 - @justin_ito (Intermediate/Advanced)\n7:30 - @ethanestandian (Intermediate/Advanced)\n7:30 - @msshimmaayy (Beginners)\n7:45 - @ethanbaotran (Kid’s Breaking Class | Ages 4 to 16)\n9:00 - @jeffreycaluag (Intermediate/Advanced)\n9:00 - @justdestiny (Vogue)\n9:15 - @_asahim_ (Starter Class)\n\nSATURDAY, DECEMBER 7\n6:00 - @grantkaita_ (Intermediate/Advanced)\n6:00 - @j0rdanbautista (Beginner Jazz Funk)\n7:30 - @_claireku (Contemporary Fusion)\n7:30 - @kianatangonan (Intermediate/Advanced)\n7:45 - @jeekalua (Whacking Foundations)\n9:00 - @itsfonso (Intermediate/Advanced)\n9:00 - @jeekalua (Whacking Choreography)\n9:15 - @clancyhickson (Starter Class)',
--     E'\n'
-- ) AS line
-- JOIN businesses b ON b.title = 'Offstage'
-- WHERE regexp_replace(substring(line from '\(([^\)]+)\)'), '\(', '', 'g') IS NOT NULL; -- Ensure title is not null

-- /* Insert service events based on some schedule */
-- WITH schedule_data AS (
--   SELECT
--     date,
--     staff_handle,
--     service_title
--   FROM (
--     VALUES
--       ('DECEMBER 2 2023 6:00PM PDT', 'sexykook', 'K-pop'),
--       ('DECEMBER 2 2023 6:00PM PDT', 'heymisslauren', 'Intermediate/Advanced'),
--       ('DECEMBER 2 2023 7:30PM PDT', '_jellow', 'Intermediate/Advanced'),
--       ('DECEMBER 2 2023 7:30PM PDT', 'mari_salarda', 'Beginners'),
--       ('DECEMBER 2 2023 7:45PM PDT', 'deesap', 'Starter Heels'),
--       ('DECEMBER 2 2023 9:00PM PDT', 'alexus_samone', 'Intermediate/Advanced'),
--       ('DECEMBER 2 2023 9:00PM PDT', 'deesap', 'Intermediate/Advanced Heels'),
--       ('DECEMBER 2 2023 9:15PM PDT', 'ethanbaotran', 'Breaking'),
--       ('DECEMBER 3 2023 6:00PM PDT', 'michaelbxrt', 'Intermediate/Advanced'),
--       ('DECEMBER 3 2023 6:00PM PDT', 'anthonyrayishere', 'Beginners'),
--       ('DECEMBER 3 2023 6:30PM PDT', 'j4_gaspar', 'Starter Class'),
--       ('DECEMBER 3 2023 7:30PM PDT', 'lpdavidlee', 'Beginners'),
--       ('DECEMBER 3 2023 7:30PM PDT', 'lex_ishimoto', 'Contemporary Fusion'),
--       ('DECEMBER 3 2023 7:45PM PDT', 'lynn.aiko', 'Starter Heels'),
--       ('DECEMBER 3 2023 9:00PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
--       ('DECEMBER 3 2023 9:00PM PDT', 'lynn.aiko', 'Intermediate/Advanced Heels'),
--       ('DECEMBER 4 2023 6:00PM PDT', 'roro_kamion', 'Beginner Heels'),
--       ('DECEMBER 4 2023 6:00PM PDT', 'aaliflower', 'K-pop'),
--       ('DECEMBER 4 2023 7:30PM PDT', 'ivxnparedes', 'Intermediate/Advanced'),
--       ('DECEMBER 4 2023 7:30PM PDT', 'geegtorres', 'Beginners'),
--       ('DECEMBER 4 2023 7:45PM PDT', 'essencefloriedance', 'Starter Heels'),
--       ('DECEMBER 4 2023 9:00PM PDT', 'joshvason', 'Intermediate/Advanced'),
--       ('DECEMBER 4 2023 9:15PM PDT', 'jensine.yu', 'Starter Class'),
--       ('DECEMBER 5 2023 6:00PM PDT', 'dinykim', 'Intermediate/Advanced'),
--       ('DECEMBER 5 2023 6:00PM PDT', 'boymeetsale', 'K-pop'),
--       ('DECEMBER 5 2023 7:30PM PDT', 'marktullen', 'Intermediate/Advanced'),
--       ('DECEMBER 5 2023 7:30PM PDT', 'shigeto.nakano', 'Beginners'),
--       ('DECEMBER 5 2023 7:45PM PDT', 'julesclairee', 'Starter Class'),
--       ('DECEMBER 5 2023 9:00PM PDT', 'danyelmoulton', 'Intermediate/Advanced'),
--       ('DECEMBER 5 2023 9:00PM PDT', 'davidslayme', 'Intermediate/Advanced Heels'),
--       ('DECEMBER 5 2023 9:15PM PDT', 'hirari.w7', 'Whacking Foundations'),
--       ('DECEMBER 6 2023 6:00PM PDT', 'yerson.8a', 'K-pop'),
--       ('DECEMBER 6 2023 6:00PM PDT', 'justin_ito', 'Intermediate/Advanced'),
--       ('DECEMBER 6 2023 7:30PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
--       ('DECEMBER 6 2023 7:30PM PDT', 'msshimmaayy', 'Beginners'),
--       ('DECEMBER 6 2023 7:45PM PDT', 'ethanbaotran', 'Kid’s Breaking Class | Ages 4 to 16'),
--       ('DECEMBER 6 2023 9:00PM PDT', 'jeffreycaluag', 'Intermediate/Advanced'),
--       ('DECEMBER 6 2023 9:00PM PDT', 'justdestiny', 'Vogue'),
--       ('DECEMBER 6 2023 9:15PM PDT', '_asahim_', 'Starter Class'),
--       ('DECEMBER 7 2023 6:00PM PDT', 'grantkaita_', 'Intermediate/Advanced'),
--       ('DECEMBER 7 2023 6:00PM PDT', 'j0rdanbautista', 'Beginner Jazz Funk'),
--       ('DECEMBER 7 2023 7:30PM PDT', '_claireku', 'Contemporary Fusion'),
--       ('DECEMBER 7 2023 7:30PM PDT', 'kianatangonan', 'Intermediate/Advanced'),
--       ('DECEMBER 7 2023 7:45PM PDT', 'jeekalua', 'Whacking Foundations'),
--       ('DECEMBER 7 2023 9:00PM PDT', 'itsfonso', 'Intermediate/Advanced'),
--       ('DECEMBER 7 2023 9:00PM PDT', 'jeekalua', 'Whacking Choreography'),
--       ('DECEMBER 7 2023 9:15PM PDT', 'clancyhickson', 'Starter Class')
--   ) AS schedule (date, staff_handle, service_title)
-- )
-- INSERT INTO service_events (start, "end", recurrence_start, recurrence_interval, recurrence_count, service_id)
-- SELECT
--   date::timestamptz AS start,
--   date::timestamptz + interval '1 hour 30 minutes' AS "end",
--   date::timestamptz AS recurrence_start,
--   604800000 AS recurrence_interval, -- 7 days in milliseconds
--   4 as recurrence_count,
--   (select id from services s where s.title = service_title limit 1) AS service_id
-- FROM 
--   schedule_data
-- ORDER BY start;

-- /* assign staffs to the service events */
-- WITH schedule_data AS (
--   SELECT
--     date,
--     staff_handle,
--     service_title
--   FROM (
--     VALUES
--       ('DECEMBER 2 2023 6:00PM PDT', 'sexykook', 'K-pop'),
--       ('DECEMBER 2 2023 6:00PM PDT', 'heymisslauren', 'Intermediate/Advanced'),
--       ('DECEMBER 2 2023 7:30PM PDT', '_jellow', 'Intermediate/Advanced'),
--       ('DECEMBER 2 2023 7:30PM PDT', 'mari_salarda', 'Beginners'),
--       ('DECEMBER 2 2023 7:45PM PDT', 'deesap', 'Starter Heels'),
--       ('DECEMBER 2 2023 9:00PM PDT', 'alexus_samone', 'Intermediate/Advanced'),
--       ('DECEMBER 2 2023 9:00PM PDT', 'deesap', 'Intermediate/Advanced Heels'),
--       ('DECEMBER 2 2023 9:15PM PDT', 'ethanbaotran', 'Breaking'),
--       ('DECEMBER 3 2023 6:00PM PDT', 'michaelbxrt', 'Intermediate/Advanced'),
--       ('DECEMBER 3 2023 6:00PM PDT', 'anthonyrayishere', 'Beginners'),
--       ('DECEMBER 3 2023 6:30PM PDT', 'j4_gaspar', 'Starter Class'),
--       ('DECEMBER 3 2023 7:30PM PDT', 'lpdavidlee', 'Beginners'),
--       ('DECEMBER 3 2023 7:30PM PDT', 'lex_ishimoto', 'Contemporary Fusion'),
--       ('DECEMBER 3 2023 7:45PM PDT', 'lynn.aiko', 'Starter Heels'),
--       ('DECEMBER 3 2023 9:00PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
--       ('DECEMBER 3 2023 9:00PM PDT', 'lynn.aiko', 'Intermediate/Advanced Heels'),
--       ('DECEMBER 4 2023 6:00PM PDT', 'roro_kamion', 'Beginner Heels'),
--       ('DECEMBER 4 2023 6:00PM PDT', 'aaliflower', 'K-pop'),
--       ('DECEMBER 4 2023 7:30PM PDT', 'ivxnparedes', 'Intermediate/Advanced'),
--       ('DECEMBER 4 2023 7:30PM PDT', 'geegtorres', 'Beginners'),
--       ('DECEMBER 4 2023 7:45PM PDT', 'essencefloriedance', 'Starter Heels'),
--       ('DECEMBER 4 2023 9:00PM PDT', 'joshvason', 'Intermediate/Advanced'),
--       ('DECEMBER 4 2023 9:15PM PDT', 'jensine.yu', 'Starter Class'),
--       ('DECEMBER 5 2023 6:00PM PDT', 'dinykim', 'Intermediate/Advanced'),
--       ('DECEMBER 5 2023 6:00PM PDT', 'boymeetsale', 'K-pop'),
--       ('DECEMBER 5 2023 7:30PM PDT', 'marktullen', 'Intermediate/Advanced'),
--       ('DECEMBER 5 2023 7:30PM PDT', 'shigeto.nakano', 'Beginners'),
--       ('DECEMBER 5 2023 7:45PM PDT', 'julesclairee', 'Starter Class'),
--       ('DECEMBER 5 2023 9:00PM PDT', 'danyelmoulton', 'Intermediate/Advanced'),
--       ('DECEMBER 5 2023 9:00PM PDT', 'davidslayme', 'Intermediate/Advanced Heels'),
--       ('DECEMBER 5 2023 9:15PM PDT', 'hirari.w7', 'Whacking Foundations'),
--       ('DECEMBER 6 2023 6:00PM PDT', 'yerson.8a', 'K-pop'),
--       ('DECEMBER 6 2023 6:00PM PDT', 'justin_ito', 'Intermediate/Advanced'),
--       ('DECEMBER 6 2023 7:30PM PDT', 'ethanestandian', 'Intermediate/Advanced'),
--       ('DECEMBER 6 2023 7:30PM PDT', 'msshimmaayy', 'Beginners'),
--       ('DECEMBER 6 2023 7:45PM PDT', 'ethanbaotran', 'Kid’s Breaking Class | Ages 4 to 16'),
--       ('DECEMBER 6 2023 9:00PM PDT', 'jeffreycaluag', 'Intermediate/Advanced'),
--       ('DECEMBER 6 2023 9:00PM PDT', 'justdestiny', 'Vogue'),
--       ('DECEMBER 6 2023 9:15PM PDT', '_asahim_', 'Starter Class'),
--       ('DECEMBER 7 2023 6:00PM PDT', 'grantkaita_', 'Intermediate/Advanced'),
--       ('DECEMBER 7 2023 6:00PM PDT', 'j0rdanbautista', 'Beginner Jazz Funk'),
--       ('DECEMBER 7 2023 7:30PM PDT', '_claireku', 'Contemporary Fusion'),
--       ('DECEMBER 7 2023 7:30PM PDT', 'kianatangonan', 'Intermediate/Advanced'),
--       ('DECEMBER 7 2023 7:45PM PDT', 'jeekalua', 'Whacking Foundations'),
--       ('DECEMBER 7 2023 9:00PM PDT', 'itsfonso', 'Intermediate/Advanced'),
--       ('DECEMBER 7 2023 9:00PM PDT', 'jeekalua', 'Whacking Choreography'),
--       ('DECEMBER 7 2023 9:15PM PDT', 'clancyhickson', 'Starter Class')
--   ) AS schedule (date, staff_handle, service_title)
-- )
-- INSERT INTO service_events_staffs (service_event_id, staff_id)
-- SELECT
--   ss.id AS service_event_id,
--   st.id AS staff_id
-- FROM schedule_data
-- JOIN staffs st ON st.instagram_handle = staff_handle
-- JOIN services s ON s.title = service_title
-- JOIN service_events ss ON ss.service_id = s.id
-- WHERE ss.start = date::timestamptz AND
--       ss.service_id = s.id;


-- /* Insert staffs names */
-- WITH schedule_data AS (
--   SELECT
--     date,
--     staff_handle,
--     service_title,
--     first_name,
--     last_name
--   FROM (
--     VALUES 
--       ('DECEMBER 2 2023 6:00PM PDT', 'sexykook', 'K-pop', 'Miriya', 'Lee'),
-- ('DECEMBER 2 2023 6:00PM PDT', 'heymisslauren', 'Intermediate/Advanced', 'Miss', 'Lauren'),
-- ('DECEMBER 2 2023 7:30PM PDT', '_jellow', 'Intermediate/Advanced', 'Jellow', ''),
-- ('DECEMBER 2 2023 7:30PM PDT', 'mari_salarda', 'Beginners', 'Mari', 'Salarda'),
-- ('DECEMBER 2 2023 7:45PM PDT', 'deesap', 'Starter Heels', 'Deesap', ''),
-- ('DECEMBER 2 2023 9:00PM PDT', 'alexus_samone', 'Intermediate/Advanced', 'Alexus', 'Samone'),
-- ('DECEMBER 2 2023 9:00PM PDT', 'deesap', 'Intermediate/Advanced Heels', 'Deesap', ''),
-- ('DECEMBER 2 2023 9:15PM PDT', 'ethanbaotran', 'Breaking', 'Ethan', 'Tran'),
-- ('DECEMBER 3 2023 6:00PM PDT', 'michaelbxrt', 'Intermediate/Advanced', 'Michael', 'Burt'),
-- ('DECEMBER 3 2023 6:00PM PDT', 'anthonyrayishere', 'Beginners', 'Anthony', 'Martinez'),
-- ('DECEMBER 3 2023 6:30PM PDT', 'j4_gaspar', 'Starter Class', 'J4', 'Gaspar'),
-- ('DECEMBER 3 2023 7:30PM PDT', 'lpdavidlee', 'Beginners', 'David', 'Lee'),
-- ('DECEMBER 3 2023 7:30PM PDT', 'lex_ishimoto', 'Contemporary Fusion', 'Lex', 'Ishimoto'),
-- ('DECEMBER 3 2023 7:45PM PDT', 'lynn.aiko', 'Starter Heels', 'Lynn', 'Aiko'),
-- ('DECEMBER 3 2023 9:00PM PDT', 'ethanestandian', 'Intermediate/Advanced', 'Ethan', 'Estandian'),
-- ('DECEMBER 3 2023 9:00PM PDT', 'lynn.aiko', 'Intermediate/Advanced Heels', 'Lynn', 'Aiko'),
-- ('DECEMBER 4 2023 6:00PM PDT', 'roro_kamion', 'Beginner Heels', 'Roro', 'Kamion'),
-- ('DECEMBER 4 2023 6:00PM PDT', 'aaliflower', 'K-pop', 'Aliyah', 'Flower'),
-- ('DECEMBER 4 2023 7:30PM PDT', 'ivxnparedes', 'Intermediate/Advanced', 'Ivan', 'Parades'),
-- ('DECEMBER 4 2023 7:30PM PDT', 'geegtorres', 'Beginners', 'GeeGee', 'Torres'),
-- ('DECEMBER 4 2023 7:45PM PDT', 'essencefloriedance', 'Starter Heels','Essence', 'Florie'),
-- ('DECEMBER 4 2023 9:00PM PDT', 'joshvason', 'Intermediate/Advanced', 'Joshua', 'Son'),
-- ('DECEMBER 4 2023 9:15PM PDT', 'jensine.yu', 'Starter Class', 'Jensine', 'Yu'),
-- ('DECEMBER 5 2023 6:00PM PDT', 'dinykim', 'Intermediate/Advanced', 'Diny', 'Kim'),
-- ('DECEMBER 5 2023 6:00PM PDT', 'boymeetsale', 'K-pop', 'Boymeet', 'Sale'),
-- ('DECEMBER 5 2023 7:30PM PDT', 'marktullen', 'Intermediate/Advanced', 'Mark', 'Tullen'),
-- ('DECEMBER 5 2023 7:30PM PDT', 'shigeto.nakano', 'Beginners', 'Shigeto', 'Nakano'),
-- ('DECEMBER 5 2023 7:45PM PDT', 'julesclairee', 'Starter Class', 'Julia', 'Claire'),
-- ('DECEMBER 5 2023 9:00PM PDT', 'danyelmoulton', 'Intermediate/Advanced', 'Danyel', 'Moulton'),
-- ('DECEMBER 5 2023 9:00PM PDT', 'davidslayme', 'Intermediate/Advanced Heels', 'David', 'Slaney'),
-- ('DECEMBER 5 2023 9:15PM PDT', 'hirari.w7', 'Whacking Foundations', 'Hirari', ''),
-- ('DECEMBER 6 2023 6:00PM PDT', 'yerson.8a', 'K-pop', 'Yerson', ''),
-- ('DECEMBER 6 2023 6:00PM PDT', 'justin_ito', 'Intermediate/Advanced', 'Justin', 'Ito'),
-- ('DECEMBER 6 2023 7:30PM PDT', 'ethanestandian', 'Intermediate/Advanced', 'Ethan', 'Estandian' ),
-- ('DECEMBER 6 2023 7:30PM PDT', 'msshimmaayy', 'Beginners', 'Michelle', 'Shimmy'),
-- ('DECEMBER 6 2023 7:45PM PDT', 'ethanbaotran', 'Kid’s Breaking Class | Ages 4 to 16', 'Ethan', 'Tran'),
-- ('DECEMBER 6 2023 9:00PM PDT', 'jeffreycaluag', 'Intermediate/Advanced', 'Jeffrey', 'Caluag'),
-- ('DECEMBER 6 2023 9:00PM PDT', 'justdestiny', 'Vogue', 'Just', 'Destiny'),
-- ('DECEMBER 6 2023 9:15PM PDT', '_asahim_', 'Starter Class', 'Asahi', 'Matsumoto'),
-- ('DECEMBER 7 2023 6:00PM PDT', 'grantkaita_', 'Intermediate/Advanced', 'Grant' , 'Kaita'),
-- ('DECEMBER 7 2023 6:00PM PDT', 'j0rdanbautista', 'Beginner Jazz Funk', 'Jordan', 'Bautista'),
-- ('DECEMBER 7 2023 7:30PM PDT', '_claireku', 'Contemporary Fusion', 'Claire', 'Ku'),
-- ('DECEMBER 7 2023 7:30PM PDT', 'kianatangonan', 'Intermediate/Advanced', 'Kiana', 'Tong'),
-- ('DECEMBER 7 2023 7:45PM PDT', 'jeekalua', 'Whacking Foundations', 'Jeeka', 'Lua'),
-- ('DECEMBER 7 2023 9:00PM PDT', 'itsfonso', 'Intermediate/Advanced', 'Fonso', ''),
-- ('DECEMBER 7 2023 9:00PM PDT', 'jeekalua', 'Whacking Choreography', 'Jeeka', 'Lua'),
-- ('DECEMBER 7 2023 9:15PM PDT', 'clancyhickson', 'Starter Class', 'Clancy', 'Hickson')
--     )  AS schedule (date, staff_handle, service_title, first_name, last_name)
-- )
-- UPDATE staffs
-- SET first_name = schedule_data.first_name,
--     last_name = schedule_data.last_name
-- FROM schedule_data
-- WHERE staffs.instagram_handle = schedule_data.staff_handle;