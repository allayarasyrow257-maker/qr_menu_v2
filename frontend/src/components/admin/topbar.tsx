import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, X, Sun, Moon, Languages, ChevronDown, Check } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useTheme } from '@/components/theme-provider';
import { useCartStore } from '@/store/cart-store';

const LANGUAGES = [
  { code: "tk", label: "Turkmen", flag: "🇹🇲" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
];

interface Notification {
  id: string;
  type: 'order' | 'waiter' | 'gift';
  message: string;
  timestamp: string;
}

interface TopbarProps {
  onMenuToggle: () => void;
}

export function AdminTopbar({ onMenuToggle }: TopbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useCartStore();
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLanguages(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join-admin');

    socket.on('order-received', (order: any) => {
      const notif: Notification = {
        id: `order-${Date.now()}`,
        type: 'order',
        message: `New order from Table ${order.table?.number || order.tableId}`,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    });

    socket.on('waiter-called', (data: any) => {
      const notif: Notification = {
        id: `waiter-${Date.now()}`,
        type: 'waiter',
        message: `Table ${data.tableNumber} is calling a waiter!`,
        timestamp: data.timestamp,
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    });

    socket.on('gift-sent', (gift: any) => {
      const notif: Notification = {
        id: `gift-${Date.now()}`,
        type: 'gift',
        message: `Gift sent from Table ${gift.senderTable?.number} to Table ${gift.receiverTable?.number}`,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    });

    return () => {
      socket.off('order-received');
      socket.off('waiter-called');
      socket.off('gift-sent');
    };
  }, []);

  const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[1];

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
        >
          <Menu size={20} className="text-zinc-600 dark:text-zinc-400" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
            >
              <span className="text-base leading-none">{activeLang.flag}</span>
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{activeLang.code}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showLanguages ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden"
                >
                  <div className="p-1.5 space-y-0.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setShowLanguages(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          language === lang.code
                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base leading-none">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </div>
                        {language === lang.code && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all border border-transparent ${
                showNotifications 
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20' 
                  : 'bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-black/5 dark:hover:border-white/5'
              }`}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold border-2 border-white dark:border-zinc-950"
                >
                  {notifications.length > 9 ? '9+' : notifications.length}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden"
                >
                  <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-sm dark:text-white">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto p-3 space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="text-zinc-300 dark:text-zinc-700" />
                        </div>
                        <p className="text-xs text-zinc-400">
                          Everything's quiet right now
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-xl text-[13px] border ${
                              notif.type === 'order'
                                ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100/50 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                                : notif.type === 'waiter'
                                ? 'bg-orange-50/50 dark:bg-orange-500/10 border-orange-100/50 dark:border-orange-500/20 text-orange-800 dark:text-orange-400'
                                : 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-400'
                            }`}
                          >
                            <p className="font-bold mb-0.5">{notif.message}</p>
                            <p className="text-[10px] opacity-60">
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
