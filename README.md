# Ver 24.6 card public repository

Ver 24.6 adds a login-free public card repository for sharing registered card data without images.

Main additions:
- publish one local registered card
- browse/search/sort public cards
- download as an independent local copy
- per-card management key for owner-only update/delete
- restore management permission on another device using card ID + management key

Supabase setup:
- `SUPABASE_PUBLIC_CARDS_v24_6.sql`
- `supabase/functions/minkai-public-cards/index.ts`

v24.5 account/cloud-key and online scroll preservation fixes are included.
