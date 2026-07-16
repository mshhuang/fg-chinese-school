import { supabase } from './supabase';

export async function logSystemEvent(
  type: 'error' | 'warning' | 'info' | 'success',
  message: string,
  details?: any,
  path?: string
) {
  // Allow logging for page visits, critical errors, and password reminders
  const isPageVisit = type === 'info' && message.startsWith('Visited page:');
  const isCriticalError = type === 'error';
  const isPasswordReminder = message.toLowerCase().includes('password reminder');
  const isLogin = message === 'Logged into the system' || message.includes('login') || message.includes('Login');

  if (!isPageVisit && !isCriticalError && !isPasswordReminder && !isLogin) {
    return;
  }

  try {
    const userStr = localStorage.getItem('user');
    let user: any = {};
    if (userStr) {
      try {
        user = JSON.parse(userStr) || {};
      } catch (e) {}
    }
    const u_id = user?.id && user?.id !== 'demo' && user?.id !== 'builder_secret' ? user.id : null;
    
    let activityText = `[${type.toUpperCase()}] ${message}`;
    if (isPageVisit) {
      activityText = message;
    }
    
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const defaultName = user.user_name || user.email || 'System';
    const finalUserName = user?.id ? (fullName || defaultName) : 'System';

    const payload: any = {
       user_id: u_id, 
       user_name: finalUserName,
       user_role: user?.role || 'system',
       page_name: isPageVisit ? 'Page Visit' : 'System Event',
       path: path || window.location.pathname,
       activity: activityText,
       action_type: isPageVisit ? 'visit' : isLogin ? 'login' : 'other',
       data_changed: details ? details : null,
       browser: details?.browser || 'System Event',
       ip_address: details?.ip_address || 'System',
       device_type: details?.device_type || 'System'
    };
    
    const { error } = await supabase.from('system_logs').insert(payload);
    if (error) {
      console.warn('Failed to log system event:', error);
    }
    
  } catch (err) {
    console.warn('Error logging system event:', err);
  }
}
