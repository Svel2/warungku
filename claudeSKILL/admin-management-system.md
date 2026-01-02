{
---
name: admin-management-system
description: Mengelola logika CRUD (Create, Read, Update, Delete) untuk admin. Gunakan saat membuat form tambah barang, edit harga, dan sistem proteksi halaman admin.
---

Instruksi wajib untuk sistem Admin:

1. **Flow Autentikasi**: Pastikan ada pengecekan session. Jika bukan admin, tendang user kembali ke halaman login.
2. **Interactive Forms**: Gunakan state management (React Hook Form/Zustand) untuk input barang agar terasa instan dan tidak lemot.
3. **Feedback User**: Selalu sertakan "Success Toast" atau notifikasi jika barang berhasil diupdate atau dihapus.
4. **Logika Stok**: Buat fungsi otomatis yang memberi warna merah jika stok barang di bawah 5.

Utamakan fungsionalitas dan kemudahan navigasi bagi pemilik toko.
}