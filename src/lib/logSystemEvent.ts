import { supabase } from './supabase';

export async function logSystemEvent(
  type: 'error' | 'warning' | 'info' | 'success',
  message: string,
  details?: any,
  path?: string
) {
  // Disabled recording into system_logs table as requested
  return;
  try {
    const userStr = localStorage.getItem('user');
    let user: any = {};
    if (userStr) {
      try {
        user = JSON.parse(userStr) || {};
      } catch (e) {}
    }

    const u_id = user?.id && user?.id !== 'demo' && user?.id !== 'builder_secret' ? user.id : null;
    
    const payload: any = { 
       user_id: u_id,
       user_name: user?.id ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'System',
       user_role: user?.role || 'system',
       page_name: 'System Event',
       path: path || window.location.pathname,
       activity: `[${type.toUpperCase()}] ${message}`,
       action_type: 'other',
       data_changed: details ? details : null,
       browser: 'System Event',
       ip_address: 'System',
       device_type: 'System'
    };

    const { error } = await supabase.from('system_logs').insert(payload);
    if (error) {
      console.warn('Failed to log system event:', error);
    }
  } catch (err) {
    console.warn('Error logging system event:', err);
  }
}
