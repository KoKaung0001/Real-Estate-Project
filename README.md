# UrbanNest — Real Estate Platform (Frontend UI)

Web-based property listing & management platform. React + TypeScript + Vite frontend (custom CSS), Spring Boot backend.

## Demo Accounts

| Role    | Username | Password    |
| ------- | -------- | ----------- |
| Buyer   | `buyer`  | `password123` |
| Seller  | `seller` | `password123` |
| Admin   | `admin`  | `password123` |

- Sign up creates real accounts (stored in `localStorage`); passwords can be changed in the Profile edit modal.
- Username cannot be changed after signup.

## Pages & Components

| Route | Page | Key Components / Features |
| ----- | ---- | ------------------------- |
| `/` | `Home.tsx` | Hero search, filter bar (type/location/price), property cards, favorites toggle, categories, CTA bands, footer |
| `/property/:id` | `PropertyDetails.tsx` | Gallery, details, contact panel (Call / Viber), favorites |
| `/property/add` & `/property/edit/:id` | `AddEditProperty.tsx` | Multi-field listing form (add & edit) |
| `/login` | `LoginRegister.tsx` | Sign in / sign up tabs, form validation, Terms links |
| `/dashboard` | `Dashboard.tsx` | Overview stats, **My Properties** (store-backed), saved favorites, profile edit modal (email/phone/avatar/**password**) |
| `/admin/dashboard` | `AdminDashboard.tsx` | KPI cards, pending approvals (review modal: Approve/Reject), recently approved, recently added, quick actions |
| `/admin/manage-all` | `AdminDataManagement.tsx` | Users tab (edit/delete user) + Properties tab (edit/delete property), search, `?tab=` deep links |
| `/about` | `AboutUs.tsx` | Hero, mission/vision, problem vs solution, key features, tech stack, team grid, academic disclaimer |
| `/contact` | `ContactUs.tsx` | Contact methods, validated message form, office hours |
| `/privacy` `/terms` `/cookies` | `LegalPage.tsx` | Shared legal page driven by `section` prop |

**Shared components:** `Navbar.tsx` (hidden on `/admin/*`), `Footer` (in Home), `AdminSidebar.tsx`, `NotificationsBell.tsx`, review/edit modals.

## Contexts / Stores (localStorage)

| Context | Key | Purpose |
| ------- | --- | ------- |
| `AuthContext` | `urbannest-users`, `urbannest-user` | User registry, login/signup, password validation |
| `PropertiesContext` | `urbannest-properties` | Property CRUD + approval workflow |
| `FavoritesContext` | `urbannest-favorites` | Saved property favorites |

## Key Changes

- **Admin panel rebuilt** to match design: top bar (brand + bell + profile), sidebar nav groups, KPI cards with trends, pending-approval review flow, edit user/property modals.
- **End-to-end property flow**: add → pending → admin approve/reject → shown on Home / user dashboard.
- **Auth hardening**: persistent user registry, password validation, password change in profile, username locked after signup.
- **New pages**: About Us, Contact, Legal (Privacy/Terms/Cookies); footer/nav links converted to SPA `<Link>`s.

## Tips

- **No Tailwind utility classes** — they do not render. Use custom classes in `src/index.css` only (prefixed per section, e.g. `.adm-`, `.admin-`, `.dash-`, `.about-`, `.contact-`, `.legal-`).
- **Currency**: always show `MMK`, never `K` or `$`.
- **Admin routes** hide the global navbar automatically (`location.pathname.startsWith('/admin')`).
- JVM crash files (`hs_err_pid*.log`, `replay_pid*.log`) and `*.tsbuildinfo` are ignored — safe to delete locally.
