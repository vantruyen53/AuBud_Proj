export interface IHelpItem {
  q: string;
  a: string;
}

export const mockHelpItems: IHelpItem[] = [
  { q: 'How to add a transaction?', a: 'Go to the Home screen and press the "+" button in the middle of the bottom navigation bar.' },
  { q: 'Can I manage group funds?', a: 'Yes, go to the Group Funds section in the Wallet tab to invite members.' },
  { q: 'How to export data?', a: 'Currently, you can view reports here. Export to CSV feature will be available soon.' },
];
