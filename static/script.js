/* =========================================================
   UTTAM GARMENT – script.js
   Full interactive logic
   ========================================================= */

"use strict";

// Force scroll to top on page load/refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

/* ─── State & Pagination Configuration ─────────────────── */
let cart = JSON.parse(localStorage.getItem("ug_cart") || "[]");
let selectedRating = 0;
let capturedLocation = null;
const ITEMS_PER_PAGE = 24; // Ek page par 24 products
let currentPage = 1;      // Current page tracker

/* ─── DOM Ready ─────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem("ug_theme") || "light");
  renderCart();
  initThemeToggle();
  initNavHamburger();
  initSearchBar();
  initFilterTabs();
  initProductInteractions();
  initAccordions();
  initReviewForm();
  initStarSelector();
  initShareButtons();
  initCheckoutForm();
  updateCartUI();
  filterProducts(); // Page load hote hi run hoga
});

/* ════════════════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.querySelector("#themeToggle i");
  if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}
function initThemeToggle() {
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("ug_theme", next);
  });
}

/* ════════════════════════════════════════════════════════
   NAV HAMBURGER
   ════════════════════════════════════════════════════════ */
function initNavHamburger() {
  const btn = document.getElementById("hamburger");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
}

/* ════════════════════════════════════════════════════════
   SEARCH BAR
   ════════════════════════════════════════════════════════ */
function initSearchBar() {
  const toggle   = document.getElementById("searchToggle");
  const wrap     = document.getElementById("searchBarWrap");
  const input    = document.getElementById("searchInput");
  const closeBtn = document.getElementById("searchClose");
  if (!toggle || !wrap || !input) return;

  toggle.addEventListener("click", () => {
    wrap.classList.toggle("open");
    if (wrap.classList.contains("open")) input.focus();
  });
  closeBtn?.addEventListener("click", () => {
    wrap.classList.remove("open");
    input.value = "";
    currentPage = 1;
    filterProducts();
  });

  input.addEventListener("input", () => {
    currentPage = 1; // Search karne par wapas Page 1 par jayein
    filterProducts();
    if (input.value.trim()) {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      document.querySelector('.filter-tab[data-filter="all"]')?.classList.add("active");
    }
  });
}

/* ════════════════════════════════════════════════════════
   FILTERS & PAGINATION LOGIC
   ════════════════════════════════════════════════════════ */
function initFilterTabs() {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const input = document.getElementById("searchInput");
      if (input) input.value = "";
      
      currentPage = 1; // Tab change hone par wapas Page 1 par chale jayein
      filterProducts();
    });
  });
}

function filterProducts() {
  const query  = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const active = document.querySelector(".filter-tab.active")?.dataset.filter || "all";
  const cards  = document.querySelectorAll(".product-card");
  
  let matchedCards = [];

  cards.forEach(card => {
    const name     = card.dataset.name     || "";
    const category = card.dataset.category || "";
    const fabric   = card.dataset.fabric   || "";
    const occasion = card.dataset.occasion || "";

    const matchSearch = !query ||
      name.includes(query) ||
      category.toLowerCase().includes(query) ||
      fabric.toLowerCase().includes(query) ||
      occasion.toLowerCase().includes(query);

    const matchFilter = active === "all" ||
      category === active ||
      fabric   === active ||
      occasion === active;

    const show = matchSearch && matchFilter;
    
    if (show) {
      matchedCards.push(card);
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });

  // Handle Pagination on matched cards
  const totalPages = Math.ceil(matchedCards.length / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = 1;

  cards.forEach(card => card.style.display = "none"); // Pehle sabhi ko hide karein

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentBatch = matchedCards.slice(start, end);

  currentBatch.forEach(card => card.style.display = "flex"); // Sirf current batch dikhayein

  const noResultsEl = document.getElementById("noResults");
  if (noResultsEl) {
    noResultsEl.style.display = matchedCards.length === 0 ? "flex" : "none";
  }
  
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById("paginationContainer");
  if (!container) return;
  container.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `filter-tab ${i === currentPage ? 'active' : ''}`;
    btn.style.padding = "6px 14px";
    btn.style.fontSize = "0.85rem";
    btn.onclick = () => {
      currentPage = i;
      filterProducts();
      const productsSection = document.getElementById("products");
      if (productsSection) {
        window.scrollTo({ top: productsSection.offsetTop - 50, behavior: 'smooth' });
      }
    };
    container.appendChild(btn);
  }
}

/* ════════════════════════════════════════════════════════
   PRODUCT CARD INTERACTIONS (color & size chips)
   ════════════════════════════════════════════════════════ */
function initProductInteractions() {
  document.querySelectorAll(".color-options").forEach(group => {
    group.querySelectorAll(".color-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        group.querySelectorAll(".color-chip").forEach(c => c.classList.remove("selected"));
        chip.classList.add("selected");
      });
    });
  });

  document.querySelectorAll(".size-options").forEach(group => {
    group.querySelectorAll(".size-chip:not(.out-of-stock)").forEach(chip => {
      chip.addEventListener("click", () => {
        group.querySelectorAll(".size-chip").forEach(s => s.classList.remove("selected"));
        chip.classList.add("selected");
      });
    });
  });

  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const pid  = parseInt(card.dataset.id);

      const selectedColor = card.querySelector(".color-chip.selected")?.dataset.color || "";
      const sizeChip      = card.querySelector(".size-chip.selected");

      if (!sizeChip) {
        showToast("Please select a size.");
        return;
      }
      if (sizeChip.dataset.qty === "0") {
        showToast("Selected size is out of stock.");
        return;
      }

      const item = {
        id:    pid,
        name:  btn.dataset.name,
        price: parseInt(btn.dataset.price),
        img:   btn.dataset.img,
        color: selectedColor,
        size:  sizeChip.dataset.size,
        qty:   1
      };

      addToCart(item);
      showToast(`${item.name} added to cart! 🛍️`);
      btn.innerHTML = '<i class="fas fa-check"></i> Added!';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-shopping-bag"></i> Add to Cart'; }, 1800);
    });
  });
}

