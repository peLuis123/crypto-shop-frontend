# Backend API Documentation - CryptoShop

## 📋 Overview
Este documento describe todos los modelos de base de datos y endpoints API necesarios para el backend de CryptoShop.

---

## 🗄️ Database Models

### 1. **User Model**
Almacena la información de los usuarios registrados.

```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  wallet: String (TRC-20 wallet address, optional),
  phone: String (optional),
  country: String (optional),
  twoFactorEnabled: Boolean (default: false),
  twoFactorSecret: String (optional),
  recoveryEmail: String (optional),
  createdAt: Date (default: Date.now),
  updatedAt: Date
}
```

### 2. **Product Model**
Almacena los productos disponibles en la tienda.

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  category: String (required), // 'electronics', 'fashion', 'home', 'sports'
  price: Number (required), // Precio en USDT
  stock: Number (required, default: 0),
  image: String (URL de la imagen),
  color: String (optional),
  rating: Number (default: 0, min: 0, max: 5),
  reviews: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date
}
```

### 3. **Order Model**
Almacena las órdenes de compra.

```javascript
{
  _id: ObjectId,
  orderId: String (required, unique), // Formato: #TRX-94820
  userId: ObjectId (ref: 'User', required),
  products: [{
    productId: ObjectId (ref: 'Product', required),
    name: String,
    price: Number,
    quantity: Number,
    color: String
  }],
  subtotal: Number (required),
  networkFee: Number (default: -1.20),
  discount: Number (default: 0),
  total: Number (required),
  status: String (required), // 'pending', 'completed', 'failed', 'cancelled'
  paymentMethod: String (default: 'TRC-20'),
  transactionHash: String (optional), // Hash de la transacción en blockchain
  walletAddress: String (required), // Dirección de wallet del comprador
  merchantAddress: String (required), // Dirección de wallet del vendedor
  createdAt: Date (default: Date.now),
  updatedAt: Date
}
```

### 4. **Transaction Model**
Almacena el historial de transacciones de wallet.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  orderId: ObjectId (ref: 'Order', optional),
  type: String (required), // 'purchase', 'refund', 'deposit', 'withdrawal'
  amount: Number (required),
  currency: String (default: 'USDT'),
  network: String (default: 'TRC-20'),
  transactionHash: String (optional),
  fromAddress: String,
  toAddress: String,
  status: String (required), // 'pending', 'confirmed', 'failed'
  confirmations: Number (default: 0),
  createdAt: Date (default: Date.now),
  updatedAt: Date
}
```

### 5. **Session Model**
Almacena las sesiones activas de los usuarios.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  device: String, // 'Windows • Chrome', 'iOS • Safari'
  ipAddress: String,
  userAgent: String,
  lastActive: Date (default: Date.now),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now)
}
```

---

## 🔌 API Endpoints

### **Authentication Endpoints**

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

---

#### POST `/api/auth/login`
Inicia sesión de un usuario.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "wallet": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
  },
  "token": "jwt_token_here"
}
```

---

#### POST `/api/auth/logout`
Cierra la sesión del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **User Endpoints**

#### GET `/api/users/profile`
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "wallet": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
    "phone": "+1 (555) 000-0000",
    "country": "United States",
    "twoFactorEnabled": false
  }
}
```

---

#### PUT `/api/users/profile`
Actualiza el perfil del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "johndoe_updated",
  "phone": "+1 (555) 111-2222",
  "country": "Canada"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

#### PUT `/api/users/password`
Cambia la contraseña del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### POST `/api/users/wallet/connect`
Conecta una wallet TRC-20 al perfil del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "walletAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet connected successfully",
  "wallet": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
}
```

---

### **Wallet Endpoints**

#### GET `/api/wallet/balance/:address`
Obtiene el balance de una wallet TRC-20.

**Params:**
- `address`: Dirección de la wallet TRC-20

**Response:**
```json
{
  "success": true,
  "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
  "usdt": 1250.50,
  "trx": 45.30,
  "network": "TRC-20"
}
```

---

### **Product Endpoints**

#### GET `/api/products`
Obtiene todos los productos disponibles.

**Query Params:**
- `category` (optional): Filtra por categoría
- `limit` (optional): Número de productos por página
- `page` (optional): Número de página

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Wireless Headphones Pro",
      "category": "electronics",
      "price": 145.00,
      "stock": 50,
      "image": "https://...",
      "color": "Midnight Black",
      "rating": 4.8,
      "reviews": 234
    },
    ...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

---

#### GET `/api/products/:id`
Obtiene un producto por su ID.

**Params:**
- `id`: ID del producto

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "...",
    "name": "Wireless Headphones Pro",
    "description": "Premium wireless headphones...",
    "category": "electronics",
    "price": 145.00,
    "stock": 50,
    "image": "https://...",
    "color": "Midnight Black",
    "rating": 4.8,
    "reviews": 234
  }
}
```

---

### **Order Endpoints**

#### POST `/api/orders`
Crea una nueva orden de compra.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "products": [
    {
      "productId": "...",
      "quantity": 2
    }
  ],
  "walletAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "...",
    "orderId": "#TRX-94821",
    "products": [...],
    "total": 290.00,
    "status": "pending",
    "merchantAddress": "TMerchantWalletAddress123...",
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

---

#### GET `/api/orders`
Obtiene todas las órdenes del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `status` (optional): Filtra por estado ('pending', 'completed', 'failed', 'cancelled')
- `limit` (optional): Número de órdenes por página
- `page` (optional): Número de página

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "...",
      "orderId": "#TRX-94820",
      "products": [...],
      "total": 450.00,
      "status": "completed",
      "createdAt": "2024-02-11T14:20:00.000Z"
    },
    ...
  ],
  "stats": {
    "total": 128,
    "pending": 2,
    "completed": 120,
    "failed": 4,
    "cancelled": 2
  }
}
```

