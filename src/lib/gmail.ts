import { getAccessToken } from './auth';

export const fetchGmailMessages = async () => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await res.json();
  if (!data.messages) return [];

  // Fetch details for each message
  const messagesDetail = await Promise.all(
    data.messages.map(async (msg: any) => {
      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return detailRes.json();
    })
  );

  return messagesDetail.map(processMessageData);
};

export const sendGmailMessage = async (to: string, subject: string, body: string) => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const emailLines = [];
  emailLines.push(`To: ${to}`);
  emailLines.push('Content-type: text/html;charset=utf-8');
  emailLines.push('MIME-Version: 1.0');
  emailLines.push(`Subject: =?utf-8?B?${btoa(encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))))}?=`);
  emailLines.push('');
  emailLines.push(body);

  const email = emailLines.join('\r\n').trim();
  
  // Safe btoa
  // Using btoa, we need to map over unescaped chars
  let encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedEmail
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to send email');
  }

  return res.json();
};

const processMessageData = (message: any) => {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('Subject');
  const from = getHeader('From');
  const date = getHeader('Date');
  const to = getHeader('To');

  let body = '';
  if (message.payload?.parts) {
    const htmlPart = message.payload.parts.find((p: any) => p.mimeType === 'text/html');
    const textPart = message.payload.parts.find((p: any) => p.mimeType === 'text/plain');
    const part = htmlPart || textPart || message.payload.parts[0];
    
    if (part?.body?.data) {
       body = decodeBase64Url(part.body.data);
    } else if (part?.parts) { // sometimes nested multipart
       const nestedHtml = part.parts.find((p: any) => p.mimeType === 'text/html');
       const nestedText = part.parts.find((p: any) => p.mimeType === 'text/plain');
       const nestedPart = nestedHtml || nestedText;
       if (nestedPart?.body?.data) {
         body = decodeBase64Url(nestedPart.body.data);
       }
    }
  } else if (message.payload?.body?.data) {
    body = decodeBase64Url(message.payload.body.data);
  }

  // If we only found plain text, replace newlines with <br> for dangerouslySetInnerHTML
  if (body && !/<[a-z][\s\S]*>/i.test(body)) {
     body = body.replace(/\n/g, '<br/>');
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date,
    snippet: message.snippet,
    body,
    unread: message.labelIds?.includes('UNREAD')
  };
};

const decodeBase64Url = (base64Url: string) => {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    return atob(base64);
  }
};
