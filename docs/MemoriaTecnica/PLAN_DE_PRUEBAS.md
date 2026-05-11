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
| ART-03 | Editar artista propio | Como artista, editar el nombre propio | Cambios guardados correctamente | ✅ Pasa |
| ART-04 | Buscar artista por nombre | Navegar a `/artist?name=test` | Solo aparecen artistas cuyo nombre contiene "test" | ✅ Pasa |
| ALB-01 | Crear álbum | Como editor, crear álbum con tipo ALBUM | Álbum creado y asociado al artista automáticamente | ✅ Pasa |
| ALB-02 | Tipos de álbum | Verificar opciones del selector | Muestra: ALBUM, SINGLE, EP, PODCAST_SERIES | ✅ Pasa |
| ALB-03 | Álbum creado inactivo | Crear álbum como artista | El campo `active` es `false` por defecto hasta aprobación | ✅ Pasa |
| ALB-04 | Activar álbum (admin) | Autenticar como admin, activar álbum | El álbum pasa a visible para oyentes | ✅ Pasa |
| ALB-05 | Listar canciones de un álbum | Abrir detalle del álbum | Se muestran las canciones asociadas | ✅ Pasa |

---

### 3.8 Módulo de canciones favoritas (Likes)

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| LIKE-01 | Dar like a una canción | Como oyente, pulsar el botón de corazón en una canción | El icono pasa a estado activo (relleno) | ✅ Pasa |
| LIKE-02 | Quitar like | Con like activo, pulsar el botón de corazón de nuevo | El icono vuelve a estado inactivo | ✅ Pasa |
| LIKE-03 | Ver canciones favoritas | Navegar al dashboard de oyente, sección favoritos | Se listan las canciones marcadas con like | ✅ Pasa |
| LIKE-04 | Persistencia de like | Dar like, cerrar sesión, volver a entrar | El like sigue activo al recargar | ✅ Pasa |
| LIKE-05 | Like sin autenticar | Sin login, pulsar botón de like | Redirige a `/login` | ✅ Pasa |

---

### 3.9 Módulo de búsqueda de canciones

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| SRCH-01 | Búsqueda por título exacto | Escribir el título completo de una canción en el buscador | La canción aparece en los resultados | ✅ Pasa |
| SRCH-02 | Búsqueda parcial | Escribir las primeras 3 letras del título | Se muestran todas las canciones cuyo título contiene esas letras | ✅ Pasa |
| SRCH-03 | Búsqueda insensible a mayúsculas | Escribir el título en mayúsculas | Los resultados son los mismos que con minúsculas | ✅ Pasa |
| SRCH-04 | Sin resultados | Escribir un título inexistente | Se muestra mensaje "No se encontraron canciones" | ✅ Pasa |
| SRCH-05 | Debounce de búsqueda | Escribir rápidamente 5 caracteres | Solo se realiza una petición al backend (300 ms de debounce) | ✅ Pasa |
| SRCH-06 | Solo muestra canciones activas | Buscar una canción marcada como inactiva | No aparece en los resultados de búsqueda | ✅ Pasa |

---

### 3.10 Módulo de subida de ficheros

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| UPLOAD-01 | Subir imagen PNG como portada | En formulario de canción, seleccionar imagen PNG < 15 MB | La URL de portada se guarda; la imagen aparece en la tarjeta | ✅ Pasa |
| UPLOAD-02 | Subir imagen JPEG como portada de álbum | En formulario de álbum, seleccionar imagen JPEG | La portada del álbum se actualiza | ✅ Pasa |
| UPLOAD-03 | Subir fichero MP3 como canción | En formulario de canción, seleccionar fichero MP3 | La URL de audio se guarda en `fileUrl` | ✅ Pasa |
| UPLOAD-04 | Rechazar tipo de fichero incorrecto (imagen como audio) | Intentar subir un PNG al endpoint de audio | Respuesta 400 con `{"error": "Solo se permiten archivos de audio"}` | ✅ Pasa |
| UPLOAD-05 | Rechazar tipo incorrecto (audio como imagen) | Intentar subir un MP3 al endpoint de imagen | Respuesta 400 con `{"error": "Solo se permiten imágenes"}` | ✅ Pasa |
| UPLOAD-06 | Rechazar fichero mayor de 15 MB | Intentar subir un fichero de 20 MB | Respuesta 413 `Payload Too Large` antes de llegar al controlador | ✅ Pasa |
| UPLOAD-07 | Nombres únicos por UUID | Subir dos ficheros con el mismo nombre original | Los dos se guardan con nombres UUID diferentes; ninguno sobreescribe al otro | ✅ Pasa |
| UPLOAD-08 | Streaming de audio desde el servidor | Reproducir una canción subida previamente | El audio se reproduce desde `/api/upload/stream/{filename}` | ✅ Pasa |
| UPLOAD-09 | Salto en la línea de tiempo (scrubbing) | Durante reproducción, arrastrar el slider a una posición | El audio comienza desde la posición seleccionada (rango HTTP) | ✅ Pasa |
| UPLOAD-10 | Protección path traversal | Solicitar `GET /api/upload/stream/../../application.yml` | Respuesta 400 Bad Request; el fichero no se sirve | ✅ Pasa |
| UPLOAD-11 | Subida sin autenticar | Intentar POST a `/api/upload/image` sin token JWT | Respuesta 401 Unauthorized | ✅ Pasa |

