// src/components/shared/Modal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className={`bg-white rounded-4xl shadow-2xl w-full ${maxWidth} overflow-hidden`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4">
            <h2 className="font-display text-xl font-semibold text-[#2d2420]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76] hover:text-blush-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Confirmation variant
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="font-body text-[#8a7b76] mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={danger ? 'btn-danger' : 'btn-primary'}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
