import { ICategory } from "@/src/models/IApp";
const mockCategoriesSending: ICategory[] = [
  // --- SENDING CATEGORIES ---
  {
    id: 'c1',
    name: 'Food',
    type: 'sending',
    iconName: 'restaurant',
    iconColor: '255, 107, 107', 
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

export {mockCategoriesSending, mockCategoriesIncome}