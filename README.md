# Ashok Auto Insurance — Insurance Management & Policy Renewal Tracker

A modern, professional, frontend-only Insurance Management, Payment Tracking, and Policy Renewal Web Application built with React, Vite, and Lucide Icons.

## 🚀 Key Features

- **Executive Analytics Dashboard:**
  - 4 Key Stat Cards (Total Customers, Total Business, Pending Payments, Upcoming Renewals).
  - 3D protective insurance illustration with warm amber/orange desert dunes.
  - Interactive Recharts (Insurance Type Distribution & Payment Status Breakdown).
  - Urgent renewal tracking with color-coded urgency badges.

- **Customer Management:**
  - Complete customer directory with multi-filter search (by name, phone, insurance company, policy status, expiry).
  - Add & edit customer modal with auto-calculated remaining amounts and payment statuses.
  - Dynamic **Insurance Company Dropdown** with an inline option to add and save custom company names.
  - Client-side PDF policy document attachment using IndexedDB.

- **Customer View & Profile:**
  - Dedicated profile hero banner with 3D SUV shield artwork and customer metadata.
  - Tabbed interface: Overview, Payments, Documents, and Activity History.
  - Financial & payment breakdown (Total Business, Amount Paid, Remaining Due).
  - Policy duration and validity schedule with live renewal countdowns.
  - Built-in PDF preview modal and one-click download.

- **Payment Ledger & Settlement:**
  - Outstanding balances and pending collection tracker.
  - Payment modal with automated remaining balance calculations and validation.

- **Executive Reports & Analytics:**
  - Portfolio breakdown by insurance carrier (HDFC ERGO, ICICI Lombard, Tata AIG, SBI General, etc.).
  - Real-time collection percentages and revenue summary.
  - One-click CSV and print export.

- **Mobile First Experience:**
  - Native mobile app UI with fixed bottom navigation bar (no horizontal swiping required).
  - Responsive 2x2 stat cards and native mobile cards for customers, payments, and renewals.

## 🛠️ Technology Stack

- **React 18**
- **Vite**
- **React Router v6**
- **Recharts**
- **Lucide React**
- **IndexedDB & LocalStorage** (100% frontend-only client architecture)

## 🏁 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/saravananpepsoftware/insurance-tracker.git
cd insurance-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

