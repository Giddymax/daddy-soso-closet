# 🛍️ Daddy SoSo Closet — Complete Setup & Deployment Guide

> A step-by-step guide written for beginners. Follow every step in order. Do not skip any.

---

## 📋 Table of Contents

1. [What You're Building](#1-what-youre-building)
2. [What You Need Before You Start](#2-what-you-need-before-you-start)
3. [Install Required Software](#3-install-required-software)
4. [Set Up Supabase (Your Database)](#4-set-up-supabase-your-database)
5. [Set Up Arkesel (SMS Notifications)](#5-set-up-arkesel-sms-notifications)
6. [Set Up the Project on Your Computer](#6-set-up-the-project-on-your-computer)
7. [Connect Environment Variables](#7-connect-environment-variables)
8. [Run the Database SQL](#8-run-the-database-sql)
9. [Create Your Admin Account](#9-create-your-admin-account)
10. [Test Locally](#10-test-locally)
11. [Deploy to Vercel (Live Website)](#11-deploy-to-vercel-live-website)
12. [Connect Your Domain](#12-connect-your-domain)
13. [Post-Launch Setup (Add Products, Staff, Images)](#13-post-launch-setup)
14. [Troubleshooting Common Errors](#14-troubleshooting-common-errors)
15. [Quick Reference: All URLs](#15-quick-reference-all-urls)

---

## 1. What You're Building

| Feature | Description |
|---|---|
| **Main Website** | Public landing page at `www.daddysosocloset.com` |
| **Tweapease Branch Page** | `/tweapease` — products for this branch |
| **Abaam Branch Page** | `/abaam` — products + salon info |
| **Staff Login** | `/auth/login` — secure login for staff |
| **Staff Dashboard** | `/dashboard` — make sales, manage inventory, print receipts |
| **Admin Panel** | `/admin` — full control over both branches |
| **SMS Alerts** | Every sale and restock sends a text to 0594299293 |

---

## 2. What You Need Before You Start

You will need:
- A computer (Windows, Mac, or Linux)
- An internet connection
- An email address
- A phone number (0594299293 already configured)
- About 60–90 minutes

Accounts to create (all free):
- [github.com](https://github.com) — stores your code
- [supabase.com](https://supabase.com) — database + login system
- [vercel.com](https://vercel.com) — hosts your live website
- [arkesel.com](https://arkesel.com) — sends SMS messages in Ghana

---

## 3. Install Required Software

### Step 3.1 — Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Download and install it
4. To confirm it worked, open **Terminal** (Mac/Linux) or **Command Prompt** (Windows) and type:

```bash
node --version
```

You should see something like `v20.11.0`. Any version above 18 is fine.

### Step 3.2 — Install Git

1. Go to [git-scm.com/downloads](https://git-scm.com/downloads)
2. Download and install for your operating system
3. Confirm it worked:

```bash
git --version
```

### Step 3.3 — Install a Code Editor (Optional but Recommended)

Download [Visual Studio Code](https://code.visualstudio.com/) — it's free and makes editing files much easier.

---

## 4. Set Up Supabase (Your Database)

Supabase stores all your products, sales, staff accounts, and settings.

### Step 4.1 — Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with your GitHub account or email

### Step 4.2 — Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Name:** `daddy-soso-closet`
   - **Database Password:** Choose a strong password and **save it somewhere safe**
   - **Region:** Choose the closest region (e.g., Europe West if no Africa option)
3. Click **"Create new project"**
4. Wait 1–2 minutes while it sets up

### Step 4.3 — Get Your API Keys

1. In your Supabase project, click **"Settings"** (gear icon in sidebar)
2. Click **"API"**
3. You will see:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`
   - **service_role key** — another long key (keep this SECRET)
4. Copy all three and save them — you'll need them in Step 7

### Step 4.4 — Create Storage Buckets

1. In Supabase sidebar, click **"Storage"**
2. Click **"New bucket"**
3. Name: `product-images` → Toggle **"Public bucket"** ON → Click **"Save"**
4. Click **"New bucket"** again
5. Name: `site-assets` → Toggle **"Public bucket"** ON → Click **"Save"**

You should now have two buckets: `product-images` and `site-assets`.

### Step 4.5 — Configure Auth Settings

1. In Supabase sidebar, click **"Authentication"**
2. Click **"URL Configuration"**
3. Set **Site URL** to: `http://localhost:3000` (change to your real domain after deployment)
4. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
5. Click **"Save"**
6. Click **"Providers"** tab
7. Make sure **Email** is enabled
8. Turn OFF **"Confirm email"** (so you can create staff without email confirmation)
9. Click **"Save"**

---

## 5. Set Up Arkesel (SMS Notifications)

Arkesel sends text messages to the admin phone when a sale or restock happens.

### Step 5.1 — Create an Arkesel Account

1. Go to [arkesel.com](https://arkesel.com)
2. Click **"Register"** and create an account
3. Verify your phone number

### Step 5.2 — Get Your API Key

1. Log in to Arkesel dashboard
2. Go to **"API Keys"** or **"Settings"**
3. Copy your API key

### Step 5.3 — Register Your Sender ID

1. In Arkesel dashboard, go to **"Sender IDs"**
2. Click **"Request Sender ID"**
3. Enter: `DaddySoSo`
4. Submit for approval (usually takes a few hours)

> **Note:** While waiting for approval, SMS will still send but may show a generic sender. This does not affect sales.

### Step 5.4 — Top Up Your Balance

SMS messages cost approximately ₵0.05–₵0.10 each.
Top up your Arkesel account with a small amount (e.g., ₵10–₵20 to start).

---

## 6. Set Up the Project on Your Computer

### Step 6.1 — Download the Project Files

The `daddy-soso-closet` folder from this package contains all your code.

Place the folder somewhere easy to find, like your Desktop or Documents.

### Step 6.2 — Open Terminal in the Project Folder

**On Mac:**
- Open Terminal
- Type `cd ` (with a space after cd)
- Drag the `daddy-soso-closet` folder into the Terminal window
- Press Enter

**On Windows:**
- Open the `daddy-soso-closet` folder in File Explorer
- Click the address bar, type `cmd`, press Enter

**On Linux:**
- Right-click inside the folder → "Open Terminal"

### Step 6.3 — Install Project Dependencies

In your terminal, type this and press Enter:

```bash
npm install
```

This downloads all the required packages. It may take 2–5 minutes. You'll see a lot of text scrolling — that's normal.

---

## 7. Connect Environment Variables

This step connects your project to Supabase and Arkesel.

### Step 7.1 — Open the `.env.local` file

Open the `daddy-soso-closet` folder in VS Code (or any text editor).

Find the file called `.env.local` and open it. It looks like this:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ARKESEL_API_KEY=your_arkesel_api_key_here
NEXT_PUBLIC_ADMIN_PHONE=0594299293
NEXT_PUBLIC_SITE_URL=https://www.daddysosocloset.com
```

### Step 7.2 — Fill in Your Values

Replace each placeholder with your actual values from Step 4.3 and Step 5.2:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
ARKESEL_API_KEY=your-actual-arkesel-key
NEXT_PUBLIC_ADMIN_PHONE=0594299293
NEXT_PUBLIC_SITE_URL=https://www.daddysosocloset.com
```

**IMPORTANT:** Never share the `SUPABASE_SERVICE_ROLE_KEY` with anyone. It has full access to your database.

Save the file.

---

## 8. Run the Database SQL

This creates all the tables, data, and rules your website needs.

### Step 8.1 — Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 8.2 — Copy and Run the SQL

Copy the entire SQL block below and paste it into the SQL Editor, then click **"Run"**:

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
('abaam_salon_description','Visit our salon for premium beauty services in Abaam.')
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

After pasting, click the green **"Run"** button. You should see "Success. No rows returned."

If you see any error, read the error message carefully — usually it means a table already exists (which is fine, the `IF NOT EXISTS` handles it).

---

## 9. Create Your Admin Account

Your admin account gives you full control of everything.

### Step 9.1 — Create the Auth User

1. In Supabase, click **"Authentication"** in the sidebar
2. Click **"Users"** tab
3. Click **"Invite user"** or **"Add user"**
4. Enter your email address and a strong password
5. Click **"Create user"**
6. Note the **User UID** shown (it looks like `550e8400-e29b-41d4-a716-446655440000`)

### Step 9.2 — Add the Staff Record

1. Go to **"SQL Editor"**
2. Run this (replace values with your actual info and the UID from Step 9.1):

```sql
INSERT INTO staff (id, full_name, email, role, is_active)
VALUES (
  'PASTE-YOUR-USER-UID-HERE',
  'Admin Name',
  'your-email@example.com',
  'admin',
  true
);
```

Click **"Run"**. You should see "1 row inserted."

---

## 10. Test Locally

### Step 10.1 — Start the Development Server

In your terminal (make sure you're in the `daddy-soso-closet` folder):

```bash
npm run dev
```

You'll see output ending with:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 10.2 — Open in Browser

Go to [http://localhost:3000](http://localhost:3000)

You should see the Daddy SoSo Closet landing page with the boutique image as background.

### Step 10.3 — Test Login

1. Go to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. Enter the admin email and password you created in Step 9
3. You should be redirected to `/admin`

### Step 10.4 — Test a Sale

1. First create a staff account via Admin → Staff → Add Staff
2. Log out, then log in with the staff account
3. Go to Dashboard → Make a Sale
4. Add products (you'll need to add some first via Admin → Products)

### Step 10.5 — Build Check

Before deploying, confirm there are zero build errors:

```bash
npm run build
```

This should complete with `✓ Compiled successfully`. If you see errors, see the [Troubleshooting section](#14-troubleshooting-common-errors).

---

## 11. Deploy to Vercel (Live Website)

### Step 11.1 — Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** button → **"New repository"**
3. Name: `daddy-soso-closet`
4. Set it to **Private**
5. Click **"Create repository"**

### Step 11.2 — Push Your Code to GitHub

In your terminal (in the project folder):

```bash
git init
git add .
git commit -m "Initial commit - Daddy SoSo Closet"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/daddy-soso-closet.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 11.3 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Find and click **"Import"** next to `daddy-soso-closet`
4. Leave all settings as default
5. **BEFORE clicking Deploy**, click **"Environment Variables"**

### Step 11.4 — Add Environment Variables to Vercel

Add each variable one by one:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `ARKESEL_API_KEY` | Your Arkesel API key |
| `NEXT_PUBLIC_ADMIN_PHONE` | `0594299293` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.daddysosocloset.com` |

Click **"Add"** after each one.

### Step 11.5 — Deploy

Click **"Deploy"**. Vercel will build and deploy your site.

This takes about 2–4 minutes. When finished, you'll see a green **"Congratulations!"** screen with a preview URL like `daddy-soso-closet.vercel.app`.

### Step 11.6 — Update Supabase Redirect URLs

Now that you have a live URL, update Supabase:

1. Go to Supabase → Authentication → URL Configuration
2. Update **Site URL** to: `https://www.daddysosocloset.com`
3. Add to **Redirect URLs**: `https://www.daddysosocloset.com/auth/callback`
4. Also add: `https://daddy-soso-closet.vercel.app/auth/callback` (the Vercel URL)
5. Click **"Save"**

---

## 12. Connect Your Domain

This makes your site accessible at `www.daddysosocloset.com`.

### Step 12.1 — Add Domain in Vercel

1. Go to your Vercel project → **"Settings"** → **"Domains"**
2. Type `www.daddysosocloset.com` and click **"Add"**
3. Vercel will show you DNS records to add

### Step 12.2 — Update DNS at Your Domain Registrar

Log in to wherever you bought `daddysosocloset.com` (GoDaddy, Namecheap, etc.)

Find **"DNS Management"** and add these records:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

### Step 12.3 — Wait for DNS

DNS changes take 15 minutes to 24 hours to take effect. When it's ready, `https://www.daddysosocloset.com` will show your website with an SSL padlock.

---

## 13. Post-Launch Setup

Once your site is live, do these steps as admin:

### Step 13.1 — Upload Logo and Images

1. Go to `www.daddysosocloset.com/auth/login`
2. Log in as admin
3. Go to **Admin → Site Settings**
4. Upload your company logo
5. Upload hero images for the main page, Tweapease branch, and Abaam branch

### Step 13.2 — Add Products

1. Go to **Admin → Products**
2. Click **"Add Product"**
3. Fill in: name, category, price, description, and upload a product image
4. Click **"Save"**
5. Repeat for all your products

### Step 13.3 — Create Staff Accounts

1. Go to **Admin → Staff**
2. Click **"Add Staff"**
3. Create one account for Tweapease branch
4. Create one account for Abaam branch
5. Give each staff member their login credentials

### Step 13.4 — Set Initial Stock Levels

1. Log in as a staff member for Tweapease
2. Go to **Dashboard → Inventory**
3. Click **"Restock"** on each product and enter the starting quantity
4. Log out, log in as Abaam staff
5. Repeat for Abaam branch

### Step 13.5 — Test a Complete Sale

1. Log in as staff
2. Go to **Dashboard → Make a Sale**
3. Add items, select payment method, click **"Complete Sale"**
4. You should see a receipt modal
5. Check that an SMS was received on 0594299293
6. Check **Admin → Analytics** to see the sale reflected

---

## 14. Troubleshooting Common Errors

### ❌ `npm run build` fails with "Module not found"

This means a file import path is wrong.

**Fix:** Check the exact file path mentioned in the error. Make sure the file exists in the location being imported from.

### ❌ "Invalid API key" from Supabase

**Fix:** Double-check your `.env.local` file. Make sure there are no spaces around the `=` sign and no quotes around the values.

### ❌ Login works locally but not on Vercel

**Fix:** Make sure all 6 environment variables are added in Vercel → Settings → Environment Variables. Redeploy after adding them.

### ❌ Images don't show after upload

**Fix:** Make sure both Supabase storage buckets (`product-images` and `site-assets`) are set to **Public**. In Supabase → Storage, click the bucket → Settings → toggle Public on.

### ❌ SMS not sending

**Fix:** 
1. Check your Arkesel API key in `.env.local` / Vercel environment variables
2. Make sure your Arkesel account has balance
3. SMS failures do NOT block sales — check the Vercel function logs for details

### ❌ "RLS policy" error when fetching data

**Fix:** Make sure you ran the full SQL from Step 8. Go to Supabase SQL Editor and re-run the policies section.

### ❌ Staff can see admin panel

**Fix:** Make sure the staff record has `role = 'staff'` not `role = 'admin'` in the `staff` table.

### ❌ Inventory not decreasing after sale

**Fix:** The trigger may not have been created. Re-run the trigger section of the SQL from Step 8.

### ❌ "Build failed" on Vercel

1. Check the build log in Vercel for the specific error
2. Run `npm run build` locally first — it must pass locally before Vercel will work
3. Fix the error shown, commit to GitHub, Vercel will auto-redeploy

---

## 15. Quick Reference: All URLs

Once deployed, bookmark these:

| Purpose | URL |
|---|---|
| Main Website | `https://www.daddysosocloset.com` |
| Tweapease Branch | `https://www.daddysosocloset.com/tweapease` |
| Abaam Branch | `https://www.daddysosocloset.com/abaam` |
| Staff Login | `https://www.daddysosocloset.com/auth/login` |
| Staff Dashboard | `https://www.daddysosocloset.com/dashboard` |
| Make a Sale | `https://www.daddysosocloset.com/dashboard/sales` |
| Inventory | `https://www.daddysosocloset.com/dashboard/inventory` |
| Sales History | `https://www.daddysosocloset.com/dashboard/receipts` |
| Admin Panel | `https://www.daddysosocloset.com/admin` |
| Analytics | `https://www.daddysosocloset.com/admin/analytics` |
| Products | `https://www.daddysosocloset.com/admin/products` |
| Staff Management | `https://www.daddysosocloset.com/admin/staff` |
| Edit Sales | `https://www.daddysosocloset.com/admin/sales-edit` |
| Site Settings | `https://www.daddysosocloset.com/admin/settings` |

---

## 🔐 Security Reminders

- Never share your `SUPABASE_SERVICE_ROLE_KEY` with anyone
- Use strong passwords for all staff accounts (min. 8 characters)
- Change passwords regularly from Admin → Staff → Change Password
- Only give admin credentials to the business owner

---

## 📞 Technical Support

If you get stuck, take a screenshot of the error and contact your developer or post on:
- [Supabase Discord](https://discord.supabase.com) for database issues
- [Vercel Support](https://vercel.com/support) for deployment issues
- [Next.js Discord](https://nextjs.org/discord) for code issues

---

*Daddy SoSo Closet — Fashion. Style. Elegance.* 🛍️
