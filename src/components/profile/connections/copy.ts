import type { ConnectionsReason } from "@/lib/platforms/types";

/** Human explanations for every locked state, per account privacy. */
export const REASON_COPY: Record<ConnectionsReason, { ar: [string, string]; en: [string, string] }> = {
  account_private: {
    ar: ["الحساب خاص", "صاحب الحساب جعله خاصاً، لذلك لا تُعرض قائمة المتابعين أو المتابَعين لأي أحد."],
    en: ["Private account", "The owner made this account private, so its lists are not shown to anyone."],
  },
  hidden_by_user: {
    ar: ["القائمة مخفية", "صاحب الحساب أخفى هذه القائمة من إعدادات الخصوصية."],
    en: ["List hidden", "The account owner hid this list in their privacy settings."],
  },
  provider_required: {
    ar: ["القائمة عامة لهذا الحساب", "تيك توك لا يتيح قائمة المتابعين الكاملة خارج تطبيقه إلا لشركاء واجهة الباحثين الرسمية، ونحن لا نتجاوز حماية تيك توك. يمكنك فتح القائمة كاملة داخل تيك توك."],
    en: ["This list is public", "TikTok only exposes the full follower list inside its app or to approved Research API partners, and we don't bypass TikTok's protections. You can open the full list on TikTok."],
  },
  login_only: {
    ar: ["متاحة داخل انستقرام فقط", "انستقرام يعرض قوائم المتابعين للمستخدمين المسجلين فقط، ولم يُرجع القائمة لسيرفرنا حالياً."],
    en: ["Available inside Instagram only", "Instagram only shows follower lists to signed-in users, and it didn't return this list to our server right now."],
  },
  not_supported: {
    ar: ["غير متاح حالياً", "تعذر جلب بيانات الحساب الآن، حاول لاحقاً."],
    en: ["Not available right now", "We couldn't load this account right now, try again later."],
  },
};

export const RELATED_COPY = {
  recent_commenters: {
    ar: ["آخر المتفاعلين مع الحساب", "أحدث الأشخاص الذين علّقوا علناً على آخر فيديوهات الحساب — تفاعل عام وليس بالضرورة قائمة المتابعين."],
    en: ["Latest people engaging", "The newest people who publicly commented on this account's latest videos — public engagement, not necessarily the follower list."],
  },
} as const;
