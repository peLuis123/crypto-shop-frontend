# 🔌 CryptoShop API - Guía de Integración Frontend

**Base URL**: `http://localhost:3000` (desarrollo) | `https://api.cryptoshop.com` (producción)

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Billetera](#billetera)
4. [Productos](#productos)
5. [Órdenes](#órdenes)
6. [Transacciones](#transacciones)
7. [Sesiones](#sesiones)
8. [Seguridad 2FA](#seguridad-2fa)
9. [Errores Comunes](#errores-comunes)

---

## 🔐 Autenticación

### POST `/api/auth/register`

**Registrar nuevo usuario**

```
Método: POST
URL: /api/auth/register
Headers: Content-Type: application/json
```

**Request:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "wallet": {
      "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
    },
    "role": "user",
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

**Errores:**

- `400`: Email ya existe, username inválido, contraseña débil
- `500`: Error del servidor

**Notas**:

- La billetera se crea automáticamente
- Los tokens se guardan en cookies automáticamente

---

### POST `/api/auth/login`

**Iniciar sesión**

```
Método: POST
URL: /api/auth/login
Headers: Content-Type: application/json
```

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "wallet": {
      "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
    },
    "role": "user",
    "lastLogin": "2024-02-12T19:00:00.000Z"
  }
}
```

**Errores:**

- `401`: Email o contraseña incorrectos
- `404`: Usuario no encontrado

**Notas**:

- Frontend: Habilita `axios.defaults.withCredentials = true`
- El token se almacena en cookie `httpOnly`

---

### POST `/api/auth/logout`

**Cerrar sesión**

```
Método: POST
URL: /api/auth/logout
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Request:**

```json
{}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST `/api/auth/refresh-token`

**Renovar token JWT**

```
Método: POST
URL: /api/auth/refresh-token
Headers:
  - Cookie: refreshToken=<token>
```

**Request:**

```json
{}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed"
}
```

**Errores:**

- `401`: Token expirado o inválido

---

### GET `/api/auth/profile`

**Obtener perfil básico (rápido)**

```
Método: GET
URL: /api/auth/profile
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "wallet": {
      "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
    },
    "role": "user"
  }
}
```

---

## 👤 Usuarios

### GET `/api/users/profile`

**Obtener perfil detallado del usuario**

```
Método: GET
URL: /api/users/profile
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1 (555) 000-0000",
    "country": "United States",
    "wallet": {
      "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
    },
    "role": "user",
    "twoFactorEnabled": false,
    "createdAt": "2024-02-12T19:00:00.000Z",
    "updatedAt": "2024-02-12T19:00:00.000Z"
  }
}
```

---

### PUT `/api/users/profile`

**Actualizar datos del perfil**

```
Método: PUT
URL: /api/users/profile
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "username": "newusername",
  "phone": "+1 (555) 111-2222",
  "country": "Canada"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "newusername",
    "phone": "+1 (555) 111-2222",
    "country": "Canada",
    "email": "john@example.com",
    "wallet": {
      "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
    }
  }
}
```

**Errores:**

- `400`: Username ya existe
- `404`: Usuario no encontrado

---

### PUT `/api/users/password`

**Cambiar contraseña**

```
Método: PUT
URL: /api/users/password
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Errores:**

- `401`: Contraseña actual incorrecta
- `400`: Nueva contraseña muy corta (<8 caracteres)

---

### POST `/api/users/wallet/connect`

**Conectar billetera TRON existente**

```
Método: POST
URL: /api/users/wallet/connect
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "walletAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Wallet connected successfully",
  "wallet": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv"
}
```

**Errores:**

- `400`: Dirección de wallet inválida (debe empezar con "T" y 34 caracteres)
- `404`: Usuario no encontrado

**Notas**: La wallet generada en registro no se puede cambiar aquí, solo se puede conectar una billetera alternativa (opcional).

---

## 💰 Billetera

### GET `/api/wallet/balance`

**Obtener balance de TRX**

```
Método: GET
URL: /api/wallet/balance
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "address": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
  "trx": 45.3,
  "network": "TRC-20"
}
```

**Errores:**

- `404`: Billetera no encontrada
- `500`: Error conectando a TRON

---

### POST `/api/wallet/send-trx`

**Enviar TRX a otra dirección**

