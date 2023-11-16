CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  nrp INT NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  nohp VARCHAR(20),
  departemen VARCHAR(255),
  role ENUM('praktikan', 'asisten', 'koordinator', 'dosen', 'admin') NOT NULL,
  approved_by VARCHAR(255),
  profil_picture VARCHAR(255)
);

CREATE TABLE log (
  user VARCHAR(255) NOT NULL PRIMARY KEY,
  change_date DATE NOT NULL,
  changed_column VARCHAR(255),
  change_type ENUM('new', 'revision', 'delete') NOT NULL,
  status_before VARCHAR(255),
  status_after VARCHAR(255),
  date_now DATE NOT NULL
);

CREATE TABLE praktikum (
  praktikum_id INT AUTO_INCREMENT PRIMARY KEY,
  praktikum_name VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  logo_praktikum VARCHAR(255)
);

CREATE TABLE jadwalPraktikum (
  jadwal_id INT AUTO_INCREMENT PRIMARY KEY,
  praktikum_id INT NOT NULL,
  judul_modul VARCHAR(255) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  kuota INT NOT NULL,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE TABLE kelompok (
  kelompok_id INT AUTO_INCREMENT PRIMARY KEY,
  jadwal_id INT NOT NULL,
  kapasitas INT NOT NULL, -- jumlah maksimal anggota kelompok
  nama_kelompok VARCHAR(255) NOT NULL,
  FOREIGN KEY (jadwal_id) REFERENCES jadwalPraktikum(jadwal_id) ON DELETE CASCADE
);

CREATE TABLE mhsPilihPraktikum (
  user_id INT NOT NULL,
  praktikum_id INT NOT NULL,
  jadwal_id INT NOT NULL,
  kelompok_id INT NOT NULL,
  PRIMARY KEY (user_id, praktikum_id, jadwal_id, kelompok_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE,
  FOREIGN KEY (jadwal_id) REFERENCES jadwalPraktikum(jadwal_id) ON DELETE CASCADE,
  FOREIGN KEY (kelompok_id) REFERENCES kelompok(kelompok_id) ON DELETE CASCADE
);

CREATE TABLE asisten (
  asisten_id INT PRIMARY KEY,
  user_id INT NOT NULL,
  praktikum_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE TABLE nilai (
  nilai_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  praktikum_id INT NOT NULL,
  nilai float(5,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE TABLE pengumuman (
  pengumuman_id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL
);

CREATE TABLE asistenJadwal (
  asisten_id INT NOT NULL,
  jadwal_id INT NOT NULL,
  FOREIGN KEY (asisten_id) REFERENCES asisten(asisten_id) ON DELETE CASCADE,
  FOREIGN KEY (jadwal_id) REFERENCES jadwalPraktikum(jadwal_id) ON DELETE CASCADE
);

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  praktikum_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);
