import { IStatisticDate, IStatisticCategory } from "../../models/IApp";

// time data
const dailyStatistic: IStatisticDate[] = [{
  id: 'day-2024-03-15',
  date: '2024-03-15',
  income: 1200000,
  sending: 450000,
}];
const monthlyStatistics: IStatisticDate[] = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(day); // Giả lập cuối tuần chi tiêu nhiều hơn
  
  return {
    id: `march-day-${day}`,
    date: `2024-03-${day < 10 ? `0${day}` : day}`,
    // Thu nhập tập trung vào đầu tháng (lương)
    income: day === 1 ? 25000000 : (Math.random() > 0.8 ? Math.floor(Math.random() * 500000) : 0),
    // Chi tiêu hàng ngày ngẫu nhiên
    sending: isWeekend 
      ? Math.floor(Math.random() * 1500000) + 500000 
      : Math.floor(Math.random() * 300000) + 50000,
  };
});
const yearlyStatistics: IStatisticDate[] = [
  { id: 'm1', date: 'Jan', income: 32000000, sending: 28000000 },
  { id: 'm2', date: 'Feb', income: 45000000, sending: 35000000 }, 
  { id: 'm3', date: 'Mar', income: 28000000, sending: 12000000 },
  { id: 'm4', date: 'Apr', income: 29500000, sending: 18000000 },
  { id: 'm5', date: 'May', income: 31000000, sending: 22000000 },
  { id: 'm6', date: 'Jun', income: 27000000, sending: 15000000 },
  { id: 'm7', date: 'Jul', income: 28000000, sending: 19000000 },
  { id: 'm8', date: 'Aug', income: 33000000, sending: 21000000 },
  { id: 'm9', date: 'Sep', income: 30000000, sending: 17000000 },
  { id: 'm10', date: 'Oct', income: 28500000, sending: 14000000 },
  { id: 'm11', date: 'Nov', income: 34000000, sending: 25000000 },
  { id: 'm12', date: 'Dec', income: 40000000, sending: 38000000 },
];

// category data 
export const dailyCategoryStats: IStatisticCategory[] = [
  { id: 'c1', totalAmount: 50000, type: 'sending', categoryName: 'Food', date: '2024-03-20' },
  { id: 'c2', totalAmount: 20000, type: 'sending', categoryName: 'Parking', date: '2024-03-20' },
  { id: 'c3', totalAmount: 150000, type: 'sending', categoryName: 'Shopping', date: '2024-03-20' },
];
export const monthlyCategoryStats: IStatisticCategory[] = [
  // (Sending)
  { id: 'm-c1', totalAmount: 4500000, type: 'sending', categoryName: 'Food', date: '2024-03' },
  { id: 'm-c2', totalAmount: 1200000, type: 'sending', categoryName: 'Transportation', date: '2024-03' },
  { id: 'm-c3', totalAmount: 3000000, type: 'sending', categoryName: 'Rent', date: '2024-03' },
  { id: 'm-c4', totalAmount: 800000, type: 'sending', categoryName: 'Internet', date: '2024-03' },
  { id: 'm-c5', totalAmount: 500000, type: 'sending', categoryName: 'Parking', date: '2024-03' },
  { id: 'm-c6', totalAmount: 2000000, type: 'sending', categoryName: 'Shopping', date: '2024-03' },
  
  // (Income)
  { id: 'm-i1', totalAmount: 20000000, type: 'income', categoryName: 'Salary', date: '2024-03' },
  { id: 'm-i2', totalAmount: 8000000, type: 'income', categoryName: 'Freelance', date: '2024-03' },
];
export const yearlyCategoryStats: IStatisticCategory[] = [
  { id: 'y-c1', totalAmount: 55000000, type: 'sending', categoryName: 'Education', date: '2024' },
  { id: 'y-c2', totalAmount: 40000000, type: 'sending', categoryName: 'Health', date: '2024' },
  { id: 'y-c3', totalAmount: 25000000, type: 'sending', categoryName: 'Travel', date: '2024' },
  { id: 'y-c4', totalAmount: 15000000, type: 'sending', categoryName: 'Gift', date: '2024' },
  { id: 'y-c5', totalAmount: 6000000, type: 'sending', categoryName: 'Food', date: '2024' },
  { id: 'y-c6', totalAmount: 1500000, type: 'sending', categoryName: 'Transportation', date: '2024' },
  { id: 'y-c7', totalAmount: 5000000, type: 'sending', categoryName: 'Rent', date: '2024' },
  { id: 'y-c8', totalAmount: 8000000, type: 'sending', categoryName: 'Internet', date: '2024' },
  { id: 'y-c9', totalAmount: 1500000, type: 'sending', categoryName: 'Parking', date: '2024' },
  { id: 'y-c10', totalAmount: 30000000, type: 'sending', categoryName: 'Shopping', date: '2024' },
  
  { id: 'y-i1', totalAmount: 300000000, type: 'income', categoryName: 'Salary', date: '2024' },
  { id: 'y-i2', totalAmount: 50000000, type: 'income', categoryName: 'Bonus', date: '2024' },
  { id: 'y-i3', totalAmount: 12000000, type: 'income', categoryName: 'Interest', date: '2024' },
  { id: 'y-i4', totalAmount: 9000000, type: 'income', categoryName: 'Freelance', date: '2024-03' },
];

export {dailyStatistic, monthlyStatistics, yearlyStatistics}
