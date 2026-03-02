import { ICategory } from "@/src/models/IApp";
const mockCategoriesSending: ICategory[] = [
  // --- SENDING CATEGORIES ---
  {
    id: 'c1',
    name: 'Food',
    type: 'sending',
    iconName: 'restaurant',
    iconColor: '255, 107, 107', // Đỏ san hô
  },
  {
    id: 'c2',
    name: 'Transport',
    type: 'sending',
    iconName: 'directions-car',
    iconColor: '77, 150, 255', // Xanh dương
  },
  {
    id: 'c3',
    name: 'Shopee',
    type: 'sending',
    iconName: 'shopping-cart',
    iconColor: '255, 217, 61', // Vàng
  },
  {
    id: 'c4',
    name: 'House',
    type: 'sending',
    iconName: 'home',
    iconColor: '107, 203, 119', // Xanh lá
  },
  {
    id: 'c5',
    name: 'Entertaiment',
    type: 'sending',
    iconName: 'movie',
    iconColor: '162, 155, 254', // Tím nhạt
  },
  {
    id: 'c6',
    name: 'Health',
    type: 'sending',
    iconName: 'local-hospital',
    iconColor: '255, 121, 198', // Hồng
  },
];
const mockCategoriesIncome: ICategory[] = [
  {
    id: 'c7',
    name: 'Salary',
    type: 'income',
    iconName: 'payments',
    iconColor: '46, 213, 115', // Xanh lá đậm
  },
  {
    id: 'c8',
    name: 'Reward',
    type: 'income',
    iconName: 'card-giftcard',
    iconColor: '255, 159, 26', // Cam
  },
  {
    id: 'c9',
    name: 'Invest',
    type: 'income',
    iconName: 'trending-up',
    iconColor: '24, 220, 255', // Xanh cyan
  },
  {
    id: 'c10',
    name: 'Selling',
    type: 'income',
    iconName: 'storefront',
    iconColor: '126, 214, 223', // Xanh mint
  }
];

export const AVAILABLE_ICONS_SENDING = [
  'restaurant', 'fastfood', 'coffee', 'cake', 'wine-bar', 'local-grocery-store',
  'bakery-dining', 'lunch-dining', 'dinner-dining', 'brunch-dining', 'emoji-food-beverage', 'liquor',
  'directions-car', 'local-gas-station', 'flight', 'directions-bus', 'directions-bike',
  'two-wheeler', 'local-taxi', 'train', 'directions-boat', 'electric-car',
  'shopping-cart', 'shopping-bag', 'redeem', 'local-mall', 'sell', 'loyalty',
  'home', 'build', 'plumbing', 'electrical-services', 'cleaning-services',
  'local-laundry-service', 'chair', 'bedroom-parent', 'kitchen',
  'local-hospital', 'fitness-center', 'spa', 'local-pharmacy', 'sports-soccer',
  'sports-basketball', 'sports-tennis', 'pool', 'self-improvement', 'psychology',
  'movie', 'sports-esports', 'music-note', 'beach-access', 'theater-comedy',
  'casino', 'golf-course', 'museum', 'park', 'celebration', 'festival',
  'school', 'work', 'local-library', 'science', 'computer', 'print',
  'face', 'favorite', 'pets', 'child-care', 'volunteer-activism', 'people',
  'phone-iphone', 'watch', 'wifi', 'devices', 'headphones',
  'hotel', 'luggage', 'map', 'explore', 'hiking',
];

export const AVAILABLE_ICONS_INCOME = [
  'account-balance', 'savings', 'currency-exchange', 'account-balance-wallet',
  'paid', 'payments', 'card-giftcard', 'monetization-on', 'attach-money',
  'wallet', 'request-quote', 'receipt-long',
  'trending-up', 'storefront', 'sell', 'loyalty', 'price-check',
  'local-atm', 'point-of-sale', 'credit-card', 'credit-score',
  'money', 'money-off', 'euro', 'currency-bitcoin', 'currency-yuan',
  'work', 'business-center', 'business', 'handshake', 'real-estate-agent',
  'assignment', 'contract', 'inventory', 'store', 'shop',
 'show-chart', 'bar-chart', 'candlestick-chart', 'waterfall-chart',
  'analytics', 'leaderboard', 'signal-cellular-alt', 'moving',
  'redeem', 'celebration', 'volunteer-activism', 'card-membership',
  'workspace-premium', 'military-tech', 'emoji-events',
];

export const AVAILABLE_COLORS = [
  '255, 107, 107', '77, 150, 255', '255, 217, 61', '107, 203, 119', 
  '162, 155, 254', '255, 121, 198', '255, 159, 26', '24, 220, 255', 
];

export {mockCategoriesSending, mockCategoriesIncome}