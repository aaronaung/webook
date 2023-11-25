create table "public"."chat_rooms" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "name" text
);


alter table "public"."chat_rooms" enable row level security;

create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "content" text,
    "room_id" uuid not null,
    "sender_user_id" uuid,
    "sender_business_id" uuid
);
alter publication supabase_realtime add table chat_messages;
alter table "public"."chat_messages" enable row level security;

-- NOTE: This enforces that only ONE user and ONE business can be in a room.
-- This simplifies the design. And, given the nature of the product, this is a reasonable constraint.
-- We don't support user to user communication or group chats. If they want to do that, they can use 
-- a different chat platform like instagram or facebook messenger.
create table "public"."chat_room_participants" (
    "created_at" timestamp with time zone default now(),
    "room_id" uuid not null,
    "user_id" uuid not null,
    "business_id" uuid not null
);

alter table "public"."chat_room_participants" enable row level security;

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_room_participants_pkey ON public.chat_room_participants USING btree (room_id, user_id, business_id);

CREATE UNIQUE INDEX chat_rooms_pkey ON public.chat_rooms USING btree (id);

alter table "public"."chat_rooms" add constraint "chat_rooms_pkey" PRIMARY KEY using index "chat_rooms_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_room_participants" add constraint "chat_room_participants_pkey" PRIMARY KEY using index "chat_room_participants_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_room_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_sender_business_id_fkey" FOREIGN KEY (sender_business_id) REFERENCES businesses(id) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_sender_business_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_sender_user_id_fkey" FOREIGN KEY (sender_user_id) REFERENCES "users"(id) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_sender_user_id_fkey";

alter table "public"."chat_room_participants" add constraint "chat_room_participants_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) not valid;

alter table "public"."chat_room_participants" validate constraint "chat_room_participants_business_id_fkey";

alter table "public"."chat_room_participants" add constraint "chat_room_participants_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."chat_room_participants" validate constraint "chat_room_participants_room_id_fkey";

alter table "public"."chat_room_participants" add constraint "chat_room_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "users"(id) not valid;

alter table "public"."chat_room_participants" validate constraint "chat_room_participants_user_id_fkey";


create policy "Enable all for authenticated"
on "public"."chat_rooms"
as permissive
for all
to authenticated
using (true);


create policy "Enable all for authenticated"
on "public"."chat_messages"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."chat_room_participants"
as permissive
for all
to authenticated
using (true)
with check (true);

