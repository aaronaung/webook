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



