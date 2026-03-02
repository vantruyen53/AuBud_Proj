import { ITransaction, ICategory, ITransactionSection } from "../models/IApp";
import { mockIncome, mockSending } from "../store/seed/transaction";
import { formatCurrency } from "./format";

const generateMockTransaction = (
  type: string = "sending",
): Record<string, ITransaction[]> => {
  const data: Record<string, ITransaction[]> = {};
  const addTx = (
    id: string,
    title: string,
    wallet: string,
    date: string,
    amount: string,
    icon: ICategory,
    type: string,
    note: string,
    budget: string,
  ) => {
    if (!data[date]) data[date] = [];

    data[date].push({
      id: id,
      category: icon,
      amount: amount,
      type: type,
      wallet: wallet,
      date: date,
      note: note,
      buget: budget,
      title: title,
    });
  };
  if (type === "sending")
    for (let t of mockSending) {
      const amount = formatCurrency(parseInt(t.amount));
      addTx(
        t.id,
        t.title,
        t.wallet,
        t.date,
        amount,
        t.category,
        t.type,
        t.note,
        t.buget,
      );
    }
  else
    for (let t of mockIncome) {
      const amount = formatCurrency(parseInt(t.amount));
      addTx(
        t.id,
        t.title,
        t.wallet,
        t.date,
        amount,
        t.category,
        t.type,
        t.note,
        t.buget,
      );
    }
  return data;
};

export { generateMockTransaction };

export const getTransactionSections = (
  type: string = "sending",
): ITransactionSection[] => {
  const sourceData = type === "sending" ? mockSending : mockIncome;

  // Nhóm theo ngày
  const groups = sourceData.reduce(
    (acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item as ITransaction);
      return acc;
    },
    {} as Record<string, ITransaction[]>,
  );

  // Chuyển sang format SectionList và sắp xếp ngày mới nhất lên đầu
  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      title: date,
      data: groups[date],
    }));
};

export const listCatCharAlphaB = (data: ICategory[]) => {
  const groups = data.reduce(
    (acc, item) => {
      const key = item.name[0].toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item as ICategory);
      return acc;
    },
    {} as Record<string, ICategory[]>,
  );

  return Object.keys(groups)
    .sort()
    .map((key) => ({
      key: key,
      data: groups[key],
    }));
};
