import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/*
  PATCH v1
  - Null-safe event binding
  - DOMContentLoaded initialization
  - Event delegation for dynamically rendered buttons
  - Firebase Auth + Firestore retained
  - Designed for the existing Tanjung Bintang Jastip & Kurir page
*/

const firebaseConfig = {
  apiKey: "AIzaSyABpnRRv30zYTN0J_IReUgZPY88FSm9Omw",
  authDomain: "kurirtabin.firebaseapp.com",
  projectId: "kurirtabin",
  storageBucket: "kurirtabin.firebasestorage.app",
  messagingSenderId: "55763945350",
  appId: "1:55763945350:web:a06e1e51fea385aa494e07"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let user = null;
let currentView = "home";
let unsubscribeOrders = null;

const $ = (id) => document.getElementById(id);

function safeOn(target, event, handler) {
  if (!target || !target.addEventListener) return false;
  target.addEventListener(event, handler);
  return true;
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function getViewElement() {
  let el = $("view");
  if (el) return el;

  el = document.querySelector("main");
  if (el) {
    el.id = "view";
    return el;
  }

  el = document.querySelector(".content, .main-content, .page-content, #content");
  if (el) {
    el.id = "view";
    return el;
  }

  return null;
}

function nav(view) {
  currentView = view || "home";
  render();
}

window.nav = nav;

function bindNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";

    safeOn(button, "click", (event) => {
      event.preventDefault();
      nav(button.dataset.view);
    });
  });

  const authBtn = $("authBtn");
  if (authBtn && authBtn.dataset.bound !== "1") {
    authBtn.dataset.bound = "1";
    safeOn(authBtn, "click", () => {
      if (user) {
        logout();
      } else {
        authModal();
      }
    });
  }
}

function updateActiveNav() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === currentView);
  });
}

function render() {
  const view = getViewElement();
  if (!view) {
    console.warn("Elemen #view/main tidak ditemukan. UI tidak ditimpa.");
    bindNavigation();
    return;
  }

  if (currentView === "home") view.innerHTML = home();
  else if (currentView === "send") view.innerHTML = send();
  else if (currentView === "orders") view.innerHTML = ordersPage();
  else if (currentView === "profile") view.innerHTML = profile();
  else view.innerHTML = home();

  updateActiveNav();
  bindNavigation();
  bindRenderedEvents();
}

function home() {
  return `
    <section class="page">
      <div class="hero-card">
        <div>
          <div class="eyebrow">Tanjung Bintang</div>
          <h1>Jastip & Kurir</h1>
          <p>Kirim barang dan titip belanja dengan mudah.</p>
          <button class="primary-btn" data-action="send">+ Kirim Barang</button>
        </div>
        <div class="hero-icon">🛵</div>
      </div>

      <div class="section-title">
        <h2>Layanan</h2>
      </div>

      <div class="service-grid">
        <button class="service-card" data-action="send">
          <span>📦</span>
          <b>Kirim Barang</b>
          <small>Pesan kurir untuk mengirim barang</small>
        </button>

        <button class="service-card" data-action="orders">
          <span>🧾</span>
          <b>Pesanan Saya</b>
          <small>Lihat status pesanan</small>
        </button>

        <button class="service-card" data-action="store">
          <span>🛍️</span>
          <b>Jastip & Store</b>
          <small>Belanja melalui layanan kami</small>
        </button>
      </div>

      <div class="info-card">
        <b>📍 Area layanan</b>
        <p>Tanjung Bintang dan area sekitarnya, Lampung Selatan.</p>
      </div>
    </section>
  `;
}

function send() {
  return `
    <section class="page">
      <div class="page-head">
        <button class="back-btn" data-action="home">←</button>
        <div>
          <div class="eyebrow">Pesanan baru</div>
          <h1>Kirim Barang</h1>
        </div>
      </div>

      <div class="form-card">
        <label>Nama pengirim</label>
        <input id="senderName" type="text" placeholder="Nama pengirim">

        <label>No. WhatsApp</label>
        <input id="senderPhone" type="tel" placeholder="08xxxxxxxxxx">

        <label>Lokasi pickup</label>
        <div class="input-row">
          <input id="pickup" type="text" placeholder="Alamat pickup">
          <button type="button" class="map-btn" data-action="mapPickup">Maps</button>
        </div>

        <label>Lokasi tujuan</label>
        <div class="input-row">
          <input id="destination" type="text" placeholder="Alamat tujuan">
          <button type="button" class="map-btn" data-action="mapDestination">Maps</button>
        </div>

        <label>Nama penerima</label>
        <input id="receiverName" type="text" placeholder="Nama penerima">

        <label>No. WhatsApp penerima</label>
        <input id="receiverPhone" type="tel" placeholder="08xxxxxxxxxx">

        <label>Detail barang</label>
        <textarea id="itemDetail" rows="3" placeholder="Contoh: 1 dus frozen food"></textarea>

        <label>Catatan</label>
        <textarea id="note" rows="3" placeholder="Catatan tambahan (opsional)"></textarea>

        <button class="primary-btn full" data-action="submitOrder">Buat Pesanan</button>
      </div>
    </section>
  `;
}

