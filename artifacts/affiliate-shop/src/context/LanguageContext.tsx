import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "ar";

const STORAGE_KEY = "dealhub-language";

const translations = {
  en: {
    "nav.home": "Home",
    "nav.deals": "All Deals",
    "nav.categories": "Categories",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.electronics": "Electronics",
    "nav.fashion": "Fashion",
    "nav.homeCategory": "Home",
    "nav.sports": "Sports",
    "nav.beauty": "Beauty",
    "nav.books": "Books",
    "header.shipping": "Free shipping on orders over $50",
    "header.updated": "Deals updated daily",
    "header.search": "Search deals...",
    "header.login": "Log in",
    "header.logout": "Log out",
    "header.account": "My Account",
    "header.compare": "Compare",
    "header.shopCategory": "Shop by Category",
    "footer.categories": "Categories",
    "footer.shop": "Shop",
    "footer.company": "Company",
    "footer.newsletter": "Get Deals First",
    "footer.subscribe": "Subscribe — It's Free",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms & Conditions",
    "footer.contact": "Contact Us",
    "footer.home": "Home",
    "footer.allDeals": "All Deals",
    "footer.allCategories": "All Categories",
    "footer.blog": "Blog & Reviews",
    "footer.featured": "Featured Picks",
    "footer.wishlist": "My Wishlist",
    "footer.compare": "Compare Products",
    "footer.about": "About DealHub",
    "footer.disclosure": "Affiliate disclosure: DealHub may earn a commission where partner tracking is configured. Standard retailer-search links do not include affiliate tracking.",
    "language.switch": "العربية",
    "language.english": "English",
    "language.arabic": "العربية",
    "admin.overview": "Overview",
    "admin.products": "Products",
    "admin.categories": "Categories",
    "admin.links": "Affiliate links",
    "admin.reviews": "Reviews",
    "admin.catalogPulse": "Catalog pulse",
    "admin.manageInventory": "Manage inventory",
    "admin.organizeShop": "Organize the shop",
    "admin.keepReferrals": "Keep referrals healthy",
    "admin.curateTrust": "Curate trust signals",
    "admin.controlRoom": "Control room / overview",
    "admin.dashboardTitle": "Know what is moving.",
    "admin.dashboardDescription": "A clean read on the DealHub catalog, its trust signals, and the work waiting in your queue.",
    "admin.viewStorefront": "View storefront",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.deals": "كل العروض",
    "nav.categories": "التصنيفات",
    "nav.blog": "المدونة",
    "nav.about": "عن DealHub",
    "nav.electronics": "إلكترونيات",
    "nav.fashion": "أزياء",
    "nav.homeCategory": "المنزل",
    "nav.sports": "رياضة",
    "nav.beauty": "الجمال",
    "nav.books": "كتب",
    "header.shipping": "شحن مجاني للطلبات فوق 50 دولارًا",
    "header.updated": "عروض جديدة يوميًا",
    "header.search": "ابحث عن العروض...",
    "header.login": "تسجيل الدخول",
    "header.logout": "تسجيل الخروج",
    "header.account": "حسابي",
    "header.compare": "مقارنة",
    "header.shopCategory": "تسوق حسب التصنيف",
    "footer.categories": "التصنيفات",
    "footer.shop": "تسوق",
    "footer.company": "الشركة",
    "footer.newsletter": "احصل على العروض أولًا",
    "footer.subscribe": "اشترك مجانًا",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "الشروط والأحكام",
    "footer.contact": "تواصل معنا",
    "footer.home": "الرئيسية",
    "footer.allDeals": "كل العروض",
    "footer.allCategories": "كل التصنيفات",
    "footer.blog": "المدونة والمراجعات",
    "footer.featured": "اختيارات مميزة",
    "footer.wishlist": "المفضلة",
    "footer.compare": "مقارنة المنتجات",
    "footer.about": "عن DealHub",
    "footer.disclosure": "إفصاح العمولة: قد يحصل DealHub على عمولة عند تفعيل تتبع الشراكة. روابط البحث العادية لدى المتاجر لا تتضمن تتبعًا للعمولة.",
    "language.switch": "English",
    "language.english": "English",
    "language.arabic": "العربية",
    "admin.overview": "نظرة عامة",
    "admin.products": "المنتجات",
    "admin.categories": "التصنيفات",
    "admin.links": "روابط العمولة",
    "admin.reviews": "المراجعات",
    "admin.catalogPulse": "نبض الكتالوج",
    "admin.manageInventory": "إدارة المخزون",
    "admin.organizeShop": "تنظيم المتجر",
    "admin.keepReferrals": "الحفاظ على صحة الإحالات",
    "admin.curateTrust": "تنظيم إشارات الثقة",
    "admin.controlRoom": "غرفة التحكم / نظرة عامة",
    "admin.dashboardTitle": "اعرف ما يتحرك.",
    "admin.dashboardDescription": "نظرة واضحة على كتالوج DealHub وإشارات الثقة والمهام المنتظرة في قائمتك.",
    "admin.viewStorefront": "عرض المتجر",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  language: Language;
  direction: "ltr" | "rtl";
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const direction = language === "ar" ? "rtl" : "ltr";

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dataset.language = language;
  }, [language, direction]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    direction,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "ar" : "en"),
    t: (key) => translations[language][key] ?? translations.en[key],
  }), [language, direction]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}