---

### 3.11 Módulo de control de propiedad y seguridad

| ID | Descripción | Pasos | Resultado esperado | Resultado |
|----|-------------|-------|--------------------|-----------|
| SEC-01 | Editar canción de otro artista | Como artista A, intentar editar una canción del artista B | El botón de edición no aparece en la UI; si se llama al endpoint directamente, devuelve 400 | ✅ Pasa |
| SEC-02 | Eliminar canción ajena | Como artista A, intentar DELETE `/api/songs/{id-de-B}` directamente | Respuesta 400 o 403 según la implementación del guard | ✅ Pasa |
| SEC-03 | Crear canción sin perfil de artista | Usuario con `ROLE_USER` que no tiene perfil de artista intenta crear canción | Respuesta 400 con `{"errorKey": "artistnotfound"}` | ✅ Pasa |
| SEC-04 | Crear álbum asigna artista automático | Como artista, crear álbum sin especificar artista en el body | El álbum se crea con el artista del usuario autenticado; no se puede falsificar | ✅ Pasa |
| SEC-05 | Género solo lo crea el admin | Como oyente, intentar POST `/api/genres` | Respuesta 403 Forbidden | ✅ Pasa |
| SEC-06 | Token expirado redirige a login | Con un token caducado, navegar a ruta protegida | `authExpiredInterceptor` detecta 401 y redirige a `/login` | ✅ Pasa |
| SEC-07 | Token no se envía a APIs externas | Verificar en DevTools que peticiones a `api.lyrics.ovh` no incluyen cabecera Authorization | La cabecera `Authorization` solo aparece en peticiones al propio servidor | ✅ Pasa |
| SEC-08 | Playlist privada no visible para otros | Crear playlist con `isPublic: false`; acceder como otro usuario | La playlist no aparece en la lista del segundo usuario | ✅ Pasa |
| SEC-09 | Asignación de ROLE_ADMIN solo por admin | Como admin, asignar rol ROLE_ADMIN a un usuario; como USER, intentar lo mismo | Solo el admin puede modificar roles de otros usuarios | ✅ Pasa |

---

## 4. Pruebas de regresión visual

Se realizaron pruebas visuales manuales tras cada cambio significativo de SCSS verificando:

- Consistencia del tema oscuro en todas las páginas.
- Correcto solapamiento de sidebar, navbar y player bar sin contenido oculto.
- Responsividad en ancho 375px (móvil), 768px (tablet) y 1280px+ (escritorio).
- Contraste de texto legible en todos los elementos.

---

## 5. Pruebas de integración backend

Las pruebas de integración del backend se ubican en `src/test/java/com/musicplayer/`. Verifican el comportamiento de los controladores REST, los repositorios JPA y la capa de seguridad en un entorno de Spring Boot completo con base de datos H2 en memoria.

### 5.1 Configuración del entorno de pruebas

Las pruebas de integración arrancan un contexto de Spring Boot completo (`@SpringBootTest(webEnvironment = RANDOM_PORT)`) con el perfil `test`. Este perfil activa H2 en memoria y desactiva el envío real de correos electrónicos. Liquibase aplica todos los changelogs al inicio de cada ejecución, garantizando un esquema idéntico al de producción.

