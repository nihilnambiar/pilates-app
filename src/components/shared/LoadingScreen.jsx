// src/components/shared/LoadingScreen.jsx
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-mesh flex flex-col items-center justify-center gap-6">
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 flex items-center justify-center shadow-glow">
          <span className="font-display text-white text-2xl font-semibold">S</span>
        </div>
        <h1 className="font-display text-2xl text-blush-700 tracking-wide">Vigour</h1>
      </motion.div>

      {/* Loader dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-blush-300"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
