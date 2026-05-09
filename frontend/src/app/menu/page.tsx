'use client';

<<<<<<< HEAD
import { useState, useEffect, Suspense } from 'react';
=======
import { useEffect, Suspense } from 'react';
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useTheme } from '@/components/theme-provider';
import { CategoryPage } from '@/components/menu/category-page';
import { GiftNotification } from '@/components/gift/gift-notification';
import { getSocket } from '@/lib/socket';
import { useTableOrderSync } from '@/hooks/use-table-order-sync';
<<<<<<< HEAD
import { TabletExitModal } from '@/components/tablet/tablet-exit-modal';
import { LogOut } from 'lucide-react';
=======
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTableData, tableId, tableCode, tableNumber } = useCartStore();
<<<<<<< HEAD
  const [showExitModal, setShowExitModal] = useState(false);
=======
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
  const { setTableId: setThemeTableId } = useTheme();

  useTableOrderSync();

<<<<<<< HEAD
  // Catch browser back button to show PIN modal
  useEffect(() => {
    const handlePopState = () => {
      // Always prevent actually going back in history
      window.history.pushState(null, '', window.location.href);
      // Trigger the exit modal
      if (tableId != null && tableId > 0) {
        setShowExitModal(true);
      }
    };

    // Push an initial state so the first "back" popstate can be caught
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [tableId]);

=======
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const lookupTable = async () => {
        try {
          const { api } = await import('@/lib/api');
<<<<<<< HEAD
          const table = await api.get<any>(`/tables/lookup/${tableParam}`);
=======
          const table = await api.get(`/tables/lookup/${tableParam}`);
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
          if (table) {
            setTableData(table.id, table.number, table.tableCode);
            setThemeTableId(table.number.toString());
            const socket = getSocket();
            socket.emit('join-table', table.id);
          }
        } catch (error) {
          console.error('Failed to lookup table:', error);
        }
      };
      lookupTable();
    }
  }, [searchParams, setTableData, setThemeTableId]);

  const handleSelectCategory = (categoryId: number) => {
    const tableParam = tableCode || tableNumber || searchParams.get('table') || '';
    router.push(`/menu/category/${categoryId}?table=${tableParam}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <CategoryPage onSelectCategory={handleSelectCategory} />
      <GiftNotification />
<<<<<<< HEAD


      {tableId != null && tableId > 0 && (
        <TabletExitModal
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          tableId={tableId}
          onSuccess={() => {
            setTableData(0, 0, '');
            window.location.href = '/options';
          }}
        />
      )}
=======
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MenuPageContent />
    </Suspense>
  );
}
