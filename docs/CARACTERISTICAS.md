# Caracteristicas de MusicPlayer

## Reproduccion de musica

### Sistema de streaming

MusicPlayer permite reproducir musica en streaming directamente desde el navegador. Cada vez que un usuario inicia la reproduccion de una cancion, el sistema registra automaticamente el evento en la base de datos incluyendo la hora de reproduccion y el tiempo de escucha.

### Seguimiento de reproducciones

El sistema mantiene un historial completo de todas las canciones que cada usuario ha reproducido. Esta informacion se utiliza para generar estadisticas de reproduccion y personalizar la experiencia del usuario.

## Gestion de albumes

### Tipos de album

La aplicacion soporta cuatro tipos de albumes:

- **Album completo**: Coleccion standard de canciones lanzadas conjuntamente
- **Single**: Una sola cancion released de manera independiente
- **EP**: Formato extendido que contiene varias pistas pero con menos contenido que un album completo
- **Serie de podcast**: Contenido de audio episodic que puede incluir episodios de audio

### Informacion del album

Cada album contiene informacion detallada incluyendo titulo, imagen de portada, fecha de lanzamiento, genero musical y el artista principal. Desde la vista del album se puede acceder a todas las canciones que contiene.

## Listas de reproduccion

### Creacion de listas

Los usuarios pueden crear tantas listas de reproduccion como deseen. Cada lista tiene un nombre obligatorio y una descripcion opcional. Las listas pueden ser publicas o privadas.

### Listas publicas

Cuando una lista se marca como publica, otros usuarios pueden verla y copiar las canciones a sus propias listas. Las listas privadas solo son visibles y editables por su creador.

### Gestion de canciones

Las canciones dentro de una lista mantienen un orden especifico definido por el campo de posicion. Los usuarios pueden agregar canciones, eliminar canciones y reordenar las canciones dentro de la lista.

## Artistas

### Perfil de artista

Cada artista tiene un perfil que incluye su nombre, biografia, imagen, pais de origen y un indicador de verificacion. Los artistas verificados tienen un badge especial que indica su autenticidad.

### Seguimiento de artistas

Los usuarios pueden seguir a sus artistas favoritos. Al seguir a un artista, el usuario recibira actualizaciones cuando el artista publique nuevo contenido.

### Colaboraciones

Las canciones pueden tener multiples artistas colaboradores. Esto permite representar correctamente las colaboraciones entre diferentes artistas.

## Sistema social

### Likes en canciones

Los usuarios pueden dar like a cualquier cancion. Las canciones con mas likes aparecen marcadas como populares en el sistema.

### Perfiles de usuario

Cada usuario tiene un perfil extendido que incluye una biografia personal y una imagen de perfil. Esta informacion es visible para otros usuarios de la plataforma.

## Busqueda

### Busqueda de canciones

La aplicacion permite buscar canciones por su titulo o por su letra. Esta funcionalidad es util para encontrar canciones cuando el usuario no conoce su nombre exacto.

### Filtros y paginacion

Todas las listas de contenido en la aplicacion soportan paginacion, lo que permite manejar grandes cantidades de datos sin afectar el rendimiento de la interfaz.

## Internacionalizacion

### Idiomas disponibles

La aplicacion esta disponible en espanol como idioma principal e ingles como idioma secundario. Los usuarios pueden cambiar el idioma desde la configuracion de su cuenta.

### Contenido localizado

Todos los textos de la interfaz, mensajes de error y etiquetas estan traducidos a ambos idiomas.
