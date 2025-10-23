import React from 'react';

interface IntroOverlayProps {
  onStart: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onStart }) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer z-30"
      style={{
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onStart}
    >
      <div className="text-center space-y-4 animate-pulse">
        <div className="text-sm tracking-widest" style={{ 
          color: 'rgba(30, 136, 229, 0.7)',
          letterSpacing: '0.35em'
        }}>
          ВОЙТИ В ПОТОК
        </div>
        <div className="text-xs tracking-widest" style={{ 
          color: 'rgba(0, 229, 204, 0.3)',
          letterSpacing: '0.2em'
        }}>
          НАЖМИТЕ, ЧТОБЫ НАЧАТЬ ПОГРУЖЕНИЕ
        </div>
      </div>
    </div>
  );
};

export default IntroOverlay;