function ordersPage() {
  return `
    <section class="page">
      <div class="page-head">
        <div>
          <div class="eyebrow">Riwayat</div>
          <h1>Pesanan Saya</h1>
        </div>
      </div>

      <div id="ordersList" class="orders-list">
        <div class="loading-card">Memuat pesanan...</div>
      </div>
    </section>
  `;
}

function profile() {
  const email = user?.email || "Belum login";

  return `
    <section class="page">
      <div class="page-head">
        <div>
          <div class="eyebrow">Akun</div>
          <h1>Profil</h1>
        </div>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">👤</div>
        <h2>${escapeHtml(email)}</h2>
        <p>${user ? "Akun aktif" : "Silakan masuk untuk membuat pesanan."}</p>

        ${
          user
            ? `<button class="danger-btn full" data-action="logout">Keluar</button>`
            : `<button class="primary-btn full" data-action="login">Masuk</button>`
        }
      </div>
    </section>
  `;
}

function bindRenderedEvents() {
  document.querySelectorAll("[data-action]").forEach((el) => {
    if (el.dataset.actionBound === "1") return;
    el.dataset.actionBound = "1";

    safeOn(el, "click", async (event) => {
      event.preventDefault();

      const action = el.dataset.action;

      if (action === "home") nav("home");
      if (action === "send") nav("send");
      if (action === "orders") nav("orders");
      if (action === "store") alert("Fitur Store/Jastip sedang disiapkan.");
      if (action === "login") authModal();
      if (action === "logout") logout();
      if (action === "mapPickup") openMaps("pickup");
      if (action === "mapDestination") openMaps("destination");
      if (action === "submitOrder") await submitOrder();
    });
  });

  if (currentView === "orders") loadOrders();
}

function openMaps(type) {
  const input = type === "pickup" ? $("pickup") : $("destination");
  if (!input) return;

  const value = input.value.trim();

  if (!value) {
    alert(type === "pickup"
      ? "Isi lokasi pickup terlebih dahulu."
      : "Isi lokasi tujuan terlebih dahulu.");
    return;
  }

  window.open(
    "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(value),
    "_blank"
  );
}

async function submitOrder() {
  if (!user) {
    alert("Silakan masuk atau daftar terlebih dahulu.");
    authModal();
    return;
  }

  const pickup = $("pickup")?.value.trim() || "";
  const destination = $("destination")?.value.trim() || "";

  if (!pickup || !destination) {
    alert("Lokasi pickup dan tujuan wajib diisi.");
    return;
  }

  const data = {
    customerId: user.uid,
    customerEmail: user.email || "",
    senderName: $("senderName")?.value.trim() || "",
    senderPhone: $("senderPhone")?.value.trim() || "",
    pickup,
    destination,
    receiverName: $("receiverName")?.value.trim() || "",
    receiverPhone: $("receiverPhone")?.value.trim() || "",
    itemDetail: $("itemDetail")?.value.trim() || "",
    note: $("note")?.value.trim() || "",
    status: "Menunggu",
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "orders"), data);
    alert("Pesanan berhasil dibuat.");
    nav("orders");
  } catch (error) {
    console.error(error);
    alert("Pesanan gagal disimpan. Periksa Firebase dan Firestore Rules.");
  }
}

