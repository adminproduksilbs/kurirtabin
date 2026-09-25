TB EXPRESS TANJUNG BINTANG - VERSI TERHUBUNG FIREBASE

Yang sudah terhubung:
- Firebase Authentication login/register
- Role admin/customer dari Firestore users/{UID}.role
- Customer membuat pesanan ke Firestore orders
- Customer melihat pesanan realtime
- Customer membuka tracking dan rute Google Maps
- Customer dapat membatalkan pesanan saat status Menunggu
- Store membaca produk dari Firestore products
- Admin melihat semua pesanan realtime
- Admin mengubah status pesanan
- Admin mengubah harga pesanan
- Admin melihat daftar customer dari Firestore users
- Admin tambah/edit/hapus produk Firestore
- Admin export laporan CSV
- Admin detail pesanan + Google Maps

Upload SEMUA isi folder ini ke GitHub Pages.
Jangan hanya upload index.html.

Firebase project yang digunakan: kurirtabin

Pastikan Firestore Rules memakai file firestore.rules.
Akun admin harus sudah ada di Authentication dan dokumen users/{UID} berisi:
email: email admin
role: admin
name: Nama Admin

Akun yang daftar dari aplikasi otomatis dibuat sebagai customer.
