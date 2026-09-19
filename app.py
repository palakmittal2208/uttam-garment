from flask import Flask, render_template, jsonify, request, session
import json, uuid, datetime, os, sqlite3

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "uttam-garment-secret-2026")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "MP07@sethhukumchand")
DB_PATH = os.path.join(os.path.dirname(__file__), "uttam.db")

# ---------------------------------------------------------------------------
# DATABASE SETUP
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            sku         TEXT,
            name        TEXT NOT NULL,
            category    TEXT DEFAULT '',
            fabric      TEXT DEFAULT '',
            occasion    TEXT DEFAULT '',
            description TEXT DEFAULT '',
            wash_care   TEXT DEFAULT '',
            price       REAL NOT NULL,
            mrp         REAL NOT NULL,
            images      TEXT DEFAULT '[]',
            colors      TEXT DEFAULT '[]',
            sizes       TEXT DEFAULT '[]',
            badge       TEXT DEFAULT ''
        )
    """)
    # Seed initial products if table is empty
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        seed_products(c)
    conn.commit()
    conn.close()

def seed_products(cursor):
    SEED = [
        (1,"Floral Cotton Kurti","Daily Wear","Cotton","Casual","Breathable 100% pure cotton kurti with delicate floral prints. Perfect for everyday comfort and style.","Machine wash cold, gentle cycle. Do not bleach. Tumble dry low.",549,999,'["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80","https://images.unsplash.com/photo-1594938298603-c8148c4b7b49?w=600&q=80"]','["Pink","Yellow","White"]','[{"size":"S","qty":5},{"size":"M","qty":8},{"size":"L","qty":3},{"size":"XL","qty":0}]',"New Arrival"),
        (2,"Silk Party Saree","Festive","Silk","Wedding","Luxurious Banarasi silk saree with gold zari border. A timeless piece for weddings and grand celebrations.","Dry clean only. Store in muslin cloth.",2999,4999,'["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80","https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"]','["Red","Royal Blue","Green"]','[{"size":"Free Size","qty":10}]',"Special"),
        (3,"Embroidered Anarkali Suit","Festive","Georgette","Festive","Elegant georgette Anarkali with heavy thread embroidery and matching dupatta. A regal look for festivities.","Hand wash cold or dry clean. Iron on low heat.",1499,2499,'["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"]','["Maroon","Teal","Navy"]','[{"size":"S","qty":4},{"size":"M","qty":6},{"size":"L","qty":4},{"size":"XL","qty":2}]',"Best Seller"),
        (4,"Casual Palazzo Set","Daily Wear","Cotton","Casual","Comfortable cotton palazzo set with matching top. Ideal for relaxed outings and home wear.","Machine wash cold. Tumble dry low.",749,1299,'["https://images.unsplash.com/photo-1594938298603-c8148c4b7b49?w=600&q=80"]','["Peach","Lavender","Mint"]','[{"size":"M","qty":10},{"size":"L","qty":7},{"size":"XL","qty":5},{"size":"XXL","qty":0}]',"New Arrival"),
        (5,"Wedding Lehenga Choli","Wedding","Silk","Wedding","Stunning bridal lehenga with intricate zardozi work. Makes you the star of every wedding.","Dry clean only. Handle with care.",5499,8999,'["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"]','["Bridal Red","Pink Gold","Off White"]','[{"size":"38","qty":3},{"size":"40","qty":4},{"size":"42","qty":2},{"size":"44","qty":0}]',"Special"),
        (6,"Rayon Printed Maxi Dress","Daily Wear","Rayon","Casual","Flowy rayon maxi dress with vibrant tropical prints. Stay stylish and cool all day long.","Machine wash cold, gentle. Do not wring.",849,1499,'["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"]','["Orange","Blue","Multi"]','[{"size":"S","qty":6},{"size":"M","qty":9},{"size":"L","qty":5},{"size":"XL","qty":3}]',""),
        (7,"Pure Cotton Salwar Suit","Daily Wear","Cotton","Casual","Classic cotton salwar suit with subtle block print. Easy to wear, easy to love.","Machine wash cold.",899,1599,'["https://images.unsplash.com/photo-1594938298603-c8148c4b7b49?w=600&q=80"]','["Sky Blue","White","Beige"]','[{"size":"S","qty":3},{"size":"M","qty":5},{"size":"L","qty":8},{"size":"XL","qty":4}]',"Best Seller"),
        (8,"Festive Silk Dupatta","Festive","Silk","Festive","Pure silk dupatta with handwoven border. The perfect accessory to elevate any ethnic outfit.","Dry clean only.",449,799,'["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"]','["Golden","Crimson","Emerald"]','[{"size":"Free Size","qty":15}]',"Special"),
        (9,"Linen Kurti with Pants","Daily Wear","Linen","Office","Smart linen kurti with matching pants. Perfect for office wear and formal casual occasions.","Machine wash cold, gentle cycle. Iron medium heat.",1099,1799,'["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"]','["Charcoal","Dusty Pink","Olive"]','[{"size":"S","qty":4},{"size":"M","qty":7},{"size":"L","qty":5},{"size":"XL","qty":2}]',"New Arrival"),
        (10,"Heavy Embroidery Saree","Wedding","Silk","Wedding","Rich handloom silk saree adorned with gold embroidery. A must-have for wedding occasions.","Dry clean only. Store folded with camphor.",4299,6999,'["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"]','["Deep Red","Royal Purple","Peacock Green"]','[{"size":"Free Size","qty":7}]',"Special"),
        (11,"Chiffon Sharara Set","Festive","Chiffon","Festive","Dreamy chiffon sharara set with sequin detailing. Look ethereal at every celebration.","Hand wash cold. Dry in shade.",1799,2999,'["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"]','["Rose Gold","Powder Blue","Ivory"]','[{"size":"S","qty":5},{"size":"M","qty":4},{"size":"L","qty":3},{"size":"XL","qty":0}]',"New Arrival"),
        (12,"Printed Wrap Dress","Daily Wear","Rayon","Casual","Versatile printed wrap dress that flatters every body type. Wear it day or night.","Machine wash cold. Do not bleach.",699,1199,'["https://images.unsplash.com/photo-1594938298603-c8148c4b7b49?w=600&q=80"]','["Floral Mix","Black White","Terracotta"]','[{"size":"S","qty":8},{"size":"M","qty":10},{"size":"L","qty":6},{"size":"XL","qty":4}]',"Best Seller"),
    ]
    for row in SEED:
        cursor.execute("""
            INSERT INTO products (id, name, category, fabric, occasion, description, wash_care,
                                  price, mrp, images, colors, sizes, badge)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (row[0], row[1], row[2], row[3], row[4], row[5], row[6],
              row[7], row[8], row[9], row[10], row[11], row[12]))

