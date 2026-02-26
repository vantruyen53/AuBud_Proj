import {IBudgetCategory} from '@/src/models/IApp';

const mockBudget:IBudgetCategory[]=[
    {
        id:'1',
        category: { id: '1', name: 'Ăn uống', iconName: 'restaurant', type:"sending", iconColor: "240, 40, 0" },
        totalAmount: 3500000,
        balance: 900000,
        date:'3/2026'
    },
    {
        id:'2',
        category: { id: '3', name: 'Di chuyển', iconName: 'directions-car', type:"sending", iconColor:"240, 160, 0" },
        totalAmount: 500000,
        balance: 350000,
        date:'3/2026'
    },
    {
        id:'3',
        category:{ id:'4', name: 'Mua sắm', iconName: 'shopping-cart', type:"sending", iconColor: "224, 240, 0" },
        totalAmount: 5000000,
        balance: 320000,
        date:'3/2026'
    },
    {
        id:'4',
        category: { id: '5', name: 'Học tập', iconName: 'school', type:"sending", iconColor: "112, 240, 0" },
        totalAmount: 2000000,
        balance: 900000,
        date:'3/2026'
    },
    {
        id:'5',
        category: { id: '6', name: 'Giải trí', iconName: 'movie', type:"sending", iconColor: "0, 240, 144" },
        totalAmount: 3500000,
        balance: 250000,
        date:'3/2026'
    },
]
export default mockBudget;