# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada proyek Kasir Pro! Dokumen ini berisi panduan untuk membantu Anda berkontribusi dengan efektif.

## 🚀 Memulai

### Setup Development Environment

1. Fork repository ini
2. Clone fork Anda:
   ```bash
   git clone https://github.com/<username>/cashier-pwa-app.git
   cd cashier-pwa-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Buat branch baru:
   ```bash
   git checkout -b fitur/nama-fitur
   ```

---

## 📝 Aturan Kode

### Struktur File

- **Komponen**: `components/` - Gunakan PascalCase (contoh: `Button.tsx`)
- **Hooks**: `hooks/` - Gunakan camelCase dengan prefix "use" (contoh: `useResponsive.ts`)
- **Utilities**: `lib/` - Gunakan camelCase (contoh: `utils.ts`)
- **Types**: `types/` - Gunakan camelCase (contoh: `api.ts`)

### Konvensi Penamaan

| Jenis             | Konvensi             | Contoh                        |
| ----------------- | -------------------- | ----------------------------- |
| Components        | PascalCase           | `ProductCard`, `LoginForm`    |
| Functions         | camelCase            | `getProducts`, `handleSubmit` |
| Constants         | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `TOKEN_KEY`   |
| Types/Interfaces  | PascalCase           | `User`, `CartItem`            |
| Files (component) | PascalCase           | `Button.tsx`, `Header.tsx`    |
| Files (utility)   | camelCase            | `utils.ts`, `api.ts`          |

### Dokumentasi Kode

Semua fungsi publik harus memiliki JSDoc:

```typescript
/**
 * Deskripsi singkat fungsi
 * @param paramName - Deskripsi parameter
 * @returns Deskripsi return value
 * @example
 * const result = namaFungsi("value");
 */
export function namaFungsi(paramName: string): ReturnType {
  // implementasi
}
```

---

## 🔀 Git Workflow

### Branch Naming

Format: `<tipe>/<deskripsi-singkat>`

| Tipe         | Penggunaan       |
| ------------ | ---------------- |
| `fitur/`     | Fitur baru       |
| `perbaikan/` | Bug fix          |
| `docs/`      | Dokumentasi      |
| `refactor/`  | Refactoring kode |
| `test/`      | Testing          |

Contoh: `fitur/tambah-filter-tanggal`, `perbaikan/login-error`

### Commit Messages

Format: `<tipe>: <deskripsi>`

| Tipe       | Penggunaan                        |
| ---------- | --------------------------------- |
| `feat`     | Fitur baru                        |
| `fix`      | Bug fix                           |
| `docs`     | Dokumentasi                       |
| `style`    | Formatting (tanpa perubahan kode) |
| `refactor` | Refactoring                       |
| `test`     | Testing                           |
| `chore`    | Maintenance                       |

Contoh:

```
feat: tambah filter tanggal di halaman transaksi
fix: perbaiki error login saat offline
docs: update README dengan instruksi instalasi
```

---

## 🧪 Testing

Sebelum submit Pull Request:

1. Pastikan build sukses:

   ```bash
   npm run build
   ```

2. Jalankan linter:

   ```bash
   npm run lint
   ```

3. Test manual fitur yang diubah

---

## 📤 Pull Request

1. Update branch dengan main terbaru
2. Pastikan semua test dan lint passed
3. Buat Pull Request dengan deskripsi jelas
4. Tunggu review dari maintainer

### Template PR

```markdown
## Deskripsi

[Jelaskan perubahan yang dilakukan]

## Tipe Perubahan

- [ ] Fitur baru
- [ ] Bug fix
- [ ] Dokumentasi
- [ ] Refactoring

## Checklist

- [ ] Kode mengikuti style guide
- [ ] Self-review sudah dilakukan
- [ ] Build berhasil
- [ ] Lint passed
```

---

## ❓ Pertanyaan?

Jika ada pertanyaan, silakan buat Issue di repository.
