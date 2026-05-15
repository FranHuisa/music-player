# Guia de desarrollo

## Requisitos previos

Antes de comenzar con el desarrollo, asegurese de tener instalado lo siguiente:

- JDK 21 o superior
- Node.js 20 o superior
- Maven 3.9 o superior
- Git

## Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd music-player
```

## Configuracion del entorno

### Variables de entorno

El proyecto utiliza archivos de configuracion de Spring Boot. Para desarrollo local, puede usar el perfil `dev` que viene configurado por defecto con una base de datos H2 en memoria.

### Base de datos de desarrollo

El entorno de desarrollo utiliza H2 en modo disco, lo que significa que los datos persisten entre ejecuciones pero no requieren instalacion de MySQL. Los datos se almacenan en la carpeta `target/h2disk/db`.

### Iniciar el servidor de desarrollo

Para ejecutar la aplicacion en modo desarrollo, utilize los siguientes comandos en terminales separadas:

```bash
./npmw run backend:start
./npmw run start
```

El backend estara disponible en `http://localhost:8080` y el frontend en `http://localhost:4200`.

## Estructura de directorios

### Backend (src/main/java/com/musicplayer)

- `domain/`: Entidades JPA del dominio
- `repository/`: Repositorios de Spring Data
- `service/`: Clases de servicio con logica de negocio
- `web/rest/`: Controladores REST

### Frontend (src/main/webapp/app)

- `entities/`: Modulos de entidades generados automaticamente
- `core/`: Modulos fundamentales (autenticacion, interceptores)
- `shared/`: Componentes y servicios compartidos
- `layouts/`: Estructura de navegacion principal

## Comandos utiles

### Compilar el proyecto

```bash
./mvnw clean compile
```

### Ejecutar pruebas

```bash
./mvnw test
```

### Ejecutar pruebas del frontend

```bash
./npmw test
```

### Generar archivos de documentacion API

```bash
./mvnw openapi:generate
```

## Trabajar con el modelo de datos

El modelo de datos se define en el archivo `music.jdl` usando la sintaxis de JHipster Domain Language. Despues de modificar el JDL, ejecute el siguiente comando para regenerar las entidades:

```bash
./mvnw hipster: regenerate -f
```

## Docker para desarrollo

Para ejecutar las dependencias (MySQL, etc) usando Docker:

```bash
docker compose -f src/main/docker/services.yml up -d
```

## Analisis de codigo

Para ejecutar el analisis de SonarQube localmente:

```bash
docker compose -f src/main/docker/sonar.yml up -d
./mvnw -Pprod clean verify sonar:sonar -Dsonar.login=admin -Dsonar.password=admin
```

## Resolucion de problemas comunes

### Error de conexion a la base de datos

Verifique que las credenciales en `src/main/resources/config/application-dev.yml` sean correctas y que MySQL este ejecutandose si esta usando el perfil de produccion.

### Problemas con node_modules

Si tiene problemas con las dependencias de node, elimine la carpeta `node_modules` y ejecute:

```bash
./npmw install
```

### El frontend no se actualiza automaticamente

Verifique que el servidor de desarrollo de Angular este ejecutandose sin errores en la terminal correspondiente.
