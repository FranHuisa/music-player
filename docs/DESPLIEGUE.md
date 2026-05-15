# Guia de despliegue

## Preparacion para produccion

### Requisitos del servidor

- JDK 21 o superior
- MySQL 8 o superior
- Docker y Docker Compose (opcional)

### Configuracion de base de datos

1. Cree una base de datos MySQL para la aplicacion:

```sql
CREATE DATABASE musicplayer_production;
CREATE USER 'musicplayer'@'%' IDENTIFIED BY 'contrasena_segura';
GRANT ALL PRIVILEGES ON musicplayer_production.* TO 'musicplayer'@'%';
FLUSH PRIVILEGES;
```

2. Configure las credenciales en `src/main/resources/config/application-prod.yml` o mediante variables de entorno.

### Construccion del paquete

#### Opcion 1: JAR standalone

Para crear un archivo JAR ejecutable:

```bash
./mvnw -Pprod clean verify
```

El archivo JAR se generara en `target/musicPlayer-0.0.1-SNAPSHOT.jar`.

Para ejecutar:

```bash
java -jar target/musicPlayer-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

#### Opcion 2: Contenedor Docker

Para construir la imagen Docker:

```bash
npm run java:docker
```

Para arquitecturas ARM64 (Apple Silicon):

```bash
npm run java:docker:arm64
```

Para ejecutar usando Docker Compose:

```bash
docker compose -f src/main/docker/app.yml up -d
```

## Configuracion de Nginx (produccion)

Se recomienda usar Nginx como proxy reverso para servir la aplicacion Angular y reenviar las peticiones API al backend de Spring Boot.

### Configuracion ejemplo de Nginx

```nginx
server {
    listen 80;
    server_name musicplayer.ejemplo.com;

    location / {
        root /var/www/musicplayer;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Variables de entorno

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| JHIPSTER_SKIP_USER_MANAGEMENT | Deshabilitar gestion de usuarios | false |
| SPRING_PROFILES_ACTIVE | Perfil de Spring a usar | prod |
| JAVA_OPTS | Opciones de JVM | -Xmx512m -Xms256m |

## Monitoreo

### Spring Boot Actuator

La aplicacion expone endpoints de monitoreo en:

- `/actuator/health`: Estado de salud de la aplicacion
- `/actuator/info`: Informacion de la aplicacion
- `/actuator/metrics`: Metric as del sistema

### Integracion con Prometheus

Para habilitar la integracion con Prometheus, descomente la dependencia en el archivo `pom.xml` y configure el endpoint de metricas en su servidor Prometheus.

## Escalabilidad

###multiple instancias

La aplicacion es sin estado, lo que permite ejecutar multiples instancias detras de un balanceador de carga. Asegurese de que:

- La base de datos MySQL este configurada con conexion pooling adecuado
- Las sesiones de autenticacion JWT se validen correctamente entre instancias
- El cache de Ehcache este configurado en modo distribuido si se requiere consistencia

### Balanceador de carga

Se recomienda usar un balanceador de carga que maneje afinidad de sesion si es necesario, aunque las peticiones autenticadas con JWT no requieren afinidad de sesion.