```java
@SpringBootTest(classes = MusicPlayerApp.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@WithMockUser
class SongResourceIT {
    @Autowired
    private MockMvc restSongMockMvc;
    // ...
}
```

`MockMvc` simula peticiones HTTP sin necesidad de un cliente HTTP real, lo que simplifica la configuración de pruebas y mejora el rendimiento.

### 5.2 Casos de prueba de integración del backend

| ID | Clase de prueba | Descripción | Resultado |
|----|----------------|-------------|-----------|
| IT-01 | `AuthenticateControllerIT` | Login con credenciales válidas devuelve token JWT | ✅ Pasa |
| IT-02 | `AuthenticateControllerIT` | Login con credenciales inválidas devuelve 401 | ✅ Pasa |
| IT-03 | `SongResourceIT` | GET `/api/songs` devuelve lista paginada con cabecera `X-Total-Count` | ✅ Pasa |
| IT-04 | `SongResourceIT` | POST `/api/songs` con body válido crea canción y devuelve 201 | ✅ Pasa |
| IT-05 | `SongResourceIT` | POST `/api/songs` sin campos requeridos devuelve 400 con detalle de validación | ✅ Pasa |
| IT-06 | `SongResourceIT` | DELETE `/api/songs/{id}` elimina la canción y devuelve 204 | ✅ Pasa |
| IT-07 | `AlbumResourceIT` | GET `/api/albums/{id}` de álbum inexistente devuelve 404 | ✅ Pasa |
| IT-08 | `AlbumResourceIT` | POST `/api/albums` sin `ROLE_ARTIST` devuelve 403 | ✅ Pasa |
| IT-09 | `PlaylistResourceIT` | POST `/api/playlists` asigna el usuario autenticado como propietario | ✅ Pasa |
| IT-10 | `PlaylistResourceIT` | GET `/api/playlists` filtra por usuario autenticado | ✅ Pasa |
| IT-11 | `GenreResourceIT` | POST `/api/genres` sin `ROLE_ADMIN` devuelve 403 | ✅ Pasa |
| IT-12 | `GenreResourceIT` | Nombre de género duplicado devuelve 400 con clave de error `nameexists` | ✅ Pasa |
| IT-13 | `UserResourceIT` | GET `/api/admin/users` sin `ROLE_ADMIN` devuelve 403 | ✅ Pasa |
| IT-14 | `AccountResourceIT` | GET `/api/account` devuelve perfil del usuario autenticado | ✅ Pasa |
| IT-15 | `AccountResourceIT` | POST `/api/account/change-password` con contraseña actual correcta actualiza | ✅ Pasa |

Para ejecutar la suite completa:
```bash
./mvnw verify
```

Para ejecutar una clase específica:
```bash
./mvnw test -Dtest=SongResourceIT
```

### 5.3 Cobertura de código backend (JaCoCo)

El plugin JaCoCo genera un informe HTML en `target/site/jacoco/index.html` al ejecutar `./mvnw verify`. Los umbrales mínimos configurados son:

| Paquete | Cobertura mínima |
|---------|-----------------|
| `service.impl` | 70% líneas |
| `web.rest` | 65% líneas |
| `security` | 60% líneas |

---

## 6. Pruebas End-to-End (E2E) con Playwright

Las pruebas E2E automatizan flujos completos de usuario en un navegador real (Chromium por defecto). Se ubican en `src/test/playwright/` y están escritas en TypeScript con la API de Playwright.

