# Kasir Pro - Aplikasi Point of Sale (PWA)

Aplikasi Point of Sale (POS) modern berbasis Progressive Web App (PWA) untuk manajemen transaksi kasir. Dibangun dengan Next.js 16, React 19, dan TypeScript.

## 🚀 Fitur Utama

### Autentikasi & Keamanan

- Login dan registrasi pengguna
- JWT token dengan auto-refresh
- Role-based access (Admin/Cashier)
- Protected routes

### Point of Sale (POS)

- Katalog produk dengan filter kategori (Makanan/Minuman)
- Pencarian produk real-time
- Keranjang belanja dengan persistent storage
- Perhitungan otomatis (subtotal, PPN 11%, total)
- Responsive design (mobile bottom sheet, desktop sidebar)

### Manajemen Transaksi

- Riwayat transaksi dengan pagination
- Filter berdasarkan tanggal, status, metode pembayaran
- Detail transaksi lengkap
- Kode transaksi unik

### Offline Support (PWA)

- Caching produk di IndexedDB
- Queue transaksi saat offline
- Auto-sync saat kembali online
- Network status monitoring
- Installable sebagai aplikasi native

### Dashboard

- Pendapatan hari ini
- Total transaksi harian
- Jumlah produk aktif
- Status koneksi real-time
- Transaksi terakhir

---

## 🛠️ Teknologi

| Kategori         | Teknologi                                                    |
| ---------------- | ------------------------------------------------------------ |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router)               |
| UI Library       | [React 19](https://react.dev/)                               |
| Bahasa           | [TypeScript 5](https://www.typescriptlang.org/)              |
| Styling          | [TailwindCSS 4](https://tailwindcss.com/)                    |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/)                   |
| HTTP Client      | [Axios](https://axios-http.com/)                             |
| Offline Storage  | [idb](https://github.com/jakearchibald/idb) (IndexedDB)      |
| PWA              | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) |
| Date Formatting  | [date-fns](https://date-fns.org/)                            |
| Icons            | [Lucide React](https://lucide.dev/)                          |

---

## 📦 Instalasi

### Prasyarat

- Node.js 18 atau lebih tinggi
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd cashier-pwa-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi environment variables**

   Buat file `.env.local` di root folder:

   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   ```

4. **Jalankan development server**

   ```bash
   npm run dev
   ```

5. **Buka browser**

   Akses [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
cashier-pwa-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Halaman autentikasi
│   │   ├── login/                # Login
│   │   ├── register/             # Registrasi
│   │   └── forgot-password/      # Lupa password
│   ├── (main)/                   # Halaman utama (protected)
│   │   ├── dashboard/            # Dashboard
│   │   ├── pos/                  # Point of Sale
│   │   ├── transactions/         # Riwayat transaksi
│   │   └── settings/             # Pengaturan
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Komponen UI reusable
│   │   ├── Button.tsx            # Tombol dengan variants
│   │   ├── Card.tsx              # Card container
│   │   ├── Input.tsx             # Input field
│   │   └── ...                   # Komponen lainnya
│   └── layout/                   # Komponen layout
│       ├── Sidebar.tsx           # Navigasi sidebar
│       └── Header.tsx            # Header dengan menu
├── lib/
│   ├── api.ts                    # Konfigurasi Axios
│   ├── utils.ts                  # Utility functions
│   ├── api/                      # API service layer
│   │   ├── auth.ts               # Auth API
│   │   ├── products.ts           # Products API
│   │   └── transactions.ts       # Transactions API
│   ├── context/                  # React contexts
│   │   ├── auth-context.tsx      # Auth state
│   │   └── network-status.tsx    # Network monitoring
│   └── offline/
│       └── offline-store.ts      # IndexedDB storage
├── hooks/
│   └── useResponsive.ts          # Responsive breakpoints
├── store/
│   └── cart.ts                   # Zustand cart store
├── types/
│   └── api.ts                    # TypeScript definitions
└── public/
    ├── manifest.json             # PWA manifest
    └── icons/                    # PWA icons
```

---

## 🧪 Script yang Tersedia

| Perintah        | Deskripsi                      |
| --------------- | ------------------------------ |
| `npm run dev`   | Menjalankan development server |
| `npm run build` | Build untuk production         |
| `npm run start` | Menjalankan production server  |
| `npm run lint`  | Menjalankan ESLint             |

---

## 🔧 Konfigurasi Environment

| Variable              | Deskripsi       | Default                               |
| --------------------- | --------------- | ------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL backend API | `https://cashier-api.faizlzm.com/api` |

---

## 📱 PWA Features

Aplikasi ini mendukung Progressive Web App yang memungkinkan:

- **Installable**: Dapat diinstall sebagai aplikasi native di desktop atau mobile
- **Offline First**: Tetap berfungsi tanpa koneksi internet
- **Auto Sync**: Transaksi offline akan disinkronkan saat online
- **Push Notifications**: Notifikasi update aplikasi

### Menginstall Aplikasi

1. Buka aplikasi di browser (Chrome/Edge recommended)
2. Klik icon "Install" di address bar atau menu browser
3. Aplikasi akan terinstall sebagai PWA

---

## 🤝 Kontribusi

Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan kontribusi.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).

---

## 📞 Kontak

Untuk pertanyaan atau dukungan, silakan hubungi tim pengembang.
