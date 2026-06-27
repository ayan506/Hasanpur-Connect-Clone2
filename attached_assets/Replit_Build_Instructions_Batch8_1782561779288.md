# BUILD INSTRUCTIONS — BATCH 8 (Detailed, Step-by-Step)

## ⚠️ READ BEFORE STARTING

This is an existing, live project. Implement only the items listed below. Do not skip any item — every single one must be fully built and working. Do not stop early because you ran low on budget/credits — finish all items below before stopping. Test every item end-to-end in the actual running app before marking it done.

---

## 1. Analytics Tab — Explain Exactly How To Build It (Step by Step)

The Analytics tab (both on the Business Owner Dashboard and the Admin Panel) currently shows real numbers for a little while when it first loads, and then those numbers reset to **0** and stop updating. This must be fixed properly, not patched. Follow these exact steps:

1. **Identify the source of truth for every number shown on the Analytics tab.** Every single number on this tab (total visitors, total views, business views, search counts, zero-result searches, category ranking, fastest growing categories, etc.) must come from a real count stored in the database — for example, a "page_views" table that gets one new row every time a page is visited, or a counter column that increments every time a relevant event happens.
2. **Every time a relevant event happens on the live site (a page view, a search, a listing view, etc.), write that event to the database immediately.** Do not store these counts only in memory/cache that disappears or resets — they must be saved permanently in the database so they survive page reloads, server restarts, and new deployments.
3. **When the Analytics tab loads, it must query the database fresh, every time, and display whatever the real current numbers are at that moment.** It should never show a cached/frozen snapshot that was correct only at build time and then goes stale.
4. **Test this by actually generating real activity and watching the numbers update:** view a few pages, perform a few searches, then reload the Analytics tab and confirm the numbers reflect that real activity — not just at first load, but every single time the tab is opened afterward, indefinitely. The numbers must never fall back to 0 once real data exists, unless the real underlying count is genuinely zero.
5. This applies to **every metric on both the Business Owner Dashboard Analytics tab and the Admin Panel Analytics tab** — go through each number on each tab and confirm it is wired to real, persistent, live data, not a one-time calculation that fades away.

---

## 2. Every Carousel Must Loop Infinitely

- Every single carousel on the entire site — every homepage carousel (Trending Now, Platinum, Trusted/Verified, Products, Popular/Top Viewed, Free Listing/Explore), the main image carousel, the Related Listings carousel on listing pages, and any other carousel anywhere in the app — must **loop continuously and infinitely**.
- Once a carousel reaches the end of its items, it must seamlessly wrap back around to the first item and keep going — it must never just stop, freeze, or come to a dead end.
- This applies whether the carousel is auto-advancing on its own timer or being manually dragged/scrolled by the user.

---

## 3. Exact Tier-Content Rules — Which Businesses/Products Appear In Which Carousel

This is a **strict requirement** — each homepage carousel must pull its items from exactly the source described below:

- **Trending Now carousel** → shows businesses marked **Featured** only.
- **Platinum carousel** → shows businesses that have **both Premium and Verified** status. On these listings, show **only the Platinum badge** — never show Premium and Verified as separate badges alongside it.
- **Trusted/Verified carousel** → shows businesses that are **Verified only**.
- **Popular carousel** → shows listings with the **highest view counts**, ranked purely by view count.
- **Explore / Free Listing carousel** → shows businesses on the **Free tier**.
- **Products carousel (homepage)** → strict order: (1) Admin-flagged "Featured" products first, shown with a **"Trending Now"** badge, then (2) Platinum-tier businesses' products next. No other source or order is allowed.

---

## 4. Phone & WhatsApp Number Fields — Placeholder, Country Code, and Auto-Fill

### A. +91 prefix and 10-digit-only placeholder, everywhere
- On **every single input field anywhere in the site** that collects a number — phone number, WhatsApp number, owner's contact number, any number field at all — apply these two rules:
  1. Show a **locked "+91"** in front of the input box. The user only ever types the number itself; they never type +91.
  2. The placeholder text inside the box must say exactly **`9876543210`** written out as plain example text — but the field must only ever accept **exactly 10 digits**, no more, no less, no matter which form or field it is (registration, listing form, WhatsApp number field, owner profile, admin forms — all of them).
- This rule applies uniformly to every phone-type field in the entire project — there should be no field anywhere that allows more or fewer than 10 digits, and no field anywhere missing the locked +91 prefix.

### B. Auto-fill WhatsApp number from phone number
- On the business listing form, when the owner fills in their **phone number** field, the **WhatsApp number** field on that same form must **automatically fill itself with the same number immediately** — the owner should not have to separately type their WhatsApp number if it's the same as their phone number.
- The owner should still be able to manually change the WhatsApp number afterward if it's actually different from their phone number — auto-fill is just the default starting point, not a locked value.

---

## 5. "I Agree" Checkbox — Correct Location

