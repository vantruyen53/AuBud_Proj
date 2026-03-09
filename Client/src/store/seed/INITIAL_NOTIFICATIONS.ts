import React, { JSX } from 'react';
import { CreditCard, ShieldCheck, Mail, Info } from 'lucide-react-native';
import { Colors } from '@/src/constants/theme';

interface Inotifacation{
    id:string,
    type:string,
    title:string,
    description:string,
    time:string,
    isRead:boolean,
}

export const INITIAL_NOTIFICATIONS:Inotifacation[] = [
    {
    id: '1',
    type: 'SYSTEM',
    title: 'Welcome to AuBud!',
    description: "Thank you for choosing AuBud to manage your personal finances. Let's start by adding your first account.",
    time: '2 mins ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'TRANSACTION',
    title: 'Transaction Successful',
    description: "You added a new expense: -500,000 VND for 'Dining'.",
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'SECURITY',
    title: 'New Login Detected',
    description: 'Your account was recently logged in from device: iPhone 15 Pro.',
    time: '3 hours ago',
    isRead: true,
  },
  {
     id: '4',
    type: 'PROMO',
    title: 'Special Offer!',
    description: 'Upgrade to Premium today to get 50% off service fees.',
    time: 'Yesterday',
    isRead: true,
  }
];
