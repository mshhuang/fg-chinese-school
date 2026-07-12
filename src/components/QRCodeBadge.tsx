import React from 'react';
import QRCode from 'react-qr-code';
import { X } from 'lucide-react';

interface QRCodeBadgeProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

export function QRCodeBadge({ studentId, studentName, onClose }: QRCodeBadgeProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-surface-container-low">
          <h3 className="font-title text-xl font-bold text-on-surface">Student ID Badge</h3>
          <button onClick={onClose} className="p-2 bg-surface-variant hover:bg-outline-variant/30 rounded-full text-on-surface-variant transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 flex flex-col items-center justify-center gap-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <QRCode value={studentId} size={200} />
          </div>
          <div className="text-center">
            <h4 className="font-display text-2xl font-bold text-on-surface">{studentName}</h4>
            <p className="font-label text-sm text-on-surface-variant tracking-widest uppercase mt-1">Scan at entrance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodeBadge;