- The "I agree to Terms and Conditions and Privacy Policy" mandatory checkbox must be on the **user account Registration form** — not on the business listing creation form. If it is currently on the listing form, remove it from there and make sure it is properly placed on the Registration form instead.
- It remains mandatory: the Register button must not be clickable until this checkbox is checked.

---

## 6. Footer — Pages Link Only, No Individual Page Links

- When a new custom page is created in the Admin Page Builder, that page must **not** get its own separate link added into the footer.
- The footer should only ever show **one single "Pages" link** — never one link per custom page. Clicking that one "Pages" link should lead to a page listing all the custom pages. Fix this so individual page links stop appearing in the footer.

---

## 7. Custom Pages — Cover Photo (up to 5 images) + Gallery Section

- When an admin creates a new custom page, the page-creation form must let the admin upload **up to 5 cover photos**.
- These same uploaded photos must **automatically also appear in a Gallery section on that page** — the admin does not upload to two separate places; the same set of up-to-5 images serves both as the cover image(s) and as the content of a dedicated **Gallery section** lower down on that page.
- **Build this Gallery section if it doesn't exist yet:** it should be a clearly visible section on the custom page itself, showing these same uploaded photos.
- These images go through Cloudinary (cloud image storage), not stored directly in the database — only the image URLs are saved in the database.

---

## 8. Business Owner Analytics Dashboard — Fix Properly

- The Business Owner's own Analytics dashboard tab has the same problem described in Item 1 above (numbers go to 0 after a while / don't reflect real activity). Apply the exact same fix described in Item 1 to this dashboard specifically — every number here must be live, real, and persistent, never resetting to 0 while real underlying activity exists.

---

## 9. Cookie Banner — Add Legal Page Links

- The cookie consent banner's content needs a small correction: it must include clickable links to the **Privacy Policy** page and the **Terms and Conditions** page directly inside the banner, so a visitor can open either page right from the banner without hunting for them elsewhere.

---

## 10. Carousel Heading Typography — Handwriting Font Only, Remove the Corporate Sub-Line

- Every carousel heading (Trending Now, Platinum Businesses, Trusted/Verified, Popular, Explore, etc.) currently has **two lines**: a large handwriting-style line and a smaller corporate/sans-serif line underneath it (e.g. "Trending Now" in handwriting font, with "Business" underneath in a corporate font).
- **Remove the smaller corporate-font line entirely.** Only keep the large handwriting-style heading line. Each carousel section should show just one heading line, in handwriting-style font — no second corporate-font line underneath it anywhere.
- **Change the handwriting font itself** to **"Allison"** (a handwriting-style font) — replace whatever handwriting font is currently being used (e.g. "Mrs Saint Delafield" from earlier instructions) with **Allison** instead. Apply this Allison font to every carousel heading across the site.

---

## 11. Products System — Full Fix and Build-Out

### A. Product Approval Notifications
- Every time a business owner uploads/submits a new product, the admin must be notified/shown this clearly (e.g. in the Products approval queue and/or a notification) — the admin must always be able to see when a new product has come in for approval.

### B. Fix the "Add Product" Error
- There is currently an error when trying to create a new product — fix this completely so adding a product works without any error.

### C. Product Image Upload Field
- The product form is currently **not asking for images at all** — this must be fixed. Add a proper image upload field to the product form.
- Allow **up to 3 images** per product.
- **At least 1 image is mandatory** — a product cannot be submitted with zero images; at least one image must be uploaded before the product can be saved/submitted.
- These images go through Cloudinary, not stored directly in the database.

### D. Approval Requirement
- Every product submitted by a business owner requires **admin approval** before it appears anywhere on the site (homepage carousel, listing page, etc.) — re-confirming this is a hard requirement.

### E. Admin Can Add Products Too
- The admin must be able to add a product directly from their own Admin Panel, using the **exact same product form** that a business owner uses (same fields: name, description, price, images, etc.).
- This admin-created product form must also include a **"Know More" link field**, where the admin can choose to link that product's "Know More" button to **any other business's listing** on the site (not just a generic link — specifically pointing to another business's listing page).

### F. Admin Edit Button
- The Admin Panel is currently missing an **Edit** button on listings — this must be added. The admin must be able to click Edit on any listing and modify its details directly from the Admin Panel.

### G. Preview Listing Button
- While a listing is **Pending** (awaiting approval), there is currently no **"Preview Listing"** button available for it — this must be added. The business owner (and admin) should be able to click "Preview Listing" to see what that pending listing will look like, even before it's approved and live.

---

## Testing Requirement

Before marking any item from this list as complete, test it end-to-end in the actual running app — not just in code review. Confirm database updates, UI changes, status transitions, and logic all work correctly together before moving to the next item. Do not skip any item in this document — every single one listed above must be fully built, not partially done, not left for later. Do not stop until everything above is complete.