def row_to_product(row):
    """Convert a sqlite3.Row to a plain dict with parsed JSON fields."""
    d = dict(row)
    d["images"] = json.loads(d.get("images") or "[]")
    d["colors"] = json.loads(d.get("colors") or "[]")
    d["sizes"]  = json.loads(d.get("sizes")  or "[]")
    # Ensure image list always has at least one placeholder
    if not d["images"]:
        d["images"] = ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"]
    d["mrp"]   = d.get("mrp") or d["price"]
    d["badge"] = d.get("badge") or ""
    d["sku"]   = d.get("sku") or ""
    return d

def get_all_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products ORDER BY id").fetchall()
    conn.close()
    return [row_to_product(r) for r in rows]

# Initialize DB on startup
init_db()

# ---------------------------------------------------------------------------
# In-memory order counter
# ---------------------------------------------------------------------------
order_counter = {"value": 1000}

def get_next_order_id():
    order_counter["value"] += 1
    return f"#UG-{order_counter['value']}"

# ---------------------------------------------------------------------------
# REVIEWS (in-memory)
# ---------------------------------------------------------------------------
REVIEWS_LIST = [
    {
        "stars": "⭐⭐⭐⭐⭐",
        "text": "Fabric quality bohot achhi hai, jaise photo mein dikhaya tha bilkul waisa hi aaya hai. Fitting bhi ekdum perfect hai!",
        "name": "Priya Sharma",
        "city": "Gwalior"
    },
    {
        "stars": "⭐⭐⭐⭐⭐",
        "text": "Material ekdum soft hai aur pehnne mein bohot comfortable hai. Delivery bhi time par mil gayi thi. Thank you Uttam Garment!",
        "name": "Meera R.",
        "city": "Delhi"
    },
    {
        "stars": "⭐⭐⭐⭐⭐",
        "text": "Quality superb hai! Maine pehli baar order kiya tha aur experience bohot acha raha. Sabhi ko zaroor recommend karungi.",
        "name": "Ananya K.",
        "city": "Morena"
    }
]

# ---------------------------------------------------------------------------
# Routes – Public
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    products = get_all_products()
    categories = sorted(set(p["category"] for p in products if p["category"]))
    fabrics    = sorted(set(p["fabric"]    for p in products if p["fabric"]))
    is_admin   = session.get("admin", False)
    return render_template("index.html",
                           products=products,
                           categories=categories,
                           fabrics=fabrics,
                           reviews=REVIEWS_LIST,
                           is_admin=is_admin)

@app.route("/api/products")
def api_products():
    return jsonify(get_all_products())