```
Método: POST
URL: /api/wallet/send-trx
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "toAddress": "TMerchantWalletAddress123456789012345678",
  "amount": 1.5
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "TRX sent successfully",
  "transaction": {
    "txID": "0x123abc...",
    "from": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
    "to": "TMerchantWalletAddress123456789012345678",
    "amount": 1.5,
    "status": "success"
  }
}
```

**Errores:**

- `400`: Dirección o cantidad inválida
- `500`: Saldo insuficiente, error en blockchain

---

## 📦 Productos

### GET `/api/products`

**Obtener todos los productos**

```
Método: GET
URL: /api/products?page=1&limit=10&category=digital
Headers:
  - Content-Type: application/json
```

**Query Parameters:**

- `page` (opcional): Página (default: 1)
- `limit` (opcional): Productos por página (default: 10)
- `category` (opcional): Filtrar por categoría

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Wireless Headphones Pro",
      "description": "Premium wireless headphones with noise cancellation",
      "price": 0.5,
      "stock": 50,
      "category": "digital",
      "image": "https://example.com/image.jpg",
      "rating": 4.8,
      "reviews": 234,
      "isActive": true,
      "createdAt": "2024-02-12T19:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "USB-C Cable",
      "description": "High-speed USB-C charging cable",
      "price": 0.25,
      "stock": 100,
      "category": "digital",
      "image": "https://example.com/image2.jpg",
      "rating": 4.5,
      "reviews": 120,
      "isActive": true,
      "createdAt": "2024-02-10T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/products/:id`

**Obtener producto específico**

```
Método: GET
URL: /api/products/507f1f77bcf86cd799439011
Headers: Content-Type: application/json
```

**Response (200):**

```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones Pro",
    "description": "Premium wireless headphones with noise cancellation",
    "price": 0.5,
    "stock": 50,
    "category": "digital",
    "image": "https://example.com/image.jpg",
    "rating": 4.8,
    "reviews": 234,
    "isActive": true,
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

**Errores:**

- `404`: Producto no encontrado

---

### POST `/api/products`

**Crear producto (solo ADMIN)**

```
Método: POST
URL: /api/products
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 0.75,
  "stock": 30,
  "category": "digital",
  "image": "https://example.com/image.jpg"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "New Product",
    "description": "Product description",
    "price": 0.75,
    "stock": 30,
    "category": "digital",
    "image": "https://example.com/image.jpg",
    "rating": 0,
    "reviews": 0,
    "isActive": true,
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

**Errores:**

- `400`: Campos requeridos faltantes, precio negativo
- `403`: Usuario no es admin

---

### PUT `/api/products/:id`

**Actualizar producto (solo ADMIN)**

```
Método: PUT
URL: /api/products/507f1f77bcf86cd799439011
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "name": "Updated Product Name",
  "price": 0.99,
  "stock": 25,
  "isActive": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Product Name",
    "price": 0.99,
    "stock": 25,
    "isActive": true,
    "updatedAt": "2024-02-12T19:30:00.000Z"
  }
}
```

**Errores:**

- `403`: Usuario no es admin
- `404`: Producto no encontrado

---

### DELETE `/api/products/:id`

**Eliminar producto (solo ADMIN)**

```
Método: DELETE
URL: /api/products/507f1f77bcf86cd799439011
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Errores:**

- `403`: Usuario no es admin
- `404`: Producto no encontrado

---

## 🛒 Órdenes

### POST `/api/orders`

**Crear nueva orden**

```
Método: POST
URL: /api/orders
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "color": "Black"
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "607f1f77bcf86cd799439011",
    "orderId": "#TRX-94820",
    "userId": "507f1f77bcf86cd799439011",
    "products": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones Pro",
        "price": 0.5,
        "quantity": 2,
        "color": "Black"
      },
      {
        "productId": "507f1f77bcf86cd799439012",
        "name": "USB-C Cable",
        "price": 0.25,
        "quantity": 1
      }
    ],
    "subtotal": 1.25,
    "networkFee": -0.01,
    "discount": 0,
    "total": 1.24,
    "status": "pending",
    "walletAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
    "merchantAddress": "TMerchantWalletAddress123456789012345678",
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

**Errores:**

- `400`: Productos vacíos, stock insuficiente
- `404`: Producto no encontrado

