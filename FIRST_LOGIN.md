# 🔐 Create Your First CEO Login

Follow these steps in order to create your first admin account.

---

## ✅ Step 1: Run Database Schema

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **ojnxpyegsqppmhragija**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Open the file: `database/schema.sql`
6. **Copy ALL the content** (Ctrl+A, Ctrl+C)
7. **Paste into Supabase SQL Editor**
8. Click **"Run"** (or press Ctrl+Enter)
9. Wait for success message: ✅ "Database schema setup completed successfully!"

**Expected Result:**
```
status: Database schema setup completed successfully!

roles: 5
employees: 0
tasks: 0
recurring_tasks: 0
self_tasks: 0
leaves: 0
task_history: 0
```

---

## ✅ Step 2: Create Auth User

1. Still in Supabase Dashboard
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** tab
4. Click **"Add user"** → **"Create new user"**
5. Fill in the form:
   - **Email:** `admin@anuranan.com`
   - **Password:** `Admin@123456`
   - ⚠️ **IMPORTANT:** Check ✅ **"Auto Confirm User"**
6. Click **"Create user"**
7. **COPY the User UUID** (looks like: `a1b2c3d4-e5f6-7890-1234-567890abcdef`)
   - You'll need this in the next step!

---

## ✅ Step 3: Link Auth User to Employee Record

1. Go back to **"SQL Editor"**
2. Click **"New Query"**
3. Open the file: `database/create-first-user.sql`
4. **Replace** `YOUR_AUTH_USER_UUID_HERE` with the UUID you copied
5. Make sure the email matches: `admin@anuranan.com`
6. Click **"Run"**

**The SQL should look like this (with your actual UUID):**
```sql
INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
VALUES (
  'a1b2c3d4-e5f6-7890-1234-567890abcdef',  -- Your actual UUID here
  'Admin CEO', 
  'admin@anuranan.com',
  (SELECT id FROM roles WHERE name = 'CEO'),
  TRUE
);
```

**Expected Result:**
```
CEO user created successfully! You can now login with:
  Email: admin@anuranan.com
  Password: Admin@123456
```

---

## ✅ Step 4: Login to Your Portal

1. Go to: http://localhost:3000
2. **Login with:**
   - **Email:** `admin@anuranan.com`
   - **Password:** `Admin@123456`
3. Click **"Sign In"**
4. 🎉 You should see the Dashboard!

---

## 🔧 Troubleshooting

### "Invalid login credentials"
- Check that you used the same email in both Authentication and SQL
- Make sure you checked "Auto Confirm User" when creating the auth user
- Verify the auth_user_id in SQL matches the UUID from Authentication

### "User not found"
- Run the `create-first-user.sql` script again
- Check the employees table:
  ```sql
  SELECT * FROM employees WHERE email = 'admin@anuranan.com';
  ```

### "Cannot connect to database"
- Check that backend is running: `cd backend; npm run dev`
- Check that `.env` file has correct Supabase credentials
- Verify SUPABASE_SERVICE_ROLE_KEY is set in `backend/.env`

### "Page not loading"
- Check that frontend is running: `cd frontend; npm run dev`
- Try hard refresh: `Ctrl + Shift + R`

---

## 📝 Your Credentials

**Login URL:** http://localhost:3000

**Email:** admin@anuranan.com  
**Password:** Admin@123456  
**Role:** CEO (Full Admin Access)

⚠️ **Important:** Change this password after first login!

---

## 🚀 What's Next?

After logging in, you can:

1. ✅ View your dashboard
2. ✅ Create tasks for employees
3. ✅ Add more employees (CEO only)
4. ✅ Set up recurring tasks
5. ✅ View reports and analytics

Need to add more employees? Go to the Admin Panel in the dashboard!

---

**Need Help?** Check the main README.md for full documentation.
