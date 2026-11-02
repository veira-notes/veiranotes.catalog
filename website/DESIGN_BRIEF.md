# veiranotes – Design brief (PRD 1.5)

_Draft 29 October 2026, revised the same day · Status: approved by you on 29 October 2026 (footer may be edited later)_

## 1. Purpose
A phone-first catalogue for people who tap the link in your bio. They should find a product from your post or video in seconds, then tap through to it with your affiliate link.

## 2. Name and voice
- **Site name:** veiranotes, in lower case, as a simple text wordmark (no logo yet).
- **Browser tab title:** veiranotes – everyday style finds
- **Language:** English.
- **No Shopee name, trademark or logo anywhere** (Shopee terms, clause 2.7(i)).

## 3. Look and feel
Premium and elegant, but clean and simple. It should feel feminine, modern and casual, like your intro.
- **Colours:** warm ivory background, soft charcoal text, and one muted gold-taupe accent for buttons and the "New" badge. This is a placeholder palette until your Brand Identity is ready. All colours and fonts sit in one file, so we can swap them in minutes.
- **Fonts:** an elegant serif for the name and headings, and a clean sans-serif for everything else. Both are free and served from the site itself, so there are no outside font requests.
- **Selected category tab:** Deep Mocha (#403329) with ivory text.
- **Sizes:** a compact header (small logo and wordmark) so products show sooner, and large square product images (140 px, filling most of each row, with a 6 px gap above and below) with the number sitting tight above the name.
- **Space:** generous white space, thin dividers and soft rounded corners. No heavy shadows and no clutter.

## 4. Page layout (one page, top to bottom)
1. **Header:**
   - Profile photo: your "Vn." logo (`public/vn-main-logo.jpeg`) in a small circle
   - Wordmark: veiranotes
   - Intro, word for word:
     > A journal of everyday style, thoughtfully curated ✨
     > Feminine • Modern • Casual
     > Daily outfit inspo & affordable finds
     > ↓ Find your next look ↓
   - Social icons: Instagram, TikTok and Threads. X is added later.
2. **Search and categories:** these stay pinned to the top while scrolling.
   - A search box that searches product names and product numbers (typing "VN25" or "25" finds product VN25).
   - Category tabs: "All" first, then each category from your sheet. They scroll sideways on a phone.
3. **Product list:** collection style, like your collshp.com example. One row per product:
   - a square image on the left
   - the product number (see section 5)
   - the product name, up to 2 lines
   - a "New" badge where it applies

   The whole row, image included, is the button: tapping anywhere on it opens the product in a new tab through your affiliate link. There's no arrow on the row. Category is used only for the tabs. The short description isn't shown.
4. **Footer (recommended):** small, quiet text, centred.
   - The social icons again (Instagram, TikTok, Threads)
   - "Thank you for stopping by. May you find the piece that feels like you." (in the italic serif)
   - © 2026 veiranotes
5. **Back-to-top button:** a round up-arrow button fixed at the bottom right, above everything else. It appears once the visitor scrolls down and brings them back to the top from anywhere on the page.

## 5. Product rules
- **Order (updated 2 November 2026):** products with the "New" badge come first, most recently published at the top (same date: higher number first). All other products follow, by your **No** column, highest first. When a badge expires, that product drops back to its number position without a rebuild.
- **Product number:** "VN" plus your **No** column, with no space and no leading zeros (e.g. VN1, VN25, VN1859). The Product ID itself isn't shown. A row with an empty or non-numeric No is skipped, and so is a duplicate No.
- **"New" badge:** shows for 14 days after a product is published. The date comes from a new **Published On** column, which the publish button fills in (PRD 1.7). Until 1.7 is set up, no badges show.
- **Not shown:** price, category (except in the tabs), short description, Product ID, Status, and any test or debug text.
- **Missing or broken image:** a soft placeholder with a "v" monogram. This shows when Image URL is empty, or when both Shopee's thumbnail and the pasted link fail to load (for example, the seller removed the photo).
- **No results:** "No products match your search", with a button to clear it.

## 6. Quality bar
- Designed for phones first (360–430 px wide), and it still looks tidy on desktop.
- Text is easy to read, and buttons are at least 44 px tall, so they're easy to tap.
- Fast: a static page with a tiny script for search and tabs only. Images load lazily.

## 7. Not in this step (later, if wanted)
- A separate page per product.
- Wishlist, filters by price, and visitor analytics.
- Your own logo and brand colours (when Brand Identity is ready).
- An X link (when you have an account).
