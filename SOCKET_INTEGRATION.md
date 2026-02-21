# Socket.io Integration Guide

## Overview
Real-time notifications for transaction confirmations. When a payment is confirmed on the blockchain, the frontend receives an instant notification via WebSocket.

---

## Backend Setup (Already Done ✅)

The backend is configured to:
- Initialize Socket.io server on HTTP server
- Accept connections from `http://localhost:5173` (frontend dev server)
- Emit `transaction:confirmed` event when blockchain confirms payment
- Support private user rooms for notifications

**Backend URL:** `http://localhost:3000`

---

## Frontend Setup

### Step 1: Install socket.io-client

```bash
npm install socket.io-client
```

### Step 2: Create Socket Hook

Create file: `src/hooks/useSocket.js`

```javascript
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      credentials: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  return socket;
};
```

### Step 3: Integrate in Orders Dashboard

In your `dashboard/orders` component (or wherever orders are displayed):

```javascript
import { useSocket } from '../hooks/useSocket';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust to your auth setup

export const OrdersDashboard = () => {
  const socket = useSocket();
  const { user } = useAuth(); // Get user ID from auth
  const userId = user?._id;

  useEffect(() => {
    if (socket && userId) {
      // Join private user room
      socket.emit('join-user', userId);
      console.log(`[Socket] Joined user room: ${userId}`);

      // Listen for transaction confirmations
      socket.on('transaction:confirmed', (data) => {
        console.log('✅ Transaction Confirmed:', data);
        
        const { orderId, txHash, message } = data;

        // Show success notification
        showNotification({
          type: 'success',
          title: '✅ Payment Confirmed',
          message: message,
          description: `Transaction: ${txHash}`
        });

        // Refresh orders list
        refetchOrders();
        
        // Optional: Mark order as completed in UI
        updateOrderStatus(orderId, 'completed');
      });

      return () => {
        socket.off('transaction:confirmed');
      };
    }
  }, [socket, userId]);

  return (
    <div>
      {/* Your orders list UI */}
    </div>
  );
};
```

### Step 4: Handle Payment Flow

In your payment button/form component:

```javascript
import { useSocket } from '../hooks/useSocket';

export const PaymentButton = ({ orderId }) => {
  const socket = useSocket();
  const [isPaying, setIsPaying] = useState(false);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);

  const handlePayment = async () => {
    try {
      setIsPaying(true);

      // Send payment request
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Payment sent to blockchain
        setWaitingConfirmation(true);
        
        showNotification({
          type: 'info',
          title: '⏳ Processing Payment',
          message: 'Your payment has been sent. Waiting for blockchain confirmation...',
          description: `Hash: ${data.transaction.hash}`
        });

        // Socket listener will handle the confirmation
        // See useEffect in OrdersDashboard above
      } else {
        showNotification({
          type: 'error',
          title: '❌ Payment Failed',
          message: data.error
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      showNotification({
        type: 'error',
        title: '❌ Error',
        message: error.message
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={isPaying || waitingConfirmation}
    >
      {waitingConfirmation ? '⏳ Confirming Payment...' : 'Pay Now'}
    </button>
  );
};
```

---

## Event Flow

```
Frontend                          Backend                         Blockchain
  |                                 |                                  |
  +------ POST /pay -------->       |                                  |
  |                                 +-------- sendTRX ------>          |
  |                                 |                                  |
  |  <--- 200 OK (txHash) --+       |  <---- txHash (pending) -------+
  |                         |       |
  |  Show "Confirming..." --|       | Listener polls every 15s
  |                         |       |
  |                         +-----> Blockchain Check
  |                         |       |
  |                   (Confirmed!)  |
  |                         |       |
  |  <--- socket event -----+       |
  |  transaction:confirmed  |       |
  |                         |       |
  +---- Update UI ----+     |       |
  +---- Refetch ------+     |       |
  |                         |       |
```

---

## Response Data

### Payment Response (POST /pay):
```json
{
  "success": true,
  "message": "Payment sent. Waiting for blockchain confirmation.",
  "order": { /* order object */ },
  "transaction": {
    "hash": "f61d16e0d404e759c3c86444781f4769214416e51eb6dfabcb630cfd0d3b68a9",
    "from": "TFrPoB5NLMPnvwX6Jv3bvA3VPUz6Dn8Uw",
    "to": "TGHua8GHBkm9i9kECBTvYWkxnWaCkT5f",
    "amount": 0.24,
    "status": "pending"
  }
}
```

### Socket Event (transaction:confirmed):
```json
{
  "orderId": "699a31fe39a540594dcaba39",
  "txHash": "f61d16e0d404e759c3c86444781f4769214416e51eb6dfabcb630cfd0d3b68a9",
  "message": "Your purchase has been confirmed. You can now place new orders.",
  "timestamp": "2026-02-21T22:30:22.789+00:00"
}
```

---

## Error Handling

### Insufficient Balance (409)
```json
{
  "error": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE",
  "userBalance": 0.1,
  "requiredAmount": 0.24
}
```

### Pending Order Exists (409)
```json
{
  "error": "You have a pending order. Please complete or cancel it first.",
  "code": "PENDING_ORDER_EXISTS",
  "pendingOrderId": "699a31fe39a540594dcaba39"
}
```

Handle these in your frontend:
```javascript
if (response.status === 409) {
  const data = await response.json();
  
  if (data.code === 'INSUFFICIENT_BALANCE') {
    showAlert('❌ Insufficient balance. Need ' + data.requiredAmount + ' TRX');
  } else if (data.code === 'PENDING_ORDER_EXISTS') {
    showAlert('⏳ You have a pending order. Wait for confirmation first.');
  }
}
```

---

## Console Logs to Expect

**Backend:**
```
[Socket] User connected: abc123...
[Socket] User userId joined room user:userId
[Listener] Found 1 pending transactions
[Listener] Transaction confirmed: f61d16e0d404e759c...
```

**Frontend:**
```
✅ Connected to socket server
[Socket] Joined user room: userId
✅ Transaction Confirmed: { orderId, txHash, message }
```

---

## Testing

1. **Start Backend:**
   ```bash
   npm start
   ```

2. **Check Socket Connection:**
   - Open browser console
   - Should see: `✅ Connected to socket server`

3. **Make a Payment:**
   - Click Pay button
   - Should see: `⏳ Processing Payment...`
   - After ~15 seconds (next listener check):
   - Should see: `✅ Transaction Confirmed`

4. **Verify Database:**
   ```bash
   # In MongoDB
   db.transactions.findOne()
   # Should show: status: "confirmed"
   
   db.orders.findOne()
   # Should show: status: "completed"
   ```

---

## Troubleshooting

### Socket not connecting
- Check CORS origin in backend (`src/config/socket.js`)
- Verify frontend URL is in allowed origins
- Check browser console for connection errors

### Not receiving transaction:confirmed event
- Verify user joined room: `socket.emit('join-user', userId)`
- Check browser console for socket events
- Check backend logs: `[Socket] User userId joined room user:userId`

### Transaction still pending after minutes
- Check listener is running: `[Listener] Found X pending transactions`
- Verify TRON response has `blockNumber`
- Check blockchain directly: https://tronscan.org/#/transaction/{txHash}

---

## Timeline

- **0s:** User clicks pay
- **~1s:** Payment sent to blockchain (sendTRX)
- **~5s:** Payment included in block
- **~15s:** Listener checks and confirms (next interval)
- **~15s:** Socket event emitted
- **Instant:** Frontend receives notification

---

**Questions?** Check backend logs and browser console for detailed debug info.
