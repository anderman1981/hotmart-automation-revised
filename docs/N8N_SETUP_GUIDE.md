# N8N Setup Guide

## 🚀 Quick Setup for Hotmart System

### 📋 Option 1: Quick Start with Browser Setup

1. **Access N8N Dashboard**
   ```
   URL: http://localhost:5679
   Email: afiliados@hotmart.com  
   Password: Hotmart2024!
   ```

2. **Create Account** (First time)
   - Click "Create an Account"
   - Use email: `afiliados@hotmart.com`
   - Set password: `Hotmart2024!`

3. **Enable User Management**
   ```
   Settings → User Management → Enable
   ```

### 📋 Option 2: Docker Environment Variables

Create `.env` file:
```env
# N8N Configuration
VP_N8N_USER=afiliados@hotmart.com
VP_N8N_PASSWORD=Hotmart2024!
N8N_BASIC_AUTH_ACTIVE=true
N8N_USER_MANAGEMENT_DISABLED=false
```

### 🔗 Option 3: Import Pre-configured Workflow

1. Import the workflow:
   ```bash
   # Access N8N at http://localhost:5679
   # Click "Import from File"
   # Upload: n8n-workflows/user-setup.json
   ```

2. Execute workflow to setup users automatically

---

## 📊 Affiliation Process Guide

### 🔑 Step 1: Register as Hotmart Affiliate

1. Go to [Hotmart Afiliados](https://afiliados.hotmart.com)
2. Register with email: `afiliados@hotmart.com`
3. Complete your profile and payment information
4. Wait for approval (usually 24-48 hours)

### 🔑 Step 2: Find Products in System

1. Login to Hotmart dashboard
2. Browse available products
3. Click the 👁️ eye icon on products to see details
4. Note the Hotmart ID (e.g., "HM-R94668718U")

### 🔑 Step 3: Activate Products as Affiliate

1. In Hotmart affiliates dashboard:
   - Search product by ID
   - Click "Promote Product"
   - Generate your unique affiliate link
   - Copy your link (will have your ref code)

### 🔑 Step 4: Update System Configuration

1. In our system, update affiliate URLs:
   ```sql
   UPDATE products 
   SET affiliate_url = 'YOUR_UNIQUE_LINK',
       affiliate_status = 'active',
       affiliate_activated_at = NOW()
   WHERE hotmart_id = 'PRODUCT_HOTMART_ID';
   ```

---

## ⚡ Testing Your Setup

### ✅ Test Product URLs
```bash
# Test API response
curl http://localhost:4123/api/products/{id}/details

# Check affiliate status
curl http://localhost:4123/api/affiliate/metrics
```

### ✅ Test Dashboard
1. Visit http://localhost:4124
2. Navigate to Products page  
3. Click 👁️ on any product
4. Verify links work and affiliate status shows

---

## 🔧 Troubleshooting

### ❌ N8N Access Issues
```bash
# Check container status
docker logs hotmart_n8n

# Restart if needed
docker restart hotmart_n8n
```

### ❌ Affiliate Links Not Working
1. Verify Hotmart account is approved
2. Check affiliate status in database
3. Ensure ref parameter is correct
4. Test link manually in browser

### ❌ Product Details Not Loading
1. Check API endpoints are responding
2. Verify database connection
3. Check browser console for errors
4. Test with curl commands above

---

## 📞 Support

For issues with:
- **N8N Setup**: Check Docker logs and configurations
- **Hotmart Affiliation**: Contact Hotmart support
- **Our System**: Check API responses and database
- **URL Generation**: Verify product IDs and formats

---

## 🎯 Success Checklist

- [ ] N8N accessible at http://localhost:5679
- [ ] User account created and logged in  
- [ ] Basic authentication enabled
- [ ] User management activated
- [ ] Product details modal working
- [ ] Affiliate status correctly displayed
- [ ] URLs properly formatted
- [ ] Links tested and working

---

*Follow this guide to successfully set up the affiliate system and start generating revenue through Hotmart product promotions.*