import React from 'react';
import { CreditCard, ShieldCheck, Mail, Info } from 'lucide-react-native';
import { Colors } from '@/src/constants/theme';

export const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'SYSTEM',
    title: 'Welcome to AuBud!',
    description: "Thank you for choosing AuBud to manage your personal finances. Let's start by adding your first account.",
    time: '2 mins ago',
    isRead: false,
    icon: <Info size={20} color={Colors.light.primary} />,
    bgColor: '#E0F2FE',
  },
  {
    id: '2',
    type: 'TRANSACTION',
    title: 'Transaction Successful',
    description: "You added a new expense: -500,000 VND for 'Dining'.",
    time: '1 hour ago',
    isRead: false,
    icon: <CreditCard size={20} color={Colors.light.success} />,
    bgColor: '#DCFCE7',
  },
  {
    id: '3',
    type: 'SECURITY',
    title: 'New Login Detected',
    description: 'Your account was recently logged in from device: iPhone 15 Pro.',
    time: '3 hours ago',
    isRead: true,
    icon: <ShieldCheck size={20} color={Colors.light.warning} />,
    bgColor: '#FEF3C7',
  },
  {
    id: '4',
    type: 'PROMO',
    title: 'Special Offer!',
    description: 'Upgrade to Premium today to get 50% off service fees.',
    time: 'Yesterday',
    isRead: true,
    icon: <Mail size={20} color="#8B5CF6" />,
    bgColor: '#EDE9FE',
  },
];
