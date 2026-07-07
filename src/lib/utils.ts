import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractPlainText(htmlContent: string): string {
  if (!htmlContent) return '';
  let str = htmlContent;
  
  // Strip role markers
  str = str.replace(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*/is, '');
  // Strip HTML tags
  str = str.replace(/<[^>]+>/g, ' ');
  // Decode common HTML entities
  str = str.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Condense spaces
  return str.replace(/\s+/g, ' ').trim();
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
