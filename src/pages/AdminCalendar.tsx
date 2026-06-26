import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, Clock, MapPin, Loader2, Info, Edit } from "lucide-react";
import { cn } from "../lib/utils";
import { SchoolEvent, fetchSchoolEvents, createSchoolEvent, deleteSchoolEvent, updateSchoolEvent } from "../lib/events";
import { format, parseISO, parse } from "date-fns";
import { EventCalendar } from "../components/EventCalendar";

export default function AdminCalendar() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Academic");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchSchoolEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const eventData = {
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      location,
      type
    };

    if (editingEventId) {
      await updateSchoolEvent(editingEventId, eventData);
    } else {
      await createSchoolEvent(eventData);
    }
    
    setSaving(false);
    setShowAddModal(false);
    setEditingEventId(null);
    // Reset form
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setType("Academic");
    loadEvents();
    setRefreshKey(prev => prev + 1);
  };

  const openAddModal = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setType("Academic");
    setShowAddModal(true);
  };

  const openEditModal = (event: SchoolEvent) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setDate(event.date);
    setStartTime(event.start_time);
    setEndTime(event.end_time);
    setLocation(event.location || "");
    setType(event.type);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSchoolEvent(id);
    loadEvents();
    setRefreshKey(prev => prev + 1);
  };

  const typeColors: Record<string, string> = {
    Academic: "bg-blue-100 text-blue-700 border-blue-200",
    Holiday: "bg-red-100 text-red-700 border-red-200",
    Staff: "bg-purple-100 text-purple-700 border-purple-200",
    Volunteer: "bg-orange-100 text-orange-700 border-orange-200",
    Extracurricular: "bg-green-100 text-green-700 border-green-200",
    School: "bg-primary-container text-on-primary-container border-primary/20",
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 pb-32 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl text-primary font-bold tracking-tight">School Calendar</h1>
          <p className="font-body text-lg text-on-surface-variant mt-2">Manage events across all roles.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-sm hover:bg-primary/90 hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </header>

      {/* Event Calendar View */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-6 md:p-8 shadow-sm">
        <EventCalendar key={refreshKey} />
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">Manage Events</h2>
        {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
           <CalendarIcon className="w-12 h-12 text-on-surface-variant/50 mx-auto mb-4" />
           <h3 className="font-title text-xl font-bold text-on-surface">No events found</h3>
           <p className="font-body text-on-surface-variant mt-2">Get started by adding your first event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 flex flex-col hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-label font-bold border w-fit", typeColors[event.type] || typeColors.School)}>
                    {event.type}
                  </span>
                  <h3 className="font-title text-xl font-bold text-on-surface">{event.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(event)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-2 text-sm text-on-surface-variant font-body">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span>{event.date ? format(parse(event.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy') : 'Unknown Date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span>{event.start_time} - {event.end_time}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-tertiary" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.description && (
                  <p className="mt-2 text-on-surface bg-surface-variant/30 p-3 rounded-xl">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-display text-2xl font-bold text-on-surface">{editingEventId ? 'Edit Event' : 'Add Event'}</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
              >
                <Trash2 className="w-5 h-5 text-transparent" /> {/* Spacer */}
                <div className="absolute"><Plus className="w-6 h-6 rotate-45 text-on-surface-variant" /></div>
              </button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface">Event Title *</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-container-lowest font-body"
                  placeholder="e.g. Science Fair"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface">Event Type *</label>
                <select 
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none bg-surface-container-lowest font-body"
                >
                  <option value="Academic">Academic</option>
                  <option value="School">School-wide</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Staff">Staff Only</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Extracurricular">Extracurricular</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-label text-sm font-bold text-on-surface">Date *</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none bg-surface-container-lowest font-body"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-sm font-bold text-on-surface">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none bg-surface-container-lowest font-body"
                    placeholder="e.g. Main Hall"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-label text-sm font-bold text-on-surface">Start Time *</label>
                  <input 
                    type="time" 
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none bg-surface-container-lowest font-body"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-sm font-bold text-on-surface">End Time *</label>
                  <input 
                    type="time" 
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none bg-surface-container-lowest font-body"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-sm font-bold text-on-surface">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none bg-surface-container-lowest font-body min-h-[100px] resize-none"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-4 pt-4 mt-2 border-t border-outline-variant/20">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-label font-bold border border-outline-variant/50 text-on-surface hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl font-label font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
