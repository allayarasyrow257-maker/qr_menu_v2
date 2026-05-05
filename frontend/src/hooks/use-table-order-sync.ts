import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { getSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function useTableOrderSync() {
  const {
    tableId,
    sessionId,
    setOrderedItemsFromBackend,
    markBillClosed,
    acknowledgeClosedBill,
    billClosedAt,
  } = useCartStore();

  useEffect(() => {
    if (!tableId) return;

    const fetchOrders = async () => {
      try {
        const orders = await api.get<any[]>(`/orders/table/${tableId}`);

        // If we still believe a bill is closed but the backend reports active
        // orders (i.e. a new customer group has placed an order on this table),
        // silently dismiss the closed-bill banner so the next group starts fresh.
        if (billClosedAt && Array.isArray(orders) && orders.length > 0) {
          acknowledgeClosedBill();
        }

        // Only sync orders from OTHER sessions to avoid replacing our local
        // combo display with individual backend products from our own order
        const otherSessionOrders = orders.filter(
          (o: any) => o.sessionId !== sessionId
        );

        const fetchedItems: any[] = [];
        otherSessionOrders.forEach((order: any) => {
          order.items.forEach((item: any) => {
            const isCombo = !!item.combo;
            const itemData = isCombo ? item.combo : item.product;

            fetchedItems.push({
              productId: item.productId,
              comboId: item.comboId,
              isCombo: isCombo,
              name: itemData.name,
              price: parseFloat(item.price),
              quantity: item.quantity,
              image: itemData.image,
              notes: item.notes,
              isGift: item.isGift,
              status: 'ordered',
            });
          });
        });

        setOrderedItemsFromBackend(fetchedItems);
      } catch (error) {
        console.error('Failed to fetch table orders:', error);
      }
    };

    // Initial fetch on mount
    fetchOrders();

    const socket = getSocket();

    // Listen for new orders from other devices
    socket.on('table-order-updated', fetchOrders);

    // Listen for bill closure — show the closed-bill banner instead of
    // silently wiping the cart. The customer sees a clear "closed at" notice
    // and acknowledges it before the cart resets.
    socket.on('bill-closed', () => {
      const ts = new Date().toISOString();
      markBillClosed(ts);
      const lang = useCartStore.getState().language;
      const msg =
        lang === 'tk' ? 'Hasap ýapyldy. Sag boluň!' :
        lang === 'ru' ? 'Счёт закрыт. Спасибо!' :
        lang === 'tr' ? 'Hesap kapatildi. Tesekkurler!' :
        'Bill closed. Thank you!';
      toast.success(msg, { icon: '🧾', duration: 6000 });
    });

    return () => {
      socket.off('table-order-updated', fetchOrders);
      socket.off('bill-closed');
    };
  }, [tableId, sessionId, setOrderedItemsFromBackend, markBillClosed, acknowledgeClosedBill, billClosedAt]);
}
