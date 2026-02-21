# 🔗 Frontend Backend Integration Guide

## ✅ Completado - Servicios API Creados

Se han creado los siguientes servicios para comunicación con el backend:

### 1. **productService.js** - Gestión de Productos

```javascript
- getProducts() → Obtiene todos los productos
- getProductsByCategory(category) → Obtiene productos por categoría
- getProduct(productId) → Obtiene un producto específico
- searchProducts(query) → Busca productos
```

### 2. **orderService.js** - Gestión de Órdenes

```javascript
- getUserOrders() → Obtiene todas las órdenes del usuario
- getOrder(orderId) → Obtiene una orden específica
- createOrder(orderData) → Crea una nueva orden
- cancelOrder(orderId) → Cancela una orden
- getOrderStatus(orderId) → Obtiene el estado de una orden
```

### 3. **walletService.js** - Gestión de Wallet

```javascript
- getWalletBalance() → Obtiene el balance de la wallet
- getWalletAddress() → Obtiene la dirección de la wallet
- getWalletTransactions(filters) → Obtiene transacciones
- getTransaction(transactionId) → Obtiene una transacción
- getWalletInfo() → Obtiene info completa (balance + dirección)
```

### 4. **userService.js** - Gestión de Usuario

```javascript
- getProfile() → Obtiene el perfil del usuario
- updateProfile(userData) → Actualiza el perfil
- changePassword(oldPassword, newPassword) → Cambia contraseña
- enable2FA() → Habilita autenticación de 2 factores
- verify2FA(code) → Verifica código de 2FA
- disable2FA(code) → Deshabilita 2FA
```

---

## 📁 Componentes Actualizados

### **1. Shop.jsx**

- ✅ Carga dinámicamente productos desde el backend
- ✅ Filtrado por categoría
- ✅ Loading state mientras carga
- ✅ Manejo de errores
- ✅ Fallback a datos mock si la API falla

### **2. OrderHistory.jsx (OrderHistory)**

- ✅ Carga órdenes del usuario desde el backend
- ✅ Filtrado por estado (pending, completed, cancelled)
- ✅ Búsqueda por ID de orden
- ✅ Cálculo automático de estadísticas
- ✅ Muestra información detallada de cada orden

### **3. CheckoutModal.jsx**

- ✅ Integración con wallet del usuario
- ✅ Creación de orden en backend
- ✅ Captura de transaction hash
- ✅ Confirmación de pago
- ✅ Limpieza del carrito después de compra exitosa

### **4. CartContext.jsx**

- ✅ Carga balance de wallet al iniciar
- ✅ Mantiene información de dirección de wallet
- ✅ Método para refrescar datos de wallet
- ✅ Usa `_id` en lugar de `id` (compatible con MongoDB)

### **5. AccountSettings.jsx**

- ✅ Edición de perfil con validación
- ✅ Cambio de contraseña
- ✅ Habilitación de 2FA
- ✅ Visualización de dirección de wallet
- ✅ Mensajes de éxito y error

### **6. PaymentHistory.jsx**

- ✅ Visualización de historial de transacciones
- ✅ Filtrado por tipo (purchase, refund, deposit, withdrawal)
- ✅ Estadísticas de transacciones
- ✅ Estados de transacciones (pending, confirmed, failed)

---

## 🔑 Variables de Entorno Necesarias

Asegúrate de que tu backend está corriendo en:

```
Base URL: http://localhost:3000
```

Si necesitas cambiar, edita `src/api/axios.js`:

```javascript
const api = axios.create({
  baseURL: "http://localhost:3000", // Cambiar aquí
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## 🚀 Endpoints Esperados del Backend

El frontend espera los siguientes endpoints en tu backend:

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `POST /api/auth/refresh-token`

### Productos

- `GET /api/products`
- `GET /api/products?category={category}`
- `GET /api/products/{id}`
- `GET /api/products/search?q={query}`

### Órdenes

- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders`
- `POST /api/orders/{id}/cancel`
- `GET /api/orders/{id}/status`

### Wallet

- `GET /api/wallet`
- `GET /api/wallet/balance`
- `GET /api/wallet/address`
- `GET /api/wallet/transactions`
- `GET /api/transactions/{id}`

### Usuario

- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`
- `POST /api/auth/2fa/enable`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/2fa/disable`

### Configuración

- `GET /api/config/merchant-address`

---

## 📝 Estructura de Datos del Requests/Responses

### Crear Orden

**Request:**

```javascript
{
    products: [
        {
            productId: "mongo_id",
            name: "Product Name",
            price: 100,
            quantity: 1,
            color: "Blue"
        }
    ],
    subtotal: 100,
    networkFee: -1.20,
    total: 98.80,
    paymentMethod: "TRC-20",
    transactionHash: "0x...",
    walletAddress: "TLR3...",
    merchantAddress: "TLR3..."
}
```

### Actualizar Perfil

**Request:**

```javascript
{
    username: "John Doe",
    phone: "+1 (555) 000-0000",
    country: "United States"
}
```

---

## 🐛 Troubleshooting

### Error: "Failed to load products"

- Verifica que el backend esté corriendo en el puerto 3000
- Comprueba que el endpoint `/api/products` está disponible
- Revisa la consola del navegador para ver el error exacto

### Error: "Insufficient balance"

- El usuario no tiene suficientes USDT en su wallet
- El balance debe ser mayor o igual al monto total

### Error: "Invalid transaction hash"

- El hash de transacción no es válido
- Verifica que el usuario copió correctamente el hash

---

## 🔐 Seguridad

- Todos los requests con credenciales incluyen `withCredentials: true`
- Se implementó manejo automático de refresh token
- Las contraseñas no se almacenan en localStorage
- Los tokens se almacenan en cookies httpOnly

---

## 📱 Componentes del Carrito

El carrito ahora referencia productos por `_id` (MongoDB) en lugar de `id`.
Si los productos del backend tienen campos diferentes, ajusta en:

- `Shop.jsx` → `product._id`
- `CartContext.jsx` → `item._id`

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Probar autenticación completa (login/register)
2. ✅ Verificar carga de productos
3. ✅ Hacer una compra de prueba
4. ✅ Verificar que las órdenes se crean correctamente
5. ✅ Probar cambio de contraseña y 2FA
6. ✅ Validar historial de pagos

---

## 📞 Soporte

Si tienes problemas con la integración, verifica:

1. El backend está corriendo
2. Los endpoints tienen la estructura correcta
3. Las respuestas incluyen los campos esperados
4. CORS está habilitado en el backend
