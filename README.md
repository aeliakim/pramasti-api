# PRAMASTI: Praktikum Manajemen System

PRAMASTI (Praktikum Manajemen System) adalah website manajemen praktikum Departemen Teknik Komputer ITS yang dapat digunakan baik oleh mahasiswa maupun dosen.

## Prasyarat

Sebelum menggunakan backend untuk PRAMASTI, pastikan sudah terinstall:

-Node.js (disarankan menggunakan versi yang resmi direkomendasikan oleh Node.js)

-MySQL (versi 8.0 ke atas)

## Panduan Memasang Backend PRAMASTI

1. Import Database MySQL
   Sebelum menginstall API, pastikan sudah terpasang MySQL dan buat database di dalamnya dengan nama database 'pramasti'.
   
   ![image](https://github.com/aeliakim/pramasti-api/assets/128810396/822b00d6-841e-4542-b304-04ec1612fa9b)

   Import file database untuk pramasti yang berada di folder models.
   Setelah database terpasang, pastikan MySQL selalu menyala agar API dapat berkomunikasi lancar dengan database.
  
2. Di terminal, jalankan npm install

  ```
  $ npm install
  ```
3. Rename file .env.example menjadi .env
4. Ubah isi variabel di file .env

   ![image](https://github.com/aeliakim/pramasti-api/assets/128810396/d17cae02-2e1e-4939-9504-a05821668a41)

   
   -ACCESS_TOKEN_SECRET: Key untuk generate dan verify access token. **Jangan ubah isi dari variable ini!**
   
   -REFRESH_TOKEN_SECRET: Key untuk generate dan verify refresh token. **Jangan ubah isi dari variable ini!**
   
   -PORT: Port yang digunakan untuk request yang akan diterima. Biasanya port yang digunakan yaitu 8080.
   
   -DB_CLIENT: Database client yang digunakan agar terhubung dengan database. Dalam hal ini, database yang digunakan yaitu MySQL.
   
   -DB_HOST: Hostname atau IP address dari server database. Jika dijalankan secara lokal, dapat ditulis 'localhost' atau '127.0.0.1'
   
   -DB_USER: Username yang digunakan oleh server database. Biasanya menggunakan 'root'.
   
   -DB_PASSWORD: Password yang digunakan oleh server database.
   
   -DB_NAME: Nama database yang digunakan. Gunakan nama yang sebelumnya telah dibuat pada saat import database.
   
   -DB_PORT: Port yang digunakan oleh server database.
   
   **-CORS_ORIGIN_URL: URL dari client side / frontend. Bagian ini penting untuk diisi agar bagian halaman client / frontend dapat berkomunikasi dengan database.**
   
6. Jalankan API dengan command berikut.

   ```
   $ npm run start
   ```


## Dokumentasi

-[Dokumentasi API (Postman)](https://documenter.getpostman.com/view/27809099/2s9Ykn92BT)

-Desain database
![Desain-Database-Pramasti](https://github.com/aeliakim/pramasti-api/assets/128810396/3918a871-7944-496f-a07c-66af10764c45)
