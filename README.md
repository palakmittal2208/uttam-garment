# Uttam Garment –Exclusive Maxi Dresses Website

A modern, fully responsive e-commerce website for women's clothing built with **Python (Flask)**, **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 Light / Dark Theme | Toggle saved in `localStorage` with royal boutique colors |
| 📢 Announcement Ticker | Scrolling festive banner at top |
| 🔍 Live Search | Real-time product search across name, fabric, category |
| 🗂️ Smart Filters | Filter by category (Daily Wear, Wedding, Festive) and fabric (Cotton, Silk, etc.) |
| 🛍️ Add to Cart | Color + size selection with out-of-stock prevention |
| 🛒 Mini Cart Drawer | Slide-in cart with quantity controls and subtotal |
| 📦 WhatsApp Checkout | Manual address form + live location capture → auto-formatted WhatsApp order |
| 🔖 Order Reference ID | Auto-generated `#UG-XXXX` per order |
| 📍 Live Location | Browser geolocation → Google Maps link in WhatsApp order |
| 💬 Floating WhatsApp | Fixed inquiry button for general customer questions |
| 🔎 Product Zoom Modal | Click image to view large with thumbnail strip |
| 📐 Size Guide Modal | Detailed size chart with fit tips |
| ⭐ Reviews & Rating | 5-star selector + review submission form |
| ❓ FAQ Accordion | Common questions with smooth expand/collapse |
| 🔄 Return & Exchange | Policy accordion section |
| 📸 Instagram Gallery | Masonry-style grid with zoom |
| 📋 Click-to-Copy | Copy address, phone, and email instantly |
| 🗺️ Google Maps Button | Opens directions to store |
| 🏷️ Discount Tags | Auto-calculated % OFF, New Arrival, Special, Best Seller badges |
| 📱 Fully Responsive | Mobile, tablet, laptop optimized |
| 📤 Share Product | Web Share API with clipboard fallback |
| 🚀 Render Ready | `gunicorn` included for one-click deployment |

---

## 🗂️ Project Structure

```
uttam-garment/
├── app.py                  # Flask backend + product data
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── templates/
│   └── index.html          # Main page template
└── static/
    ├── style.css           # All styles (light/dark theme)
    └── script.js           # All interactive logic
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.9+
- pip

### Steps

```bash
# 1. Clone or download the project
cd uttam-garment

# 2. Create a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the development server
python app.py
```

Open your browser at: **http://localhost:5000**

---

## ☁️ Deploy on Render (Free)

### Step 1 – Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit – Uttam Garment"
git remote add origin https://github.com/YOUR_USERNAME/uttam-garment.git
git push -u origin main
```

### Step 2 – Create a Web Service on Render
1. Go to [https://render.com](https://render.com) and sign in.
2. Click **New → Web Service**.
3. Connect your GitHub repository.
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |
| **Instance Type** | Free |

5. Click **Create Web Service**.

Render will automatically build and deploy. Your site will be live at `https://your-app.onrender.com`.

### Optional Environment Variables on Render
| Variable | Description |
|---|---|
| `SECRET_KEY` | A random secret string for Flask sessions |
| `PORT` | Render sets this automatically (do not override) |

---

## 🛠️ Customisation Guide

### Update Shop Details
Edit `templates/index.html`:
- **Address** → search for `shopAddress`
- **Phone** → search for `shopPhone`
- **Email** → search for `shopEmail`
- **WhatsApp Number** → search for `wa.me/` (update all occurrences)
- **Social Links** → Instagram / Facebook `href` attributes

### Add / Edit Products
Open `app.py` and add a new dictionary to the `PRODUCTS` list:

```python
{
    "id": 13,                          # unique integer
    "name": "New Kurti Name",
    "category": "Daily Wear",          # Daily Wear | Festive | Wedding
    "fabric": "Cotton",                # Cotton | Silk | Rayon | etc.
    "occasion": "Casual",
    "description": "Product description here.",
    "wash_care": "Machine wash cold.",
    "mrp": 1200,                       # Original MRP (shown with strikethrough)
    "price": 699,                      # Discounted price
    "images": [
        "https://your-image-url.com/photo.jpg"
    ],
    "colors": ["Pink", "Blue"],
    "sizes": [
        {"size": "S",  "qty": 5},
        {"size": "M",  "qty": 0},      # qty 0 → shows "Out of Stock"
        {"size": "L",  "qty": 3}
    ],
    "badge": "New Arrival"             # "New Arrival" | "Special" | "Best Seller" | ""
}
```

### Change WhatsApp Order Number
In `static/script.js`, find:
```js
const waNumber = "91XXXXXXXXXX";
```
Replace with your actual WhatsApp-enabled number in international format (no `+` or spaces).

### Change Theme Colors
In `static/style.css`, update the `:root` block for light mode or `[data-theme="dark"]` block for dark mode.

---

## 📦 Scaling to 1000+ Products

The `PRODUCTS` list in `app.py` can hold any number of products. For production at scale:

1. **Move to a database** (SQLite → PostgreSQL on Render):
   ```python
   # Replace PRODUCTS list with SQLAlchemy queries
   from flask_sqlalchemy import SQLAlchemy
   ```
2. **Add pagination** to the `/api/products` endpoint.
3. **Host images** on Cloudinary or AWS S3 for fast loading.
4. **Add admin panel** (Flask-Admin) to manage products via a UI.

---

## 🔒 Security Notes

- Set a strong `SECRET_KEY` environment variable in production.
- For real payment processing, integrate Razorpay or Cashfree.
- Add CSRF protection for forms using Flask-WTF.

---

## 📄 License

© 2026 Uttam Garment. All Rights Reserved.
