-- Run this in the Supabase SQL editor for your project.
-- Creates the `comments` table used by the article comment section
-- and the Review Panel's Comments tab.

create table if not exists comments (
  id text primary key,
  article_id text not null,
  parent_id text references comments(id),   -- null = top-level comment, set = reply
  author_name text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "public can read comments"
  on comments for select
  using (true);

create policy "public can insert pending comments"
  on comments for insert
  with check (status = 'pending');

create policy "reviewers can update comments"
  on comments for update
  using (auth.role() = 'authenticated');

alter publication supabase_realtime add table comments;