**Notas**:

- El networkFee es siempre -0.01 TRX
- La orden comienza en estado "pending"

---

### GET `/api/orders`

**Obtener todas las órdenes del usuario**

```
Método: GET
URL: /api/orders?status=pending&page=1
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Query Parameters:**

- `status` (opcional): pending, completed, failed, cancelled
- `page` (opcional): Página (default: 1)
- `limit` (opcional): Órdenes por página

**Response (200):**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "607f1f77bcf86cd799439011",
      "orderId": "#TRX-94820",
      "products": [...],
      "total": 1.24,
      "status": "pending",
      "createdAt": "2024-02-12T19:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

---

### GET `/api/orders/:id`

**Obtener detalles de una orden**

```
Método: GET
URL: /api/orders/607f1f77bcf86cd799439011
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "order": {
    "_id": "607f1f77bcf86cd799439011",
    "orderId": "#TRX-94820",
    "userId": "507f1f77bcf86cd799439011",
    "products": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones Pro",
        "price": 0.5,
        "quantity": 2,
        "color": "Black"
      }
    ],
    "subtotal": 1.0,
    "networkFee": -0.01,
    "discount": 0,
    "total": 0.99,
    "status": "pending",
    "transactionHash": null,
    "walletAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
    "merchantAddress": "TMerchantWalletAddress123456789012345678",
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

---

### POST `/api/orders/:id/pay`

**Pagar orden con TRX**

```
Método: POST
URL: /api/orders/607f1f77bcf86cd799439011/pay
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "order": {
    "_id": "607f1f77bcf86cd799439011",
    "orderId": "#TRX-94820",
    "status": "completed",
    "transactionHash": "0x123abc456def789ghi...",
    "total": 0.99
  },
  "transaction": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439011",
    "orderId": "607f1f77bcf86cd799439011",
    "type": "purchase",
    "amount": 0.99,
    "currency": "TRX",
    "network": "TRC-20",
    "transactionHash": "0x123abc456def789ghi...",
    "status": "pending",
    "fromAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
    "toAddress": "TMerchantWalletAddress123456789012345678",
    "createdAt": "2024-02-12T19:00:00.000Z"
  }
}
```

**Errores:**

- `400`: Orden ya pagada
- `404`: Orden no encontrada
- `500`: Saldo insuficiente, error en blockchain

---

### PATCH `/api/orders/:id/status`

**Actualizar estado de orden (solo ADMIN)**

```
Método: PATCH
URL: /api/orders/607f1f77bcf86cd799439011/status
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "status": "completed",
  "transactionHash": "0x123abc456def789ghi..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "_id": "607f1f77bcf86cd799439011",
    "orderId": "#TRX-94820",
    "status": "completed",
    "transactionHash": "0x123abc456def789ghi..."
  }
}
```

**Errores:**

- `403`: Usuario no es admin
- `404`: Orden no encontrada

---

## 💳 Transacciones

### GET `/api/transactions`

**Obtener historial de transacciones**

```
Método: GET
URL: /api/transactions?type=purchase&status=confirmed&page=1
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Query Parameters:**

- `type` (opcional): purchase, refund, deposit, withdrawal
- `status` (opcional): pending, confirmed, failed
- `page` (opcional): Página (default: 1)
- `limit` (opcional): Por página

**Response (200):**

```json
{
  "success": true,
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439011",
      "orderId": "607f1f77bcf86cd799439011",
      "type": "purchase",
      "amount": 1.24,
      "currency": "TRX",
      "network": "TRC-20",
      "transactionHash": "0x123abc...",
      "status": "confirmed",
      "confirmations": 21,
      "fromAddress": "TLR3qG5yjpGKzW9x1B2n4Rr6S7T8U9vkK9zw4pXQv",
      "toAddress": "TMerchantWalletAddress123456789012345678",
      "createdAt": "2024-02-12T19:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "pages": 1
  }
}
```

---

## 📱 Sesiones

### GET `/api/sessions`

**Obtener sesiones activas**

```
Método: GET
URL: /api/sessions
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "sessions": [
    {
      "_id": "607f1f77bcf86cd799439030",
      "userId": "507f1f77bcf86cd799439011",
      "device": "Windows • Chrome",
      "ipAddress": "192.168.1.1",
      "lastActive": "2024-02-12T19:30:00.000Z",
      "isActive": true,
      "createdAt": "2024-02-12T10:00:00.000Z"
    },
    {
      "_id": "607f1f77bcf86cd799439031",
      "device": "iPhone • Safari",
      "ipAddress": "201.50.23.18",
      "lastActive": "2024-02-12T15:00:00.000Z",
      "isActive": true,
      "createdAt": "2024-02-11T10:00:00.000Z"
    }
  ]
}
```

---

### DELETE `/api/sessions/:id`

**Terminar sesión específica**

```
Método: DELETE
URL: /api/sessions/607f1f77bcf86cd799439030
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