@app.route("/api/product/<int:pid>")
def api_product(pid):
    conn = get_db()
    row = conn.execute("SELECT * FROM products WHERE id=?", (pid,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row_to_product(row))

@app.route("/api/order", methods=["POST"])
def api_order():
    order_id = get_next_order_id()
    return jsonify({"order_id": order_id, "timestamp": datetime.datetime.now().isoformat()})

@app.route("/api/review", methods=["POST"])
def api_review():
    data   = request.get_json(silent=True) or {}
    name   = data.get("name", "").strip()
    city   = data.get("city", "").strip()
    rating = int(data.get("rating", 5))
    text   = data.get("text", "").strip()
    if not name or not text:
        return jsonify({"success": False, "message": "Name and review text are required."}), 400
    REVIEWS_LIST.insert(0, {"stars": "⭐" * rating, "text": text, "name": name, "city": city})
    return jsonify({"success": True, "message": "Thank you for your review!"})

# ---------------------------------------------------------------------------
# Routes – Admin Auth
# ---------------------------------------------------------------------------

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    if data.get("password") == ADMIN_PASSWORD:
        session["admin"] = True
        return jsonify({"success": True, "message": "Logged in as admin."})
    return jsonify({"success": False, "message": "Incorrect password."}), 401

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("admin", None)
    return jsonify({"success": True, "message": "Logged out."})

@app.route("/api/admin/status")
def admin_status():
    return jsonify({"admin": session.get("admin", False)})

# ---------------------------------------------------------------------------
# Routes – Admin Product Management
# ---------------------------------------------------------------------------

def admin_required():
    if not session.get("admin"):
        return jsonify({"success": False, "message": "Unauthorized. Admin login required."}), 401
    return None

@app.route("/api/admin/product", methods=["POST"])
def admin_add_product():
    err = admin_required()
    if err: return err

    data = request.get_json(silent=True) or {}

    name  = (data.get("name") or "").strip()
    price = data.get("price")
    if not name:
        return jsonify({"success": False, "message": "Product name is required."}), 400
    try:
        price = float(price)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "A valid price is required."}), 400

    mrp         = data.get("mrp") or price
    sku         = (data.get("sku") or "").strip()
    category    = (data.get("category") or "").strip()
    fabric      = (data.get("fabric") or "").strip()
    occasion    = (data.get("occasion") or "").strip()
    description = (data.get("description") or "").strip()
    wash_care   = (data.get("wash_care") or "").strip()
    badge       = (data.get("badge") or "").strip()

    # Images: accept comma-separated string or list
    raw_images = data.get("images") or data.get("image_url") or []
    if isinstance(raw_images, str):
        raw_images = [u.strip() for u in raw_images.split(",") if u.strip()]
    images_json = json.dumps(raw_images)

    # Colors: accept "Red-5, Blue-3, Green" or list of {color, stock} or plain list
    raw_colors = data.get("colors") or []
    if isinstance(raw_colors, str):
        # Parse "Red-5, Blue, Green-0" format → list of color names (stock is ignored for simple list)
        parsed_colors = []
        for part in raw_colors.split(","):
            part = part.strip()
            if "-" in part:
                segments = part.rsplit("-", 1)
                color_name = segments[0].strip()
                if color_name:
                    parsed_colors.append(color_name)
            elif part:
                parsed_colors.append(part)
        raw_colors = parsed_colors
    colors_json = json.dumps(raw_colors)

    # Sizes: accept "S-5, M-2, 32-4, Free Size-10" format or list of {size, qty}
    raw_sizes = data.get("sizes") or []
    if isinstance(raw_sizes, str):
        parsed_sizes = []
        for part in raw_sizes.split(","):
            part = part.strip()
            if not part:
                continue
            if "-" in part:
                segments = part.rsplit("-", 1)
                size_name = segments[0].strip()
                try:
                    qty = int(segments[1].strip())
                except ValueError:
                    qty = 0
                if size_name:
                    parsed_sizes.append({"size": size_name, "qty": qty})
            else:
                parsed_sizes.append({"size": part, "qty": 0})
        raw_sizes = parsed_sizes
    sizes_json = json.dumps(raw_sizes)

    try:
        mrp = float(mrp)
    except (TypeError, ValueError):
        mrp = price

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO products (sku, name, category, fabric, occasion, description, wash_care,
                              price, mrp, images, colors, sizes, badge)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (sku, name, category, fabric, occasion, description, wash_care,
          price, mrp, images_json, colors_json, sizes_json, badge))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": f"Product '{name}' added.", "id": new_id}), 201

@app.route("/api/admin/product/<int:pid>", methods=["DELETE"])
def admin_delete_product(pid):
    err = admin_required()
    if err: return err

    conn = get_db()
    row = conn.execute("SELECT id, name FROM products WHERE id=?", (pid,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "message": "Product not found."}), 404
    name = row["name"]
    conn.execute("DELETE FROM products WHERE id=?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Product '{name}' deleted."})

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
