# Modelo de datos

## Entidades del sistema

### Genre (Genero musical)

Representa los generos musicales disponibles en la plataforma.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| name | String | Requerido, unico, maximo 50 caracteres |

**Relaciones:**
- Uno a muchos con Album (opcional)
- Uno a muchos con Song (opcional)

---

### Artist (Artista)

Almacena la informacion de los artistas musicales.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| name | String | Requerido, maximo 100 caracteres |
| bio | TextBlob | Biografia del artista |
| image | String | URL de imagen, maximo 255 caracteres |
| country | String | Codigo de pais ISO 3166-1 alpha-2 |
| verified | Boolean | Indica si el artista esta verificado |
| createdAt | Instant | Fecha de creacion del registro |

**Relaciones:**
- Uno a muchos con Album (requerido)
- Muchos a muchos con Song (artistas colaboradores)
- Uno a muchos con UserFollower (seguidores)

---

### Album

Representa los albumes musicales publicados en la plataforma.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| title | String | Requerido, maximo 150 caracteres |
| coverImage | String | URL de portada, maximo 255 caracteres |
| releaseDate | LocalDate | Fecha de lanzamiento |
| albumType | Enum | ALBUM, SINGLE, EP, PODCAST_SERIES |

**Relaciones:**
- Muchos a uno con Artist (requerido)
- Muchos a uno con Genre (opcional)
- Uno a muchos con Song

---

### Song (Cancion)

almacena la informacion de las canciones disponibles.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| title | String | Requerido, maximo 150 caracteres |
| duration | Integer | Duracion en segundos |
| fileUrl | String | URL del archivo de audio, requerido, maximo 255 caracteres |
| coverImage | String | URL de portada, maximo 255 caracteres |
| lyrics | TextBlob | Letra de la cancion |
| releaseDate | LocalDate | Fecha de lanzamiento |
| createdAt | Instant | Fecha de creacion del registro |

**Relaciones:**
- Muchos a uno con Album (opcional)
- Muchos a uno con Genre (opcional)
- Muchos a muchos con Artist
- Uno a muchos con Play
- Uno a muchos con Like
- Uno a muchos con PlaylistSong

---

### Playlist (Lista de reproduccion)

Representa las listas de reproduccion creadas por los usuarios.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| name | String | Requerido, maximo 100 caracteres |
| description | TextBlob | Descripcion de la lista |
| isPublic | Boolean | Indica si es publicly accesible |
| coverImage | String | URL de imagen de portada, maximo 255 caracteres |
| createdAt | Instant | Fecha de creacion |
| updatedAt | Instant | Fecha de ultima modificacion |

**Relaciones:**
- Muchos a uno con User (requerido, usando builtInEntity)
- Uno a muchos con PlaylistSong

---

### PlaylistSong

Entidad de union entre Playlist y Song para manejar el orden de las canciones.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| position | Integer | Posicion en la lista de reproduccion |
| addedAt | Instant | Fecha en que se agrego la cancion |

**Relaciones:**
- Muchos a uno con Playlist (requerido)
- Muchos a uno con Song (requerido)

---

### Play (Reproduccion)

Registra cada vez que un usuario reproduce una cancion.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| playedAt | Instant | Momento en que se inicio la reproduccion |
| durationListened | Integer | Segundos escuchados |

**Relaciones:**
- Muchos a uno con User (usando builtInEntity)
- Muchos a uno con Song

---

### Like (Me gusta)

Registra los likes de usuarios en canciones.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| createdAt | Instant | Fecha en que se dio el like |

**Relaciones:**
- Muchos a uno con User (usando builtInEntity)
- Muchos a uno con Song

---

### UserProfile (Perfil de usuario)

Extension del perfil de usuario base con informacion adicional.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| bio | TextBlob | Biografia del usuario |
| profileImage | String | URL de imagen de perfil, maximo 255 caracteres |

**Relaciones:**
- Uno a uno con User (requerido, usando builtInEntity)

---

### UserFollower (Seguimiento)

Registra las relaciones de seguimiento entre usuarios y artistas.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Long | Clave primaria |
| createdAt | Instant | Fecha en que se inicio el seguimiento |

**Relaciones:**
- Muchos a uno con User como follower (requerido, usando builtInEntity)
- Muchos a uno con User como followed (requerido, usando builtInEntity)

---

## Diagramas de relaciones

```
User <1----1> UserProfile
User <1----*> Play
User <1----*> Like
User <1----*> Playlist
User <1----*> UserFollower (como follower)
User <1----*> UserFollower (como seguido)

Artist <1----*> Album
Artist <*----*> Song (muchos a muchos)

Album <1----*> Artist
Album <*----> Genre (opcional)
Album <1----*> Song

Song <*----> Album (opcional)
Song <*----> Genre (opcional)
Song <1----*> Play
Song <1----*> Like
Song <1----*> PlaylistSong

Playlist <1----*> User
Playlist <1----*> PlaylistSong
PlaylistSong <*----> Song

Artist <1----*> UserFollower
```

## Tipos de album

El campo albumType es un enumerador con los siguientes valores:

- **ALBUM**: Album musical completo tradicional
- **SINGLE**: Tema musical individual publicado por separado
- **EP**: Extended Play, formato intermedio entre single y album
- **PODCAST_SERIES**: Serie de episodios de podcast
