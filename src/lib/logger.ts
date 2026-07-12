import { supabase } from "./supabase";

export async function logSystemActivity(
  pageName: string,
  path: string,
  activity: string,
  actionType: "login" | "create" | "read" | "update" | "delete" | "view" | "other",
  dataChanged: any = null
) {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr) || {};
    let ipAddress = 'Unknown';

    try {
       const res = await fetch('https://api.ipify.org?format=json');
       if (res.ok) {
          const data = await res.json();
          ipAddress = data.ip;
       }
    } catch (e) { }

    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    let device = "Desktop";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
       device = "Smartphone";
    } else if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
       device = "Tablet";
    } else if (ua.includes('Macintosh') || ua.includes('Windows') || ua.includes('Linux')) {
       device = "Laptop/Desktop";
    }

    const payload: any = {
       user_id: user?.id !== 'demo' && user?.id !== 'builder_secret' ? user?.id : null,
       user_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'System',
       user_role: user?.role || 'system',
       page_name: pageName,
       path: path,
       activity: activity,
       action_type: actionType,
       data_changed: dataChanged,
       browser: browser,
       ip_address: ipAddress,
       device_type: device
    };

    await supabase.from('system_logs').insert(payload);
  } catch (err) {
    console.warn("Failed to log activity:", err);
  }
}