---

#### GET `/api/orders/:id`
Obtiene los detalles de una orden específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Params:**
- `id`: ID de la orden

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderId": "#TRX-94820",
    "products": [
      {
        "productId": "...",
        "name": "Wireless Headphones Pro",
        "price": 145.00,
        "quantity": 2,
        "color": "Midnight Black"
      }
    ],
    "subtotal": 290.00,
    "networkFee": -1.20,
    "discount": 0,
    "total": 288.80,
    "status": "completed",
    "transactionHash": "0x123abc...",
    "createdAt": "2024-02-11T14:20:00.000Z"
  }
}
```

---

#### PATCH `/api/orders/:id/status`
Actualiza el estado de una orden (solo admin o sistema de pago).

**Headers:**
```
Authorization: Bearer <token>
```

**Params:**
- `id`: ID de la orden

**Request Body:**
```json
{
  "status": "completed",
  "transactionHash": "0x123abc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": { ... }
}
```

---

### **Payment History Endpoints**

#### GET `/api/transactions`
Obtiene el historial de transacciones del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `type` (optional): Filtra por tipo ('purchase', 'refund', 'deposit', 'withdrawal')
- `status` (optional): Filtra por estado ('pending', 'confirmed', 'failed')
- `limit` (optional): Número de transacciones por página
- `page` (optional): Número de página

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "type": "purchase",
      "amount": 288.80,
      "currency": "USDT",
      "network": "TRC-20",
      "transactionHash": "0x123abc...",
      "status": "confirmed",
      "confirmations": 21,
      "createdAt": "2024-02-11T14:20:00.000Z"
    },
    ...
  ]
}
```

---

### **Session Endpoints**

#### GET `/api/sessions`
Obtiene las sesiones activas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "_id": "...",
      "device": "Windows • Chrome",
      "ipAddress": "192.168.1.1",
      "lastActive": "2024-02-12T19:00:00.000Z",
      "isActive": true,
      "createdAt": "2024-02-12T10:00:00.000Z"
    },
    ...
  ]
}
```

---

#### DELETE `/api/sessions/:id`
Cierra una sesión específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Params:**
- `id`: ID de la sesión

**Response:**
```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

---

## 🔐 Security Endpoints

#### POST `/api/security/2fa/enable`
Habilita la autenticación de dos factores.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "qrCode": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

---

#### POST `/api/security/2fa/verify`
Verifica el código 2FA.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA verified successfully"
}
```

---

## 📊 Admin Endpoints (Optional)

#### GET `/api/admin/products`
Obtiene todos los productos (incluidos inactivos).

#### POST `/api/admin/products`
Crea un nuevo producto.

#### PUT `/api/admin/products/:id`
Actualiza un producto.

#### DELETE `/api/admin/products/:id`
Elimina un producto.

#### GET `/api/admin/orders`
Obtiene todas las órdenes de todos los usuarios.

#### GET `/api/admin/users`
Obtiene todos los usuarios.

---

## 🚀 Notas de Implementación

### Tecnologías Recomendadas:
- **Framework**: Node.js + Express.js
- **Base de Datos**: MongoDB + Mongoose
- **Autenticación**: JWT (jsonwebtoken)
- **Blockchain**: TronWeb (para interactuar con TRC-20)
- **Seguridad**: bcrypt (hash de contraseñas), helmet, cors
- **Validación**: express-validator o Joi

### Variables de Entorno Necesarias:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cryptoshop
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
TRON_API_KEY=your_tron_api_key
MERCHANT_WALLET_ADDRESS=TMerchantWalletAddress123...
NODE_ENV=development
```

### Middleware Requerido:
1. **authMiddleware**: Verifica el token JWT
2. **errorHandler**: Maneja errores globalmente
3. **validateRequest**: Valida los datos de entrada
4. **rateLimiter**: Limita las peticiones por IP

---

## 📝 Prioridades de Implementación

### Fase 1 (Esencial):
1. ✅ User Model + Auth Endpoints
2. ✅ Product Model + Product Endpoints
3. ✅ Order Model + Order Endpoints
4. ✅ Wallet Balance Endpoint

### Fase 2 (Importante):
5. ✅ Transaction Model + Transaction Endpoints
6. ✅ Session Model + Session Endpoints
7. ✅ Payment verification con blockchain

### Fase 3 (Opcional):
8. ⚪ 2FA Implementation
9. ⚪ Admin Panel Endpoints
10. ⚪ Email notifications
11. ⚪ Webhooks para confirmaciones de pago

---

**Fecha de creación**: 2024-02-12  
**Versión**: 1.0
