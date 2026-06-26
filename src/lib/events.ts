import { supabase } from './supabase';

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  created_at?: string;
  created_by?: string;
}

export const fetchSchoolEvents = async (): Promise<SchoolEvent[]> => {
  const { data, error } = await supabase.from('school_events').select('*').order('date', { ascending: true }).order('start_time', { ascending: true });
  
  let events: SchoolEvent[] = [];
  if (data) {
    events = [...data] as SchoolEvent[];
  }
  
  // Merge local storage events just in case some inserts failed and were only saved locally
  const local = localStorage.getItem('school_events');
  if (local) {
    try {
      const localEvents: SchoolEvent[] = JSON.parse(local);
      for (const le of localEvents) {
        if (!events.some(e => e.id === le.id)) {
          events.push(le);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  // Re-sort just in case local storage events were added
  events.sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const timeA = a.start_time || '';
    const timeB = b.start_time || '';
    return timeA.localeCompare(timeB);
  });
  
  return events;
};

export const createSchoolEvent = async (event: Omit<SchoolEvent, 'id' | 'created_at'>): Promise<SchoolEvent> => {
  const newEvent = {
    ...event,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('school_events').insert(newEvent).select().single();
  
  if (error) {
    // Fallback to local storage
    const local = localStorage.getItem('school_events');
    const events: SchoolEvent[] = local ? JSON.parse(local) : [];
    events.push(newEvent);
    localStorage.setItem('school_events', JSON.stringify(events));
    return newEvent;
  }
  return data as SchoolEvent;
};

export const updateSchoolEvent = async (id: string, updates: Partial<SchoolEvent>): Promise<SchoolEvent> => {
  const { data, error } = await supabase.from('school_events').update(updates).eq('id', id).select().single();
  
  if (error) {
    // Fallback to local storage
    const local = localStorage.getItem('school_events');
    if (local) {
      const events: SchoolEvent[] = JSON.parse(local);
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        events[index] = { ...events[index], ...updates };
        localStorage.setItem('school_events', JSON.stringify(events));
        return events[index];
      }
    }
    throw new Error('Event not found');
  }
  return data as SchoolEvent;
};

export const deleteSchoolEvent = async (id: string) => {
  await supabase.from('school_events').delete().eq('id', id);
  
  // Always try to delete from local storage as well to prevent sync issues
  const local = localStorage.getItem('school_events');
  if (local) {
    const events: SchoolEvent[] = JSON.parse(local);
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem('school_events', JSON.stringify(filtered));
  }
};
