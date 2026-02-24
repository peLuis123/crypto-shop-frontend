# CryptoShop Frontend

Frontend profesional de e-commerce con pagos en **TRX (TRC-20)**, panel de cliente y panel administrativo.

Este proyecto fue construido para ofrecer una experiencia moderna, rápida y escalable: compras, checkout cripto, historial de órdenes y gestión administrativa completa.

---

## ¿Qué hace este sistema?

### Para clientes

- Registro e inicio de sesión.
- Catálogo de productos con categorías, stock visible y paginación.
- Carrito de compras y flujo de checkout en TRX.
- Vista unificada de **Orders & Payments** con filtros, estados y hash de transacción.
- Enlaces directos a **Tronscan** para validar transacciones on-chain.
- Perfil de usuario, estado de wallet y saldo en el header.

### Para administradores

- Dashboard con KPIs de negocio (ventas, órdenes, usuarios, fees).
- Gestión de ventas con cambio de estado y reembolsos.
- Gestión de clientes (búsqueda, bloqueo, métricas).
- Gestión de productos (crear, editar, eliminar, filtrar).
- Visualización de tendencias y datos operativos en tiempo real.

---

## Enfoque técnico (resumen para reclutadores)

- Arquitectura por módulos y separación de responsabilidades:
  - `pages/` para vistas de negocio.
  - `components/` para UI reutilizable.
  - `context/` para estado global (auth, carrito, socket).
  - `api/` para servicios HTTP aislados.
- Manejo robusto de autenticación con refresh token e interceptores de Axios.
- Integración de eventos en tiempo real con Socket.io (confirmaciones de transacción).
- UI consistente con Tailwind CSS y componentes orientados a UX.
- Navegación protegida por rol (`user` / `admin`) con rutas privadas.

---

## Stack

- **React 19**
- **Vite 7**
- **React Router 7**
- **Axios**
- **Socket.io Client**
- **Tailwind CSS 4**
- **Lucide React**

---

## Estructura del proyecto

```text
src/
	api/            # Servicios HTTP (auth, admin, wallet, orders, etc.)
	components/     # Componentes reutilizables (header, modals, rutas protegidas)
	context/        # Estado global (AuthContext, CartContext, SocketContext)
	layouts/        # Layout de cliente y admin
	pages/          # Vistas funcionales (Shop, Orders, AdminDashboard, etc.)
```

---

## Instalación y ejecución

### 1) Instalar dependencias

```bash
npm install
```

### 2) Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3) Levantar entorno de desarrollo

```bash
npm run dev
```

### 4) Build de producción

```bash
npm run build
```

### 5) Preview del build

```bash
npm run preview
```

---

## Rutas principales

### Cliente

- `/dashboard/shop`
- `/dashboard/orders`
- `/dashboard/account`

### Admin

- `/admin`
- `/admin/sales`
- `/admin/customers`
- `/admin/products`

---

## Estado del proyecto

Proyecto funcional con foco en:

- experiencia de compra cripto,
- operación administrativa,
- métricas clave,
- integración con backend REST y eventos en tiempo real.

---

## Nota

Este repositorio corresponde al **frontend**. El backend (APIs, base de datos, lógica de negocio y blockchain) se integra por medio de endpoints REST y eventos Socket.
