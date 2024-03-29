create policy "Enable availability_schedules read for public"
on "public"."availability_schedules"
as permissive
for select
to public
using (true);


create policy "Enable availability_slot_overrides read for public"
on "public"."availability_slot_overrides"
as permissive
for select
to public
using (true);


create policy "Enable availability_weekly_slots read for public"
on "public"."availability_weekly_slots"
as permissive
for select
to public
using (true);


create policy "Enable questions read for public"
on "public"."questions"
as permissive
for select
to public
using (true);


create policy "Enable services read to all users"
on "public"."services"
as permissive
for select
to public
using (true);



