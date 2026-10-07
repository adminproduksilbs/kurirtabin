# 🛵 KurirKu LIVE

Webapp kurir ala Gojek untuk **Tanjung Bintang** — versi **Firebase** dengan **live tracking GPS** real-time.
Customer dan kurir memakai HP berbeda-beda, datanya tersambung lewat internet.

- `index.html` → **Aplikasi Customer**: 4 layanan (📦 Antar Barang, 🛵 Antar Penumpang, 🍱 Antar Makanan, 🛒 Titip Beli), hitung ongkir otomatis dari jarak rute, lacak status + **posisi kurir live di peta**.
- `kurir.html` → **Dashboard Kurir**: statistik, order masuk, order aktif + **siaran lokasi GPS**, riwayat & pendapatan.

File statis 100% — **tanpa build step**, siap upload ke GitHub + GitHub Pages.

---

## 🚀 Cara Setup (sekali saja, ±15 menit)

### Langkah 1 — Buat project Firebase (gratis)
1. Buka https://console.firebase.google.com → **Add project** / **Buat project**.
2. Nama project mis. `kurirku-live` → lanjutkan (Google Analytics boleh dimatikan) → **Create project**.

### Langkah 2 — Buat Realtime Database
1. Di menu kiri: **Build → Realtime Database** → **Create Database**.
2. Pilih lokasi terdekat (mis. `asia-southeast1` Singapore) → Next.
3. Pilih **Start in test mode** (atau locked mode, nanti kita ganti rules) → **Enable**.

### Langkah 3 — Ambil config web & paste ke `firebase-config.js`
1. Klik **Project Overview** (menu kiri atas) → ikon gear → **Project settings**.
2. Bagian **Your apps** → klik ikon Web `</>` → beri nickname mis. `kurirku-web` → **Register app**.
3. Salin isi objek `firebaseConfig` yang muncul (apiKey, authDomain, databaseURL, dst).
4. Buka file `firebase-config.js` di repo ini → ganti semua teks `PASTE_..._DI_SINI` dengan nilai dari Firebase.
   - `databaseURL` bentuknya seperti `https://kurirku-live-default-rtdb.asia-southeast1.firebasedatabase.app`

### Langkah 4 — Pasang rules database
1. Di Firebase console: **Realtime Database → tab Rules**.
2. Hapus isi lama → copy-paste **seluruh isi** file `database.rules.json` dari repo ini → **Publish**.
3. ⚠️ Rules bawaan ini **terbuka untuk demo** (read/write bebas). Untuk produksi, ketatkan — contoh: hanya izinkan tulis order baru & update status oleh kurir yang datanya cocok.

### Langkah 5 — Upload ke GitHub
Jalankan di terminal, dari dalam folder project ini:

```bash
git init
git add .
git commit -m "KurirKu LIVE v1"
git branch -M main
git remote add origin https://github.com/USERNAME/kurirku-live.git
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub kamu. Buat repository `kurirku-live` dulu di github.com (New repository, tanpa README agar tidak konflik).

### Langkah 6 — Aktifkan GitHub Pages
1. Di halaman repository GitHub → tab **Settings** → menu **Pages**.
2. **Build and deployment** → Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/(root)** → **Save**.
4. Tunggu 1–2 menit. Webapp live di:
   - Customer: `https://USERNAME.github.io/kurirku-live/`
   - Kurir: `https://USERNAME.github.io/kurirku-live/kurir.html`

### Langkah 7 — Cara pakai
- **Customer**: buka URL customer di HP → pilih layanan → tap peta untuk titik jemput & antar → **Hitung Ongkir** → **Buat Order** → pantau di tab **Order Saya** (status + posisi kurir live 🛵).
- **Kurir**: buka URL `/kurir.html` di HP → daftar sekali (nama, WA, PIN 4 digit) → aktifkan **ONLINE** → ambil order di tab **Order Masuk** → siaran lokasi otomatis jalan saat order aktif → update status sampai selesai.

---

## 📡 Cara kerja live tracking

1. Kurir mengambil order → HP kurir menyalakan GPS (`watchPosition`).
2. Posisi dikirim ke Firebase tiap **≥5 detik** atau jika bergerak **≥10 meter** (hemat baterai & kuota):
   - `/orders/{id}/courierLoc` → `{lat, lng, updatedAt}`
   - `/couriers/{id}` → `{name, phone, online, lat, lng, updatedAt, activeOrderId}`
3. HP customer mendengarkan (`onValue`) order miliknya → marker 🛵 di peta **bergerak real-time** + label status ("Kurir menuju titik jemput" / "Kurir sedang mengantar").
4. Siaran berhenti otomatis saat order selesai/dibatalkan atau kurir pindah tab.

## 💰 Tarif (Tanjung Bintang)

Jarak dibulatkan **ke atas** ke km bulat (4,5 km → 5 km). Di atas batas tabel: **+Rp3.000/km**.

| Layanan | 1–3 km | 4–5 km | 6–8 km | 9–10 km |
|---|---|---|---|---|
| 📦 Antar Barang (≤5 kg) | Rp10.000 | Rp14.000 | Rp18.000 | — |
| 🛵 Antar Penumpang | Rp8.000 | Rp12.000 | Rp16.000 | Rp20.000 |
| 🍱 Antar Makanan | Rp10.000 | Rp14.000 | Rp18.000 | Rp22.000 |
| 🛒 Titip Beli | = tarif makanan + jasa belanja Rp4.000/titik |

Biaya tambahan (bisa diubah di Pengaturan aplikasi): overload barang >5 kg **+Rp3.000/kg** • 🌧 hujan **+Rp4.000** • 🕐 jam sibuk **+25%** • 🌙 jam malam **+Rp7.500** • 🕳 jalan rusak **+Rp4.000**.

## 📁 Struktur data Firebase

- `/orders/{pushId}` — order: kode `KR-YYYYMMDD-###` (counter transaksi di `/counters/order_YYYYMMDD`), layanan, customer, titik jemput/antar, rincian ongkir, status, `courier`, `courierLoc`, `timeline`.
- `/couriers/{courierId}` — kurir: nama, WA, online, posisi terakhir, `activeOrderId`.

## ⚠️ Catatan

- Butuh **koneksi internet** (peta, Firebase, dan routing OSRM semuanya online).
- Satu kurir menangani **satu order aktif** dalam satu waktu (disederhanakan untuk demo).
- Kode order memakai transaction counter per tanggal agar tidak kembar antar HP.
- Jangan commit `firebase-config.js` yang sudah terisi ke repo **publik** tanpa membatasi API key (Google Cloud Console → Credentials → API restrictions → HTTP referrers → domain GitHub Pages kamu).
