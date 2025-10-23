import { useEffect, useRef } from 'react';

interface UseEventHandlersProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onStart: () => void;
  onAccelerationStart: () => void;
  onAccelerationEnd: () => void;
  onToggleUI: () => void;
  gameRef: React.MutableRefObject<any>;
}

export const useEventHandlers = ({
  containerRef,
  onStart,
  onAccelerationStart,
  onAccelerationEnd,
  onToggleUI,
  gameRef
}: UseEventHandlersProps) => {
  const touchStartTimeRef = useRef(0);
  const longPressTimerRef = useRef<number | null>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Обработчик движения мыши
    const handleMouseMove = (e: MouseEvent) => {
      gameRef.current.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      gameRef.current.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Обработчик изменения размера окна
    const handleResize = () => {
      if (gameRef.current.camera && gameRef.current.renderer) {
        gameRef.current.camera.aspect = window.innerWidth / window.innerHeight;
        gameRef.current.camera.updateProjectionMatrix();
        gameRef.current.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    // Обработчики старта
    const handleStart = (e: Event) => {
      e.preventDefault();
      onStart();
    };

    // Обработчики клавиатуры
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        onAccelerationStart();
      }
      if (event.key === 'o' || event.key === 'O') {
        onToggleUI();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        onAccelerationEnd();
      }
    };

    // Обработчики мыши
    const handleMouseDown = () => {
      onAccelerationStart();
    };

    const handleMouseUp = () => {
      onAccelerationEnd();
    };

    // Мобильные обработчики
    const handleTouchStart = (e: TouchEvent) => {
      touchStartTimeRef.current = Date.now();
      
      // Тройной тап для UI (в правом верхнем углу)
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && e.touches[0]) {
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        const isInCorner = touchX > rect.width - 80 && touchY < 80;
        
        if (isInCorner) {
          tapCountRef.current++;
          if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
          
          tapTimerRef.current = setTimeout(() => {
            if (tapCountRef.current >= 3) {
              onToggleUI();
            }
            tapCountRef.current = 0;
          }, 1000);
        }
      }
      
      // Долгий тап для ускорения
      longPressTimerRef.current = setTimeout(() => {
        onAccelerationStart();
      }, 300);
    };

    const handleTouchEnd = () => {
      const touchDuration = Date.now() - touchStartTimeRef.current;
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      
      // Если был долгий тап, останавливаем ускорение
      if (touchDuration > 300) {
        onAccelerationEnd();
      }
    };

    // Добавляем обработчики
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleStart);
    window.addEventListener('click', handleStart);
    window.addEventListener('touchstart', handleStart);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    // Очистка
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleStart);
      window.removeEventListener('click', handleStart);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, [containerRef, onStart, onAccelerationStart, onAccelerationEnd, onToggleUI, gameRef]);
};