function loadOrders() {
  const list = $("ordersList");
  if (!list || !user) {
    if (list && !user) {
      list.innerHTML = `
        <div class="empty-card">
          <b>Belum login</b>
          <p>Masuk terlebih dahulu untuk melihat pesanan.</p>
          <button class="primary-btn" data-action="login">Masuk</button>
        </div>
      `;
      bindRenderedEvents();
    }
    return;
  }

  if (unsubscribeOrders) {
    unsubscribeOrders();
    unsubscribeOrders = null;
  }

  const q = query(
    collection(db, "orders"),
    where("customerId", "==", user.uid)
  );

  unsubscribeOrders = onSnapshot(
    q,
    (snapshot) => {
      if (currentView !== "orders") return;

      const rows = [];
      snapshot.forEach((d) => rows.push({ id: d.id, ...d.data() }));

      rows.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });

      if (!rows.length) {
        list.innerHTML = `
          <div class="empty-card">
            <b>Belum ada pesanan</b>
            <p>Pesanan yang dibuat akan tampil di sini.</p>
          </div>
        `;
        return;
      }

      list.innerHTML = rows.map(orderCard).join("");
    },
    (error) => {
      console.error(error);
      list.innerHTML = `
        <div class="empty-card">
          <b>Pesanan belum dapat dimuat.</b>
          <p>Periksa koneksi Firebase dan Firestore Rules.</p>
        </div>
      `;
    }
  );
}

function orderCard(o) {
  return `
    <article class="order-card">
      <div class="order-top">
        <b>${escapeHtml(o.itemDetail || "Pesanan kurir")}</b>
        <span class="status">${escapeHtml(o.status || "Menunggu")}</span>
      </div>
      <div class="route">
        <div>📍 ${escapeHtml(o.pickup || "-")}</div>
        <div>📦 ${escapeHtml(o.destination || "-")}</div>
      </div>
      <div class="order-meta">
        Penerima: ${escapeHtml(o.receiverName || "-")}
      </div>
      <button class="map-route-btn"
        data-route-pickup="${escapeAttr(o.pickup || "")}"
        data-route-destination="${escapeAttr(o.destination || "")}">
        🗺️ Lihat rute
      </button>
    </article>
  `;
}

function authModal() {
  const modal = $("modal");

  if (!modal) {
    const email = prompt("Email:");
    if (!email) return;

    const password = prompt("Password:");
    if (!password) return;

    signIn(email, password);
    return;
  }

  modal.innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <div class="modal-card" onclick="event.stopPropagation()">
        <button class="modal-close" data-close-modal>×</button>
        <h2>Masuk</h2>
        <p>Gunakan akun customer atau admin.</p>

        <input id="loginEmail" type="email" placeholder="Email">
        <input id="loginPassword" type="password" placeholder="Password">

        <button class="primary-btn full" id="loginSubmit">Masuk</button>
        <button class="secondary-btn full" id="registerSubmit">Daftar akun baru</button>
        <div id="authMessage"></div>
      </div>
    </div>
  `;

  modal.style.display = "block";

  safeOn($("loginSubmit"), "click", async () => {
    await signIn(
      $("loginEmail")?.value.trim(),
      $("loginPassword")?.value
    );
  });

  safeOn($("registerSubmit"), "click", async () => {
    await register(
      $("loginEmail")?.value.trim(),
      $("loginPassword")?.value
    );
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    safeOn(el, "click", () => {
      modal.style.display = "none";
    });
  });
}

async function signIn(email, password) {
  if (!email || !password) {
    authMessage("Email dan password wajib diisi.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
  } catch (error) {
    console.error(error);
    authMessage("Email atau password salah.");
  }
}

async function register(email, password) {
  if (!email || !password) {
    authMessage("Email dan password wajib diisi.");
    return;
  }

  if (password.length < 6) {
    authMessage("Password minimal 6 karakter.");
    return;
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", credential.user.uid), {
      email,
      role: "customer",
      createdAt: serverTimestamp()
    });

    closeModal();
    alert("Akun berhasil dibuat.");
  } catch (error) {
    console.error(error);
    authMessage(error?.message || "Pendaftaran gagal.");
  }
}

function authMessage(message) {
  const el = $("authMessage");
  if (el) el.textContent = message;
  else alert(message);
}

async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
}

function closeModal() {
  const modal = $("modal");
  if (modal) {
    modal.style.display = "none";
    modal.innerHTML = "";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function bindRouteButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-route-pickup]");
    if (!button) return;

    const pickup = button.dataset.routePickup || "";
    const destination = button.dataset.routeDestination || "";

    if (!pickup || !destination) return;

    window.open(
      "https://www.google.com/maps/dir/?api=1&origin=" +
        encodeURIComponent(pickup) +
        "&destination=" +
        encodeURIComponent(destination),
      "_blank"
    );
  });
}

function init() {
  bindNavigation();
  bindRouteButtons();

  onAuthStateChanged(auth, (u) => {
    user = u || null;

    const authBtn = $("authBtn");
    if (authBtn) {
      authBtn.textContent = user ? "Keluar" : "Masuk";
    }

    render();
  });

  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
