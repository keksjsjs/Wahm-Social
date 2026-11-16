/** Bilingual static legal/info pages (markdown). */
export const PAGES: Record<string, { title: { ar: string; en: string }; body: { ar: string; en: string } }> = {
  about: {
    title: { ar: "عن وهم سوشال", en: "About Wahm Social" },
    body: {
      ar: `## من نحن\nوهم سوشال منصة عربية أولاً من **Wahm (@iwahm)** لتحليل الحسابات العامة على تيك توك وانستقرام وتحميل المحتوى العام بسهولة.\n\n## مبادئنا\n- البيانات العامة فقط — لا تجاوز للخصوصية.\n- لا نطلب كلمة مرور حسابك أبداً.\n- شفافية كاملة: نوسم البيانات التجريبية والمخزنة بوضوح.\n\n## التقنية\nبنينا المنصة على Next.js مع طبقة خدمات لكل منصة، ذاكرة مؤقتة، حدود استخدام، ومصادقة JWT.`,
      en: `## Who we are\nWahm Social is an Arabic-first platform by **Wahm (@iwahm)** for analyzing public TikTok and Instagram accounts and saving public content easily.\n\n## Principles\n- Public data only — no privacy bypass.\n- We never ask for your account password.\n- Full transparency: demo and cached data are clearly labelled.\n\n## Technology\nBuilt on Next.js with per-platform service adapters, caching, rate limits and JWT auth.`,
    },
  },
  privacy: {
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    body: {
      ar: `## ما نجمعه\n- البريد الإلكتروني والاسم عند إنشاء حساب.\n- سجل استخدام مجهول (عدد عمليات البحث والتحميل اليومية).\n- أسماء المستخدمين التي تبحث عنها لإحصاءات "الأكثر بحثاً" بشكل مجمّع.\n\n## ما لا نجمعه\n- كلمات مرور حسابات تيك توك أو انستقرام.\n- أي محتوى خاص.\n\n## الكوكيز\nنستخدم كوكي جلسة آمنة (httpOnly) وكوكي اللغة فقط.\n\n## حقوقك\nيمكنك طلب حذف حسابك في أي وقت عبر صفحة التواصل.`,
      en: `## What we collect\n- Email and name when you create an account.\n- Anonymous usage counters (daily lookups and downloads).\n- Searched usernames, aggregated for "trending" stats.\n\n## What we don't collect\n- TikTok or Instagram passwords.\n- Any private content.\n\n## Cookies\nWe only use a secure httpOnly session cookie and a language cookie.\n\n## Your rights\nRequest account deletion at any time via the contact page.`,
    },
  },
  terms: {
    title: { ar: "شروط الاستخدام", en: "Terms of Service" },
    body: {
      ar: `## الاستخدام المقبول\n- استخدم الخدمة للمحتوى العام فقط وللأغراض الشخصية أو التحليلية.\n- لا تعِد نشر محتوى الآخرين دون إذنهم.\n- يُمنع استخدام الخدمة للتحرش أو التتبع المؤذي.\n\n## الاشتراكات\n- تتجدد اشتراكات برو تلقائياً ويمكن إلغاؤها في أي وقت.\n- تظل الميزات فعالة حتى نهاية الفترة المدفوعة.\n\n## إخلاء مسؤولية\nوهم سوشال غير تابع لتيك توك أو انستقرام. توفر البيانات يعتمد على المنصات نفسها.`,
      en: `## Acceptable use\n- Use the service for public content only, for personal or analytical purposes.\n- Don't repost others' content without permission.\n- Harassment or harmful tracking is prohibited.\n\n## Subscriptions\n- Pro renews automatically and can be cancelled any time.\n- Features stay active until the end of the paid period.\n\n## Disclaimer\nWahm Social is not affiliated with TikTok or Instagram. Data availability depends on the platforms.`,
    },
  },
  contact: {
    title: { ar: "تواصل معنا", en: "Contact" },
    body: {
      ar: `## الدعم\nتواصل معنا عبر X: **@iwahm**\n\n## الشركات\nلطلبات خطة الأعمال والوصول إلى API، راسلنا مع وصف مختصر لحالة الاستخدام.`,
      en: `## Support\nReach us on X: **@iwahm**\n\n## Business\nFor Business plan and API access, message us with a short description of your use case.`,
    },
  },
  docs: {
    title: { ar: "دليل الاستخدام", en: "User guide" },
    body: {
      ar: `## البحث عن حساب\n1. اختر المنصة (تيك توك أو انستقرام).\n2. اكتب اسم المستخدم أو الصق رابط الحساب.\n3. اضغط **بحث**.\n\n## تحميل منشور\n1. افتح أي منشور من شبكة المنشورات.\n2. اضغط **تحميل الفيديو** أو **تحميل الصورة**.\n- أو الصق الرابط مباشرة في **مركز التحميل**.\n\n## التحليلات\nتبويب **التحليلات** يعرض معدل التفاعل والمتوسطات. أفضل وقت للنشر والرسوم البيانية وتقدير الأرباح متاحة في **برو**.\n\n## المقارنة والمراقبة (برو)\n- **المقارنة**: ضع حتى ٤ حسابات واضغط قارن.\n- **المراقبة**: أضف حسابات من صفحة الملف وتابع تغير المتابعين.\n\n## مصدر البيانات\n- **مباشر**: جُلبت الآن.\n- **من الذاكرة المؤقتة**: جُلبت خلال الدقائق الماضية.\n- **تجريبي**: المنصة تحد الطلبات مؤقتاً.`,
      en: `## Look up an account\n1. Choose the platform (TikTok or Instagram).\n2. Type the username or paste the profile link.\n3. Press **Search**.\n\n## Download a post\n1. Open any post from the grid.\n2. Press **Download video** or **Download image**.\n- Or paste the link straight into the **Download center**.\n\n## Analytics\nThe **Analytics** tab shows engagement and averages. Best time to post, charts and earnings estimates are **Pro**.\n\n## Compare & watchlist (Pro)\n- **Compare**: add up to 4 accounts and press compare.\n- **Watchlist**: add accounts from a profile page and track follower changes.\n\n## Data source labels\n- **Live**: fetched just now.\n- **Cached**: fetched in the last few minutes.\n- **Demo**: the platform is rate-limiting temporarily.`,
    },
  },
};

