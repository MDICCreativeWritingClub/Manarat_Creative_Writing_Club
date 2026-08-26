-- ============================================================
-- Migration: Recognition history (Writer of the Month,
-- Editor's Choice) + supporting index for author lookups.
--
-- Previously, both WoM and Editor's Choice were single
-- overwritable fields in site_config — no record of past winners
-- existed. This table gives every win a permanent row, so
-- "how many times has X won" can actually be counted.
--
-- Keyed on student_code (not name) since that's the field your
-- verification process treats as authoritative — name spelling
-- can vary across submissions, student_code shouldn't.
-- ============================================================

create table if not exists recognitions (
  id uuid primary key default gen_random_uuid(),
  student_code text not null,
  name text not null,
  category text not null check (category in ('wom', 'editors_choice')),
  article_id text,
  awarded_at timestamptz not null default now()
);

create index if not exists idx_recognitions_student_code on recognitions (student_code);

-- Public read (author pages are public). Insert/delete are left
-- open to anon for now, matching the CURRENT pre-auth state of
-- submissions/site_config elsewhere in this project — real login
-- isn't deployed yet. When you deploy real reviewer/admin auth
-- (the paused work), swap "anon, authenticated" below to
-- "authenticated" only, same as the submissions/site_config
-- tightening planned for that same moment.
alter table recognitions enable row level security;

drop policy if exists "public can read recognitions" on recognitions;
create policy "public can read recognitions"
  on recognitions for select
  to anon, authenticated
  using (true);

drop policy if exists "temp open insert recognitions" on recognitions;
create policy "temp open insert recognitions"
  on recognitions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "temp open delete recognitions" on recognitions;
create policy "temp open delete recognitions"
  on recognitions for delete
  to anon, authenticated
  using (true);

-- Helpful index for author-page lookups by student_code on submissions
create index if not exists idx_submissions_student_code on submissions (student_code);