/* ════════════════════════════════════════════════════════
   CART
   ════════════════════════════════════════════════════════ */
function addToCart(item) {
  const key = `${item.id}-${item.color}-${item.size}`;
  const existing = cart.find(c => `${c.id}-${c.color}-${c.size}` === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, key });
  }
  saveCart();
  updateCartUI();
  renderCart();
}

function removeFromCart(key) {
  cart = cart.filter(c => c.key !== key);
  saveCart();
  updateCartUI();
  renderCart();
}

function changeQty(key, delta) {
  const item = cart.find(c => c.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(key);
    return;
  }
  saveCart();
  updateCartUI();
  renderCart();
}

function saveCart() {
  localStorage.setItem("ug_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = total;
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const footer    = document.getElementById("cartFooter");
  const empty     = document.getElementById("cartEmpty");
  const totalEl   = document.getElementById("cartTotal");
  if (!container) return;

  container.querySelectorAll(".cart-item").forEach(el => el.remove());

  if (cart.length === 0) {
    empty.style.display = "block";
    footer.style.display = "none";
    return;
  }

  empty.style.display = "none";
  footer.style.display = "flex";

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.dataset.key = item.key;
    div.innerHTML = `
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-meta">${item.color} · Size ${item.size}</p>
        <p class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.key}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" title="Remove"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>`;
    container.appendChild(div);
  });

  totalEl.textContent = `₹${subtotal.toLocaleString()}`;
}

function toggleCart() {
  document.getElementById("cartDrawer")?.classList.toggle("open");
  document.getElementById("cartOverlay")?.classList.toggle("open");
}

document.getElementById("cartToggle")?.addEventListener("click", toggleCart);

/* ════════════════════════════════════════════════════════
   CHECKOUT
   ════════════════════════════════════════════════════════ */
function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }
  toggleCart();
  openModal("checkoutOverlay");
}

function captureLocation() {
  const btn    = document.getElementById("locationBtn");
  const status = document.getElementById("locationStatus");
  if (!navigator.geolocation) {
    status.textContent = "Geolocation not supported by your browser.";
    return;
  }
  status.textContent = "Fetching location…";
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      capturedLocation = { lat, lng };
      btn.classList.add("got");
      btn.innerHTML = '<i class="fas fa-check-circle"></i> Location Captured!';
      status.textContent = `📍 ${lat}, ${lng}`;
      btn.disabled = false;
    },
    () => {
      status.textContent = "Could not get location. Please try again or enter address manually.";
      btn.disabled = false;
    }
  );
}

