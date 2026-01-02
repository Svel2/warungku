---
name: warung-aesthetic-redesign
description: Mendesain ulang halaman katalog pelanggan dengan kualitas produksi tinggi dan estetika yang unik. Gunakan skill ini saat user meminta untuk mempercantik tampilan utama, membuat kartu produk yang menarik, atau menyusun layout katalog yang tidak membosankan. Menghasilkan kode React/Tailwind yang berkarakter dan menghindari estetika "AI generic".
---

Skill ini memandu pembuatan antarmuka katalog toko yang berani dan profesional, menghindari tampilan "AI slop". Implementasikan kode yang berfungsi penuh dengan perhatian luar biasa pada detail estetika dan pilihan desain kreatif.

## Design Thinking untuk Warung

Sebelum menulis kode, tentukan arah estetika yang BERANI:
- **Purpose**: Memudahkan pelanggan melihat barang, harga, dan kategori tanpa hambatan visual.
- **Tone Options**: Pilih satu yang ekstrem: 
    * "Modern Minimalist Boutique" (Bersih, banyak ruang kosong, font elegan).
    * "Cyberpunk Toko Kelontong" (Dark mode, neon accents, industrial feel).
    * "Heritage/Indonesian Retro" (Warm tones, typography bergaya vintage, tekstur kertas/grain).
    * "Playful & Vibrant" (Warna cerah, sudut membulat/rounded yang ekstrem, animasi mikro yang lucu).
- **Differentiation**: Apa yang membuat pelanggan betah? Mungkin transisi halus saat ganti kategori atau hover effect yang unik pada setiap barang.

## Pedoman Estetika Katalog

- **Typography**: JANGAN gunakan Inter atau Arial. Pilih font yang berkarakter dari Google Fonts. Gunakan font display yang kuat untuk Nama Warung/Harga, dan font sans-serif yang sangat bersih untuk deskripsi barang.
- **Color & Theme**: Gunakan palet warna yang berani. Misalnya: "Terracotta & Cream" untuk kesan organik, atau "Electric Blue & Slate" untuk kesan modern. Gunakan variabel CSS untuk semua warna.
- **Motion**: Gunakan 'framer-motion' untuk stagger reveal (barang muncul satu-satu saat halaman dibuka). Tambahkan micro-interactions pada tombol "Cari" atau Filter Kategori.
- **Product Presentation**: Jangan hanya kotak biasa. Gunakan asimetri, bayangan (shadow) yang dramatis tapi lembut, atau border yang tidak biasa. Berikan indikator "Stok Habis" yang terlihat artistik, bukan sekadar teks merah.
- **Backgrounds**: Tambahkan tekstur halus seperti noise, mesh gradients, atau pola geometris tipis di latar belakang agar halaman tidak terasa "kosong" dan datar.

PENTING: Jangan gunakan gradasi ungu-biru standar AI. Jangan gunakan layout grid yang membosankan. Berikan kejutan dalam desainnya.