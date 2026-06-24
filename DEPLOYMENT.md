# Daddy SoSo Closet -- Setup & Deployment Guide

> Step-by-step for beginners. Follow in order, don't skip steps.

---

## 1. What You're Building

| Feature | URL |
|---|---|
| Public Landing Page | `/` |
| Tweapease Branch | `/tweapease` |
| Abaam Branch (+ Salon) | `/abaam` |
| Salon Booking | `/salon` |
| Staff Login | `/auth/login` |
| Staff Dashboard | `/dashboard` |
| Admin Panel | `/admin` |
| SMS Alerts | Auto-sent on every sale, restock & customer order |

**Tech stack:** Next.js 14, Supabase (database + auth + storage), Arkesel (SMS), Vercel (hosting).

---

## 2. Prerequisites

**Software to install:**

| Tool | Download | Verify |
|---|---|---|
| Node.js (v18+) | [nodejs.org](https://nodejs.org) -- click "LTS" | `node --version` |
| Git | [git-scm.com/downloads](https://git-scm.com/downloads) | `git --version` |
| VS Code (optional) | [code.visualstudio.com](https://code.visualstudio.com) | -- |

**Accounts to create (all free):**

- [github.com](https://github.com) -- code hosting
- [supabase.com](https://supabase.com) -- database + auth
- [vercel.com](https://vercel.com) -- website hosting
- [arkesel.com](https://arkesel.com) -- SMS delivery (Ghana)

---

## 3. Set Up Supabase

### 3.1 Create a Project

1. Go to [supabase.com](https://supabase.com) and sign up with GitHub
2. Click **New Project**
3. Name: `daddy-soso-closet`, pick a strong database password, choose the nearest region
4. Wait ~2 minutes for setup

### 3.2 Get Your API Keys

1. Go to **Settings** (gear icon) then **API**
2. Copy and save these three values:
   - **Project URL** -- `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** -- starts with `eyJ...`
   - **service_role key** -- starts with `eyJ...` (keep this SECRET)

### 3.3 Create Storage Buckets

1. Go to **Storage** in the sidebar
2. Create bucket: `product-images` -- toggle **Public** ON -- Save
3. Create bucket: `site-assets` -- toggle **Public** ON -- Save

### 3.4 Configure Auth

1. Go to **Authentication** then **URL Configuration**
2. Set **Site URL** to `http://localhost:3000`
3. Add **Redirect URL**: `http://localhost:3000/auth/callback`
4. Go to **Providers** tab and ensure **Email** is enabled
5. Turn OFF **"Confirm email"** then Save

---

## 4. Set Up Arkesel (SMS)

1. Register at [arkesel.com](https://arkesel.com) and verify your phone
2. Copy your **API Key** from the dashboard (Settings then API Keys)
3. Go to **Sender IDs** and request sender ID: `Daddy-Soso` (approval takes a few hours; SMS still works meanwhile with a generic sender)
4. Top up balance -- SMS costs ~GHS 0.05-0.10 each

---

## 5. Install & Configure the Project

### 5.1 Get the Code

Place the `daddy-soso-closet` folder on your Desktop or Documents, then open a terminal in that folder:

- **Windows:** Open the folder in File Explorer, click address bar, type `cmd`, press Enter
- **Mac:** Open Terminal, type `cd ` then drag the folder in, press Enter
- **Linux:** Right-click inside folder, select Open Terminal

### 5.2 Install Dependencies

```bash
npm install
```

Wait 2-5 minutes. Lots of text scrolling is normal.

### 5.3 Create `.env.local`

Create a file called `.env.local` in the project root with these values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
ARKESEL_API_KEY=your-arkesel-api-key
ARKESEL_SENDER_ID=Daddy-Soso
ARKESEL_RECIPIENT_PHONE=0552315639
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace each placeholder with your real values from Steps 3.2 and 4.2.

> **IMPORTANT:** Never share `SUPABASE_SERVICE_ROLE_KEY` with anyone.

---

## 6. Set Up the Database

### 6.1 Run the Schema SQL

1. In Supabase, go to **SQL Editor** then **New query**
2. Paste the entire block below and click **Run**:

```sql
-- BRANCHES
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  location TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO branches (name, display_name, location, type) VALUES
('tweapease', 'Tweapease Branch', 'Tweapease, Eastern Region', 'boutique'),
('abaam', 'Abaam Branch', 'Abaam, Eastern Region', 'boutique_salon')
ON CONFLICT DO NOTHING;

-- ROLES
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);
INSERT INTO roles (name) VALUES ('admin'), ('staff') ON CONFLICT DO NOTHING;

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT REFERENCES roles(name),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);
INSERT INTO categories (name, slug) VALUES
('Clothing','clothing'),('Necklaces','necklaces'),('Bracelets','bracelets'),
('Earrings','earrings'),('Footwear','footwear'),('Slippers','slippers')
ON CONFLICT DO NOTHING;

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  restock_threshold INTEGER DEFAULT 5,
  last_restocked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, branch_id)
);

-- SALES
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  staff_id UUID REFERENCES staff(id),
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  receipt_number TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALE ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- RESTOCK LOG
CREATE TABLE IF NOT EXISTS restock_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  branch_id UUID REFERENCES branches(id),
  quantity_added INTEGER NOT NULL,
  restocked_by UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO site_settings (key, value) VALUES
('logo_url',''),('hero_image_url',''),('tweapease_hero_url',''),
('abaam_hero_url',''),('site_tagline','Fashion. Style. Elegance.'),
('abaam_salon_description','Visit our salon for premium beauty services in Abaam.'),
('sms_recipient_phone','0552315639'),
('order_whatsapp_number','')
ON CONFLICT (key) DO NOTHING;

-- ROW LEVEL SECURITY
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Staff see own branch sales" ON sales;
CREATE POLICY "Staff see own branch sales" ON sales FOR ALL USING (
  branch_id = (SELECT branch_id FROM staff WHERE id = auth.uid())
  OR (SELECT role FROM staff WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Authenticated read products" ON products;
CREATE POLICY "Authenticated read products" ON products
  FOR SELECT USING (auth.role() = 'authenticated' OR is_active = true);

DROP POLICY IF EXISTS "Admin manages products" ON products;
CREATE POLICY "Admin manages products" ON products
  FOR ALL USING ((SELECT role FROM staff WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write site_settings" ON site_settings;
CREATE POLICY "Admin write site_settings" ON site_settings
  FOR ALL USING ((SELECT role FROM staff WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Staff manage own inventory" ON inventory;
CREATE POLICY "Staff manage own inventory" ON inventory FOR ALL USING (
  branch_id = (SELECT branch_id FROM staff WHERE id = auth.uid())
  OR (SELECT role FROM staff WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Staff see own record" ON staff;
CREATE POLICY "Staff see own record" ON staff FOR SELECT USING (true);

-- INVENTORY AUTO-DECREMENT TRIGGER
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory
  SET quantity = quantity - NEW.quantity, updated_at = NOW()
  WHERE product_id = NEW.product_id
    AND branch_id = (SELECT branch_id FROM sales WHERE id = NEW.sale_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory ON sale_items;
CREATE TRIGGER trigger_update_inventory
AFTER INSERT ON sale_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_sale();

-- RECEIPT NUMBER GENERATOR
CREATE SEQUENCE IF NOT EXISTS receipt_seq START 1000;
CREATE OR REPLACE FUNCTION generate_receipt_number(branch_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(branch_name, 1, 3)) || '-' ||
         TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         LPAD(nextval('receipt_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

You should see "Success. No rows returned."

### 6.2 Create Your Admin Account

1. In Supabase go to **Authentication** then **Users** then **Add user**
2. Enter your email and a strong password then click **Create user**
3. Copy the **User UID** shown (e.g., `550e8400-e29b-41d4-a716-446655440000`)
4. Go to **SQL Editor** and run:

```sql
INSERT INTO staff (id, full_name, email, role, is_active)
VALUES (
  'PASTE-YOUR-USER-UID-HERE',
  'Your Name',
  'your-email@example.com',
  'admin',
  true
);
```

---

## 7. Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) -- you should see the landing page.

**Quick checks:**

1. Go to `/auth/login` and log in with your admin credentials -- should redirect to `/admin`
2. Go to Admin then Products and add a test product
3. Go to Admin then Staff and create a staff account for one branch
4. Log out, log in as staff then Dashboard then make a test sale

**Build check** (must pass before deploying):

```bash
npm run build
```

---

## 8. Deploy to Vercel

### 8.1 Push to GitHub

1. Create a **Private** repo named `daddy-soso-closet` on [github.com](https://github.com)
2. In your terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/daddy-soso-closet.git
git push -u origin main
```

### 8.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** then Import `daddy-soso-closet`
3. **Before clicking Deploy**, add these **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `ARKESEL_API_KEY` | Your Arkesel API key |
| `ARKESEL_SENDER_ID` | `Daddy-Soso` |
| `ARKESEL_RECIPIENT_PHONE` | `0552315639` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.daddysosocloset.com` |

4. Click **Deploy** -- takes ~2-4 minutes

### 8.3 Update Supabase Auth URLs

After deployment, go back to Supabase then **Authentication** then **URL Configuration**:

1. Change **Site URL** to `https://www.daddysosocloset.com`
2. Add these **Redirect URLs**:
   - `https://www.daddysosocloset.com/auth/callback`
   - `https://daddy-soso-closet.vercel.app/auth/callback`

---

## 9. Connect Your Domain

1. In Vercel go to **Settings** then **Domains** then add `www.daddysosocloset.com`
2. At your domain registrar (GoDaddy, Namecheap, etc.), add DNS records:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

3. Wait 15 min to 24 hours for DNS to propagate. HTTPS is automatic.

---

## 10. Post-Launch Checklist

Log in as admin at `your-domain.com/auth/login` and complete these:

- [ ] **Admin then Settings** -- Upload logo, hero images for main/Tweapease/Abaam pages
- [ ] **Admin then Settings** -- Set the SMS recipient phone number
- [ ] **Admin then Products** -- Add all products with images, prices, categories
- [ ] **Admin then Staff** -- Create staff accounts (one per branch)
- [ ] **Log in as staff** then Dashboard then Inventory then Restock each product with starting quantities
- [ ] **Test a sale** -- Complete a sale, verify receipt shows, verify SMS arrives
- [ ] **Admin then Analytics** -- Confirm the sale appears in reports

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `npm run build` fails "Module not found" | Check the file path in the error -- the imported file is missing or misspelled |
| "Invalid API key" from Supabase | Check `.env.local` -- no spaces around `=`, no quotes around values |
| Login works locally but not on Vercel | Add all env vars in Vercel then Settings then Environment Variables, then redeploy |
| Images don't show after upload | Ensure both storage buckets (`product-images`, `site-assets`) are set to Public |
| SMS not sending | Check Arkesel API key, check account balance. SMS failures never block sales |
| "RLS policy" error | Re-run the policies section of the SQL from Step 6.1 |
| Staff can access admin panel | Ensure their `staff` record has `role = 'staff'`, not `'admin'` |
| Inventory not decreasing after sale | Re-run the trigger section of the SQL from Step 6.1 |
| Build fails on Vercel | Run `npm run build` locally first, fix errors, commit, Vercel auto-redeploys |

---

## 12. Quick Reference

### Environment Variables

| Variable | Purpose | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | **YES** |
| `ARKESEL_API_KEY` | SMS API key | **YES** |
| `ARKESEL_SENDER_ID` | SMS sender name | No |
| `ARKESEL_RECIPIENT_PHONE` | Fallback SMS recipient | No |
| `NEXT_PUBLIC_SITE_URL` | Your live domain | No |

### All App URLs

| Page | Path |
|---|---|
| Landing Page | `/` |
| Tweapease Branch | `/tweapease` |
| Abaam Branch | `/abaam` |
| Salon | `/salon` |
| Staff Login | `/auth/login` |
| Staff Dashboard | `/dashboard` |
| Make a Sale | `/dashboard/sales` |
| Inventory | `/dashboard/inventory` |
| Receipts | `/dashboard/receipts` |
| Admin Home | `/admin` |
| Analytics | `/admin/analytics` |
| Products | `/admin/products` |
| Staff Management | `/admin/staff` |
| Edit Sales | `/admin/sales-edit` |
| Site Settings | `/admin/settings` |
| Videos | `/admin/videos` |

### Security Reminders

- Never share `SUPABASE_SERVICE_ROLE_KEY` with anyone
- Use strong passwords (8+ characters) for all accounts
- Only give admin credentials to the business owner
- The SMS recipient phone can be changed from Admin then Settings without redeploying
