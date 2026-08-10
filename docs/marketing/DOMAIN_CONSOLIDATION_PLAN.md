# SegurIA domain consolidation plan

Updated: 9 August 2026.

## Canonical target

`https://seguria.tech` is the long-term canonical web identity for SegurIA Security Suite.

`https://segur-ia.cl` belongs to the same SegurIA organization and is treated as a legacy same-company domain during the migration period. It must not become a second source of new canonical content.

## Entity model

```text
N3uralia
  -> reusable technology and AI/automation engines
      -> SegurIA Security Suite
          -> canonical web identity: https://seguria.tech
          -> legacy same-company domain: https://segur-ia.cl
```

## Rules before cutover

- Publish all new product, capability, industry and geographic content only on `seguria.tech`.
- Keep canonical tags, sitemap entries, structured data, `llms.txt`, documentation and campaigns pointed at `seguria.tech`.
- Use `segur-ia.cl` only as a same-company identity signal while it still serves useful legacy traffic or links.
- Do not duplicate new SegurIA pages across both domains.
- Update external profiles and new backlinks to `seguria.tech` whenever possible.

## Cutover checklist for segur-ia.cl

When access to the legacy domain is ready for migration:

1. Inventory every indexable `segur-ia.cl` URL and its backlinks/traffic where available.
2. Create a one-to-one mapping to the closest equivalent `seguria.tech` URL. Avoid redirecting unrelated pages to the homepage.
3. Deploy server-side permanent redirects (`301` or `308`) directly to final `seguria.tech` destinations.
4. Remove legacy-domain canonicals/sitemaps and submit the `seguria.tech` sitemap in Search Console.
5. If both domains are verified in Google Search Console, submit Change of Address for the domain migration when applicable.
6. Update important external links, social profiles, directory listings, campaigns and partner references to `seguria.tech`.
7. Keep redirects for at least one year and preferably indefinitely when operationally practical.
8. Monitor 404s, redirect chains, index coverage, branded queries, impressions, clicks and conversions during the migration.
9. After migration signals stabilize, remove `segur-ia.cl` from `sameAs` in the `seguria.tech` Organization JSON-LD if the legacy site no longer provides useful identity evidence.

## Geographic positioning retained through migration

- Santiago / Vitacura remains the national operational base.
- Valdivia / Los Ríos remains the southern Chile branch.
- Regional project focus remains La Araucanía, Los Ríos and Los Lagos, with other Chilean locations evaluated by project feasibility.

## Release gate

The domain migration is PASS only when:

- legacy URLs redirect to the correct final `seguria.tech` URLs;
- no material redirect chains or legacy canonical conflicts remain;
- `seguria.tech` is the only domain used for new canonical content;
- sitemap and structured data use `seguria.tech`;
- public profiles and major controlled links use `seguria.tech`;
- Search Console and crawl checks show the move progressing without a material indexing blocker.
