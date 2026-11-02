# Integrations

Notes on what each service allows, with official sources. Research only: no working connections are built in this milestone (PRD R7).

| Integration | Requirements / access | Constraints | Status |
|---|---|---|---|
| Hermes ↔ n8n | | | Not started (PRD 6.2) |
| Shopee Affiliate (Indonesia) | Official Affiliate Open API exists; needs an AppId and Secret that Shopee grants per affiliate | No public application form found; your account has no access yet | Researched 2 November 2026 (PRD 2.2) – see below |
| Threads | | | Not started (PRD 6.1) |
| X (Twitter) | | | Not started (PRD 6.1) |
| Instagram | | | Not started (PRD 6.1) |
| TikTok | | | Not started (PRD 6.1) |
| n8n ↔ product sheet | | | Not started (PRD 6.3) |

## Shopee Affiliate (Indonesia): programmatic access (PRD 2.2, checked 2 November 2026)

**Answer:** Shopee runs an official **Affiliate Open API** for Indonesia, but access is by approval, and there is no public way to apply. Until Shopee grants access, affiliate links and product data stay manual (copy from the affiliate dashboard into the sheet), which already works.

**What exists (official):**
- A GraphQL API at `open-api.affiliate.shopee.co.id`, with a public test tool, the **Open API Explorer V2**. The explorer asks for an **AppId** and **Secret**. It lists:
  - *Queries:* `productOfferV2` and `shopOfferV2` (product and shop offers), `shopeeOfferV2` (Shopee campaign offers), `conversionReport` and `validatedReport` (your sales and commission reports), `listItemFeeds` and `getItemFeedData` (product data feeds).
  - *Mutations:* `generateShortLink` and `generateBatchShortLink` (turn product links into your affiliate short links, one or many at a time).
- Shopee's own help centre (Singapore) describes the same features: offer lists, short links, and conversion and validated reports for "tracking conversions in real-time".
- The Indonesian affiliate portal has an **Open API** page at `affiliate.shopee.co.id/open_api` (needs your Shopee login).

**How to get access – what we know:**
- The AppId and Secret are issued per affiliate inside the logged-in portal. Third-party guides describe "apply, wait for approval, then copy the AppId and Secret from the Open API page", and quote the portal message "You currently do not have access to the Shopee Affiliate Open API Platform" for accounts without approval. These guides are mostly about other countries (Brazil, Vietnam); I found no official Indonesian guide.
- **Your finding (2 November 2026):** on your account, the Open API page says access must be requested, but shows no way to request it.
- Shopee's help centre has no public article on how Indonesian affiliates apply.

**Options:**
1. **Ask Shopee Affiliate support** (the same channel that approved the website) how to request Open API access for an individual affiliate, mentioning the approved site https://veiranotes.pages.dev. Access is likely given case by case (for example to larger or more active affiliates).
2. **Keep working manually** (current set-up, USD 0): paste each product's affiliate link and image link into the sheet; press **Publish site**.
3. **Don't use unofficial scrapers or "product finder" services** that pull data from Shopee without the Open API. Shopee's affiliate terms ban automated extraction of Shopee content (clause 6.3(i)), so they risk your affiliate account.

**What this changes in the plan:** nothing in this milestone. Later automation (product discovery, n8n adding products to the sheet) must either wait for Open API access or stay human-in-the-loop: you supply the affiliate links, and automation fills in the rest.

**Sources:**
- [Shopee Affiliate Open API Explorer V2 (Indonesia)](https://open-api.affiliate.shopee.co.id/explorer/v2) – official tool; lists the queries and mutations above
- [Shopee Help Centre (Singapore) – API Access](https://help.shopee.sg/10/article/191702-API-Access) – official description of the API features
- [Syarat dan Ketentuan Program Afiliasi Shopee untuk Individu](https://help.shopee.co.id/portal/4/article/71217) – clause 6.3(i) on automated extraction
- Third-party, unofficial: [keywordrush – Shopee module](https://ce-docs.keywordrush.com/modules/affiliate/shopee), [instabio – Shopee affiliate AppID and Secret](https://www.instabio.cc/prom/help/shopee-affiliate-appid-and-secret/), [bcat95/shopee-aff on GitHub](https://github.com/bcat95/shopee-aff)
