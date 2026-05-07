# Diagramas de Flujo — MusicPlayer

Los diagramas están escritos en sintaxis **Mermaid** y se renderizan automáticamente en GitHub, GitLab y VS Code (extensión Mermaid Preview).

---

## 1. Flujo de autenticación

```mermaid
flowchart TD
    A([Usuario accede a la app]) --> B{¿Tiene token JWT válido?}
    B -- Sí --> C[Cargar perfil de usuario]
    B -- No --> D[Redirigir a /login]
    D --> E[Mostrar formulario de login]
    E --> F[Usuario introduce credenciales]
    F --> G[POST /api/authenticate]
    G --> H{¿Credenciales válidas?}
    H -- No --> I[Mostrar error en formulario]
    I --> E
    H -- Sí --> J[Guardar JWT en localStorage]
    J --> C
    C --> K{¿Qué rol tiene?}
    K -- ROLE_ADMIN --> L[Dashboard Administrador]
    K -- ROLE_EDITOR / ROLE_ARTIST --> M[Dashboard Editor]
    K -- ROLE_USER --> N[Dashboard Oyente]
```

---

## 2. Flujo de reproducción y letras de canción

```mermaid
flowchart TD
    A([Usuario en lista de canciones]) --> B[Click en canción]
    B --> C[Player bar muestra nombre y artista]
    C --> D[Usuario pulsa Play]
    D --> E[Toggle estado isPlaying]
    E --> F[Icono cambia a Pause]
    F --> G{¿Usuario quiere ver letras?}
    G -- No --> H([Continúa escuchando])
    G -- Sí --> I[Click en botón de letras]
    I --> J[showLyrics = true]
    J --> K[Panel de letras se despliega]
    K --> L[LyricsService.getLyrics llamado]
    L --> M[GET lyrics.ovh/v1/artista/titulo]
    M --> N{¿Letras encontradas?}
    N -- Sí --> O[Mostrar texto de la letra]
    N -- No --> P[Mostrar mensaje: No se encontraron letras]
    O --> Q{¿Cerrar panel?}
    P --> Q
    Q -- Sí --> R[Click en botón de letras]
    R --> S[showLyrics = false, panel se cierra]
```

---

## 3. Flujo de gestión de playlist

```mermaid
flowchart TD
    A([Usuario autenticado]) --> B[Navegar a Playlists]
    B --> C[Ver lista de playlists propias]
    C --> D{¿Acción?}
    D -- Crear nueva --> E[Click en Crear playlist]
    E --> F[Formulario: nombre, descripción, pública/privada]
    F --> G[POST /api/playlists]
    G --> H[Playlist creada]
    H --> C
    D -- Añadir canción --> I[Abrir detalle de playlist]
    I --> J[Ir a PlaylistSong / Añadir]
    J --> K[Seleccionar canción y posición]
    K --> L[POST /api/playlist-songs]
    L --> M[Canción añadida a la playlist]
    M --> I
    D -- Eliminar playlist --> N[Click en eliminar]
    N --> O{¿Confirmar?}
    O -- No --> C
    O -- Sí --> P[DELETE /api/playlists/id]
    P --> C
```

---

## 4. Flujo de registro de usuario

```mermaid
flowchart TD
    A([Usuario en /login]) --> B[Click en Registrarse]
    B --> C[Formulario de registro]
    C --> D[Introduce: login, email, contraseña, nombre]
    D --> E{¿Formulario válido?}
    E -- No --> F[Mostrar errores de validación]
    F --> C
    E -- Sí --> G[POST /api/register]
    G --> H{¿Login/email disponibles?}
    H -- No --> I[Error: usuario ya existe]
    I --> C
    H -- Sí --> J[Cuenta creada]
    J --> K[Email de activación enviado]
    K --> L[Usuario pulsa enlace de activación]
    L --> M[GET /api/activate?key=...]
    M --> N[Cuenta activada]
    N --> O[Redirigir a /login]
    O --> P([Usuario puede iniciar sesión])
```

---

## 5. Diagrama de componentes Angular

```mermaid
graph TD
    subgraph AppRoot
        APP[App Component]
        MAIN[Main Component]
    end

    subgraph Layouts
        NAV[Navbar]
        SIDE[Sidebar]
        PLAYER[PlayerBar]
    end

    subgraph Home
        H[HomeComponent]
        DA[DashboardAdmin]
        DE[DashboardEditor]
        DU[DashboardUser]
    end

    subgraph Entities
        SONG[SongComponent]
        ALBUM[AlbumComponent]
        ARTIST[ArtistComponent]
        PLAYLIST[PlaylistComponent]
        GENRE[GenreComponent]
        LIKE[LikeComponent]
        PLAY[PlayComponent]
    end

    subgraph Core
        AUTH[AuthService]
        ACCOUNT[AccountService]
        LYRICS[LyricsService]
        INTERCEPTORS[Interceptores HTTP]
    end

    APP --> MAIN
    MAIN --> NAV
    MAIN --> SIDE
    MAIN --> PLAYER
    MAIN --> H
    H --> DA
    H --> DE
    H --> DU
    MAIN --> SONG
    MAIN --> ALBUM
    MAIN --> ARTIST
    MAIN --> PLAYLIST
    MAIN --> GENRE
    MAIN --> LIKE
    MAIN --> PLAY
    PLAYER --> LYRICS
    NAV --> ACCOUNT
    SIDE --> ACCOUNT
    H --> ACCOUNT
    AUTH --> INTERCEPTORS

    linkStyle 0 stroke:#4285f4,stroke-width:2px
    linkStyle 1,2,3 stroke:#34a853,stroke-width:2px
    linkStyle 4,5,6,7 stroke:#fbbc04,stroke-width:2px
    linkStyle 8,9,10,11,12,13,14 stroke:#9c27b0,stroke-width:2px
    linkStyle 15,16,17,18,19 stroke:#ea4335,stroke-width:2px
```

---

## 6. Flujo de control de acceso por rol

```mermaid
flowchart TD
    A([Petición de navegación]) --> B[AuthGuard.canActivate]
    B --> C{¿Token JWT presente?}
    C -- No --> D[Redirigir a /login]
    C -- Sí --> E{¿Token válido y no expirado?}
    E -- No --> D
    E -- Sí --> F{¿Ruta requiere rol específico?}
    F -- No --> G[Permitir acceso]
    F -- Sí --> H{¿Usuario tiene el rol?}
    H -- Sí --> G
    H -- No --> I[Redirigir a /accessdenied]
```
