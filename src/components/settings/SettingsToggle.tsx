import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useIsMobile } from '../../hooks/useMediaQuery';

const SettingsToggle: React.FC = () => {
  const openPanel = useSettingsStore((state) => state.openPanel);
  const isPanelOpen = useSettingsStore((state) => state.isPanelOpen);
  const isMobile = useIsMobile();
  
  // Скрываем кнопку если панель открыта или на мобилке
  if (isPanelOpen || isMobile) {
    return null;
  }
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={openPanel}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.1), rgba(30, 136, 229, 0.1))',
        border: '1px solid rgba(0, 229, 204, 0.3)',
        boxShadow: '0 4px 24px rgba(0, 229, 204, 0.2)'
      }}
    >
      <span className="text-xl">⚙️</span>
    </motion.button>
  );
};

export default SettingsToggle;
