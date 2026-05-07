# Como arrancar Music Player

Esta guía te explica paso a paso cómo iniciar la aplicación para verla en tu navegador.

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- Java 21 o superior (ya lo tienes - Java 24)
- Node.js (ya instalado)
- Docker Desktop (opcional, pero recomendado)

---

## Opción 1: Arrancar con MySQL (Recomendado)

### Paso 1: Iniciar Docker Desktop

1. Abre **Docker Desktop** desde el menú de inicio de Windows
2. Espera a que aparezca el mensaje "Docker is running" (aparece en la esquina inferior izquierda)
3. Puede tardar 1-2 minutos en arrancar completamente

### Paso 2: Iniciar la base de datos MySQL

Abre una terminal (CMD o PowerShell) en la carpeta del proyecto y ejecuta:

```bash
docker compose -f src/main/docker/mysql.yml up -d
```

Verás algo como:

```
✔ Container musicplayer-mysql-1  Started
```

### Paso 3: Iniciar el backend (servidor)

En la misma terminal, ejecuta:

```bash
mvnw.cmd spring-boot:run
```

Espera hasta ver el mensaje:

```
Application 'musicPlayer' is running!
```

** Importante:** No cierres esta terminal, déjala abierta.

### Paso 4: Iniciar el frontend (página web)

Abre **otra terminal nueva** (CMD o PowerShell) en la misma carpeta y ejecuta:

```bash
npm start
```

Espera hasta ver:

```
Application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

- Importante:\*\* Tampoco cierres esta terminal.

### Paso 5: Abrir en el navegador

Abre tu navegador favorito (Chrome, Edge, Firefox) y ve a:

```
http://localhost:4200
```

¡Ya está! Deberías ver la página de inicio.

---

## Cómo iniciar sesión

Una vez que la página cargue, haz clic en el botón de login (arriba a la derecha) y usa:

### Usuario Administrador (Editor de música)

- **Usuario:** `admin`
- **Contraseña:** `admin`

Este usuario puede:

- Subir canciones
- Crear álbumes
- Gestionar lanzamientos
- Administrar artistas

### Usuario Normal (Oyente)

- **Usuario:** `user`
- **Contraseña:** `user`

Este usuario puede:

- Escuchar música
- Dar "me gusta" a canciones
- Crear playlists
- Ver estadísticas

---

## Cómo detener la aplicación

Cuando termines de usar la aplicación:

1. **Detener el frontend:** Ve a la terminal donde ejecutaste `npm start` y presiona `Ctrl + C`
2. **Detener el backend:** Ve a la terminal donde ejecutaste `mvnw.cmd` y presiona `Ctrl + C`
3. **Detener MySQL (opcional):**
   ```bash
   docker compose -f src/main/docker/mysql.yml down
   ```

---

## Opción 2: Arrancar con H2 (Sin Docker - Más simple)

Si no quieres usar Docker o tienes problemas, puedes usar H2 (base de datos en memoria):

### Paso 1: Cambiar la configuración

Abre el archivo `src/main/resources/config/application-dev.yml` y cambia:

```yaml
datasource:
  url: jdbc:h2:file:./target/h2db/db/musicplayer
  username: musicPlayer
  password:
  driver-class-name: org.h2.Driver
```

### Paso 2: Iniciar el backend

```bash
mvnw.cmd spring-boot:run
```

### Paso 3: Iniciar el frontend

En otra terminal:

```bash
npm start
```

### Paso 4: Abrir el navegador

```
http://localhost:4200
```

**Nota:** Con H2 los datos se guardan en archivos y se mantienen entre reinicios.

---

## Problemas comunes

### "Cannot connect to MySQL"

- Verifica que Docker Desktop esté corriendo
- Ejecuta el comando de MySQL: `docker compose -f src/main/docker/mysql.yml up -d`

### "Port 8080 is already in use"

- Ya tienes el backend corriendo, ciérralo primero con `Ctrl + C`

### "Port 4200 is already in use"

- Ya tienes el frontend corriendo, ciérralo primero con `Ctrl + C`

### El navegador muestra "Cannot connect"

- Asegúrate de que ambas terminales (backend y frontend) estén corriendo
- Espera unos segundos más, a veces tarda en cargar

### "Error: admin/admin no funciona"

- Verifica que el backend esté completamente iniciado
- Revisa en la terminal del backend si hay errores en rojo
- Asegúrate de que la base de datos esté corriendo

---

## Consejos útiles

- **Reiniciar todo:** Si algo no funciona, cierra todas las terminales y Docker, y empieza desde el paso 1
- **Ventanas separadas:** Usa dos ventanas de terminal lado a lado para ver ambos logs
- **Paciencia:** La primera vez puede tardar 2-3 minutos en compilar todo
- **Datos de prueba:** Con la configuración actual, se cargan usuarios y datos de ejemplo automáticamente

---

## Resumen rápido

```bash
# Terminal 1 - Backend
docker compose -f src/main/docker/mysql.yml up -d
mvnw.cmd spring-boot:run

# Terminal 2 - Frontend
npm start

# Navegador
http://localhost:4200

# Usuarios
admin / admin  (editor)
user / user    (oyente)
```

---
