import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import QuickSettings from './QuickSettings';
import ModeSelector from './ModeSelector';
import SoundControl from './SoundControl';
import SpeedControl from './SpeedControl';

const SettingsPanel: React.FC = () => {
  const isPanelOpen = useSettingsStore((state) => state.isPanelOpen);
  const closePanel = useSettingsStore((state) => state.closePanel);
  const isMobile = useIsMobile();

  const tabs = [
    {
      id: 'visual',
      label: 'Визуал',
      icon: '🎨',
      content: <ModeSelector />
    },
    {
      id: 'audio',
      label: 'Аудио',
      icon: '🎵',
      content: <SoundControl />
    },
    {
      id: 'performance',
      label: 'Производительность',
      icon: '⚡',
      content: <SpeedControl />
    }
  ];

  return (
    <Dialog open={isPanelOpen} onOpenChange={closePanel}>
      <DialogContent 
        className={`
          ${isMobile 
            ? 'bottom-0 left-0 right-0 top-auto h-[85vh] rounded-t-3xl max-w-none' 
            : 'right-0 top-0 bottom-0 left-auto w-96 h-full rounded-l-3xl'
          }
          border-glass-strong bg-glass-medium backdrop-blur-xl
        `}
        style={{
          background: isMobile 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          boxShadow: isMobile 
            ? '0 -20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <DialogHeader className="pb-4 border-b border-glass-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-text-primary">
                  Настройки
                </DialogTitle>
                <p className="text-sm text-text-secondary">
                  Персонализируйте свой опыт
                </p>
              </div>
            </div>
            <Badge variant="glass" className="text-xs">
              Flow v2.0
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Быстрые настройки */}
          <Card variant="glass" className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">⚡</span>
                Быстрые настройки
              </CardTitle>
              <CardDescription>
                Основные параметры для быстрого доступа
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <QuickSettings />
            </CardContent>
          </Card>

          {/* Табы с настройками */}
          <Tabs defaultValue="visual" className="h-full flex flex-col">
            <TabsList className={`grid w-full grid-cols-3 mb-4 ${isMobile ? 'h-12' : ''}`}>
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className={`flex items-center gap-2 ${isMobile ? 'text-sm px-3' : 'text-xs'}`}
                >
                  <span className={isMobile ? 'text-lg' : ''}>{tab.icon}</span>
                  <span className={isMobile ? 'inline' : 'hidden sm:inline'}>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {tabs.map((tab) => (
                <TabsContent 
                  key={tab.id} 
                  value={tab.id}
                  className="mt-0 h-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {tab.content}
                  </motion.div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;