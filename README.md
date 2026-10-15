# Picture Connect

Game browser tebak kata berbasis gambar untuk booth event, layar sentuh, dan display 16:9. Seluruh gameplay berjalan di browser tanpa backend, login, atau koneksi internet saat aset sudah terpasang.

## Menjalankan proyek

Prasyarat: Node.js 20.19+ (atau Node.js 22.12+) dan npm.

```bash
npm install
npm run dev
```

Buka URL lokal yang ditampilkan Vite. Untuk perangkat booth pada jaringan yang sama, gunakan alamat LAN yang dicetak oleh Vite.

## Test dan build produksi

```bash
npm test
npm run build
npm run preview
```

Hasil build berada di folder `dist/`. Folder itu dapat ditempatkan di static web server apa pun. Untuk menjalankan secara offline, salin seluruh isi `dist/` ke mesin booth dan layani melalui server HTTP lokal; jangan membuka `index.html` langsung lewat `file://` karena browser dapat membatasi pemuatan modul dan JSON.

Contoh server lokal setelah build:

```bash
npx vite preview --host 0.0.0.0
```

Setelah dependensi npm dan build tersedia, game tidak memanggil API, font, gambar, atau audio eksternal.

## Kontrol dan mode booth

- Semua kontrol mendukung mouse dan sentuhan; huruf dipilih dari tombol di layar.
- Tombol layar penuh memakai Fullscreen API dan gagal secara aman bila browser menolaknya.
- Ikon roda gigi di beranda mengatur jumlah soal (5–10), kecepatan timer, dan idle timeout.
- Skor terbaik dan konfigurasi disimpan lewat `localStorage`. Data rusak akan diabaikan tanpa menghentikan game.
- Suara dibuat dengan Web Audio API setelah interaksi pengguna dan dapat dimatikan.
- Result screen kembali ke attract screen sesuai idle timeout. Sesi sementara selalu dihapus ketika kembali ke beranda.

JavaScript tidak dapat mengunci sistem operasi, keluar dari browser, shortcut global, atau akses perangkat. Untuk deployment publik, gunakan kiosk mode milik OS/browser (misalnya Assigned Access di Windows atau Chrome Enterprise kiosk), batasi akun pengguna, dan nonaktifkan shortcut sistem sesuai kebijakan venue.

## Struktur penting

- `src/data/puzzles.json` — 30 soal Indonesia, masing-masing dengan gambar, hint, huruf, kesulitan, poin, dan waktu.
- `public/images/puzzle-sprites.svg` — ilustrasi vektor lokal orisinal untuk seluruh puzzle.
- `src/game/` — state engine, input, scoring, timer, audio, dan penyimpanan lokal.
- `src/ui/` — renderer layar dan efek visual.
- `src/styles/main.css` — visual arcade, layout booth, responsivitas, dan reduced motion.
- `tests/game.test.js` — unit test scoring, normalisasi, validasi/pemilihan soal, transisi state, serta guard double-score.

## Menambah puzzle

Tambahkan objek ke `src/data/puzzles.json`. ID wajib unik; jawaban, hint, 2–4 gambar, `basePoints`, `timeLimit`, dan `letterPool` wajib valid. Seluruh huruf jawaban (termasuk jumlah huruf yang berulang) harus tersedia dalam `letterPool`. Simbol gambar baru dapat ditambahkan sebagai `<symbol>` pada sprite SVG lokal.