**Errores:**

- `403`: Sesión no pertenece al usuario
- `404`: Sesión no encontrada

---

## 🔒 Seguridad 2FA

### POST `/api/security/2fa/enable`

**Habilitar autenticación de dos factores**

```
Método: POST
URL: /api/security/2fa/enable
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
```

**Request:**

```json
{}
```

**Response (200):**

```json
{
  "success": true,
  "message": "2FA setup initiated",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

**Notas**:

- Mostrar el código QR en la interfaz
- El usuario escanea con Google Authenticator, Microsoft Authenticator, etc.
- Guardar el `secret` como backup

---

### POST `/api/security/2fa/verify`

**Verificar código 2FA y activar**

```
Método: POST
URL: /api/security/2fa/verify
Headers:
  - Authorization: Bearer <token>
  - Cookie: accessToken=<token>
  - Content-Type: application/json
```

**Request:**

```json
{
  "code": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

**Errores:**

- `401`: Código 2FA inválido
- `400`: 2FA no inicializado

---

## ⚠️ Errores Comunes

### 400 - Bad Request

```json
{
  "success": false,
  "error": "Validation failed: Email already exists"
}
```

**Causas**: Faltan campos, formato inválido, validación fallida

---

### 401 - Unauthorized

```json
{
  "success": false,
  "error": "Invalid token or expired"
}
```

**Causas**: Token expirado, no autenticado, credenciales incorrectas

---

### 403 - Forbidden

```json
{
  "success": false,
  "error": "User is not admin"
}
```

**Causas**: Usuario no tiene permisos (intenta acceder a endpoint admin siendo user)

---

### 404 - Not Found

```json
{
  "success": false,
  "error": "Product not found"
}
```

**Causas**: Recurso no existe en base de datos

---

### 500 - Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Causas**: Error del servidor, problemas con blockchain, falla en la BD

---

## 🔑 Headers Necesarios

### Autenticación

**Para endpoints protegidos, incluye:**

```javascript
// Opción 1: Cookie (automática si está configurada)
axios.defaults.withCredentials = true;

// Opción 2: Bearer Token
headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

### Content Type

```javascript
headers: {
  "Content-Type": "application/json"
}
```

---

## 📝 Ejemplo Completo - Frontend Integration

```javascript
// src/api/client.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Incluir cookies automáticamente
  headers: {
    "Content-Type": "application/json",
  },
});

// Register
export const register = (credentials) =>
  api.post("/auth/register", credentials);

// Login
export const login = (credentials) => api.post("/auth/login", credentials);

// Get Products
export const getProducts = (page = 1, limit = 10) =>
  api.get("/products", { params: { page, limit } });

// Create Order
export const createOrder = (products) => api.post("/orders", { products });

// Pay Order
export const payOrder = (orderId) => api.post(`/orders/${orderId}/pay`);

// Get Balance
export const getBalance = () => api.get("/wallet/balance");
```

---

## 🎯 Flujo de Integración Recomendado

### 1. Autenticación

```
Register → Login → Obtener Profile → Guardar en localStorage/sessionStorage
```

### 2. Ver Productos

```
GET /api/products → Mostrar en catálogo → Agregar a carrito
```

### 3. Crear Orden

```
POST /api/orders → Mostrar detalle → Botón "Pagar"
```

### 4. Pagar

```
POST /api/orders/:id/pay → Esperar blockchain → Mostrar confirmación
```

### 5. Historial

```
GET /api/transactions → Mostrar historial de pagos
```

---

**Última actualización**: 12/02/2026
**Versión API**: 1.0.0
