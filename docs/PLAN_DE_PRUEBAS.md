# Plan de Pruebas — MusicPlayer

## 1. Introducción

Este documento describe la estrategia de pruebas aplicada al proyecto MusicPlayer. Cubre los tipos de prueba empleados, los casos de prueba por módulo y los criterios de aceptación para cada uno.

---

## 2. Estrategia de pruebas

### 2.1 Tipos de prueba

| Tipo | Herramienta | Alcance |
|------|------------|---------|
| Pruebas unitarias (frontend) | Vitest 4.x | Servicios Angular, lógica de componentes |
| Pruebas de integración (backend) | JUnit 5 + Spring Boot Test | Controladores REST, repositorios JPA |
| Pruebas manuales funcionales | Navegador + Postman | Flujos de usuario completos |
| Pruebas de regresión visual | Manual en Chrome/Firefox | Consistencia del diseño tras cambios |

### 2.2 Entorno de pruebas

- **Frontend**: servidor de desarrollo Angular en `http://localhost:4200`
- **Backend**: servidor Spring Boot en `http://localhost:8080`
- **Base de datos**: MySQL en Docker (`localhost:3306`) o H2 en memoria para pruebas unitarias
- **Credenciales de prueba**:
  - Administrador: `admin / admin`
  - Oyente: `user / user`

---

## 3. Casos de prueba

### 3.1 Módulo de autenticación

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| AUTH-01 | Login con credenciales válidas | 1. Ir a `/login` 2. Introducir `admin/admin` 3. Pulsar "Iniciar sesión" | Redirige al dashboard de administrador | ✅ Pasa |
| AUTH-02 | Login con credenciales inválidas | 1. Ir a `/login` 2. Introducir usuario/contraseña incorrectos 3. Pulsar "Iniciar sesión" | Muestra mensaje de error, no redirige | ✅ Pasa |
| AUTH-03 | Logout | 1. Estar autenticado 2. Pulsar "Cerrar sesión" en el navbar | Redirige a `/login`, token eliminado | ✅ Pasa |
| AUTH-04 | Acceso a ruta protegida sin token | 1. Sin autenticar, navegar a `/home` | Redirige a `/login` | ✅ Pasa |
| AUTH-05 | Acceso a ruta de admin con rol usuario | 1. Autenticar como `user/user` 2. Navegar a `/admin` | Muestra pantalla de acceso denegado | ✅ Pasa |
| AUTH-06 | Persistencia de sesión tras refresco | 1. Autenticar 2. Refrescar la página (F5) | El usuario sigue autenticado | ✅ Pasa |

---

### 3.2 Módulo de dashboards por rol

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| DASH-01 | Dashboard administrador | Autenticar como `admin/admin` | Muestra métricas y accesos de administración | ✅ Pasa |
| DASH-02 | Dashboard editor | Autenticar como usuario con rol EDITOR | Muestra catálogo musical y herramientas de edición | ✅ Pasa |
| DASH-03 | Dashboard oyente | Autenticar como `user/user` | Muestra listas de reproducción e historial | ✅ Pasa |
| DASH-04 | Sidebar adaptada por rol | Autenticar con distintos roles | Los enlaces del sidebar varían según el rol | ✅ Pasa |

---

### 3.3 Módulo de gestión de canciones

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| SONG-01 | Listar canciones | Navegar a `/song` | Se muestra tabla con canciones paginada | ✅ Pasa |
| SONG-02 | Crear canción (editor) | Como editor, ir a `/song/new`, rellenar formulario, guardar | Canción creada y visible en la lista | ✅ Pasa |
| SONG-03 | Editar canción | En lista, pulsar lápiz en una canción, modificar título, guardar | Los cambios se reflejan en la lista | ✅ Pasa |
| SONG-04 | Eliminar canción | En lista, pulsar papelera, confirmar | Canción desaparece de la lista | ✅ Pasa |
| SONG-05 | Ver detalle de canción | Pulsar sobre el nombre de una canción | Se muestra página de detalle con todos los campos | ✅ Pasa |
| SONG-06 | Usuario sin permisos no ve botones de edición | Autenticar como `user/user`, navegar a `/song` | Botones de crear/editar/borrar no aparecen | ✅ Pasa |

---

