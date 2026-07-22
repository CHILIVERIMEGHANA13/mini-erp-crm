# Mini ERP + CRM Operations Portal

> **Full Stack Developer Placement Drive Case Study Submission**  
> Built using **Node.js, Express, TypeScript, Prisma ORM, React (Vite), TypeScript, and Tailwind CSS**.

---

## 🌟 Executive Summary & Architecture

The **Mini ERP + CRM Operations Portal** is a production-grade web application built for wholesale and distribution enterprises. It manages customer relations, product inventory with low-stock alerts, stock movement logs, and serial sales challans with automatic inventory deduction and stock validation.

```
                  ┌─────────────────────────────────────────┐
                  │          React Frontend (Vite)          │
                  │   - Dashboard & Metrics                 │
                  │   - Customer CRM & Notes Timeline       │
                  │   - Product Inventory & Stock Alerts    │
                  │   - Sales Challans & 1-Click PDF Export │
                  └────────────────────┬────────────────────┘
                                       │ REST API (JWT Auth)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Node.js / Express Backend         │
                  │   - TypeScript Architecture             │
                  │   - Role-Based Access Middleware (RBAC) │
                  │   - Atomic Transactions (Stock Checks) │
                  └────────────────────┬────────────────────┘
                                       │ Prisma ORM
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │        SQLite / PostgreSQL Database     │
                  │   - Customer, Notes, Product,           │
                  │     StockMovement, Challan, Items       │
                  └─────────────────────────────────────────┘
```

---

## 🔑 Test Login Credentials (All 4 Required Roles)

Password for all pre-seeded evaluation accounts: `Password123!`

| Role | Email | Permissions Overview |
| :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | Full administrative access across all CRM, inventory, stock adjustments, and challans. |
| **Sales** | `sales@minierp.com` | Customer CRM management, follow-up notes, sales challan creation and draft updates. |
| **Warehouse** | `warehouse@minierp.com` | Product inventory management, manual stock IN/OUT adjustments, stock movement audit logs. |
| **Accounts** | `accounts@minierp.com` | View challans, confirm challans, trigger stock deductions, export financial PDF invoices. |

> ⚡ **Demo Tip**: The top Navigation bar features a **1-Click Quick Role Switcher** button bar (`ADMIN` \| `SALES` \| `WAREHOUSE` \| `ACCOUNTS`) so you can switch role perspectives instantly during live evaluation without re-typing credentials!

---

## 🚀 Key Features & Core Business Logic

### 1. Authentication & Role-Based Access Control (RBAC)
- Secure JWT authentication with salted bcrypt password hashing.
- Strict role checking middleware restricting unauthorized API calls (e.g., Warehouse staff cannot add customers, Sales staff cannot alter core product master prices).

### 2. Customer CRM Module
- Search by customer name, business name, mobile, email, or GST number.
- Filter by account type (`Retail`, `Wholesale`, `Distributor`) and status (`Lead`, `Active`, `Inactive`).
- **CRM Follow-Up Timeline**: Detail drawer allows sales representatives to append timestamped follow-up notes and track upcoming call dates.

### 3. Product & Inventory Module
- Real-time stock warnings when `currentStock` $\le$ `minStockAlert`.
- **Stock Movement Log**: Tracks every stock change with movement type (`IN` / `OUT`), quantity, reason (e.g., *Vendor Delivery*, *Sales Challan #CH-202607-0001*), logged user, and timestamp.
- Manual Stock Adjustment modal (Stock IN / Stock OUT).

### 4. Sales Challan Workflow (Core Business Logic Enforcement)
- **Auto-Generated Challan Numbers**: Format `CH-YYYYMM-SEQ` (e.g., `CH-202607-0001`).
- **Product & Customer Snapshots**: Stores full product pricing and customer details as JSON snapshots inside the challan, guaranteeing historical financial accuracy even if product prices change later.
- **Stock Validation & Deduction**:
  - Saving or confirming a challan validates inventory stock levels.
  - **Stock Cannot Go Negative**: If requested quantity exceeds stock on hand, the API immediately throws HTTP 400 Bad Request error with explicit item details.
  - On confirmation, inventory stock is atomically decremented and stock movement logs (`OUT`) are auto-created in a single database transaction.

### 🏆 Bonus Features Implemented
- 📄 **1-Click PDF Invoice Download**: Download professional invoices with company headers, customer details, line items table, and totals.
- 🐳 **Docker Setup**: `docker-compose.yml` for multi-container orchestration.
- 📮 **Postman Collection**: `mini_erp_crm.postman_collection.json` containing ready-to-run API requests.
- ⚙️ **CI/CD Pipeline**: `.github/workflows/deploy.yml` for automated GitHub Actions build checks.

---

## 🛠️ Step-by-Step Local Setup Instructions

### Prerequisites
- Node.js (v18 or v20 recommended)
- npm or yarn

### 1. Clone & Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Push database schema & seed initial test data
npm run prisma:push
npm run seed

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 2. Setup Frontend

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🐳 Docker Deployment Instructions

To run the full stack with PostgreSQL, Backend, and Frontend containers:

```bash
# From the root directory:
docker-compose up --build -d
```

---

## 📮 API Expectations & Postman Collection

Import `mini_erp_crm.postman_collection.json` into Postman. Key REST API endpoints include:

- `POST /auth/login` - Authenticate user & retrieve JWT token
- `GET /auth/me` - Fetch authenticated user profile & role
- `GET /customers` - List customers with search/filter queries
- `POST /customers` - Create customer
- `POST /customers/:id/notes` - Add CRM follow-up note
- `GET /products` - List products (`?lowStock=true` for alert items)
- `POST /products/:id/adjust-stock` - Record stock IN/OUT movement
- `POST /challans` - Generate sales challan (validates stock)
- `PATCH /challans/:id/status` - Confirm or cancel sales challan

---

## 📝 Assumptions & Known Limitations

1. **Database Provider**: Configured with SQLite by default for instant zero-configuration local evaluation. For production PostgreSQL deployments, update `provider = "postgresql"` in `backend/prisma/schema.prisma` and provide `DATABASE_URL` in `.env`.
2. **S3 Image Uploads**: Product image URLs currently accept standard web image URLs; S3 integration hook is prepared in schema.
