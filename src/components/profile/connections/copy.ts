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
    ar: ["القائمة عامة لهذا الحساب", "صاحب الحساب يسمح بعرض القائمة. يتم جلبها عبر واجهة TikTok الرسمية للباحثين عند تفعيلها على السيرفر — وحتى ذلك الحين يمكنك فتحها مباشرة في تيك توك."],
    en: ["This list is public", "The owner allows this list to be seen. It's fetched through TikTok's official Research API once enabled on the server — meanwhile you can open it directly on TikTok."],
  },
  login_only: {
    ar: ["متاحة داخل انستقرام فقط", "انستقرام يعرض قوائم المتابعين للمستخدمين المسجلين داخل التطبيق فقط."],
    en: ["Available inside Instagram only", "Instagram only shows follower lists to signed-in users in the app."],
  },
  not_supported: {
    ar: ["غير متاح حالياً", "تعذر جلب بيانات الحساب الآن، حاول لاحقاً."],
    en: ["Not available right now", "We couldn't load this account right now, try again later."],
  },
};