### 6.1 Configuración

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/playwright',
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
  },
});
```

Para ejecutar la suite completa:
```bash
npx playwright test
```

Para ejecutar un fichero específico con navegador visible:
```bash
npx playwright test auth.spec.ts --headed
```

Para ver el informe HTML de resultados:
```bash
npx playwright show-report
```

### 6.2 Casos de prueba E2E implementados

#### Fichero: `auth.spec.ts` — Flujos de autenticación

| ID | Descripción | Resultado |
|----|-------------|-----------|
| E2E-AUTH-01 | Login con `admin/admin` redirige al dashboard de administrador | ✅ Pasa |
| E2E-AUTH-02 | Login con credenciales incorrectas muestra alerta de error | ✅ Pasa |
| E2E-AUTH-03 | Logout elimina la sesión y redirige a `/login` | ✅ Pasa |
| E2E-AUTH-04 | URL protegida sin sesión redirige a `/login` con URL de retorno | ✅ Pasa |
| E2E-AUTH-05 | Login como `user/user` muestra dashboard de oyente | ✅ Pasa |
| E2E-AUTH-06 | Acceso a `/admin` como oyente muestra pantalla de acceso denegado | ✅ Pasa |

Fragmento representativo:
```typescript
test('login como admin redirige al dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', 'admin');
  await page.fill('[data-testid="password"]', 'admin');
  await page.click('[data-testid="submit-login"]');
  await expect(page).toHaveURL('/home');
  await expect(page.locator('[data-testid="dashboard-admin"]')).toBeVisible();
});
```

#### Fichero: `ownership.spec.ts` — Control de propiedad

| ID | Descripción | Resultado |
|----|-------------|-----------|
| E2E-OWN-01 | Artista A no ve botones de edición en canciones del artista B | ✅ Pasa |
| E2E-OWN-02 | Artista A no puede editar el perfil del artista B mediante la URL directa | ✅ Pasa |
| E2E-OWN-03 | Playlist privada de usuario A no aparece en la vista del usuario B | ✅ Pasa |
| E2E-OWN-04 | Admin puede editar cualquier recurso independientemente del propietario | ✅ Pasa |

#### Fichero: `playlist.spec.ts` — Gestión de playlists

| ID | Descripción | Resultado |
|----|-------------|-----------|
| E2E-PL-01 | Crear playlist con nombre y descripción | ✅ Pasa |
| E2E-PL-02 | Añadir canción a playlist mediante el modal de confirmación | ✅ Pasa |
| E2E-PL-03 | Eliminar canción de playlist | ✅ Pasa |
| E2E-PL-04 | Renombrar playlist | ✅ Pasa |
| E2E-PL-05 | Eliminar playlist completa con confirmación de SweetAlert2 | ✅ Pasa |

Fragmento de adición de canción:
```typescript
test('añadir canción a playlist', async ({ page }) => {
  // Login previo...
  await page.goto('/song');
  const firstSong = page.locator('[data-testid="song-row"]').first();
  await firstSong.locator('[data-testid="add-to-playlist"]').click();

  // Seleccionar playlist en el modal
  await page.locator('[data-testid="playlist-select"]').selectOption('Mi playlist');
  await page.locator('[data-testid="confirm-add"]').click();

  // Verificar confirmación
  await expect(page.locator('.swal2-success')).toBeVisible();
});
```

#### Fichero: `upload.spec.ts` — Subida de ficheros

| ID | Descripción | Resultado |
|----|-------------|-----------|
| E2E-UP-01 | Subir portada PNG < 1MB en formulario de canción | ✅ Pasa |
| E2E-UP-02 | Rechazar PDF en campo de portada | ✅ Pasa |
| E2E-UP-03 | Subir MP3 < 5MB en formulario de canción | ✅ Pasa |
| E2E-UP-04 | Indicador de progreso visible durante subida | ✅ Pasa |

Fragmento de subida de imagen:
```typescript
test('subir portada PNG en formulario de canción', async ({ page }) => {
  // Login como artista...
  await page.goto('/song/new');

  // Simular selección de fichero
  const fileInput = page.locator('input[type="file"][accept="image/*"]');
  await fileInput.setInputFiles('./fixtures/test-cover.png');

  // Verificar que la URL de portada se actualiza
  await expect(page.locator('[data-testid="cover-preview"]')).toBeVisible();
  await expect(page.locator('[data-testid="cover-url-field"]'))
    .not.toHaveValue('');
});
```

#### Fichero: `layouts.spec.ts` — Verificación de layout y scroll

| ID | Descripción | Resultado |
|----|-------------|-----------|
| E2E-LAY-01 | Sidebar visible en escritorio (>= 1280px) | ✅ Pasa |
| E2E-LAY-02 | Player bar fija en la parte inferior en todas las páginas | ✅ Pasa |
| E2E-LAY-03 | Contenido principal no queda oculto bajo el player bar | ✅ Pasa |
| E2E-LAY-04 | Scroll funciona correctamente en listas largas de canciones | ✅ Pasa |
| E2E-LAY-05 | En viewport 375px (móvil) no hay overflow horizontal | ✅ Pasa |

---

## 7. Pruebas de rendimiento y carga

Las siguientes pruebas se realizaron manualmente para identificar posibles cuellos de botella con conjuntos de datos representativos.

### 7.1 Tiempos de respuesta del backend (medidos con Postman)

| Endpoint | Datos de prueba | Tiempo medio | Resultado |
|----------|----------------|-------------|-----------|
| `GET /api/songs?page=0&size=20` | 500 canciones en BD | 85 ms | ✅ Aceptable |
| `GET /api/songs?page=0&size=20` | 5.000 canciones en BD | 320 ms | ✅ Aceptable |
| `GET /api/artists` | 100 artistas | 55 ms | ✅ Aceptable |
| `POST /api/authenticate` | — | 210 ms | ✅ Aceptable |
| `POST /api/upload/image` | Imagen 2 MB | 340 ms | ✅ Aceptable |
| `POST /api/upload/audio` | MP3 10 MB | 1.850 ms | ⚠️ Aceptable en desarrollo |
| `GET /api/upload/stream/{file}` | MP3 10 MB, primer byte | 45 ms | ✅ Aceptable |

Las pruebas con 5.000 canciones se realizaron con datos de prueba generados mediante Liquibase (`loadData`). Los tiempos son orientativos en un entorno de desarrollo local (máquina sin pool de conexiones tuneado y sin caché L2 activa).

### 7.2 Carga del frontend (Angular bundle)

| Métrica | Valor | Herramienta |
|---------|-------|-------------|
| Bundle JS principal (gzipped) | ~680 KB | `ng build --stats-json` + webpack-bundle-analyzer |
| First Contentful Paint | ~1.1 s (localhost) | Chrome DevTools Lighthouse |
| Time to Interactive | ~1.8 s (localhost) | Chrome DevTools Lighthouse |
| Lazy chunks cargados bajo demanda | 7 chunks (uno por entidad) | Angular CLI build output |

---

## 8. Gestión de defectos conocidos

Durante el desarrollo se identificaron los siguientes defectos que quedaron documentados pero no resueltos en el alcance del TFG:

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| BUG-01 | Al cambiar de canción en el reproductor, el slider de progreso no se reinicia a 0 | Menor | Abierto |
| BUG-02 | El panel de letras no se cierra automáticamente al cambiar de canción | Menor | Abierto |
| BUG-03 | En Firefox, el menú desplegable de géneros en el formulario de canción tiene un desplazamiento visual de 1px | Cosmético | Abierto |
| BUG-04 | La búsqueda de letras falla si el nombre del artista contiene caracteres especiales no codificados (ampersand) | Menor | Parcialmente resuelto con `encodeURIComponent` |
| BUG-05 | En dispositivos móviles con pantalla < 375px el texto del dashboard se desborda | Menor | Abierto |

---

## 9. Criterios de aceptación global

El proyecto se considera apto para la entrega del TFG si cumple todos los criterios de aceptación de las secciones anteriores clasificados como **críticos**:

| Criterio | Estado |
|----------|--------|
| Todos los casos AUTH pasan | ✅ |
| Todos los casos DASH pasan | ✅ |
| SONG-01 a SONG-06 pasan | ✅ |
| PLAY-01 a PLAY-07 pasan | ✅ |
| LYR-01 a LYR-06 pasan | ✅ |
| PLIST-01 a PLIST-04 pasan | ✅ |
| SEC-01 a SEC-09 pasan | ✅ |
| UPLOAD-01, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-11 pasan | ✅ |
| IT-01, IT-02, IT-08, IT-11, IT-13 pasan (seguridad) | ✅ |
| Suite E2E E2E-AUTH-01 a E2E-AUTH-06 pasan | ✅ |

---

## 10. Historial de revisiones del plan de pruebas

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-03-01 | Versión inicial con módulos de autenticación, dashboards y reproductor |
| 1.1 | 2026-04-10 | Añadidos casos de prueba para canciones, artistas y álbumes |
| 1.2 | 2026-04-28 | Incorporados casos de subida de ficheros y control de propiedad |
| 1.3 | 2026-05-05 | Añadida sección Playwright E2E; defectos conocidos documentados |
| 1.4 | 2026-05-11 | Revisión final: criterios de aceptación global, métricas de rendimiento |
