import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Save, Plus, X, Loader2 } from 'lucide-react';

export interface ExistingClockRecord {
  id?: string | number;
  user_id?: string;
  student_id?: string;
  action_type: string;
  created_at: string;
  daily_status?: string;
}

interface DuplicateClockWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  actionType: string; // 'clock_in' | 'clock_out' | 'school_check_in' | 'school_check_out'
  existingRecord: ExistingClockRecord | null;
  onUpdateExisting: (recordId: string | number | undefined, newTimeIso: string, newReason?: string) => Promise<void>;
  onCreateNew?: (newTimeIso: string, newReason?: string) => Promise<void>;
}

export const DuplicateClockWarningModal: React.FC<DuplicateClockWarningModalProps> = ({
  isOpen,
  onClose,
  userName,
  actionType,
  existingRecord,
  onUpdateExisting,
  onCreateNew
}) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const dateToUse = existingRecord?.created_at ? new Date(existingRecord.created_at) : new Date();
      const hh = dateToUse.getHours().toString().padStart(2, '0');
      const mm = dateToUse.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hh}:${mm}`);
      setReason(existingRecord?.daily_status || '');
      setLoading(false);
    }
  }, [isOpen, existingRecord]);

  if (!isOpen) return null;

  const isCheckIn = actionType === 'clock_in' || actionType === 'school_check_in';
  const actionLabel = isCheckIn ? 'Clock In' : 'Clock Out';

  const formatExistingTime = (isoString?: string) => {
    if (!isoString) return 'earlier today';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return 'earlier today';
    }
  };

  const getIsoFromSelectedTime = () => {
    const base = existingRecord?.created_at ? new Date(existingRecord.created_at) : new Date();
    if (!selectedTime) return base.toISOString();
    const [hh, mm] = selectedTime.split(':').map(Number);
    base.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
    return base.toISOString();
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdateExisting(existingRecord?.id, getIsoFromSelectedTime(), reason);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!onCreateNew) return;
    setLoading(true);
    try {
      await onCreateNew(getIsoFromSelectedTime(), reason);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 dark:border-amber-900/50 flex flex-col gap-5 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              Duplicate {actionLabel} Warning
            </h3>
            <p className="text-xs text-on-surface-variant">
              A record already exists for today
            </p>
          </div>
        </div>

        {/* Body Description */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 text-sm text-amber-900 dark:text-amber-200 flex flex-col gap-1">
          <p className="font-semibold">
            {userName} was already {actionLabel.toLowerCase()}ned at {formatExistingTime(existingRecord?.created_at)}.
          </p>
          <p className="text-xs opacity-90">
            Would you like to change/update the {actionLabel.toLowerCase()} time for this record, or create a new entry?
          </p>
        </div>

        {/* Time Input Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Adjust {actionLabel} Time:
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl border border-outline bg-surface text-on-surface font-mono font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Reason / Note Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-on-surface-variant">
            Note / Reason (optional):
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Corrected time, manual clock in adjustment"
            disabled={loading}
            className="w-full px-3.5 py-2 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Existing {actionLabel} Time
          </button>

          {onCreateNew && (
            <button
              onClick={handleCreateNew}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-2xl border border-outline text-on-surface font-semibold text-sm hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Separate Entry Instead
            </button>
          )}

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors text-center"
          >
            Keep Existing Record & Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
