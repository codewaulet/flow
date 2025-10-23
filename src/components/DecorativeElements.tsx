import React from 'react';

interface DecorativeElementsProps {
  showIntro: boolean;
}

const DecorativeElements: React.FC<DecorativeElementsProps> = ({ showIntro }) => {
  return (
    <>
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2,8,24,0.5) 70%, rgba(2,8,24,0.9) 100%)'
        }} 
      />
      
      {/* Ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[3000ms]"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(30,136,229,0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0,229,204,0.1) 0%, transparent 40%)
          `,
          opacity: 0.5
        }} 
      />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30,136,229,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,204,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center bottom'
        }} 
      />
      
      {/* Mobile hint */}
      {!showIntro && (
        <div className="absolute bottom-4 left-4 text-xs sm:hidden" style={{ 
          color: 'rgba(30, 136, 229, 0.4)',
          display: window.innerWidth < 640 ? 'block' : 'none'
        }}>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div className="text-center">
              <div className="text-lg mb-1">👆</div>
              <div>Тапните для управления</div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop hint */}
      {!showIntro && (
        <div className="absolute bottom-4 left-4 text-xs hidden sm:block" style={{ 
          color: 'rgba(30, 136, 229, 0.4)'
        }}>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div>Нажмите <kbd className="bg-white/20 px-1 rounded">O</kbd> для управления</div>
          </div>
        </div>
      )}
    </>
  );
};

export default DecorativeElements;
