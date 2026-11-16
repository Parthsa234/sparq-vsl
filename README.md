# Sparq Labs · /vsl landing page (v4 · India pilot)

Static HTML + one CSS + one JS. No build step, no libraries.

## Files
```
vsl.html               the landing page (static copy)
booked.html            /booked: confirmation page (brief Part G) with the VSL again. Fires Schedule.
not-a-fit.html         /not-a-fit: shown instead of the calendar to unqualified leads (brief Part E)
assets/vsl/config.js   ALL editable content, shared by the 3 pages: videoUrl, bookingLink, tracking IDs,
                       pricing, people, tool logos, client logos, case studies, testimonials, screenshot, FAQ
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

Standalone instead: Vercel → Add New Project → Framework preset **Other**, no build command. Or `npx vercel ## Caching
CSS/JS under /assets/vsl are cached by browsers for 7 days. After editing vsl.css, vsl.js or config.js,
bump the ?v= number on their links in vsl.html, booked.html and not-a-fit.html.

## Page structure (design brief v1, 16 Nov 2026)
S1 nav · S2 hero + VSL · S3 results (only proof section) · S4 pain · S5 how it works · S6 offer + pricing ·
S7 fit / not a fit · S8 team · S9 FAQ · S10 book + footer (`#book`, the only calendar).
Every button says **Book your pilot call** and scrolls to `#book`. On mobile (<900px) there is no Cal.com
embed; an **Open the calendar** button opens the booking page in a new tab.

## Offer (brief Part A) — keep ads, video captions, page and Cal.com form identical
For AEO, GEO, content, social media and PR agencies doing ₹40 lakh a month or more. 14-day pilot, no retainer.
If the pilot doesn't produce a single SQL, we pay ₹10,000. After the pilot: ₹2,00,000/month retainer +
₹8,000–40,000 per qualified call, most agencies land around ₹3,00,000 a month. Infrastructure at cost.

## Still open before running ads
- `videoUrl` is the YouTube VSL (https://youtu.be/t2YL6nm__8w). Keep it Public or Unlisted (Private won't play),
  with embedding allowed. The page reads YouTube's player status to fire VideoPlay, Video50 (Pixel ViewContent)
  and VideoPastPricing (~4:00, `tracking.pricingSecond`).
- [CONFIRM] revenue bar (₹40L) and retainer (₹2,00,000): change in the static copy and the SPARQ_VSL config.
- [CONFIRM] lock-in FAQ: write the answer in `faq`; the question stays hidden while the answer is empty.
- [NEEDS REAL QUOTES] `testimonials`: block stays hidden until real, approved quotes are added.
- [CONFIRM] logo list, certifications, "Pilot spots open" line, second office city (footer shows Bengaluru only).
- Cal.com qualifying questions + routing (brief Part E) are configured in Cal.com, not in this repo.
  In Cal.com: send not-a-fit answers to https://sparq-vsl-three.vercel.app/not-a-fit and set the event's
  success redirect to https://sparq-vsl-three.vercel.app/booked (this also tracks bookings made on mobile).
- The stack marquee (How it works) was added on request; the brief suggested cutting it. Remove the
  .stack-band block in vsl.html to drop it. Product mock-ups (draft email, reply board) are labelled Example.
- `tracking.gtmId` / `tracking.metaPixelId`: Sparq Labs IDs only. Events: PageView, VideoPlay, ViewContent at 50%
  of the video and a past-pricing (~4:00) milestone (both for .mp4 videos), CtaClick, BookingLinkClick,
  Schedule (once per session on a confirmed Cal.com booking). UTMs are passed through to Cal.com.
- Add `?debug=1` to the URL to log tracking events in the console.
