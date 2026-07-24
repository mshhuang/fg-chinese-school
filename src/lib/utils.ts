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
  let fName = (firstName || '').trim();
  let lName = (lastName || '').trim();

  if (!fName && !lName) return defaultRole;

  if (fName && !lName && fName.includes(' ')) {
    const parts = fName.split(' ');
    fName = parts[0];
    lName = parts.slice(1).join(' ');
  }

  if ((fName === 'Youlin' && lName === 'Venerable') || fName.includes('法師') || lName.includes('法師')) {
    return '有霖法師';
  }

  const fnLower = fName.toLowerCase();
  const lnLower = lName.toLowerCase();

  if (fnLower === 'derek') return 'Mr. Derek';
  if (fnLower === 'janice') return 'Ms. Janice';
  if (fnLower === 'vickie') return 'Ms. Vickie';
  if (fnLower === 'kayvan') return 'Mr. Kayvan';
  if (lnLower === 'li' || fnLower === 'li') return 'Mr. Li';

  if (fName.startsWith('Ms.') || fName.startsWith('Mr.') || fName.startsWith('Mrs.') || fName.startsWith('Dr.')) {
    return [fName, lName].filter(Boolean).join(' ');
  }

  if (lName && lName.length > 1) {
    return `Mr./Ms. ${lName}`;
  }

  return `Ms. ${fName || lName || defaultRole}`;
}
