# Sparq Labs · /vsl landing page (v3)

Static HTML + one CSS + one JS. No build step, no libraries.

## Files
```
vsl.html               the page. ALL editable content is in the SPARQ_VSL block at the bottom:
                       videoUrl, bookingLink, tracking IDs, pricing, people (Nish + Dai),
                       client logos, tools, case studies, dashboard screenshots
assets/vsl/vsl.css     page styles (separate from site.css)
assets/vsl/vsl.js      motion, video, Cal.com embeds, tracking, UTM capture
assets/tools/*.png     tool logos          ┐ same files already in the sparqlabs repo,
assets/proof/*.jpg     dashboard shots     │ included so this folder also deploys on its own
assets/badges, founder.jpg, nish-avatar.jpg, favicon-32.png ┘
vercel.json            serves /vsl → vsl.html, caching + noindex headers
```

## Deploy into Parthsa234/sparqlabs (Vercel project "sparqlabs")
1. Copy everything in this folder into the repo root (asset files are identical to the existing ones).
2. Commit and push to `main`. Live at `https://sparqlabs.vercel.app/vsl`.

Standalone instead: Vercel → Add New Project → Framework preset **Other**, no build command. Or `npx vercel --prod` inside this folder.

## Before running ads
- `videoUrl`: the 6-minute VSL link (Vimeo / YouTube / Loom / Wistia / .mp4). Empty = placeholder.
- Dai Bamenou's photo is at assets/vsl/dai.jpg (200×200 source; swap in a larger version for sharper display).
- `tracking.gtmId` / `tracking.metaPixelId`: Sparq Labs IDs only. Put the Pixel in ONE place (here OR inside GTM).
  Events pushed to dataLayer: sparq_vsl_pageview, sparq_vsl_videoplay, sparq_vsl_ctaclick, sparq_vsl_bookinglinkclick,
  sparq_vsl_schedule (once per session on a confirmed Cal.com booking).
- Do one real test booking in each calendar embed.
- Offer shown (USD): free 14-day pilot, $100 back if it books zero SQLs, then $2,000/month retainer + $100–500 per
  qualified call, most months ~$3,000. Keep the ads on the same dollar numbers (the ₹ ad variants don't match the page).
- Add `?debug=1` to the URL to log tracking events in the console.
