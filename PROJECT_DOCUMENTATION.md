# Nexora Project Documentation

Nexora is a full-stack multi-tenant admin platform built with Vue 3, Pinia, NestJS, JWT authentication, Socket.IO realtime events, and a runtime CSS variable theme engine.

## 1. Project Overview

Nexora models an enterprise SaaS-style platform with two main roles:

- `superadmin`: manages the whole platform, tenants, lifecycle state, themes, dashboard, and audit visibility.
- `tenant-admin`: manages inventory data for one tenant workspace.

The project started as a basic full-stack CRUD system and evolved into a more complete platform architecture:

```text
Phase 1: Vue + NestJS product CRUD
Phase 2: JWT authentication and protected routes
Phase 3: Multi-tenant role and data isolation
Phase 4: Dashboard metrics and audit logging
Phase 5: Socket.IO realtime domain events
Phase 6: Runtime tenant theme engine with live sync
```

Current state: Nexora is an architecture-complete prototype. It has real frontend/backend flows, protected APIs, realtime infrastructure, audit logs, dashboard aggregation, tenant lifecycle controls, runtime themes, and in-memory data storage. The in-memory database is temporary and intended to be replaced by PostgreSQL later.

## 2. Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| Vue 3 | Component-based UI and reactive rendering. |
| Pinia | Centralized state stores for auth, products, tenants, dashboard, audit, socket, notifications, and themes. |
| Vue Router | Protected routes, nested layout routing, and role-based navigation. |
| Axios | HTTP client with JWT header injection and unauthorized handling. |
| Socket.IO Client | Realtime connection to backend domain events. |
| CSS variables | Runtime design token injection for tenant themes. |
| lucide-vue-next | Consistent icon system across the UI. |

### Backend

| Technology | Purpose |
| --- | --- |
| NestJS | Modular backend architecture with controllers, services, guards, and dependency injection. |
| JWT + Passport | Stateless authentication for protected HTTP routes. |
| Socket.IO | Realtime gateway, authenticated socket connections, and room-based fanout. |
| Resend API | Transactional email provider behind a centralized provider abstraction. |
| TypeScript | Safer backend structure and clearer contracts. |
| In-memory arrays | Temporary development database while architecture evolves. |

Why this stack works: Vue/Pinia gives a clean reactive frontend, NestJS gives strong backend separation, JWT keeps auth stateless, and Socket.IO adds realtime sync without replacing HTTP as the source-of-truth write path.

## 3. Architecture Overview

Nexora uses a layered architecture on both frontend and backend.

```text
Browser UI
  |
  v
Vue View -> Pinia Store -> Frontend Service -> Axios / Socket.IO
                                                |
                                                v
NestJS Controller -> Guard -> Service -> In-memory data
                                      |
                                      v
                              Audit + Realtime events
```

### Frontend Flow: Service -> Store -> View

Frontend code is split by responsibility:

- Services know how to call APIs or sockets.
- Stores own state, loading flags, errors, computed values, and actions.
- Views render screens and call store actions.

Example product flow:

```text
ProductsView
  -> productStore.loadProducts()
  -> productService.fetchProducts()
  -> GET /products
  -> store updates products
  -> Vue rerenders table
```

This avoids putting API details directly inside page components.

### Backend Flow: Module -> Controller -> Service

NestJS modules group each domain:

- `AuthModule`
- `ProductsModule`
- `CategoriesModule`
- `TenantsModule`
- `DashboardModule`
- `AuditModule`
- `RealtimeModule`

Backend flow:

```text
Controller receives request
  -> JwtAuthGuard validates token
  -> Service enforces role and tenant rules
  -> Service mutates data
  -> Service writes audit log / emits realtime event
  -> Controller returns response
```

Controllers stay thin. Services contain business rules.

### Realtime Flow

Realtime events do not replace HTTP. HTTP performs the mutation; realtime distributes the result.

```text
Backend service mutation
  -> domain event
  -> Socket.IO room emit
  -> frontend socketStore
  -> realtimeDispatcher
  -> Pinia stores
  -> reactive UI update
```

