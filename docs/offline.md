# Offline State UX

Phase 15.5 menambahkan penanganan kondisi jaringan tanpa mengubah OurSpace
menjadi aplikasi offline-first.

## Yang Bisa Dilakukan Saat Offline

- App shell dan bottom navigation tetap dapat dipakai jika session lokal masih
  tersedia.
- Home, Notes, Dates, dan Shared Lists menampilkan data terakhir dari
  `sessionStorage`, termasuk cache yang TTL-nya sudah lewat selama device masih
  offline.
- Gallery dapat menampilkan cache terakhir yang masih ada di memory pada sesi
  tab yang sama. Cache Gallery tidak dipersist karena dapat berisi thumbnail
  base64.
- Halaman yang mempunyai cache menampilkan `OfflineNotice` dan tetap membiarkan
  pengguna membaca data.
- `/offline` menyediakan penjelasan, tombol coba lagi, dan tombol kembali.

Cache hanya berisi payload data yang sebelumnya sudah dipakai aplikasi. Phase
ini tidak menambahkan cache baru untuk `sessionToken`.

## Yang Tidak Bisa Dilakukan Saat Offline

- Membuat, mengedit, atau menghapus Notes, Dates, Gallery, dan Shared Lists.
- Upload foto.
- Pairing dan recovery session.
- Pemeriksaan API, session, Gallery, dan Backup di Settings.
- Menjalankan backup atau reset pairing.

Mutasi offline langsung diblokir dengan pesan yang ramah. Mutasi tidak masuk
antrean dan tidak akan dijalankan otomatis setelah koneksi kembali.

## Perilaku Tanpa Cache

Jika halaman belum pernah dibuka dan tidak mempunyai cache, skeleton tidak
ditampilkan tanpa batas. Halaman menunjukkan bahwa belum ada data tersimpan di
device dan meminta pengguna menyambungkan internet terlebih dahulu.

`navigator.onLine` serta event browser `online`/`offline` menjadi sumber status
jaringan. Kegagalan `fetch` pada lapisan API juga dinormalisasi menjadi
`NETWORK_OFFLINE`, sehingga UI tidak menampilkan pesan error mentah dari
browser.

## Batasan Fase Ini

- Tidak ada service worker caching baru.
- Tidak ada offline mutation queue.
- Tidak ada conflict resolution atau background sync.
- Cache browser bukan backup dan dapat hilang ketika data situs dibersihkan.
