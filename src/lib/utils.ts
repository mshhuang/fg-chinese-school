import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTeacherName(firstName?: string | null, lastName?: string | null, defaultRole = 'Teacher'): string {
  const fName = (firstName || '').trim();
  const lName = (lastName || '').trim();

  if (!fName && !lName) return defaultRole;

  if (fName === 'Youlin' && lName === 'Venerable') {
    return '有仁法師';
  }

  if (fName === 'Derek') return 'Mr. Derek';
  if (fName === 'Janice') return 'Ms. Janice';
  if (fName === 'Kayvan') return 'Mr. Kayvan';
  if (fName === 'Yang' && lName === 'Li') return 'Mr. Li';

  if (fName.startsWith('Ms.') || fName.startsWith('Mr.')) {
     return [fName, lName].filter(Boolean).join(' ');
  }

  return `Ms. ${fName || lName}`;
}
