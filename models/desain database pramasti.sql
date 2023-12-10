CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  nrp VARCHAR(30) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  nohp VARCHAR(20),
  departemen VARCHAR(255),
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
  id_modul VARCHAR(255) NOT NULL,
  id_modul_jadwal VARCHAR(255) NULL,
  praktikum_id INT NOT NULL,
  judul_modul VARCHAR(255) NULL,
  start_tgl DATE NULL,
  start_wkt TIME NULL,
  finish_tgl DATE NULL,
  finish_wkt TIME NULL,
  kuota INT NULL,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE TABLE kelompok (
  kelompok_id INT AUTO_INCREMENT PRIMARY KEY,
  kapasitas INT NOT NULL, -- jumlah maksimal anggota kelompok
  nama_kelompok VARCHAR(255),
  jadwal_id INT NOT NULL,
  FOREIGN KEY (jadwal_id) REFERENCES jadwalPraktikum(jadwal_id) ON DELETE CASCADE
);

CREATE TABLE mhsPilihPraktikum (
  user_id INT NOT NULL,
  praktikum_id INT NOT NULL,
  jadwal_id INT NOT NULL,
  kelompok_id INT DEFAULT NULL,
  PRIMARY KEY (user_id, praktikum_id, jadwal_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE,
  FOREIGN KEY (jadwal_id) REFERENCES jadwalPraktikum(jadwal_id) ON DELETE CASCADE,
  FOREIGN KEY (kelompok_id) REFERENCES kelompok(kelompok_id) ON DELETE SET NULL
);

CREATE TABLE nilai (
  user_id INT NOT NULL,
  praktikum_id INT NOT NULL,
  id_modul VARCHAR(255) NOT NULL,
  nilai_modul float(5,2) NULL,
  PRIMARY KEY (user_id, praktikum_id, id_modul),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE,
  FOREIGN KEY (id_modul) REFERENCES modul(id_modul) ON DELETE CASCADE
);

CREATE TABLE nilai_akhir (
    user_id INT NOT NULL,
    praktikum_id INT NOT NULL,
    nilai_akhir INT,
    PRIMARY KEY (user_id, praktikum_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE TABLE pengumuman (
  pengumuman_id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL
);

CREATE TABLE asistenJadwal (
  user_id INT NOT NULL,
  jadwal_id INT NOT NULL,
  praktikum_id INT,
  PRIMARY KEY (jadwal_id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (jadwal_id) REFERENCES jadwalPraktikum(jadwal_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  praktikum_id INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (praktikum_id) REFERENCES praktikum(praktikum_id) ON DELETE CASCADE
);

CREATE Table tokens (
  id_token int AUTO_INCREMENT NOT NULL,
  user_id int(11) NOT NULL,
  token text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id_token),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
