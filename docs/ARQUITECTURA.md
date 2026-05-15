# MusicPlayer

Plataforma de reproduccion y gestion de musica en streaming desarrollada con JHipster 9.0.0.

## Descripcion general

MusicPlayer es una aplicacion que permite a los usuarios reproducir musica en streaming, gestionar sus propias listas de reproduccion, seguir a artistas y descubrir nuevo contenido musical. El sistema cuenta con un modulo de administracion que facilita la gestion de contenidos.

## Funcionalidades principales

- Reproduccion de musica en streaming con seguimiento de reproducciones
- Gestion de listas de reproduccion publicas y privadas
- Sistema de artistas verificados
- Perfiles de usuario extendidos con biografia e imagen
- Sistema de likes para canciones
- Seguimiento de artistas por parte de usuarios
- Generos musicales para organizacion de contenido
- Soporte para multiples tipos de albumes: album completo, singles, EP y series de podcast
- Aplicacion disponible en español e ingles

## Tecnologias utilizadas

### Backend
- Spring Boot 4.0.3
- Java 21
- Spring Security con autenticacion JWT
- MySQL 8 (produccion) / H2 (desarrollo)
- Hibernate ORM con MapStruct para DTOs
- Liquibase para migraciones de base de datos
- Maven como herramienta de construccion

### Frontend
- Angular 21.2.2
- TypeScript
- ng-bootstrap 20.0.0
- Bootstrap 5.3.8
- Font Awesome 7.2.0
- RxJS para gestion de estado reactivo
- ngx-translate para internacionalizacion

## Requisitos del sistema

- JDK 21 o superior
- Node.js 20 o superior
- Maven 3.9 o superior
- MySQL 8 (para entorno de produccion)
- Docker y Docker Compose (opcional, para contenedores)

## Instalacion y configuracion

Consultar el archivo DESARROLLO.md para obtener instrucciones detalladas sobre como configurar el entorno de desarrollo local.

## Documentacion adicional

- ARQUITECTURA.md - Descripcion de la arquitectura del sistema y estructura del proyecto
- MODELO_DATOS.md - Modelo de datos y relaciones entre entidades
- API.md - Documentacion de los endpoints de la API REST
- CARACTERISTICAS.md - Guia detallada de las funcionalidades disponibles
- DESARROLLO.md - Guia para el entorno de desarrollo
- DESPLIEGUE.md - Instrucciones para el despliegue en produccion

## Licencia

Este proyecto utiliza JHipster, consulte la documentacion oficial de JHipster para mas informacion sobre las licencias aplicables.