## 4. Major Implemented Features

### Multi-Tenant Architecture

Tenant-owned records include `tenantId`. Tenant admins only access records belonging to their tenant. Superadmin can access platform-level data.

Enforcement happens on the backend through service checks, not only by hiding UI.

### JWT Authentication

Implemented flow:

```text
POST /auth/login
  -> validate user
  -> check tenant active status
  -> sign JWT
  -> return token + user profile
  -> frontend stores token
  -> frontend restores profile with /auth/me
```

JWT is used for:

- Protected API routes.
- Frontend route guards.
- Socket authentication.

### Tenant Lifecycle

Superadmin can:

- Create tenants.
- Generate tenant-admin bootstrap credentials.
- Activate/deactivate tenants.
- Delete tenants and related data.
- Update tenant themes.

Inactive tenants cannot log in, access protected APIs, or establish socket connections.

### Products And Categories

Tenant admins can manage their own catalog:

- Products: create, read, update, delete, search, filter, assign category.
- Categories: create, read, update, delete, search, tenant-scoped slug validation.

Important backend rules:

- Superadmin can read platform data but cannot create tenant products.
- Category ownership is validated before assigning it to products.
- Categories with products cannot be deleted.

### Dashboard

Dashboard metrics are role-specific.

Superadmin sees:

- Total tenants.
- Active/inactive tenants.
- Total products.
- Tenant admins.
- Total users.

Tenant admin sees:

- Total products.
- Active products.
- Low-stock products.
- Total inventory value.
- Tenant name.

Dashboard metrics are loaded by HTTP and patched by selected realtime events.

### Audit Logs

Audit logs track important actions:

- Login and logout.
- Tenant creation, deletion, activation, deactivation.
- Tenant theme updates.
- Product CRUD.
- Category CRUD.

Superadmin can view platform logs. Tenant admins can view their own tenant logs. Audit entries are also emitted as realtime events.

### Notifications And Notification Center

The notification system has:

- Toast notifications.
- Notification center.
- Unread count.
- Mark as read.
- Mark all as read.
- Clear notifications.

Realtime domain events are converted into human-readable notifications, except audit events, which appear in the audit timeline.

### Transactional Email Infrastructure

Nexora includes a centralized event-driven email layer:

```text
Domain Event
  -> EmailOrchestrator
  -> EmailService
  -> Email Provider abstraction
  -> Resend API
```

Business services do not call Resend or templates directly. They emit domain events, and the email orchestrator reacts asynchronously.

Current communication events:

- `LOW_STOCK_DETECTED`
- `TENANT_DEACTIVATED`
- `TENANT_CREATED`
- `USER_WELCOME`

Current templates:

- Low-stock alert.
- Tenant deactivated.
- Welcome email placeholder.

The provider layer is designed so Resend can be replaced later without changing product, tenant, or frontend logic.

### Runtime Themes

Each tenant has theme configuration:

- Primary color.
- Accent color.
- Light/dark mode.
- Sidebar style.
- Surface style.
- Logo URL.

Superadmin can preview a tenant theme before saving. Saved theme updates propagate live to affected tenant users.

## 5. Realtime Architecture

### What WebSockets Add

HTTP is request-response: the browser asks, the server answers.

WebSockets keep a connection open so the server can push updates immediately. Nexora uses Socket.IO for this because it provides events, reconnection, namespaces, and rooms.

### Domain Events

Nexora emits business-level events such as:

- `PRODUCT_CREATED`
- `PRODUCT_UPDATED`
- `PRODUCT_DELETED`
- `CATEGORY_CREATED`
- `CATEGORY_UPDATED`
- `CATEGORY_DELETED`
- `TENANT_CREATED`
- `TENANT_ACTIVATED`
- `TENANT_DEACTIVATED`
- `TENANT_DELETED`
- `TENANT_THEME_UPDATED`
- `LOW_STOCK_DETECTED`
- `USER_WELCOME`
- `AUDIT_CREATED`

Event shape:

```ts
{
  type: 'PRODUCT_CREATED',
  tenantId: 'tenant-1',
  actor: {
    userId: 'tenant-admin-1',
    role: 'tenant-admin'
  },
  timestamp: '2026-05-21T10:30:00.000Z',
  payload: {
    product: {}
  }
}
```

### Rooms And Fanout

Sockets join rooms after JWT authentication:

```text
user:<userId>
role:<role>
platform
tenant:<tenantId>
```

Fanout rules:

```text
Tenant event
  -> tenant:<tenantId>
  -> platform

Platform event
  -> platform
```

This lets tenant users receive their own updates while superadmin observes platform activity.

### Complete Realtime Lifecycle

Example: superadmin updates a tenant theme.

```text
1. TenantsView saves theme.
2. tenantStore calls PATCH /tenants/:id/theme.
3. TenantsService validates superadmin and theme payload.
4. Tenant theme is updated in memory.
5. RealtimeService emits TENANT_THEME_UPDATED.
6. AuditService writes TENANT_THEME_UPDATED audit log.
7. Socket.IO sends DOMAIN_EVENT to tenant and platform rooms.
8. socketStore receives event.
9. realtimeDispatcher routes event.
10. notificationStore creates notification/toast.
11. tenantStore patches tenant theme in tenant list.
12. themeStore applies CSS variables for affected active tenant user.
13. Vue UI updates automatically.
```

### Current Realtime Coverage

Implemented live behavior:

- Dashboard metric patches for product and tenant lifecycle events.
- Notification center and toast fanout from domain events.
- Realtime audit feed from `AUDIT_CREATED`.
- Live tenant theme synchronization.
- Realtime product and category table reconciliation through centralized stores.
- Canonical tenant deletion propagation with dependent product/category/tenant cleanup.
- Socket connection indicator: live, reconnecting, offline.

Current stabilization boundary:

- Realtime entity reconciliation is ID-based and works for the currently loaded store data. Future pagination should keep the same reconciliation model and apply it to the active page/window.

## 6. Theme Engine

Nexora uses a runtime design token engine.

Theme object:

```ts
{
  primaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  mode: 'light',
  sidebarStyle: 'glass',
  surfaceStyle: 'elevated',
  logo: ''
}
```

Theme flow:

```text
tenant theme
  -> normalizeTheme()
  -> buildThemeTokens()
  -> applyThemeTokens()
  -> CSS variables on document.documentElement
  -> UI updates instantly
```

Generated tokens include:

- `--color-primary`
- `--color-accent`
- `--text-primary`
- `--surface-bg`
- `--surface-border`
- `--sidebar-bg`
- `--card-shadow`
- `--focus-ring`
- `--transition-speed`

Why CSS variables matter: components can use stable token names while each tenant gets a different visual identity at runtime.

Realtime visual sync:

```text
TENANT_THEME_UPDATED
  -> dispatcher
  -> tenantStore updates tenant list
  -> themeStore checks current user tenant
  -> CSS tokens are injected
  -> active UI changes without refresh
```

Theme isolation is important: a theme update only applies if the current user belongs to that tenant, or if superadmin is actively previewing that tenant.

## 7. Important Engineering Concepts

### Reactive Programming

State changes automatically update the UI. When a Pinia store value changes, Vue rerenders components that depend on it.

### Centralized Architecture

Important state lives in stores instead of being scattered through components. This makes behavior easier to debug and extend.

### Service Abstraction

Services hide external details such as API URLs, Axios, and Socket.IO setup. Stores call services instead of directly touching network code.

### Event-Driven Architecture

The backend announces what happened with domain events. The frontend decides how to react.

```text
Backend says: PRODUCT_CREATED happened.
Frontend reacts: update dashboard, show notification, maybe patch product list later.
```

### Loose Coupling

Backend services do not know about Vue components. Socket clients do not know every store. The dispatcher connects events to stores in one place.

### Distributed State

The same business state can exist in multiple places:

- Backend memory arrays.
- Superadmin browser.
- Tenant admin browser.
- Dashboard metrics.
- CSS theme variables.

Realtime events help these copies stay aligned.

### Tenant Isolation