/** Programmatic SEO landing pages under /tools/[slug]. */
export const TOOLS: Record<string, { title: { ar: string; en: string }; desc: { ar: string; en: string }; platform: "tiktok" | "instagram"; mode: "download" | "profile" | "stories" | "analytics" }> = {
  "tiktok-downloader": {
    platform: "tiktok",
    mode: "download",
    title: { ar: "تحميل فيديو تيك توك بدون علامة مائية", en: "TikTok Video Downloader — No Watermark" },
    desc: { ar: "الصق رابط فيديو تيك توك وحمله بجودة HD بدون شعار، مجاناً.", en: "Paste a TikTok link and save it in HD without the logo, free." },
  },
  "instagram-downloader": {
    platform: "instagram",
    mode: "download",
    title: { ar: "تحميل ريلز وصور انستقرام", en: "Instagram Reels & Photo Downloader" },
    desc: { ar: "حمّل ريلز وصور ومنشورات انستقرام العامة بأعلى جودة.", en: "Download public Instagram reels, photos and posts in top quality." },
  },
  "tiktok-profile-viewer": {
    platform: "tiktok",
    mode: "profile",
    title: { ar: "عارض حسابات تيك توك", en: "TikTok Profile Viewer" },
    desc: { ar: "اعرض أي حساب تيك توك عام: المتابعين، الإعجابات، وأحدث الفيديوهات.", en: "View any public TikTok profile: followers, likes and latest videos." },
  },
  "instagram-profile-viewer": {
    platform: "instagram",
    mode: "profile",
    title: { ar: "عارض حسابات انستقرام", en: "Instagram Profile Viewer" },
    desc: { ar: "اعرض حسابات انستقرام العامة والمنشورات والإحصائيات.", en: "View public Instagram profiles, posts and stats." },
  },
  "instagram-story-viewer": {
    platform: "instagram",
    mode: "stories",
    title: { ar: "عارض ستوري انستقرام العامة", en: "Instagram Public Story Viewer" },
    desc: { ar: "شاهد ستوري الحسابات العامة وحمّلها.", en: "Watch and save public account stories." },
  },
  "tiktok-engagement-calculator": {
    platform: "tiktok",
    mode: "analytics",
    title: { ar: "حاسبة معدل التفاعل في تيك توك", en: "TikTok Engagement Rate Calculator" },
    desc: { ar: "احسب معدل التفاعل لأي حساب تيك توك عام في ثوانٍ.", en: "Calculate the engagement rate of any public TikTok account in seconds." },
  },
  "instagram-engagement-calculator": {
    platform: "instagram",
    mode: "analytics",
    title: { ar: "حاسبة معدل التفاعل في انستقرام", en: "Instagram Engagement Rate Calculator" },
    desc: { ar: "احسب معدل التفاعل لأي حساب انستقرام عام.", en: "Calculate the engagement rate of any public Instagram account." },
  },
};
