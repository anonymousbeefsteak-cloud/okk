import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, OrderItem } from './types';
import { menuItems, WEB_APP_URL, SHOP_LINE_ID } from './constants';

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

// --- Helper Components ---

const Notification: React.FC<NotificationState> = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed top-5 right-5 p-4 rounded-lg text-white font-bold shadow-lg transition-transform transform translate-x-0 ${bgColor} z-50 whitespace-pre-line`}>
      {message}
    </div>
  );
};

const CartItemRow: React.FC<{ item: OrderItem; onUpdateQuantity: (id: number, delta: number) => void; onRemove: (id: number) => void; }> = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
    <div>
      <p className="font-bold text-gray-800">{item.image} {item.name}</p>
      <p className="text-sm text-gray-500">${item.price} x {item.quantity} = ${item.price * item.quantity}</p>
    </div>
    <div className="flex items-center gap-2">
      <button aria-label={`減少 ${item.name} 數量`} onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center hover:bg-blue-600 transition-transform transform hover:scale-110">-</button>
      <span className="w-8 text-center font-semibold">{item.quantity}</span>
      <button aria-label={`增加 ${item.name} 數量`} onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center hover:bg-blue-600 transition-transform transform hover:scale-110">+</button>
      <button aria-label={`從購物車移除 ${item.name}`} onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-md bg-red-500 text-white font-bold flex items-center justify-center hover:bg-red-600 transition-transform transform hover:scale-110">×</button>
    </div>
  </div>
);

// --- Main Order Component ---

export default function Order() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLineId, setCustomerLineId] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);


  const setDefaultDateTime = useCallback(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    const formatted = localDate.toISOString().slice(0, 16);
    setPickupTime(formatted);
  }, []);

  useEffect(() => {
    setDefaultDateTime();
  }, [setDefaultDateTime]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleAddItem = (menuItem: MenuItem) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...menuItem, quantity: 1 }];
      }
    });
    showNotification(`已添加 ${menuItem.name}`, 'success');
  };

  const handleMenuSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      return;
    }

    const menuItem = menuItems.find(item => item.id === parseInt(selectedId, 10));
    if (menuItem) {
      handleAddItem(menuItem);
    }
    
    // Reset the select element to the placeholder for the next selection
    setSelectedMenuItemId('');
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setOrderItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.id === itemId);
      if (!itemToUpdate) return prevItems;
      
      const newQuantity = itemToUpdate.quantity + delta;
      
      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== itemId);
      } else {
        return prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
      }
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(SHOP_LINE_ID).then(() => {
      setIsCopied(true);
      showNotification('LINE ID 已複製！', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }, (err) => {
      showNotification('複製失敗', 'error');
      console.error('Could not copy text: ', err);
    });
  };
  
  const totalAmount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [orderItems]);

  const resetForm = useCallback(() => {
    setOrderItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerLineId('');
    setOrderNotes('');
    setDefaultDateTime();
  }, [setDefaultDateTime]);

  const handleSubmit = async () => {
    if (!customerName) return showNotification('請輸入顧客姓名', 'error');
    if (!/^[0-9]{10}$/.test(customerPhone)) return showNotification('請輸入有效的手機號碼', 'error');
    if (!pickupTime) return showNotification('請選擇取餐時間', 'error');
    if (orderItems.length === 0) return showNotification('請選擇至少一樣餐點', 'error');

    const orderData = {
      customerName,
      customerPhone,
      customerLineId,
      pickupTime,
      notes: orderNotes,
      items: orderItems.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      totalAmount,
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);

    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(orderData),
        mode: 'no-cors', // Google Apps Script often requires this to avoid CORS issues if not configured for it
      });

      // With no-cors, we can't read the response. We'll assume success like the original script.
      setTimeout(() => {
        setIsLoading(false);
        const notificationMessage = `✅ 訂單已送出！\n取餐時間: ${new Date(orderData.pickupTime).toLocaleString('zh-TW')}\n總金額: $${orderData.totalAmount}`;
        showNotification(notificationMessage, 'success');
        resetForm();
      }, 2000); // Simulate network delay and processing time

    } catch (error) {
      console.error('Order submission error:', error);
      setIsLoading(false);
      showNotification('訂單送出失敗，請稍後再試。', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex justify-center items-center p-4 font-sans">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden my-8 animate-fadeIn">
        <header className="bg-gradient-to-br from-red-500 to-orange-500 text-white p-8 text-center shadow-lg">
          <h1 className="text-4xl font-bold mb-2">🍜 台灣小吃店</h1>
          <p className="text-lg opacity-90">線上訂餐系統 • 快速方便</p>
        </header>

        <main className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-lg">💬 透過 Line 接收訂單確認</h3>
            <div className="text-sm">
                <p className="font-semibold mb-2">1. 請先將我們的官方帳號加為好友：</p>
                <div className="flex items-center gap-2">
                    <span className="font-bold bg-blue-200 text-blue-900 px-3 py-1.5 rounded-md">{SHOP_LINE_ID}</span>
                    <button onClick={handleCopyToClipboard} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-md hover:bg-blue-600 transition-all flex items-center gap-1">
                        {isCopied ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            已複製
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H4z" /></svg>
                            複製
                          </>
                        )}
                    </button>
                </div>
            </div>
            <p className="text-sm">2. 我們必須在您成為好友後，才能發送訂單通知給您。</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block mb-1 font-semibold text-gray-700">顧客姓名 <span className="text-red-500">*</span></label>
              <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="請輸入您的姓名" />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block mb-1 font-semibold text-gray-700">聯絡電話 <span className="text-red-500">*</span></label>
              <input type="tel" id="customerPhone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="請輸入您的手機號碼" />
            </div>
            <div>
              <label htmlFor="customerLineId" className="flex items-center mb-1 font-semibold text-gray-700">
                  Line User ID (選填)
                  <div className="group relative ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-pointer" viewBox="0 0 20 20" fill="currentColor" tabIndex={0} role="button" aria-describedby="tooltip-lineid">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div id="tooltip-lineid" role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                          這是用於接收自動通知的內部ID (通常以 'U' 開頭)，不是您用來被搜尋的LINE ID。如果您不確定，可以將此欄位留空。
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                  </div>
              </label>
              <input type="text" id="customerLineId" value={customerLineId} onChange={e => setCustomerLineId(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="若想收到自動通知，請填寫 User ID" />
            </div>
            <div>
              <label htmlFor="pickupTime" className="block mb-1 font-semibold text-gray-700">取餐時間 <span className="text-red-500">*</span></label>
              <input type="datetime-local" id="pickupTime" value={pickupTime} onChange={e => setPickupTime(e.target.value)} min={pickupTime} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">🍽️ 菜單選擇</h3>
              <div>
                  <label htmlFor="menuSelect" className="block mb-2 font-semibold text-gray-700">選擇餐點 (將直接加入購物車)</label>
                  <select
                      id="menuSelect"
                      value={selectedMenuItemId}
                      onChange={handleMenuSelectChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                      <option value="">請選擇餐點...</option>
                      {menuItems.map(item => (
                          <option key={item.id} value={item.id}>
                              {item.image} {item.name} - ${item.price}
                          </option>
                      ))}
                  </select>
              </div>
          </div>
            
          <div className="bg-white p-4 rounded-lg shadow-inner border">
            <h4 className="font-bold text-gray-700 mb-2 text-lg">🛒 您的購物車</h4>
            {orderItems.length > 0 ? (
              <div className="space-y-2">
                {orderItems.map(item => (
                  <CartItemRow key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveItem} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 italic py-4">您的購物車是空的</p>
            )}
          </div>

          <div>
            <label htmlFor="orderNotes" className="block mb-1 font-semibold text-gray-700">訂單備註</label>
            <textarea id="orderNotes" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={3} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="如有特殊需求請在此備註"></textarea>
          </div>

          <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-green-800 space-y-2">
            <h3 className="text-xl font-bold">💰 訂單總計</h3>
            <div className="flex justify-between items-center text-2xl font-bold border-t-2 border-green-300 pt-3 mt-3">
              <span>總金額：</span>
              <span>${totalAmount}</span>
            </div>
          </div>

          <div className="pt-2">
            {isLoading ? (
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">訂單發送中...</p>
              </div>
            ) : (
              <button onClick={handleSubmit} disabled={totalAmount === 0 || isLoading} className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none">
                🚀 送出訂單
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