### 3.4 Módulo del reproductor

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| PLAY-01 | Barra del reproductor visible | Navegar a cualquier página tras login | Player bar fija en la parte inferior | ✅ Pasa |
| PLAY-02 | Toggle reproducir/pausar | Pulsar el botón central del reproductor | El icono alterna entre play y pause | ✅ Pasa |
| PLAY-03 | Toggle aleatorio | Pulsar botón de aleatorio | El botón cambia a estado activo (color acento) | ✅ Pasa |
| PLAY-04 | Toggle repetir | Pulsar botón de repetición | El botón cambia a estado activo | ✅ Pasa |
| PLAY-05 | Control de volumen | Mover el slider de volumen | La barra de volumen refleja el cambio | ✅ Pasa |
| PLAY-06 | Silenciar/des-silenciar | Pulsar el icono de volumen | El icono alterna y el slider va a 0 y vuelve | ✅ Pasa |
| PLAY-07 | Barra de progreso | Mover el slider de progreso | La barra fill refleja la posición seleccionada | ✅ Pasa |

---

### 3.5 Módulo de letras de canciones

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| LYR-01 | Mostrar panel de letras | Pulsar el botón de letras en el player bar | El panel de letras se despliega encima del reproductor | ✅ Pasa |
| LYR-02 | Ocultar panel de letras | Con panel abierto, pulsar el botón de letras de nuevo | El panel se cierra | ✅ Pasa |
| LYR-03 | Indicador de carga | Pulsar botón de letras | Aparece spinner mientras se obtienen las letras | ✅ Pasa |
| LYR-04 | Letras encontradas | Canción con artista y título conocidos (ej. "Ed Sheeran - Shape of You") | Se muestra el texto completo de la letra | ✅ Pasa |
| LYR-05 | Letras no encontradas | Canción con datos ficticios o desconocidos | Se muestra "No se encontraron letras para esta canción." | ✅ Pasa |
| LYR-06 | Error de red | Simular desconexión y pulsar botón de letras | Se muestra mensaje de error amigable | ✅ Pasa |

---

### 3.6 Módulo de listas de reproducción

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| PLIST-01 | Crear lista de reproducción | Navegar a `/playlist/new`, rellenar nombre, guardar | Lista creada y visible | ✅ Pasa |
| PLIST-02 | Ver canciones de una playlist | Abrir detalle de playlist | Se listan las canciones asociadas | ✅ Pasa |
| PLIST-03 | Añadir canción a playlist | Desde la gestión de PlaylistSong, asociar canción | La canción aparece en la playlist | ✅ Pasa |
| PLIST-04 | Playlist pública vs privada | Crear playlist con `isPublic: false` | Solo el propietario la ve | ✅ Pasa |

---

### 3.7 Módulo de artistas y álbumes

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| ART-01 | Listar artistas | Navegar a `/artist` | Tabla de artistas paginada | ✅ Pasa |
| ART-02 | Artista verificado | Crear artista con `verified: true` | El campo se muestra en detalle | ✅ Pasa |
| ALB-01 | Crear álbum | Como editor, crear álbum con tipo ALBUM | Álbum creado y asociado al artista | ✅ Pasa |
| ALB-02 | Tipos de álbum | Verificar opciones del selector | Muestra: ALBUM, SINGLE, EP, PODCAST_SERIES | ✅ Pasa |

---

## 4. Pruebas de regresión visual

Se realizaron pruebas visuales manuales tras cada cambio significativo de SCSS verificando:

- Consistencia del tema oscuro en todas las páginas.
- Correcto solapamiento de sidebar, navbar y player bar sin contenido oculto.
- Responsividad en ancho 375px (móvil), 768px (tablet) y 1280px+ (escritorio).
- Contraste de texto legible en todos los elementos.

---

## 5. Pruebas de integración backend

Las pruebas de integración del backend se ubican en `src/test/java/com/musicplayer/`. Verifican:

- Autenticación y generación de JWT (`AuthenticateControllerIT`).
- Operaciones CRUD en los controladores REST principales.
- Validación de restricciones de campos en las entidades.
- Control de acceso por rol en endpoints protegidos.

Para ejecutar:
```bash
./mvnw verify
```

---

## 6. Cobertura y herramientas

- **Frontend**: configuración de Vitest en `vitest.config.ts`. Ejecutar con `npm test`.
- **Backend**: JaCoCo para reporte de cobertura. Ejecutar con `./mvnw test`.
- **Linting**: ESLint + Prettier en frontend. Ejecutar con `npm run lint`.
