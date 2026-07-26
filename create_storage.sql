-- Create the class_photos bucket
insert into storage.buckets (id, name, public)
values ('class_photos', 'class_photos', true)
on conflict (id) do nothing;

-- Set up policies for class_photos to allow public viewing and anonymous uploads
create policy "class_photos_select"
  on storage.objects for select
  using ( bucket_id = 'class_photos' );

create policy "class_photos_insert"
  on storage.objects for insert
  with check ( bucket_id = 'class_photos' );

create policy "class_photos_update"
  on storage.objects for update
  with check ( bucket_id = 'class_photos' );

create policy "class_photos_delete"
  on storage.objects for delete
  using ( bucket_id = 'class_photos' );
