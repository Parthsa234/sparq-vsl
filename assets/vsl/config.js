/* =====================================================================
   SPARQ LABS VSL — shared config for /vsl, /booked and /not-a-fit.
   Offer facts follow the design brief (Part A). Change a number here AND
   in the static copy in vsl.html (search the page for "₹").
   ===================================================================== */
window.SPARQ_VSL = {
  // The ~6-minute VSL: Vimeo, YouTube, Loom, Wistia, Google Drive link or an .mp4. Empty = thumbnail placeholder.
  // Self-hosted MP4 on Vercel Blob (store "sparq-vsl-media", public, bom1): SparqLabs_VSL_16x9_v3,
  // 1920x1080 H.264 High@4.0 / AAC-LC, 5:27, 114 MB. Remuxed with `-movflags +faststart` (stream copy,
  // no re-encode) so the moov atom leads the file and the browser can start playing and seek before the
  // whole file has downloaded. Too big for Git (GitHub caps files at 100 MB) and Vercel does not resolve
  // Git LFS pointers, so the file is served from Blob's CDN instead of the repo.
  videoUrl: 'https://hmewpj1i9c70uov4.public.blob.vercel-storage.com/sparq-vsl-v3.mp4',
  // Thumbnail: Nish looking at camera, frame grab at 0:03 (the video's own first frame is black).
  videoPoster: '/assets/vsl/poster.jpg',
  videoTitle: 'How we put qualified calls on your calendar',

  bookingLink: 'shrinish/30mins',   // Cal.com event. Qualifying questions (brief Part E) are set up inside Cal.com.

  tracking: {
    // Sparq Labs IDs only. Do NOT reuse GTME.School's GTM-NPFX54H8 or Pixel 3411910105669587.
    gtmId: '',
    metaPixelId: '',
    pricingSecond: 240      // "watched past the pricing part" milestone (~4:00)
  },

  // Brief Part A. Retainer is [CONFIRM] with Nish.
  pricing: [
    { label: 'Monthly retainer', value: '₹2,00,000', sub: 'infrastructure, data, copy, sending, reply handling, team' },
    { label: 'Per qualified call', value: '₹8,000–40,000', sub: 'only for calls that meet the agreed bar' },
    { label: 'Typical working month', value: '~₹3,00,000', sub: 'what most agencies land at', hl: true }
  ],

  people: [
    { name: 'Nishkarsh Agarwal', role: 'Founder, Sparq Labs', photo: '/assets/founder.jpg',
      bio: 'Built outbound systems with Vertical GTM, C17 Lab and OpenBorder before founding Sparq Labs. Runs GTME Launchpad and teaches the system at GTME.School. Takes every pilot call himself.',
      tags: ['Clay Certified Expert', 'Instantly Certified Expert'],   // [CONFIRM] both certifications
      linkedin: 'https://www.linkedin.com/company/sparqai/' },
    { name: 'Dai Bamenou', role: 'Co-founder, Sparq Labs', photo: '/assets/vsl/dai.jpg', initials: 'D',
      bio: 'US-based GTM operator with experience at Clay. Writes for 2K+ followers on LinkedIn about GTM engineering, AI and automation.',
      tags: ['Clay Cup 2025 · Top 5', 'GTM engineering'],
      linkedin: 'https://www.linkedin.com/in/mrdaioff/' }
  ],

  // Tool logos for the stack marquee (files in /assets/tools). Split into two rows.
  tools: ['clay', 'apollo', 'prospeo', 'builtwith', 'trigify', 'rb2b', 'leadmagic', 'findymail', 'bettercontact', 'ocean-io', 'apify', 'linkedin',
          'instantly', 'smartlead', 'emailbison', 'heyreach', 'vapi', 'n8n', 'claude', 'chatgpt', 'perplexity', 'hubspot', 'gohighlevel', 'slack'],

  // Client marquee (getsparq.ai style). From the SparqLabs 2026 case studies; own brands
  // (SparqLabs, GTME.School), the Bazooka vendor case and Howdy GTM ("details to confirm") left out.
  clients: ['MZ Media', 'OkayDone', 'WiseMango', 'RouteElite', 'HappyFolks', 'Kontent Media', 'FilterKing', 'Zaap.ai',
            'LetsUnbound', 'Sales Vantage', 'Think Macro', 'Sufix Tech', 'Workscape Designs', 'byeHotelier', 'tagthose', 'Go Market Labs'],
  // Second, outlined row: as published on getsparq.ai.
  meetingsWith: ['CEQUENS', 'weteams', 'FIFA', 'yrefy'],

  // Illustrative examples for the signal feed (not real companies).
  signals: [
    ['Funding', 'D2C skincare brand', 'raised a Series A'],
    ['New leader', 'B2B fintech', 'hired a new CMO'],
    ['Traffic', 'SaaS company', 'organic traffic down 31% QoQ'],
    ['Launch', 'Health-tech startup', 'launched a new product line'],
    ['Hiring', 'E-commerce brand', 'posted 3 content marketing roles'],
    ['AI search', 'HR-tech platform', 'missing from AI answers for its category'],
    ['Funding', 'Climate-tech company', 'closed a seed round'],
    ['New leader', 'Edtech company', 'new VP Marketing, 3 weeks in']
  ],

  // Case-study cards removed on request: Results shows the client marquee and quotes only.
  cases: [],
  moreCases: [],

  // Real client quotes, as published in the SparqLabs 2026 case studies.
  // Shape: { photo, quote, name, role, company, linkedin, video (optional URL) }
  testimonials: [
    { quote: 'Working with [the SparqLabs] team was one good decision we made while running the company, since they helped us immensely in product positioning, GTM strategy, at time of initial user acquisition, fund raising and even during acquisition.',
      name: 'Vimal Ramakrishnan', role: 'Ex-founder', company: 'HappyFolks' },
    { quote: 'Partnering with [SparqLabs] was a pivotal step in our growth journey. The young energetic team and their experience in B2B lead generation channels opened new avenues for us, as we adapted them before our competitors.',
      name: 'Steven', role: 'VP Operations', company: 'RouteElite' }
  ],

  shot: { src: '/assets/proof/dash-13k.jpg', stat: 'One client · July · 13.4K sent · 2.0% reply rate · 64 opportunities · $215,000',
          cap: 'One client\'s sending dashboard, July. $215,000 is opportunity (pipeline) value, not closed revenue. Open tracking is off to protect deliverability, so opens show 0%.' },

  faq: [
    ['Does cold outbound still work in 2026?', 'Generic blasts don\'t. Messages tied to a real moment in the buyer\'s business do. That\'s why every account we contact has a signal behind it, and why we test angles instead of sending one script.'],
    ['What do I need to do, and how fast does it start?', 'One onboarding call so we understand your offer and best clients, a quick review of the list and copy, then show up to the calls. Campaigns launch within days of sign-off.'],
    ['What counts as a qualified call?', 'A decision-maker at a company in the ICP we agree on together, who books a call about your service. We agree the bar with you before anything is sent.'],
    ['Will you guarantee a number of meetings?', 'No. The pilot shows you how the engine works in your market. If it produces zero sales-qualified leads, we pay you ₹10,000 for your time.'],
    ['What does it cost after the pilot?', 'A ₹2,00,000 monthly retainer plus a fee for each qualified call we book. Most months land around ₹3,00,000. Infrastructure is passed through at cost. We confirm your exact numbers on the call.'],
    // [CONFIRM with Nish] minimum term, notice period. Hidden until an answer is written here.
    ['Is there a lock-in after the pilot?', ''],
    ['Whose name and domains do you send from?', 'Your agency\'s, on sending infrastructure set up in your name and kept separate from your main domain to protect it.']
  ]
};
