-- =====================================================
-- Diagrama 5: Arquitectura de Componentes Angular
-- MusicPlayer TFG
-- Uso: ejecutar en MySQL Workbench → luego
--      Database > Reverse Engineer → ver EER Diagram
-- =====================================================

DROP DATABASE IF EXISTS music_player_components;
CREATE DATABASE music_player_components CHARACTER SET utf8mb4;
USE music_player_components;

-- ── AppRoot ──────────────────────────────────────────
CREATE TABLE app_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'AppComponent'
);

CREATE TABLE main_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'MainComponent',
  app_component_id INT NOT NULL,
  FOREIGN KEY (app_component_id) REFERENCES app_component(id)
);

-- ── Core (sin dependencias hacia arriba) ─────────────
CREATE TABLE account_service (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'AccountService'
);

CREATE TABLE auth_service (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'AuthService'
);

CREATE TABLE interceptores_http (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'InterceptoresHTTP',
  auth_service_id INT NOT NULL,
  FOREIGN KEY (auth_service_id) REFERENCES auth_service(id)
);

-- ── Layouts ──────────────────────────────────────────
CREATE TABLE navbar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'Navbar',
  main_component_id INT NOT NULL,
  account_service_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id),
  FOREIGN KEY (account_service_id) REFERENCES account_service(id)
);

CREATE TABLE sidebar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'Sidebar',
  main_component_id INT NOT NULL,
  account_service_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id),
  FOREIGN KEY (account_service_id) REFERENCES account_service(id)
);

CREATE TABLE lyrics_service (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'LyricsService'
);

CREATE TABLE player_bar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'PlayerBar',
  main_component_id INT NOT NULL,
  lyrics_service_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id),
  FOREIGN KEY (lyrics_service_id) REFERENCES lyrics_service(id)
);

-- ── Home ─────────────────────────────────────────────
CREATE TABLE home_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'HomeComponent',
  main_component_id INT NOT NULL,
  account_service_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id),
  FOREIGN KEY (account_service_id) REFERENCES account_service(id)
);

CREATE TABLE dashboard_admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'DashboardAdmin',
  home_component_id INT NOT NULL,
  FOREIGN KEY (home_component_id) REFERENCES home_component(id)
);

CREATE TABLE dashboard_editor (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'DashboardEditor',
  home_component_id INT NOT NULL,
  FOREIGN KEY (home_component_id) REFERENCES home_component(id)
);

CREATE TABLE dashboard_user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'DashboardUser',
  home_component_id INT NOT NULL,
  FOREIGN KEY (home_component_id) REFERENCES home_component(id)
);

-- ── Entities ─────────────────────────────────────────
CREATE TABLE song_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'SongComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);

CREATE TABLE album_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'AlbumComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);

CREATE TABLE artist_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'ArtistComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);

CREATE TABLE playlist_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'PlaylistComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);

CREATE TABLE genre_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'GenreComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);

CREATE TABLE like_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'LikeComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);

CREATE TABLE play_component (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) DEFAULT 'PlayComponent',
  main_component_id INT NOT NULL,
  FOREIGN KEY (main_component_id) REFERENCES main_component(id)
);
