insert into storage.buckets (id, name, public)
values ('announcements_attachments', 'announcements_attachments', true)
on conflict (id) do nothing;

create policy "announcements_attachments_select"
  on storage.objects for select
  using ( bucket_id = 'announcements_attachments' );

create policy "announcements_attachments_insert"
  on storage.objects for insert
  with check ( bucket_id = 'announcements_attachments' );
