alter table planner_state enable row level security;

create policy "Users manage own planner"
on planner_state
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
