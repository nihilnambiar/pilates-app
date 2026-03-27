// src/components/shared/EmptyState.jsx
import { motion } from 'framer-motion';

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-blush-50 flex items-center justify-center mb-5 text-4xl">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold text-[#2d2420] mb-2">{title}</h3>
      {subtitle && (
        <p className="font-body text-sm text-[#8a7b76] mb-6 max-w-xs leading-relaxed">{subtitle}</p>
      )}
      {action}
    </motion.div>
  );
}
