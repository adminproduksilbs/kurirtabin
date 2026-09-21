# Tanjung Bintang Jastip & Kurir

Prototype web app responsive untuk area Tanjung Bintang.

## Fitur demo
- Mode Customer dan Admin
- Beranda Customer
- Form Kirim Barang
- Jastip + daftar toko/barang
- Keranjang jastip
- Detail dan status pesanan
- Riwayat pesanan
- Dashboard Admin
- Kelola pesanan + update status
- Kelola toko/barang (demo)
- Tarif & area
- Laporan CSV
- Data demo tersimpan di localStorage browser

## Cara menjalankan
Buka `index.html` di browser.

## Catatan
Versi ini adalah prototype frontend yang sudah interaktif. Untuk dipakai online oleh banyak customer, tahap berikutnya adalah menghubungkan Authentication + Firestore/Storage (misalnya Firebase), lalu menambahkan WhatsApp, pembayaran/QRIS, peta/GPS, dan notifikasi.


VERSI FINAL - GOOGLE MAPS
- Customer dapat memasukkan lokasi pickup dan tujuan.
- Tombol Pilih di Maps membuka Google Maps.
- Tombol Lihat Rute membuka rute pickup -> tujuan di Google Maps.
- Struktur siap dikembangkan ke Google Maps JavaScript API + Firebase untuk pin interaktif, jarak/ETA otomatis, dan tracking kurir realtime.
- Untuk API key Google Maps dan tracking realtime, konfigurasi Firebase + Google Maps API masih diperlukan.
