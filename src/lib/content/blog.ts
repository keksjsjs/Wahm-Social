/** Static, SEO-oriented articles. Content is bilingual; body is lightweight markdown. */
export interface Article {
  slug: string;
  date: string;
  tags: string[];
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  body: { ar: string; en: string };
}

export const ARTICLES: Article[] = [
  {
    slug: "download-tiktok-without-watermark",
    date: "2026-10-02",
    tags: ["tiktok", "download"],
    title: { ar: "كيف تحمل فيديو تيك توك بدون علامة مائية (دليل ٢٠٢٦)", en: "How to download TikTok videos without watermark (2026 guide)" },
    excerpt: {
      ar: "الطريقة الأسرع والأكثر أماناً لحفظ فيديوهات تيك توك العامة بجودة عالية وبدون شعار.",
      en: "The fastest, safest way to save public TikTok videos in high quality without the logo.",
    },
    body: {
      ar: `## لماذا العلامة المائية؟\nتضيف تيك توك شعارها واسم المستخدم عند الحفظ من داخل التطبيق.\n\n## الخطوات\n1. افتح الفيديو في تيك توك واضغط **مشاركة ← نسخ الرابط**.\n2. ادخل إلى **مركز التحميل** في وهم سوشال.\n3. الصق الرابط واضغط **جلب الوسائط**.\n4. اضغط **تحميل الفيديو**.\n\n## نصائح\n- احترم حقوق صاحب المحتوى ولا تعيد نشره دون إذن.\n- الفيديوهات الخاصة لا يمكن تحميلها — وهذا مقصود.`,
      en: `## Why the watermark?\nTikTok stamps its logo and the username when you save from the app.\n\n## Steps\n1. Open the video in TikTok and tap **Share → Copy link**.\n2. Go to the Wahm Social **Download center**.\n3. Paste the link and press **Fetch media**.\n4. Press **Download video**.\n\n## Tips\n- Respect creators' rights; don't repost without permission.\n- Private videos can't be downloaded — by design.`,
    },
  },
  {
    slug: "instagram-engagement-rate",
    date: "2026-09-18",
    tags: ["instagram", "analytics"],
    title: { ar: "ما هو معدل التفاعل الجيد في انستقرام؟", en: "What is a good Instagram engagement rate?" },
    excerpt: { ar: "شرح مبسط لحساب معدل التفاعل ومقارنته بمتوسطات السوق.", en: "A simple explanation of engagement rate and industry benchmarks." },
    body: {
      ar: `## المعادلة\nمعدل التفاعل = (الإعجابات + التعليقات) ÷ المتابعين لكل منشور.\n\n## المتوسطات التقريبية\n- أقل من ١٠ آلاف متابع: ٤٪ – ٨٪\n- ١٠ آلاف – ١٠٠ ألف: ٢٪ – ٤٪\n- أكثر من مليون: ١٪ – ٢٪\n\n## كيف تحسبه بسرعة؟\nابحث عن الحساب في وهم سوشال وافتح تبويب **التحليلات**.`,
      en: `## The formula\nEngagement rate = (likes + comments) ÷ followers, per post.\n\n## Rough benchmarks\n- Under 10K followers: 4% – 8%\n- 10K – 100K: 2% – 4%\n- Over 1M: 1% – 2%\n\n## Quick way\nSearch the account on Wahm Social and open the **Analytics** tab.`,
    },
  },
  {
    slug: "best-time-to-post-tiktok-saudi",
    date: "2026-08-30",
    tags: ["tiktok", "growth"],
    title: { ar: "أفضل وقت للنشر على تيك توك في السعودية والخليج", en: "Best time to post on TikTok in Saudi Arabia & the Gulf" },
    excerpt: { ar: "اكتشف الساعات الذهبية للنشر بناءً على نشاط الجمهور الخليجي.", en: "Find the golden hours based on Gulf audience activity." },
    body: {
      ar: `## الساعات الذهبية (بتوقيت الرياض)\n- ٨ – ١١ مساءً أيام الأسبوع\n- ٢ – ٥ عصراً يومي الجمعة والسبت\n\n## اعتمد على بياناتك\nكل جمهور مختلف. افتح تحليلات حسابك في وهم لترى **أفضل يوم** و**أفضل ساعة** حسب تفاعلك الفعلي.`,
      en: `## Golden hours (Riyadh time)\n- 8 – 11 PM on weekdays\n- 2 – 5 PM on Friday and Saturday\n\n## Trust your data\nEvery audience differs. Open your Wahm analytics to see your **best day** and **best hour** from real engagement.`,
    },
  },
  {
    slug: "view-instagram-stories-anonymously-truth",
    date: "2026-08-12",
    tags: ["instagram", "privacy"],
    title: { ar: "مشاهدة ستوري انستقرام: الحقيقة حول الخصوصية", en: "Viewing Instagram stories: the truth about privacy" },
    excerpt: { ar: "ما الممكن وما المستحيل — ولماذا لا نتجاوز الحسابات الخاصة.", en: "What's possible, what isn't — and why we never bypass private accounts." },
    body: {
      ar: `## الحسابات العامة\nالستوري في الحسابات العامة مرئية لأي شخص داخل انستقرام، ويمكن عرضها عبر أدوات تعتمد على واجهات عامة.\n\n## الحسابات الخاصة\nلا توجد أداة شرعية تعرض ستوري الحسابات الخاصة. أي موقع يدّعي ذلك غالباً احتيال أو يسرق بياناتك.\n\n## موقفنا\nوهم سوشال يعرض **العام فقط**، ولا يطلب منك أبداً كلمة مرور حسابك.`,
      en: `## Public accounts\nStories on public accounts are visible to anyone on Instagram and can be shown by tools using public interfaces.\n\n## Private accounts\nNo legitimate tool shows private stories. Any site claiming so is likely a scam or harvesting your data.\n\n## Our stance\nWahm Social shows **public only** and will never ask for your account password.`,
    },
  },
  {
    slug: "tiktok-influencer-pricing",
    date: "2026-07-21",
    tags: ["tiktok", "business"],
    title: { ar: "كم يستحق المؤثر على تيك توك؟ دليل تسعير الإعلانات", en: "How much should a TikTok influencer charge? Pricing guide" },
    excerpt: { ar: "طريقة تقدير سعر الإعلان حسب المتابعين والتفاعل والفئة.", en: "Estimate sponsored post prices from followers, engagement and tier." },
    body: {
      ar: `## الفئات\n- نانو (أقل من ١٠ آلاف)\n- مايكرو (١٠ – ٥٠ ألف)\n- متوسط (٥٠ – ٥٠٠ ألف)\n- ماكرو (٥٠٠ ألف – مليون)\n- ميجا (أكثر من مليون)\n\n## التقدير\nنستخدم في وهم معادلة تعتمد على المتابعين ومعدل التفاعل الفعلي من آخر المنشورات لإعطاء نطاق سعري واقعي.`,
      en: `## Tiers\n- Nano (<10K)\n- Micro (10–50K)\n- Mid (50–500K)\n- Macro (500K–1M)\n- Mega (1M+)\n\n## Estimation\nWahm uses a formula based on followers and real engagement from recent posts to give a realistic price range.`,
    },
  },
  {
    slug: "grow-instagram-hashtags-2026",
    date: "2026-07-03",
    tags: ["instagram", "growth"],
    title: { ar: "استراتيجية الهاشتاقات في انستقرام ٢٠٢٦", en: "Instagram hashtag strategy for 2026" },
    excerpt: { ar: "كم هاشتاق تستخدم، وكيف تكتشف الأقوى لمجالك.", en: "How many hashtags to use and how to find the strongest for your niche." },
    body: {
      ar: `## العدد المثالي\n٣ – ٥ هاشتاقات دقيقة أفضل من ٣٠ عشوائية.\n\n## اكتشف هاشتاقات المنافسين\nابحث عن منافسك في وهم سوشال وافتح **أقوى الهاشتاقات** لترى ما يستخدمه ومتوسط الإعجابات لكل هاشتاق.`,
      en: `## The ideal count\n3–5 precise hashtags beat 30 random ones.\n\n## Spy on competitors\nSearch a competitor on Wahm Social and open **Top hashtags** to see what they use and average likes per tag.`,
    },
  },
  {
    slug: "compare-creators-before-campaign",
    date: "2026-06-15",
    tags: ["business", "compare"],
    title: { ar: "قارن المؤثرين قبل إطلاق حملتك", en: "Compare creators before launching your campaign" },
    excerpt: { ar: "كيف تختار المؤثر المناسب باستخدام مقارنة البيانات العامة.", en: "Pick the right creator using public-data comparisons." },
    body: {
      ar: `## لا تعتمد على عدد المتابعين فقط\nمعدل التفاعل ونشاط النشر أهم.\n\n## أداة المقارنة\nفي خطة برو يمكنك وضع حتى ٤ حسابات (٨ في أعمال) ومقارنتها جنباً إلى جنب.`,
      en: `## Followers aren't everything\nEngagement rate and posting consistency matter more.\n\n## The compare tool\nOn Pro you can line up to 4 accounts (8 on Business) side by side.`,
    },
  },
  {
    slug: "is-it-legal-to-download-social-videos",
    date: "2026-05-28",
    tags: ["legal"],
    title: { ar: "هل تحميل فيديوهات السوشال ميديا قانوني؟", en: "Is downloading social media videos legal?" },
    excerpt: { ar: "الاستخدام الشخصي مقابل إعادة النشر — ما تحتاج معرفته.", en: "Personal use vs. reposting — what you need to know." },
    body: {
      ar: `## الاستخدام الشخصي\nحفظ نسخة للمشاهدة الشخصية مقبول عادة.\n\n## إعادة النشر\nتحتاج إذن صاحب المحتوى، وانسب الفضل دائماً.\n\n## مسؤوليتك\nباستخدامك وهم سوشال توافق على احترام حقوق الملكية وشروط المنصات.`,
      en: `## Personal use\nKeeping a copy for personal viewing is generally fine.\n\n## Reposting\nYou need the creator's permission — always give credit.\n\n## Your responsibility\nBy using Wahm Social you agree to respect copyright and platform terms.`,
    },
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
