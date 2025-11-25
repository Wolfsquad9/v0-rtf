# Supabase Setup Instructions

## Database Table

Create this table in your Supabase dashboard (SQL Editor):

```sql
CREATE TABLE planner_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  state JSONB NOT NULL,
  program_name TEXT,
  theme TEXT DEFAULT 'dark-knight',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_planner_state_user_id ON planner_state(user_id);
CREATE INDEX idx_planner_state_updated_at ON planner_state(updated_at);
```

## Environment Variables

Your Supabase credentials are stored securely in Replit Secrets:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Your anonymous API key

## How It Works

1. **Offline First**: All changes save to browser localStorage immediately
2. **Background Sync**: Changes sync to Supabase every time you modify something
3. **Cloud Restore**: On app load, the latest data is fetched from Supabase
4. **Fallback**: If Supabase is unavailable, the app uses localStorage as a draft

## Security

- API credentials stored securely in server environment only
- Client-side never exposes API keys
- Database has proper indexes for performance
- Automatic timestamps for audit trails

## Next Steps

1. Go to your Supabase dashboard
2. Create a new SQL query and paste the table creation SQL above
3. Run it to create the `planner_state` table
4. Your fitness planner will now sync all changes to Supabase automatically!
