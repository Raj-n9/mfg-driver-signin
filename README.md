# MFG Driver Sign-In

Static GitHub Pages app using Supabase.

## Workflow

- **Mobiledock — I have a PIN** opens the existing Mobiledock self check-in URL.
- **No Mobiledock PIN — Manual Sign-In** opens the MFG manual form.
- Manual submission is saved to Supabase.
- A success message is shown for 5 seconds, then the app returns to the main screen.
- Coordinators sign into the Admin page to view, filter and export records.

## Setup

1. Create a Supabase project.
2. Run `supabase-setup.sql` in Supabase SQL Editor.
3. Create coordinator users in Supabase Authentication.
4. Add each coordinator UUID/email to `public.coordinator_users`.
5. Copy the Supabase Project URL and public anon key into `supabase-config.js`.
6. Push the files to GitHub.
7. Enable GitHub Pages from the `main` branch, root folder.
8. Open the GitHub Pages URL on the iPad.

## Security

Never place the Supabase service-role key in this repository.
The public kiosk can only insert records; authorised coordinators can read records. No update/delete policy is provided.

## Mobiledock return limitation

Because Mobiledock is an external site, the GitHub Pages app cannot reliably detect when its flow is finished or force it to return unless Mobiledock supports a callback/return URL. The MFG manual flow can return automatically because we control it.

## Branding

The starter uses a temporary black `M` mark. Replace it with the approved MFG logo asset when available.
