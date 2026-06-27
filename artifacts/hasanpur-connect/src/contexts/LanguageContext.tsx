import { createContext, useContext, ReactNode } from "react";

export type Lang = "en" | "hi";

function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  return match?.[1] === "hi" ? "hi" : "en";
}

const englishLabels: Record<string, string> = {
  home: "Home",
  businesses: "Businesses",
  blog: "Blog",
  login: "Login",
  logout: "Logout",
  requestService: "Request a Service",
  browseBusinesses: "Browse Businesses",
  search: "Search",
  searchPlaceholder: "What are you looking for? (e.g. Restaurants, Doctors)",
  findBestIn: "Find the best in",
  cityName: "Hasanpur City",
  heroSubtitle: "Discover trusted local businesses, premium services, and exclusive offers right in your neighborhood.",
  exploreCategories: "Explore Categories",
  viewAll: "View All",
  featuredBusinesses: "Featured Businesses",
  premiumListings: "Premium Listings",
  verifiedBusiness: "Verified",
  premiumBusiness: "Premium",
  callNow: "Call Now",
  whatsapp: "WhatsApp",
  enquiry: "Send Enquiry",
  website: "Visit Website",
  address: "Address",
  email: "Email",
  phone: "Phone",
  openNow: "Open Now",
  closedNow: "Closed Now",
  businessHours: "Business Hours",
  reviews: "Reviews",
  writeReview: "Write a Review",
  yourName: "Your Name",
  yourReview: "Your Review",
  submitReview: "Submit Review",
  sendEnquiry: "Send Enquiry",
  yourMessage: "Your Message",
  submit: "Submit",
  loading: "Loading...",
  noResults: "No results found",
  searchResults: "Search Results",
  typeToSearch: "Type to search businesses...",
  register: "Register",
  createAccount: "Create Account",
  alreadyHaveAccount: "Already have an account?",
  noAccount: "Don't have an account?",
  forgotPassword: "Forgot Password?",
  dashboard: "Dashboard",
  myListing: "My Listing",
  products: "Products",
  pendingApproval: "Pending Approval",
  approved: "Approved",
  suspended: "Suspended",
  businessSuspended: "This business has been suspended.",
  businessNotFound: "Business not found",
  about: "About Us",
  contact: "Contact Us",
  faq: "FAQ",
  privacyPolicy: "Privacy Policy",
  terms: "Terms of Service",
  disclaimer: "Disclaimer",
  governmentContacts: "Government Contacts",
  communityPartners: "Community Partners",
  allRightsReserved: "All Rights Reserved",
  rating: "Rating",
  share: "Share",
  directions: "Get Directions",
  report: "Report",
  photos: "Photos",
  faqs: "FAQs",
  similarBusinesses: "Similar Businesses",
  name: "Name",
  message: "Message",
  send: "Send",
  cancel: "Cancel",
  save: "Save",
  edit: "Edit",
  delete: "Delete",
  close: "Close",
  back: "Back",
  next: "Next",
  previous: "Previous",
  noBusinessYet: "No businesses found.",
  listYourBusiness: "List Your Business",
  password: "Password",
  confirmPassword: "Confirm Password",
  businessName: "Business Name",
  category: "Category",
  description: "Description",
  location: "Location",
  selectCategory: "Select Category",
  localDirectory: "Hasanpur's #1 Local Directory",
  webDevTitle: "Need a Website?",
  webDevSubtitle: "We build professional websites for local businesses.",
  getInTouch: "Get in Touch",
  verifyEmail: "Verify Your Email",
  otpSent: "A 6-digit code was sent to",
  verifyCode: "Verify & Create Account",
  resendOtp: "Resend OTP",
  didntReceive: "Didn't receive the code?",
  wrongEmail: "Wrong email? Go back",
  verificationCode: "Verification Code",
  validFor: "Valid for 10 minutes",
};

interface LanguageContextType {
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggle: () => {},
  t: (k) => englishLabels[k] ?? k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = getLangFromCookie();

  const toggle = () => {
    const domain = window.location.hostname;
    if (lang === "en") {
      document.cookie = `googtrans=/en/hi; path=/; domain=${domain}`;
      document.cookie = "googtrans=/en/hi; path=/";
    } else {
      const past = "Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `googtrans=; expires=${past}; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=${past}; path=/`;
    }
    window.location.reload();
  };

  const t = (key: string): string => englishLabels[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
