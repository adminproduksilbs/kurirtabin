TANJUNG BINTANG — GO STYLE V2

File utama:
- index.html: aplikasi standalone, Firebase sudah diisi sesuai project kurirtabin.
- firestore.rules: rules untuk customer/admin.

DESAIN:
Mengikuti referensi yang diberikan: gaya aplikasi kurir modern, kartu layanan, bottom navigation customer, tracking timeline, dan dashboard admin.

CUSTOMER:
- Beranda
- Kirim Barang
- Jastip & Store
- Pesanan Saya
- Tracking status
- Google Maps rute
- Pilihan layanan Instant/Reguler
- Metode pembayaran COD/Transfer
- Profil

ADMIN:
- Dashboard KPI
- Kelola semua pesanan
- Filter status
- Ubah status Menunggu/Diproses/Dikirim/Selesai/Dibatalkan
- Buka rute Google Maps
- Daftar customer
- Produk & Store
- Tambah/hapus produk
- Laporan ringkas

ROLE:
Firestore users/{UID} harus memiliki role:
admin
atau
customer

Akun admin tidak dibuat dari tombol Daftar Customer. Buat akun admin di Firebase Authentication, lalu buat dokumen users/{UID} dengan role=admin.

INSTALASI:
1. Backup index.html lama.
2. Upload index.html dari paket ini ke repository GitHub Pages.
3. Publish.
4. Firebase Console > Firestore > Rules: gunakan firestore.rules jika rules lama belum sesuai.
5. Logout/login ulang agar role dibaca kembali.
