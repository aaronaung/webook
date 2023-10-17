set check_function_bodies = off;

/** TODO (important): for now, we enable all access to authenticated users for every table. Look into making this more secure later on.*/
create policy "Enable insert for authenticated users only"
on "public"."business"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for users based on email"
on "public"."business"
as permissive
for update
to public
using ((auth.uid() = owner_id));

create policy "Enable all for authenticated users only"
on "public"."service"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated users only"
on "public"."service_group"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated users only"
on "public"."service_slot"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated users only"
on "public"."service_slot_staff"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated users only"
on "public"."staff"
as permissive
for all
to authenticated
using (true)
with check (true);



