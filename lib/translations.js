// lib/translations.js
// All UI strings for Addora — English & Amharic

export const translations = {
  en: {
    // Header nav
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    orders: 'Orders',
    cart: 'Cart',
    account: 'Account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    searchPlaceholder: 'What are you looking for?',
    search: 'Search',
    clear: 'Clear',
    openSearch: 'Open search',
    searchProducts: 'Search products...',

    // User dropdown
    accountManagement: 'Account Management',
    myOrders: 'My Orders',
    myCart: 'My Cart',

    // Announcement strip
    cashOnDelivery: 'Cash on Delivery',
    fastDelivery: '1–3 Day Delivery',
    freeInAddis: 'Free in Addis',

    // Bottom nav
    navHome: 'Home',
    navOrders: 'Orders',
    navCart: 'Cart',
    navCategories: 'Categories',
    navAccount: 'Account',

    // General
    loading: 'Loading...',
    close: 'Close',
    back: 'Back',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    viewAll: 'View All',
    seeMore: 'See More',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    sold: 'Sold',
    reviews: 'Reviews',
    rating: 'Rating',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    emptyCart: 'Your cart is empty',
    wishlist: 'Wishlist',

    // Trust / Footer
    securePayment: 'Secure Payment',
    freeReturns: 'Free Returns',
    support: '24/7 Support',
    trustedVendors: 'Trusted Vendors',
  },

  am: {
    // Header nav
    home: 'ዋና ገጽ',
    shop: 'መደብር',
    categories: 'ምድቦች',
    orders: 'ትዕዛዞች',
    cart: 'ጋሪ',
    account: 'መለያ',
    signIn: 'ግባ',
    signUp: 'ተመዝገብ',
    signOut: 'ውጣ',
    searchPlaceholder: 'ምን እየፈለጉ ነዎት?',
    search: 'ፈልግ',
    clear: 'አጽዳ',
    openSearch: 'ፍለጋ ክፈት',
    searchProducts: 'ምርቶችን ፈልግ...',

    // User dropdown
    accountManagement: 'መለያ አስተዳደር',
    myOrders: 'ትዕዛዞቼ',
    myCart: 'ጋሪዬ',

    // Announcement strip
    cashOnDelivery: 'ሲደርስ ክፈሉ',
    fastDelivery: '1–3 ቀን ማድረሻ',
    freeInAddis: 'በአዲስ አበባ ነፃ',

    // Bottom nav
    navHome: 'ዋና',
    navOrders: 'ትዕዛዝ',
    navCart: 'ጋሪ',
    navCategories: 'ምድቦች',
    navAccount: 'መለያ',

    // General
    loading: 'በመጫን ላይ...',
    close: 'ዝጋ',
    back: 'ተመለስ',
    addToCart: 'ወደ ጋሪ ጨምር',
    buyNow: 'አሁን ግዛ',
    viewAll: 'ሁሉንም ይመልከቱ',
    seeMore: 'ተጨማሪ ይመልከቱ',
    outOfStock: 'አልቋል',
    inStock: 'አለ',
    sold: 'ተሸጠ',
    reviews: 'ግምገማዎች',
    rating: 'ደረጃ',
    price: 'ዋጋ',
    quantity: 'ብዛት',
    total: 'ጠቅላላ',
    subtotal: 'ንዑስ ጠቅላላ',
    checkout: 'ክፈሉ',
    continueShopping: 'ግዢ ቀጥሉ',
    emptyCart: 'ጋሪዎ ባዶ ነው',
    wishlist: 'ምኞት ዝርዝር',

    // Trust / Footer
    securePayment: 'ደህንነቱ የተጠበቀ ክፍያ',
    freeReturns: 'ነፃ መመለስ',
    support: '24/7 ድጋፍ',
    trustedVendors: 'የታመኑ አቅራቢዎች',
  },
}

// Convenience helper — use inside non-React files if needed
export function getT(lang = 'en') {
  const dict = translations[lang] ?? translations.en
  return (key) => dict[key] ?? translations.en[key] ?? key
}
