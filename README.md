# Sparq Labs · /vsl landing page (v4 · India pilot)

Static HTML + one CSS + one JS. No build step, no libraries.

## Files
```
vsl.html               the page. ALL editable content is in the SPARQ_VSL block at the bottom:
                       videoUrl, bookingLink, tracking IDs, pricing, people (Nish + Dai),
                       client logos, 3 case studies, testimonials, 1 dashboard screenshot, FAQ
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

Standalone instead: Vercel → Add New Project → Framework preset **Other**, no build command. Or `npx vercel ## Page structure (design brief v1, 16 Nov 2026)
S1 nav · S2 hero + VSL · S3 results (only proof section) · S4 pain · S5 how it works · S6 offer + pricing ·
S7 fit / not a fit · S8 team · S9 FAQ · S10 book + footer (`#book`, the only calendar).
Every button says **Book your pilot call** and scrolls to `#book`. On mobile (<900px) there is no Cal.com
embed; an **Open the calendar** button opens the booking page in a new tab.

## Offer (brief Part A) — keep ads, video captions, page and Cal.com form identical
For AEO, GEO, content, social media and PR agencies doing ₹40 lakh a month or more. 14-day pilot, no retainer.
If the pilot doesn't produce a single SQL, we pay ₹10,000. After the pilot: ₹2,00,000/month retainer +
₹8,000–40,000 per qualified call, most agencies land around ₹3,00,000 a month. Infrastructure at cost.

## Still open before running ads
- `videoUrl` [NEEDS REAL VIDEO]: until set, the hero shows a Nish thumbnail with the title (no play button).
- [CONFIRM] revenue bar (₹40L) and retainer (₹2,00,000): change in the static copy and the SPARQ_VSL config.
- [CONFIRM] lock-in FAQ: write the answer in `faq`; the question stays hidden while the answer is empty.
- [NEEDS REAL QUOTES] `testimonials`: block stays hidden until real, approved quotes are added.
- [CONFIRM] logo list, certifications, "Pilot spots open" line, second office city (footer shows Bengaluru only).
- Cal.com qualifying questions + not-a-fit routing (brief Part E) are configured in Cal.com, not in this repo.
- `tracking.gtmId` / `tracking.metaPixelId`: Sparq Labs IDs only. Events: PageView, VideoPlay, ViewContent at 50%
  of the video and a past-pricing (~4:00) milestone (both for .mp4 videos), CtaClick, BookingLinkClick,
  Schedule (once per session on a confirmed Cal.com booking). UTMs are passed through to Cal.com.
- Add `?debug=1` to the URL to log tracking events in the console.