function initCheckoutForm() {
  document.getElementById("checkoutForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const name  = document.getElementById("cName").value.trim();
    const phone = document.getElementById("cPhone").value.trim();
    const house = document.getElementById("cHouse").value.trim();
    const area  = document.getElementById("cArea").value.trim();
    const city  = document.getElementById("cCity").value.trim();
    const pin   = document.getElementById("cPin").value.trim();
    const state = document.getElementById("cState").value.trim();

    if (!name || !phone || !house || !area || !city || !pin || !state) {
      showToast("Please fill all required fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      showToast("Please enter a valid 10-digit phone number.");
      return;
    }

    let orderId = "#UG-" + Math.floor(1000 + Math.random() * 9000);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart })
      });
      const data = await res.json();
      if (data.order_id) orderId = data.order_id;
    } catch (_) {}

    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const itemLines = cart.map(c =>
      `▪ ${c.name} (${c.color}, Size: ${c.size}) × ${c.qty} = ₹${(c.price * c.qty).toLocaleString()}`
    ).join("\n");

    const locationLine = capturedLocation
      ? `📍 Location: https://maps.google.com/?q=${capturedLocation.lat},${capturedLocation.lng}`
      : "📍 Location: (not shared)";

    const message = `
🛍️ *NEW ORDER – Uttam Garment*
━━━━━━━━━━━━━━━━━━━━━
🔖 Order ID: *${orderId}*

👤 *Customer Details*
Name: ${name}
Phone: ${phone}
Address: ${house}, ${area}, ${city} – ${pin}, ${state}
${locationLine}

🛒 *Items Ordered*
${itemLines}

💰 Subtotal: ₹${subtotal.toLocaleString()}
Free Delivery till ₹500! 🚚

Please confirm order & share payment details.
`.trim();

    const waNumber = "919300243660";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    cart = [];
    saveCart();
    updateCartUI();
    renderCart();
    closeModal("checkoutOverlay");
    document.getElementById("checkoutForm").reset();
    capturedLocation = null;
    document.getElementById("locationBtn").classList.remove("got");
    document.getElementById("locationBtn").innerHTML = '<i class="fas fa-map-pin"></i> Share Live Location / Pin on Google Maps';
    document.getElementById("locationStatus").textContent = "";

    showToast(`Order ${orderId} placed! Opening WhatsApp…`);
    setTimeout(() => window.open(waUrl, "_blank"), 800);
  });
}

/* ════════════════════════════════════════════════════════
   MODALS
   ════════════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id)?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.open").forEach(o => closeModal(o.id));
    document.getElementById("cartDrawer")?.classList.remove("open");
    document.getElementById("cartOverlay")?.classList.remove("open");
    document.body.style.overflow = "";
  }
});

function openZoom(pid) {
  const product = window.PRODUCTS.find(p => p.id === pid);
  if (!product) return;

  const img    = document.getElementById("zoomImg");
  const info   = document.getElementById("zoomInfo");
  const thumbs = document.getElementById("zoomThumbs");

  img.src = product.images[0];
  img.alt = product.name;

  info.innerHTML = `
    <h3>${product.name}</h3>
    <p>${product.description}</p>
    <p style="margin-top:8px;font-size:.78rem;color:var(--text3)">🧺 ${product.wash_care}</p>
  `;

  thumbs.innerHTML = product.images.map((src, i) =>
    `<img src="${src}" alt="${product.name} ${i+1}" class="${i===0?'active':''}" onclick="setZoomImg('${src}', this)" />`
  ).join("");

  openModal("zoomOverlay");
}
function setZoomImg(src, thumbEl) {
  document.getElementById("zoomImg").src = src;
  document.querySelectorAll("#zoomThumbs img").forEach(t => t.classList.remove("active"));
  thumbEl.classList.add("active");
}

function openSizeGuide() {
  openModal("sizeGuideOverlay");
}

function openGalleryZoom(item) {
  const img = item.querySelector("img");
  if (!img) return;
  document.getElementById("galleryZoomImg").src = img.src;
  openModal("galleryZoomOverlay");
}

/* ════════════════════════════════════════════════════════
   ACCORDION
   ════════════════════════════════════════════════════════ */
function initAccordions() {
  document.querySelectorAll(".acc-head").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".acc-item.open").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ════════════════════════════════════════════════════════
   STAR RATING SELECTOR
   ════════════════════════════════════════════════════════ */
function initStarSelector() {
  const stars = document.querySelectorAll("#starSelect .star");
  stars.forEach(star => {
    star.addEventListener("mouseenter", () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener("mouseleave", ()  => highlightStars(selectedRating));
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.val);
      highlightStars(selectedRating);
    });
  });
}
function highlightStars(n) {
  document.querySelectorAll("#starSelect .star").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.val) <= n);
  });
}

/* ════════════════════════════════════════════════════════
   REVIEW FORM
   ════════════════════════════════════════════════════════ */
