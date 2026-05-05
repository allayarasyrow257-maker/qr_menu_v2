'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useTheme } from '@/components/theme-provider';
import { CategoryPage } from '@/components/menu/category-page';
import { GiftNotification } from '@/components/gift/gift-notification';
import { getSocket } from '@/lib/socket';
import { useTableOrderSync } from '@/hooks/use-table-order-sync';

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTableData, tableId, tableCode, tableNumber } = useCartStore();
  const { setTableId: setThemeTableId } = useTheme();

  useTableOrderSync();

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const lookupTable = async () => {
        try {
          const { api } = await import('@/lib/api');
          const table = await api.get(`/tables/lookup/${tableParam}`);
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
