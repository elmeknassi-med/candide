# Setup Guide — École Candide Registration

## Prerequisites
- Supabase account → https://supabase.com
- Resend account → https://resend.com (free: 3 000 emails/month)
- Supabase CLI installed (`brew install supabase/tap/supabase`)

---

## Step 1 — Create a Supabase project

1. Go to https://supabase.com/dashboard → New project
2. Note your **Project URL** and **anon public key** (Settings → API)

---

## Step 2 — Run the database migration

In the Supabase dashboard → SQL Editor, paste and run the contents of:
```
supabase/migrations/20250401_inscriptions.sql
```

---

## Step 3 — Configure the frontend

Open `script.js` and replace lines 2–3:

```js
const SUPABASE_URL      = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

---

## Step 4 — Get a Resend API key

1. Sign up at https://resend.com
2. Go to API Keys → Create API Key
3. Add and verify your sending domain (or use `onboarding@resend.dev` for testing)

---

## Step 5 — Link & deploy the Edge Function

```bash
cd candid-web-site

# Login and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set your Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx

# Deploy the edge function
supabase functions deploy send-inscription
```

---

## Step 6 — Test it

Fill out the form on `index.html` and submit.  
- The inscription is saved in your Supabase table `inscriptions`
- The school receives an email at **candide286@yahoo.fr**
- The parent receives a confirmation email

---

## View inscriptions

In your Supabase dashboard → Table Editor → `inscriptions`  
You can filter by `status`, `cycle`, `level`, etc.

---

## Email from address

In `supabase/functions/send-inscription/index.ts`, update the `from` field:
```ts
from: "Inscriptions Candide <inscriptions@YOUR_DOMAIN.com>",
```
Replace with your verified Resend domain.