function initReviewForm() {
  document.getElementById("reviewForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const city = document.getElementById("reviewCity").value.trim();
    const text = document.getElementById("reviewText").value.trim();

    if (!name || !text || selectedRating === 0) {
      showToast("Please fill your name, rating & review.");
      return;
    }

    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, rating: selectedRating, text })
      });
    } catch (_) {}

    const grid = document.getElementById("reviewsGrid");
    const stars = "⭐".repeat(selectedRating);
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-stars">${stars}</div>
      <p class="review-text">"${text}"</p>
      <div class="review-author"><strong>${name}</strong>${city ? ` – ${city}` : ""}</div>
    `;
    grid.prepend(card);
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });

    document.getElementById("reviewForm").reset();
    selectedRating = 0;
    highlightStars(0);
    showToast("Thank you for your review! ⭐");
  });
}

/* ════════════════════════════════════════════════════════
   SHARE BUTTONS
   ════════════════════════════════════════════════════════ */
function initShareButtons() {
  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const name = btn.dataset.name;
      const url  = window.location.href;
      const text = `Check out this beautiful piece from Uttam Garment: ${name} – ${url}`;

      if (navigator.share) {
        navigator.share({ title: name, text, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(text).then(() => showToast("Product link copied! 📋")).catch(() => {
          showToast("Copy link from your browser's address bar.");
        });
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   COPY TO CLIPBOARD
   ════════════════════════════════════════════════════════ */
function copyText(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text.trim()).then(() => {
    btn.classList.add("copied");
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    showToast("Copied to clipboard! 📋");
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    }, 2200);
  }).catch(() => showToast("Could not copy. Please copy manually."));
}

/* ════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ════════════════════════════════════════════════════════
   STICKY NAVBAR SHADOW
   ════════════════════════════════════════════════════════ */
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (nav) nav.style.boxShadow = window.scrollY > 10 ? "0 4px 24px rgba(0,0,0,.15)" : "";
}, { passive: true });

/* ════════════════════════════════════════════════════════
   ADMIN PANEL
   ════════════════════════════════════════════════════════ */
function toggleAdminPanel() {
  const wrap = document.getElementById("adminPanelWrap");
  const btn  = document.getElementById("adminToggleBtn");
  if (!wrap) return;
  const isOpen = wrap.classList.toggle("open");
  btn.innerHTML = isOpen
    ? '<i class="fas fa-times"></i> Close Admin'
    : '<i class="fas fa-shield-alt"></i> Admin Panel';

  if (isOpen) {
    fetch("/api/admin/status")
      .then(r => r.json())
      .then(d => { if (d.admin) showAdminDashboard(); });
  }
}

async function adminLogin() {
  const pw  = (document.getElementById("adminPasswordInput")?.value || "").trim();
  const msg = document.getElementById("adminLoginMsg");
  if (!pw) { if (msg) msg.textContent = "Please enter the password."; return; }

  try {
    const res  = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    if (data.success) {
      showAdminDashboard();
      showToast("✅ Admin logged in!");
    } else {
      if (msg) { msg.textContent = data.message || "Incorrect password."; msg.className = "admin-msg error"; }
    }
  } catch (_) {
    if (msg) { msg.textContent = "Login failed. Please try again."; msg.className = "admin-msg error"; }
  }
}

async function adminLogout() {
  await fetch("/api/admin/logout", { method: "POST" });
  showToast("Logged out.");
  setTimeout(() => window.location.reload(), 800);
}

function showAdminDashboard() {
  const loginBox   = document.getElementById("adminLoginBox");
  const dashboard  = document.getElementById("adminDashboard");
  if (loginBox)  loginBox.style.display  = "none";
  if (dashboard) dashboard.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAdminPanel, 0);
});

function initAdminPanel() {
  const form = document.getElementById("adminAddProductForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("adminAddMsg");
    const fd  = new FormData(form);
    const payload = {};
    fd.forEach((val, key) => {
      const v = val.toString().trim();
      if (v) payload[key] = v;
    });

    if (!payload.name || !payload.price) {
      if (msg) { msg.textContent = "Product name and price are required."; msg.className = "admin-msg error"; }
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Adding…"; }

    try {
      const res  = await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (msg) { msg.textContent = `✅ ${data.message}`; msg.className = "admin-msg success"; }
        form.reset();
        showToast(`${payload.name} added! Refreshing…`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        if (msg) { msg.textContent = `❌ ${data.message}`; msg.className = "admin-msg error"; }
      }
    } catch (_) {
      if (msg) { msg.textContent = "❌ Network error. Please try again."; msg.className = "admin-msg error"; }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product'; }
    }
  });

  document.querySelectorAll(".admin-delete-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const pid  = btn.dataset.id;
      const name = btn.dataset.name;
      if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return;

      try {
        const res  = await fetch(`/api/admin/product/${pid}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          showToast(`🗑️ ${name} deleted!`);
          const card = btn.closest(".product-card");
          if (card) {
            card.style.transition = "opacity 0.3s";
            card.style.opacity = "0";
            setTimeout(() => card.remove(), 300);
          }
        } else {
          showToast(`Error: ${data.message}`);
        }
      } catch (_) {
        showToast("Delete failed. Please try again.");
      }
    });
  });

  if (window.IS_ADMIN) {
    showAdminDashboard();
  }
}