Tenant isolation means one tenant cannot read or mutate another tenant's data. Nexora enforces this using JWT tenant IDs, backend service checks, scoped queries, and tenant socket rooms.

### Runtime Configuration

Theme settings are runtime configuration. They can change while the app is running without rebuilding the frontend.

## 8. In-Memory Database

Current data lives in `backend/src/database/memory-db.ts`.

It stores:

- Tenants.
- Users.
- Products.
- Categories.
- Audit logs.

Why it exists now:

- Fast development.
- Simple setup.
- Lets architecture evolve before adding database complexity.

Important limitation:

```text
Backend restart = all runtime changes are lost.
```

That includes created tenants, product changes, category changes, theme updates, and audit logs.

Future PostgreSQL direction:

- `tenants`
- `users`
- `products`
- `categories`
- `audit_logs`

The migration should keep controllers and frontend contracts mostly stable while replacing direct array access inside services with database/repository calls.

## 9. How To Run The Project

### Prerequisites

Use Node supported by the frontend package:

```text
Node ^20.19.0 or >=22.12.0
```

### Install

From repo root:

```bash
npm install
```

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### Run Backend

```bash
cd backend
npm run start:dev
```

Default API:

```text
http://localhost:3000
```

### Run Frontend

```bash
cd frontend
npm run dev
```

Default Vite URL is usually:

```text
http://localhost:5173
```

### Environment

Frontend:

```text
VITE_API_URL=http://localhost:3000
```

Backend:

```text
PORT=3000
```

If not set, the app uses these same defaults.

### Seed Login Credentials

```text
superadmin@nexora.com / 123456
admin@spotify.com / 123456
admin@netflix.com / 123456
```

### WebSocket Usage

After login, the frontend connects to:

```text
<VITE_API_URL>/realtime
```

The JWT is sent in the socket auth payload. The backend validates it, checks tenant status, and joins the socket to the correct rooms.

## 10. Current Status And Roadmap

### Currently Built

- Vue 3 frontend with routed admin shell.
- Pinia stores and frontend service layer.
- NestJS modular backend.
- JWT login, profile restore, logout, and protected APIs.
- Role-aware frontend routing.
- Multi-tenant data isolation.
- Tenant lifecycle management.
- Product and category management.
- Dashboard aggregation.
- Audit logging and realtime audit feed.
- Socket.IO realtime gateway.
- Domain event system.
- Notification center and toast notifications.
- Event-driven transactional email infrastructure.
- Low-stock email alerts for tenant admins.
- Runtime CSS variable theme engine.
- Live tenant theme synchronization.
- Realtime product/category entity synchronization.
- Canonical `TENANT_DELETED` domain event propagation.
- Connection status indicator.

### Known Current Limitations

- In-memory database loses changes on restart.
- JWT secret is hardcoded.
- Passwords are plain text in seed data.
- No refresh tokens or token revocation.
- Socket.IO is single-process; no Redis adapter for horizontal scaling.
- Realtime events are not persisted for replay after reconnect.
- Email delivery currently runs as fire-and-forget async work without durable queue/retry storage.

### Future Roadmap

High-value next steps:

- Add PostgreSQL persistence.
- Add password hashing and invite/reset flows.
- Move secrets and CORS settings into environment config.
- Add pagination and server-side filtering.
- Add frontend tests and stronger backend tenant isolation tests.
- Add Redis Socket.IO adapter for scaling.
- Add durable email queues, retries, and delivery logs.
- Add richer role/permission model.
- Add durable audit retention and event replay strategy.

## Final Architecture Summary

Nexora is designed around clean separation of concerns:

```text
Vue views render
Pinia stores coordinate state
Services isolate API/socket details
NestJS controllers expose routes
NestJS services enforce rules
JWT protects identity
Tenant IDs enforce isolation
Domain events announce changes
Socket rooms fan events out
Dispatcher routes events to stores
CSS variables apply runtime themes
```

That is the core idea of the project: a practical enterprise admin platform where data, identity, realtime updates, and visual tenant configuration are designed as connected but independent systems.
