-- Adds the editorial pipeline: Unverified -> Pending -> Waiting for Confirmation
-- -> Writing for Confirmation -> Approved (live), with Rejected reachable from any stage.
-- Run this in the Supabase SQL editor.

-- 1. Editor notes: a single free-text box editors use when editing a submission,
--    to record what they changed and leave instructions for the next stage.
alter table submissions add column if not exists editor_notes text;

-- 2. Widen (or add) the status check constraint to allow the new pipeline stages.
--    This drops any existing check constraint on submissions.status, whatever it's
--    named, so it works regardless of how the table was originally created.
do $$
declare
  con record;
begin
  for con in
    select c.conname
    from pg_constraint c
    join pg_class rel on rel.oid = c.conrelid
    where rel.relname = 'submissions'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format('alter table submissions drop constraint %I', con.conname);
  end loop;
end $$;

alter table submissions add constraint submissions_status_check
  check (status in ('unverified', 'pending', 'waiting_confirmation', 'writing_confirmation', 'approved', 'rejected'));

-- 3. New submissions now enter at "unverified" rather than "pending".
alter table submissions alter column status set default 'unverified';

-- Note: existing rows are left as-is on purpose (test data) — nothing here
-- rewrites current "pending"/"approved"/"rejected" rows.
