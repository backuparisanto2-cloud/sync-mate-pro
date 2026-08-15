# Sidebar layout + perbaikan build statis

## 1. Ganti navigasi atas menjadi sidebar

Saat ini `AppShell` memakai deretan pil navigasi di header. Diganti dengan sidebar memakai komponen sidebar yang sudah ada di project:

- Sidebar kiri berisi logo "Reminder Mail", grup menu (Dasbor, SMTP, Riwayat, Export, Hosting, Env), dan tombol Keluar di bagian bawah.
- Bisa diciutkan jadi rail ikon di desktop; di mobile jadi panel geser dengan tombol hamburger pada bar atas tipis.
- Item aktif ditandai sesuai rute; konten halaman pindah ke area kanan dengan lebar maksimum yang sama seperti sekarang.
- Tidak ada perubahan logika data — hanya tata letak.

## 2. Perbaiki "loading terus" pada versi statis

Temuan saat memeriksa project:

- Tidak ada skrip `export:static` di `package.json`, tidak ada `public/exports/`, jadi paket statis yang sekarang beredar dibuat di luar project ini dan tidak bisa dibangun ulang di sini.
- Halaman ekspor menampilkan status berdasarkan file `remindly-static.json` yang juga belum ada.
- Layar "Memuat…" muncul selama `useSession()` belum selesai, dan halaman login menunggu status sesi sebelum siap. Jika JavaScript bundel tidak pernah hidup (aset gagal dimuat / hasil build masih berformat SSR, bukan SPA), teks itu tetap tampil dan input tidak bisa diketik — persis gejala yang dilaporkan.

Yang dikerjakan:

1. Tambah skrip `export:static` yang membangun bundel SPA murni (aset jalur relatif, tanpa kebutuhan server Node), menyalin `index.html` menjadi `404.html`, menyertakan `.htaccess` / `_redirects` / `vercel.json` / contoh Nginx, lalu mengemasnya ke `public/exports/remindly-static.zip` beserta `remindly-static.json` (ukuran, jumlah file, hasil validasi).
2. Validasi otomatis sebelum ZIP dibuat: entry point ada, folder `assets/` lengkap, kredensial backend publik benar-benar ter-inject, dan tidak ada rahasia server ikut terbawa. ZIP hanya terbentuk jika semua lolos, sehingga halaman Export menampilkan status yang nyata.
3. Halaman login dibuat tidak bergantung pada status sesi untuk bisa dipakai: form email/kata sandi langsung dirender dan bisa diketik sejak detik pertama; pengecekan sesi hanya dipakai untuk mengalihkan otomatis kalau ternyata sudah login.
4. Layar "Memuat…" pada shell diberi batas waktu: jika pengecekan sesi tak selesai (misal backend tak terjangkau dari hosting), pengguna diarahkan ke halaman login dengan pesan jelas, bukan berputar selamanya.
5. Tambahkan penjaga sederhana di `index.html` hasil ekspor: bila bundel JS gagal dimuat, tampilkan pesan diagnosa (aset belum terunggah / rewrite belum aktif) alih-alih layar diam.

## Catatan teknis

- Sidebar memakai `src/components/ui/sidebar.tsx` (`SidebarProvider`, `SidebarMenu`, `SidebarTrigger`); `AppShell` yang dirombak, semua halaman tetap memanggilnya seperti sekarang.
- Build statis memakai mode SPA (prerender dimatikan) supaya HTML hasilnya benar-benar shell kosong + JS, aman dipasang di cPanel atau subfolder.
- Endpoint SMTP/cron tetap di backend; paket statis memanggilnya lewat `VITE_BACKEND_URL`.
