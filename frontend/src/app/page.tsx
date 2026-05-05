'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 p-8"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <h1 className="text-6xl font-bold text-gradient mb-4">QR Menu</h1>
          <p className="text-xl text-muted-foreground">
            Modern Restaurant Ordering System
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/menu?table=1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 gradient-primary rounded-2xl text-white font-semibold text-lg shadow-lg shadow-purple-500/25"
            >
              View Menu
            </motion.button>
          </Link>
          <Link href="/admin/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass rounded-2xl font-semibold text-lg"
            >
              Admin Panel
            </motion.button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Scan a QR code on your table to start ordering
        </p>
      </motion.div>
    </div>
  );
}
