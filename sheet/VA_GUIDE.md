# Sea Isle Eats — Google Sheet Guide

How to manage restaurant listings from a Google Sheet. Two parts: a **one-time
setup** (owner) and the **everyday workflow** (you or a VA).

---

## PART 1 — One-time setup (owner only)

You only do this once.

1. In **Google Drive → New → Google Sheets**, create a sheet named
   "Sea Isle Eats — Listings".
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete anything in the editor, paste in the Sea Isle Eats script, and click
   the **Save** icon (💾).
4. In Apps Script, click **⚙️ Project Settings** (left side) → scroll to
   **Script properties** → **Add script property** twice:
   - `SITE_URL` = `https://siceats.com`
   - `SYNC_SECRET` = (the secret from your site's settings — ask the owner)
5. Go back to the sheet tab and **reload the page**. A **"Sea Isle Eats"** menu
   appears next to Help.
6. Click **Sea Isle Eats → Pull latest from site**. The first time, Google asks
   permission: **Review permissions → choose your account → Advanced → Go to
   project (unsafe) → Allow.** (It's your own script — safe.)
7. The sheet fills with all the restaurants. You're set up.

To let a VA help: **Share** the sheet with them as an **Editor** (Share button,
top-right). They can then use the menu just like you.

---

## PART 2 — Everyday workflow

### Start of a session
**Sea Isle Eats → Pull latest from site.** This loads the current listings so
you're editing the latest data.

### Editing a listing
Edit cells directly. Key columns:

| Column | What to put |
|---|---|
| `name` | Restaurant name |
| `cuisine` | One or more tags, comma-separated: `Pizza` or `Hot Dog, Pizza` |
| `price_level` | `1`=$, `2`=$$, `3`=$$$, `4`=$$$$ |
| `phone` | Phone number |
| `address` | Street address |
| `neighborhood` | (big cities only) the neighborhood name, e.g. `East Nashville` — must match one defined for that city |
| `accepts_cards` | `TRUE` if they take cards, `FALSE` if cash-only |
| `online_ordering` | `TRUE` / `FALSE` |
| `dine_in` | `TRUE` / `FALSE` (sit-down available) |
| `takeout` | `TRUE` / `FALSE` |
| `delivery` | `TRUE` / `FALSE` |
| `byob` | `TRUE` / `FALSE` — bring your own bottle |
| `menu_url` | Link to their menu (Facebook / Instagram / website) |
| `order_url` | Link to their online ordering, if any |
| `website_url` | Their website |
| `facebook_url` | Their Facebook page |
| `instagram_url` | Their Instagram page |
| `description` | Short blurb |
| `notes` | Internal call log — not shown on the site |
| `status` | `unverified`, `needs_call`, or `verified` |
| `published` | `TRUE` to show on the site, `FALSE` to hide |
| `owner_verified` | `TRUE` once the owner has claimed & confirmed the listing |
| `hours_sun` … `hours_sat` | See below |

Most fields (cuisine, hours, payment, dine-in/takeout/delivery) are pre-filled
from Google — your job is to verify and correct them, and add the things Google
doesn't give us (menu/order links, website & social links, owner-verified, BYOB).

**Overriding Google:** Google isn't always right. If a place delivers but Google
doesn't list it (e.g. Bubba Dogs), just type the correct `TRUE`/`FALSE` in that
column and Push — your value sticks and the nightly Google sync won't overwrite
it. Same for hours, cuisine, payment, etc.

**Hours:** each day is its own column, 24-hour time.
- Open 11am–10pm → `11:00-22:00`
- Lunch & dinner (split) → `11:00-14:00, 16:00-22:00`
- Closed that day → **leave blank**

**Do NOT edit** the `id` or `google_place_id` columns — those are the keys that
match each row to the site.

### Save your work
**Sea Isle Eats → Push changes to site.** Your edits go live on siceats.com
within a few seconds. Anything you changed is "locked" so the automatic Google
refresh won't overwrite your work.

### Publishing
A listing only appears on the public site when its `published` column is `TRUE`.
Verify the info first, set `status` to `verified`, then set `published` to `TRUE`
and Push.

---

## PART 3 — Reading visitor submissions

Visitors can submit "Suggest a change" and "Claim this listing" from the site.
To see them:

**Sea Isle Eats → Pull submissions (suggestions & claims).**

This creates/refreshes a **"Submissions"** tab listing each pending item: the
type, date, restaurant, what they suggested, their message, and their email.
Use it as your inbox — review, then update the relevant listing on the main tab
and Push.

---

## Quick reference

- **Pull latest** → get current data (do this first each session)
- **Push changes** → save your edits to the live site
- **Pull submissions** → check visitor suggestions/claims
- Hours: `11:00-22:00`, split with a comma, blank = closed
- `published` `TRUE` = live on the site
- Never touch `id` / `google_place_id`
