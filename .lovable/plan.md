# Perbaikan: browser membeku saat mengetik di halaman login (build ekspor statis)

## Status masalah

Sudah terkonfirmasi lewat pengujian otomatis:

- Di aplikasi versi dev/preview, mengetik di form login berjalan normal.
- Di bundel hasil `export:static` (dites lewat server lokal), halaman login tampil dan bisa diklik, tetapi begitu ada input pertama, main thread browser membeku total — perintah JavaScript berikutnya tidak pernah dijawab.
- Menghapus `StrictMode` dari entry SPA tidak mengubah apa pun.

Akar penyebabnya **belum terkonfirmasi**. Karena itu langkah pertama rencana ini adalah pembuktian, bukan tebakan.

## Langkah 1 — Buktikan penyebabnya

1. Ambil profil CPU browser saat pembekuan terjadi dan tulis hasilnya ke file (percobaan sebelumnya gagal karena output profiler hilang di pipe). Fungsi teratas pada profil akan menunjukkan apakah ini loop render React, loop di router, atau loop di modul lain.
2. Bila profil tidak konklusif, lakukan bisect pada bundel statis: render halaman minimal (hanya satu `<input>` React tanpa router), lalu tambahkan lapisan satu per satu — router, layout, halaman login — sampai pembekuan muncul.
3. Catat lapisan pertama yang memicu pembekuan; itulah penyebabnya.

Dugaan yang akan diuji lebih dulu (urut dari yang paling mungkin):
- Dua salinan React/React-DOM atau router ikut terbundel di build statis, sehingga state update masuk lingkaran tak berujung.
- Konfigurasi build statis buatan sendiri menyalin ulang perilaku router secara berbeda dari build resmi (mis. alias modul server yang terlalu luas ikut mengganti modul yang seharusnya nyata).

## Langkah 2 — Perbaiki sesuai temuan

- Jika penyebabnya duplikasi paket: samakan resolusi modul pada build statis dengan build utama (dedupe/alias tunggal) dan buktikan hanya ada satu salinan di bundel.
- Jika penyebabnya konfigurasi build statis buatan sendiri: ganti pendekatan — hasilkan bundel statis dari pipeline build resmi aplikasi (mode SPA bawaan framework) alih-alih entry + konfigurasi Vite terpisah. Ini menghilangkan seluruh kelas bug "beda perilaku antara dev dan ekspor" sekaligus, bukan hanya gejala di halaman login.
- Perbaikan diterapkan pada level konfigurasi/bundling, bukan dengan menambal komponen login.

## Langkah 3 — Verifikasi

Uji otomatis pada bundel statis yang disajikan lewat server lokal:

1. Ketik email dan kata sandi penuh di halaman login, pastikan nilainya masuk dan halaman tetap responsif.
2. Klik tombol Masuk dan pastikan aplikasi merespons (pesan gagal login untuk kredensial salah sudah cukup sebagai bukti responsif).
3. Navigasi antar halaman (sidebar) dan reload di URL dalam, memastikan tidak ada regresi.
4. Ulangi pemeriksaan yang sama di aplikasi dev agar tidak ada yang rusak di sisi lain.

ZIP ekspor baru hanya dibuat ulang setelah ketiga pemeriksaan di atas lolos.

## Catatan teknis

- Berkas yang kemungkinan berubah: `vite.static.config.ts`, `src/spa.tsx`, `index.static.html`, `scripts/export-static.mjs`.
- Tidak ada perubahan skema database, logika pengiriman email, maupun cron.
- Tampilan sidebar dan isi halaman tidak diubah.
