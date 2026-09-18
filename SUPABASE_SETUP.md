# Supabase environment

The frontend talks directly to Supabase. Two variables are required:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same page → Publishable key |

Both are public by design — they ship in the browser bundle, and row level
security is what protects the data. The **secret / service-role key must never
be added here**: it bypasses RLS, and anything in this project reaches the
client.

## Local

```bash
cp .env.example .env.local   # then fill in both values
pnpm dev
```

## Vercel

Project Settings → Environment Variables. Add both, ticking **Production,
Preview and Development** — preview deployments build from the same code and
will fail without them.

`NEXT_PUBLIC_` values are inlined at build time rather than read at runtime, so
a deployment that was built without them stays broken until it is rebuilt.
Redeploy after adding them; changing a variable alone does not republish.

## Schema

The database schema, RLS policies and seed data live in the
[`MarketX-supabase`](https://github.com/MarketXpress/MarketX-supabase)
repository, not here. This project only consumes them.
