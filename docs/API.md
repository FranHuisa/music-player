# Documentación de la API REST

## Información general

La API de MusicPlayer expone endpoints RESTful para todas las entidades del sistema. Todos los endpoints requieren autenticación JWT salvo `/api/authenticate` y `/api/register`.

Las listas devuelven un **array JSON** con la cabecera `X-Total-Count` indicando el total de registros. Admiten paginación mediante `?page=0&size=20&sort=id,asc`.

---

## Autenticación

### Iniciar sesión

**POST** `/api/authenticate`

**Cuerpo:**
```json
{
  "username": "admin",
  "password": "admin",
  "rememberMe": false
}
```

**Respuesta 200:**
```json
{
  "id_token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

Usar el token en peticiones posteriores: `Authorization: Bearer <id_token>`

---

### Registrar usuario

**POST** `/api/register`

**Cuerpo:**
```json
{
  "login": "nuevousuario",
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "langKey": "es"
}
```

**Respuesta 201** (sin cuerpo). Se envía email de activación.

---

### Activar cuenta

**GET** `/api/activate?key={clave}`

Activa la cuenta con la clave recibida por email.

---

### Obtener cuenta actual

**GET** `/api/account`

Devuelve el perfil del usuario autenticado.

---

### Cambiar contraseña

**POST** `/api/account/change-password`

```json
{
  "currentPassword": "actual",
  "newPassword": "nueva"
}
```

---

## Géneros musicales

### Listar géneros

**GET** `/api/genres`

Respuesta — array:
```json
[
  { "id": 1, "name": "Rock" },
  { "id": 2, "name": "Pop" }
]
```
Cabecera: `X-Total-Count: 15`

### Obtener género

**GET** `/api/genres/{id}`

### Crear género *(requiere ROLE_ADMIN)*

**POST** `/api/genres`
```json
{ "name": "Jazz" }
```

### Actualizar género *(requiere ROLE_ADMIN)*

**PUT** `/api/genres/{id}`

### Eliminar género *(requiere ROLE_ADMIN)*

**DELETE** `/api/genres/{id}` → 204

---

## Artistas

### Listar artistas

**GET** `/api/artists`

Respuesta — array:
```json
[
  {
    "id": 1,
    "name": "The Beatles",
    "bio": "Banda inglesa...",
    "country": "UK",
    "verified": true
  }
]
```

### Obtener artista

**GET** `/api/artists/{id}`

### Crear artista *(requiere ROLE_ADMIN o ROLE_EDITOR)*

**POST** `/api/artists`
```json
{
  "name": "Artista Nuevo",
  "bio": "Descripción",
  "country": "ES",
  "verified": false
}
```

### Actualizar artista

**PUT** `/api/artists/{id}`

### Eliminar artista *(requiere ROLE_ADMIN)*

**DELETE** `/api/artists/{id}` → 204

---

## Álbumes

### Listar álbumes

**GET** `/api/albums`

Respuesta — array:
```json
[
  {
    "id": 1,
    "title": "Abbey Road",
    "releaseDate": "1969-09-26",
    "albumType": "ALBUM",
    "artist": { "id": 1, "name": "The Beatles" },
    "genre": { "id": 1, "name": "Rock" }
  }
]
```

Tipos válidos para `albumType`: `ALBUM`, `SINGLE`, `EP`, `PODCAST_SERIES`

### Obtener álbum

**GET** `/api/albums/{id}`

### Crear álbum *(requiere ROLE_ADMIN o ROLE_EDITOR)*

**POST** `/api/albums`
```json
{
  "title": "Nuevo álbum",
  "releaseDate": "2024-01-15",
  "albumType": "ALBUM",
  "artist": { "id": 1 },
  "genre": { "id": 2 }
}
```

### Actualizar álbum

**PUT** `/api/albums/{id}`

### Eliminar álbum *(requiere ROLE_ADMIN)*

**DELETE** `/api/albums/{id}` → 204

---

## Canciones

### Listar canciones

**GET** `/api/songs`

Respuesta — array:
```json
[
  {
    "id": 1,
    "title": "Come Together",
    "duration": 259,
    "fileUrl": "https://...",
    "coverImage": "https://...",
    "releaseDate": "1969-09-26",
    "album": { "id": 1, "title": "Abbey Road" },
    "genre": { "id": 1, "name": "Rock" },
    "artistses": [{ "id": 1, "name": "The Beatles" }]
  }
]
```

### Obtener canción

**GET** `/api/songs/{id}`

### Crear canción *(requiere ROLE_ADMIN o ROLE_EDITOR)*

**POST** `/api/songs`
```json
{
  "title": "Nueva canción",
  "duration": 180,
  "fileUrl": "https://storage.ejemplo.com/cancion.mp3",
  "releaseDate": "2024-01-15",
  "album": { "id": 1 },
  "genre": { "id": 1 },
  "artistses": [{ "id": 1 }]
}
```

### Actualizar canción

**PUT** `/api/songs/{id}`

### Eliminar canción *(requiere ROLE_ADMIN)*

**DELETE** `/api/songs/{id}` → 204

---

## Listas de reproducción

### Listar playlists

**GET** `/api/playlists`

Respuesta — array:
```json
[
  {
    "id": 1,
    "name": "Mis favoritas",
    "description": "...",
    "isPublic": true,
    "user": { "id": 1, "login": "user" }
  }
]
```

### Obtener playlist

**GET** `/api/playlists/{id}`

### Crear playlist

**POST** `/api/playlists`
```json
{
  "name": "Mi nueva lista",
  "description": "Descripción opcional",
  "isPublic": false
}
```

### Actualizar playlist

**PUT** `/api/playlists/{id}`

### Eliminar playlist

**DELETE** `/api/playlists/{id}` → 204

---

## Canciones en playlist

### Listar entradas

**GET** `/api/playlist-songs`

### Añadir canción a playlist

**POST** `/api/playlist-songs`
```json
{
  "position": 1,
  "playlist": { "id": 1 },
  "song": { "id": 5 }
}
```

### Actualizar posición

**PUT** `/api/playlist-songs/{id}`

### Quitar canción de playlist

**DELETE** `/api/playlist-songs/{id}` → 204

---

## Reproducciones (historial)

### Registrar reproducción

**POST** `/api/plays`
```json
{
  "playedAt": "2024-05-07T14:30:00Z",
  "durationListened": 180,
  "song": { "id": 5 }
}
```

### Listar reproducciones

**GET** `/api/plays`

### Obtener reproducción

**GET** `/api/plays/{id}`

### Eliminar entrada del historial

**DELETE** `/api/plays/{id}` → 204

---

## Likes (canciones favoritas)

### Listar likes

**GET** `/api/likes`

### Dar like a una canción

**POST** `/api/likes`
```json
{
  "song": { "id": 5 }
}
```

### Obtener like

**GET** `/api/likes/{id}`

### Eliminar like

**DELETE** `/api/likes/{id}` → 204

---

## Gestión de usuarios *(requiere ROLE_ADMIN)*

### Listar usuarios

**GET** `/api/admin/users`

### Crear usuario

**POST** `/api/admin/users`

### Actualizar usuario

**PUT** `/api/admin/users`

### Eliminar usuario

**DELETE** `/api/admin/users/{login}` → 204

---

## Códigos de respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK — operación exitosa |
| 201 | Created — recurso creado |
| 204 | No Content — eliminado exitosamente |
| 400 | Bad Request — datos inválidos |
| 401 | Unauthorized — token ausente o expirado |
| 403 | Forbidden — sin permiso de rol |
| 404 | Not Found — recurso no encontrado |
| 500 | Internal Server Error |
