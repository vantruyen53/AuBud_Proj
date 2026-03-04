import { ITransactionItem, ICategory } from "../models/interface/Entities";
import { formatCurrency } from "./format";
interface ITransactionSection {
  title: string;
  data: ITransactionItem[];
}

export const getTransactionSections = (
  sourceData:ITransactionItem[]
): ITransactionSection[] => {

  // Nhóm theo ngày
  const groups = sourceData.reduce(
    (acc, item) => {
      const date = item.date?.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item as ITransactionItem);
      return acc;
    },
    {} as Record<string, ITransactionItem[]>,
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
