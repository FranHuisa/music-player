from __future__ import annotations

import re
import subprocess
import sys
import textwrap
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent.parent
PYDEPS = ROOT / '.pydeps'

if PYDEPS.exists():
    sys.path.insert(0, str(PYDEPS))

from bs4 import BeautifulSoup, NavigableString, Tag  # type: ignore  # noqa: E402
import pypandoc  # type: ignore  # noqa: E402
from pypdf import PdfReader  # type: ignore  # noqa: E402
SOURCE_JS = ROOT / 'generate-memoria-borja.mjs'
SOURCE_HTML = ROOT / 'MemoriaTecnica Borja.html'
SOURCE_PDF = ROOT / 'MemoriaTecnica Borja-2_telegram.pdf'
LITERAL_MD = ROOT / 'MEMORIA_TECNICA_BORJA_LITERAL.md'
FINAL_MD = ROOT / 'MEMORIA_TECNICA_BORJA_PANDOC.md'
FINAL_HTML = ROOT / 'MEMORIA_TECNICA_BORJA_PANDOC.html'
FINAL_PDF = ROOT / 'MEMORIA_TECNICA_BORJA_PANDOC.pdf'
PANDOC_DIR = ROOT / 'pandoc'
METADATA_FILE = PANDOC_DIR / 'metadata.yaml'
HEADER_FILE = PANDOC_DIR / 'header.tex'
CSS_FILE = PANDOC_DIR / 'styles.css'
ER_IMAGE = ROOT / 'Ejemplos' / 'Modelo Entidad Relacion Fran.jpeg'
CAPTURES_DIR = ROOT / 'capturas'


PLACEHOLDERS = {
    'FIG_ACCESS': None,
    'FIG_SEQUENCE': None,
    'FIG_BACKEND': None,
    'TBL_ER_ENTITIES': None,
}


def run(command: list[str], cwd: Path = PROJECT_ROOT) -> None:
    subprocess.run(command, cwd=cwd, check=True)


def read_text(path: Path) -> str:
    return path.read_text(encoding='utf8')


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf8')


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r'<[^>]+>', '', value)
    value = (
        value.replace('á', 'a')
        .replace('é', 'e')
        .replace('í', 'i')
        .replace('ó', 'o')
        .replace('ú', 'u')
        .replace('ü', 'u')
        .replace('ñ', 'n')
    )
    value = re.sub(r'[^a-z0-9]+', '-', value).strip('-')
    return value or 'item'


def url_path(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    return quote(relative)


def extract_generator_css(js_source: str) -> str:
    match = re.search(r"const css = `([\s\S]*?)`;\s*\n\s*const architectureSvg", js_source)
    if not match:
        raise RuntimeError('No se pudo extraer el CSS base del generador actual.')
    return textwrap.dedent(match.group(1)).strip()


def remove_section_by_title(body: Tag, title: str) -> None:
    for section in body.find_all('section', recursive=False):
        h1 = section.find('h1', recursive=False)
        if h1 and h1.get_text(' ', strip=True) == title:
            section.decompose()
            return


def find_section(body: Tag, title: str) -> Tag:
    for section in body.find_all('section', recursive=False):
        h1 = section.find('h1', recursive=False)
        if h1 and h1.get_text(' ', strip=True) == title:
            return section
    raise RuntimeError(f'No se encontro la seccion "{title}".')


def find_heading(container: Tag, title: str) -> Tag:
    for heading in container.find_all(re.compile(r'^h[1-6]$')):
        if heading.get_text(' ', strip=True) == title:
            return heading
    raise RuntimeError(f'No se encontro el encabezado "{title}".')


def next_heading_at_or_above(heading: Tag, level: int) -> Tag | None:
    sibling = heading.next_sibling
    while sibling is not None:
        if isinstance(sibling, Tag) and re.fullmatch(r'h[1-6]', sibling.name or ''):
            sibling_level = int(sibling.name[1])
            if sibling_level <= level:
                return sibling
        sibling = sibling.next_sibling
    return None


def iter_nodes_until(start: Tag, stop: Tag | None) -> list[Tag | NavigableString]:
    nodes: list[Tag | NavigableString] = []
    current: Tag | NavigableString | None = start
    while current is not None and current is not stop:
        nodes.append(current)
        current = current.next_sibling
    return nodes


def replace_block(heading: Tag, fragment_html: str) -> None:
    parent = heading.parent
    level = int(heading.name[1])
    stop = next_heading_at_or_above(heading, level)
    nodes = iter_nodes_until(heading, stop)
    for node in nodes:
        node.extract()
    fragment = BeautifulSoup(fragment_html, 'html.parser')
    children = [child for child in fragment.contents]
    for child in children:
        if isinstance(child, NavigableString) and not child.strip():
            continue
        if stop is not None:
            stop.insert_before(child)
        else:
            parent.append(child)


def extract_block_html(heading: Tag) -> str:
    level = int(heading.name[1])
    stop = next_heading_at_or_above(heading, level)
    nodes = iter_nodes_until(heading, stop)
    return ''.join(str(node) for node in nodes)


def remove_block(heading: Tag) -> None:
    level = int(heading.name[1])
    stop = next_heading_at_or_above(heading, level)
    nodes = iter_nodes_until(heading, stop)
    for node in nodes:
        node.extract()


def insert_before(target: Tag, fragment_html: str) -> None:
    fragment = BeautifulSoup(fragment_html, 'html.parser')
    children = [child for child in fragment.contents]
    for child in children:
        if isinstance(child, NavigableString) and not child.strip():
            continue
        target.insert_before(child)


def insert_after(target: Tag, fragment_html: str) -> None:
    fragment = BeautifulSoup(fragment_html, 'html.parser')
    anchor = target
    for child in [child for child in fragment.contents]:
        if isinstance(child, NavigableString) and not child.strip():
            continue
        anchor.insert_after(child)
        anchor = child


def build_er_fragment() -> str:
    return textwrap.dedent(
        f"""
        <h2>3.2. Modelo entidad-relación explicado</h2>
        <p>El modelo entidad-relación se ha sustituido por la imagen de trabajo utilizada durante el desarrollo y almacenada en la carpeta de ejemplos del proyecto. Esta versión resulta más fiel al esquema realmente manejado por el equipo y evita inconsistencias de flechas o cardinalidades que aparecían en el diagrama anterior.</p>
        <div class="figure" data-caption-core="Modelo entidad-relación del sistema. Fuente: imagen del proyecto adaptada para la memoria técnica." data-ref-key="FIG_ER">
          <img class="entity-model" src="{url_path(ER_IMAGE)}" alt="Modelo entidad-relación del sistema MusicPlayer" />
          <div class="caption"></div>
        </div>
        <h3>3.2.1. Estructura general del modelo</h3>
        <p>La figura organiza el sistema en tres bloques funcionales. El primero es el bloque de identidad y permisos, formado por <code>roles</code>, <code>users</code> y <code>user_followers</code>. Aquí se define quién accede a la plataforma, con qué perfil lo hace y cómo se representan relaciones sociales entre usuarios.</p>
        <p>El segundo bloque recoge la interacción de una persona usuaria con el catálogo musical. En este nivel aparecen <code>playlists</code>, <code>playlist_songs</code>, <code>plays</code> y <code>likes</code>. Estas entidades no describen la canción en sí misma, sino la actividad que se genera alrededor de ella: listas personalizadas, orden de reproducción, historial de escucha y favoritos.</p>
        <p>El tercer bloque corresponde al catálogo principal. Está compuesto por <code>artists</code>, <code>song_artists</code>, <code>songs</code>, <code>genres</code> y <code>albums</code>. La entidad <code>songs</code> ocupa una posición central porque conecta la autoría musical, la clasificación por género, la pertenencia a álbum y la reutilización posterior en favoritos, reproducciones y playlists.</p>
        <h3>3.2.2. Relaciones clave del diseño</h3>
        <p>La relación entre <code>users</code> y <code>roles</code> permite distinguir perfiles administrativos, editoriales, artísticos y de consumo. La tabla <code>user_followers</code> introduce una relación autorreferente entre usuarios, útil para ampliar la dimensión social de la plataforma sin duplicar la información principal de la cuenta.</p>
        <p>Las playlists se modelan mediante una cabecera en <code>playlists</code> y una tabla intermedia <code>playlist_songs</code>, que añade el atributo <code>position</code>. Esta decisión es importante porque el orden dentro de una lista forma parte del comportamiento funcional de la aplicación y no puede resolverse con una relación muchos a muchos simple.</p>
        <p>La autoría musical se divide entre un artista principal y colaboraciones. La tabla <code>song_artists</code> evita duplicar datos y permite que una canción mantenga varias relaciones de autoría. Del mismo modo, <code>albums</code> y <code>genres</code> se conectan con <code>songs</code> para ordenar el catálogo y hacer posibles búsquedas, filtros y agrupaciones coherentes.</p>
        <table data-caption-core="Entidades visibles en el modelo entidad-relación" data-ref-key="TBL_ER_ENTITIES">
          <caption></caption>
          <thead>
            <tr>
              <th>Entidad</th>
              <th>Papel dentro del sistema</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>roles</code></td><td>Define los perfiles de acceso y las capacidades generales del sistema.</td></tr>
            <tr><td><code>users</code></td><td>Representa las cuentas autenticables de la plataforma.</td></tr>
            <tr><td><code>user_followers</code></td><td>Modela el seguimiento entre usuarios.</td></tr>
            <tr><td><code>playlists</code></td><td>Cabecera de listas personales o públicas.</td></tr>
            <tr><td><code>playlist_songs</code></td><td>Resuelve la asociación entre playlist y canción conservando el orden.</td></tr>
            <tr><td><code>plays</code></td><td>Registra reproducciones e información temporal asociada.</td></tr>
            <tr><td><code>likes</code></td><td>Persistencia de canciones marcadas como favoritas.</td></tr>
            <tr><td><code>artists</code></td><td>Información autoral y de gestión de intérpretes.</td></tr>
            <tr><td><code>song_artists</code></td><td>Relaciona canciones con artistas colaboradores.</td></tr>
            <tr><td><code>songs</code></td><td>Entidad central del catálogo y de la reproducción.</td></tr>
            <tr><td><code>genres</code></td><td>Clasificación temática del catálogo.</td></tr>
            <tr><td><code>albums</code></td><td>Agrupación editorial de canciones.</td></tr>
          </tbody>
        </table>
        <p>La lectura conjunta de la figura y la tabla anterior permite justificar que el modelo relacional no es un apéndice del proyecto, sino la base que hace posible catálogo, reproducción, favoritos, seguimiento y organización musical. Por ello, esta representación se mantiene en el cuerpo principal de la memoria y no en los anexos.</p>
        """
    ).strip()


def build_access_flow_figure() -> str:
    svg = """
    <svg viewBox="0 0 920 530" role="img" aria-label="Flujo de control de acceso por rol">
      <defs>
        <marker id="arrowAccess" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#334155"></path>
        </marker>
      </defs>
      <rect x="60" y="35" width="240" height="58" rx="10" fill="#e8f4ef" stroke="#1f6f5f" stroke-width="2"></rect>
      <text x="180" y="69" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#163029">Usuario solicita una ruta protegida</text>

      <rect x="370" y="35" width="220" height="58" rx="10" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <text x="480" y="69" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#20365f">AuthGuard / Interceptor</text>

      <path d="M300 64 L370 64" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>

      <polygon points="480,110 590,170 480,230 370,170" fill="#fff8e7" stroke="#b7791f" stroke-width="2"></polygon>
      <text x="480" y="162" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#6b4f14">¿Existe token</text>
      <text x="480" y="184" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#6b4f14">y no ha expirado?</text>
      <path d="M480 93 L480 110" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>

      <rect x="660" y="141" width="220" height="58" rx="10" fill="#ffe6e6" stroke="#b42318" stroke-width="2"></rect>
      <text x="770" y="175" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#7a271a">Redirigir a login</text>
      <path d="M590 170 L660 170" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>
      <text x="618" y="158" font-family="Arial" font-size="14" fill="#334155">No</text>

      <polygon points="480,240 590,300 480,360 370,300" fill="#eaf7ff" stroke="#1d4ed8" stroke-width="2"></polygon>
      <text x="480" y="292" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#173b83">¿La ruta exige</text>
      <text x="480" y="314" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#173b83">un rol concreto?</text>
      <path d="M480 230 L480 240" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>
      <text x="496" y="236" font-family="Arial" font-size="14" fill="#334155">Sí</text>

      <rect x="370" y="445" width="220" height="58" rx="10" fill="#e8f4ef" stroke="#1f6f5f" stroke-width="2"></rect>
      <text x="480" y="479" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#163029">Acceso permitido</text>
      <path d="M480 360 L480 445" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>
      <text x="494" y="405" font-family="Arial" font-size="14" fill="#334155">No</text>

      <polygon points="750,240 860,300 750,360 640,300" fill="#fff8e7" stroke="#b7791f" stroke-width="2"></polygon>
      <text x="750" y="292" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#6b4f14">¿El usuario posee</text>
      <text x="750" y="314" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#6b4f14">el rol requerido?</text>
      <path d="M590 300 L640 300" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>
      <text x="606" y="288" font-family="Arial" font-size="14" fill="#334155">Sí</text>

      <rect x="660" y="445" width="220" height="58" rx="10" fill="#ffe6e6" stroke="#b42318" stroke-width="2"></rect>
      <text x="770" y="479" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#7a271a">Acceso denegado</text>
      <path d="M750 360 L750 445" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowAccess)"></path>
      <text x="764" y="405" font-family="Arial" font-size="14" fill="#334155">No</text>

      <path d="M750 360 L750 395 L480 395 L480 445" stroke="#334155" stroke-width="2.5" fill="none" marker-end="url(#arrowAccess)"></path>
      <text x="706" y="382" font-family="Arial" font-size="14" fill="#334155">Sí</text>
    </svg>
    """
    return textwrap.dedent(
        f"""
        <h2>3.5. Diseño de flujos técnicos</h2>
        <p>Además de los diagramas de actividad generales, interesa documentar algunos recorridos técnicos concretos porque son los que conectan frontend, seguridad, lógica de negocio y persistencia. Los tres diagramas siguientes se han incorporado para reforzar la explicación del diseño y corregir la carencia de detalle señalada en la revisión.</p>
        <h3>3.5.1. Control de acceso por rol</h3>
        <p>El control de acceso se resuelve en dos planos. En el cliente, los guards y la navegación protegen la experiencia de uso; en el servidor, Spring Security aplica la autorización efectiva. La Figura @@FIG_ACCESS@@ resume el recorrido que sigue una solicitud desde que la persona usuaria intenta abrir una ruta protegida hasta que el sistema permite el acceso, exige autenticación o devuelve acceso denegado.</p>
        <div class="figure" data-caption-core="Flujo de control de acceso por rol. Fuente: elaboración propia." data-ref-key="FIG_ACCESS">
          {svg}
          <div class="caption"></div>
        </div>
        """
    ).strip()


def build_sequence_figure() -> str:
    svg = """
    <svg viewBox="0 0 940 460" role="img" aria-label="Secuencia de creación de canción">
      <defs>
        <marker id="arrowSeq" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#334155"></path>
        </marker>
      </defs>
      <rect x="40" y="24" width="140" height="42" rx="8" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <rect x="220" y="24" width="140" height="42" rx="8" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <rect x="400" y="24" width="140" height="42" rx="8" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <rect x="580" y="24" width="140" height="42" rx="8" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <rect x="760" y="24" width="140" height="42" rx="8" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <text x="110" y="50" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Usuario editor</text>
      <text x="290" y="50" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Song form</text>
      <text x="470" y="50" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">SongResource</text>
      <text x="650" y="50" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">SongService</text>
      <text x="830" y="50" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold">Repositorio / BD</text>
      <g stroke="#94a3b8" stroke-dasharray="7 7" stroke-width="2">
        <line x1="110" y1="66" x2="110" y2="420"></line>
        <line x1="290" y1="66" x2="290" y2="420"></line>
        <line x1="470" y1="66" x2="470" y2="420"></line>
        <line x1="650" y1="66" x2="650" y2="420"></line>
        <line x1="830" y1="66" x2="830" y2="420"></line>
      </g>
      <path d="M110 105 L290 105" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="200" y="95" text-anchor="middle" font-family="Arial" font-size="14">Completa formulario</text>
      <path d="M290 145 L470 145" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="380" y="135" text-anchor="middle" font-family="Arial" font-size="14">POST SongDTO</text>
      <path d="M470 185 L650 185" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="560" y="175" text-anchor="middle" font-family="Arial" font-size="14">Validar rol y DTO</text>
      <path d="M650 225 L830 225" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="740" y="215" text-anchor="middle" font-family="Arial" font-size="14">Buscar artista y guardar</text>
      <path d="M830 265 L650 265" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="740" y="255" text-anchor="middle" font-family="Arial" font-size="14">Entidad persistida</text>
      <path d="M650 305 L470 305" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="560" y="295" text-anchor="middle" font-family="Arial" font-size="14">DTO de respuesta</text>
      <path d="M470 345 L290 345" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="380" y="335" text-anchor="middle" font-family="Arial" font-size="14">201 Created</text>
      <path d="M290 385 L110 385" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowSeq)"></path>
      <text x="200" y="375" text-anchor="middle" font-family="Arial" font-size="14">Actualiza listado y notifica</text>
    </svg>
    """
    return textwrap.dedent(
        f"""
        <h3>3.5.2. Secuencia completa de creación de canción</h3>
        <p>La creación de canciones concentra validación de permisos, resolución del artista propietario y persistencia de relaciones musicales. La Figura @@FIG_SEQUENCE@@ expone esa secuencia de extremo a extremo, desde el formulario Angular hasta la escritura final en repositorio y base de datos.</p>
        <div class="figure" data-caption-core="Secuencia completa de creación de canción. Fuente: elaboración propia." data-ref-key="FIG_SEQUENCE">
          {svg}
          <div class="caption"></div>
        </div>
        """
    ).strip()


def build_backend_components_figure() -> str:
    svg = """
    <svg viewBox="0 0 920 430" role="img" aria-label="Componentes backend y capas de servicio">
      <defs>
        <marker id="arrowBack" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#334155"></path>
        </marker>
      </defs>
      <rect x="45" y="50" width="180" height="80" rx="10" fill="#eaf7ff" stroke="#1d4ed8" stroke-width="2"></rect>
      <text x="135" y="86" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#173b83">Capa REST</text>
      <text x="135" y="112" text-anchor="middle" font-family="Arial" font-size="14" fill="#173b83">AuthenticateController, SongResource,</text>
      <text x="135" y="132" text-anchor="middle" font-family="Arial" font-size="14" fill="#173b83">FileUploadResource</text>

      <rect x="280" y="50" width="180" height="80" rx="10" fill="#e8f4ef" stroke="#1f6f5f" stroke-width="2"></rect>
      <text x="370" y="86" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#163029">Capa de servicio</text>
      <text x="370" y="112" text-anchor="middle" font-family="Arial" font-size="14" fill="#163029">SongService, PlaylistService,</text>
      <text x="370" y="132" text-anchor="middle" font-family="Arial" font-size="14" fill="#163029">UserService</text>

      <rect x="515" y="50" width="180" height="80" rx="10" fill="#fff8e7" stroke="#b7791f" stroke-width="2"></rect>
      <text x="605" y="86" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#6b4f14">Persistencia</text>
      <text x="605" y="112" text-anchor="middle" font-family="Arial" font-size="14" fill="#6b4f14">Repositorios JPA, DTO, mappers,</text>
      <text x="605" y="132" text-anchor="middle" font-family="Arial" font-size="14" fill="#6b4f14">Liquibase</text>

      <rect x="750" y="50" width="130" height="80" rx="10" fill="#f6f6f6" stroke="#64748b" stroke-width="2"></rect>
      <text x="815" y="86" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#334155">Infraestructura</text>
      <text x="815" y="112" text-anchor="middle" font-family="Arial" font-size="14" fill="#334155">MySQL, correo,</text>
      <text x="815" y="132" text-anchor="middle" font-family="Arial" font-size="14" fill="#334155">uploads</text>

      <path d="M225 90 L280 90" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowBack)"></path>
      <path d="M460 90 L515 90" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowBack)"></path>
      <path d="M695 90 L750 90" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowBack)"></path>

      <rect x="145" y="220" width="220" height="90" rx="10" fill="#edf3ff" stroke="#324f8f" stroke-width="2"></rect>
      <text x="255" y="250" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#20365f">Seguridad transversal</text>
      <text x="255" y="278" text-anchor="middle" font-family="Arial" font-size="14" fill="#20365f">Spring Security, JWT,</text>
      <text x="255" y="298" text-anchor="middle" font-family="Arial" font-size="14" fill="#20365f">autorización por autoridades</text>

      <rect x="435" y="220" width="220" height="90" rx="10" fill="#e8f4ef" stroke="#1f6f5f" stroke-width="2"></rect>
      <text x="545" y="250" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#163029">Gestión de ficheros</text>
      <text x="545" y="278" text-anchor="middle" font-family="Arial" font-size="14" fill="#163029">Subida de imágenes y audio,</text>
      <text x="545" y="298" text-anchor="middle" font-family="Arial" font-size="14" fill="#163029">streaming básico y validación MIME</text>

      <path d="M255 130 L255 220" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowBack)"></path>
      <path d="M545 130 L545 220" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowBack)"></path>

      <rect x="250" y="350" width="300" height="42" rx="8" fill="#fff1f2" stroke="#be123c" stroke-width="2"></rect>
      <text x="400" y="377" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#881337">Objetivo: separar responsabilidades y evitar lógica mezclada entre capas</text>
    </svg>
    """
    return textwrap.dedent(
        f"""
        <h3>3.5.3. Componentes backend y capas de servicio</h3>
        <p>El backend se apoya en una separación clara entre recursos REST, servicios, mappers, repositorios e infraestructura. La Figura @@FIG_BACKEND@@ resume esa organización para que el lector pueda relacionar las clases explicadas en el desarrollo con una vista de conjunto más fácil de seguir.</p>
        <div class="figure" data-caption-core="Componentes backend y capas de servicio. Fuente: elaboración propia." data-ref-key="FIG_BACKEND">
          {svg}
          <div class="caption"></div>
        </div>
        <p>Con estos tres recorridos se completa la parte de diseño que faltaba explicar con mayor claridad: autorización, secuencia operativa y distribución de responsabilidades técnicas. Esta ampliación responde directamente a la necesidad de reforzar los diagramas sin alterar el núcleo del contenido ya validado.</p>
        """
    ).strip()


def build_streaming_fragment() -> str:
    return textwrap.dedent(
        """
        <h3>4.2.4. Gestión de ficheros y streaming</h3>
        <p>La versión actual del proyecto ya permite reproducción real porque <code>FileUploadResource</code> expone rutas de carga para imágenes y audio. En ambos casos se valida el tipo MIME, se crea el directorio si todavía no existe y se genera un nombre aleatorio con <code>UUID</code> para reducir colisiones. El resultado devuelto al cliente contiene la URL pública y, en el caso del audio, también el nombre de fichero que luego utilizará el reproductor.</p>
        <pre>String filename = UUID.randomUUID().toString() + extension;
Path filePath = uploadPath.resolve(filename);
Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);</pre>
        <p>En el endpoint de streaming el objetivo ya no es guardar, sino servir el recurso correcto sin abrir la puerta a rutas arbitrarias. Por eso se normaliza el nombre recibido, se comprueba que el fichero siga dentro de la carpeta autorizada y solo después se construye un <code>UrlResource</code>. La respuesta anuncia <code>Content-Disposition: inline</code> y <code>Accept-Ranges: bytes</code>, pero esta última cabecera debe entenderse como base técnica para una evolución futura: la implementación actual sirve audio de forma correcta, aunque todavía no desarrolla por completo respuestas parciales <code>206</code>.</p>
        <p>Desde un punto de vista arquitectónico, esta solución separa bien tres responsabilidades: la base de datos conserva metadatos y relaciones, el sistema de ficheros almacena binarios y la API REST controla la exposición pública. En una memoria técnica, explicar esta triada es más valioso que copiar largas listas de propiedades, porque aclara cómo funciona de verdad la reproducción del proyecto.</p>
        """
    ).strip()


def update_frontend_screenshot_figures(section: Tag) -> None:
    figure_map = {
        'Pantalla de administración. Fuente: elaboración propia.': CAPTURES_DIR / 'dashboard-admin.png',
        'Pantalla de listado de canciones y reproductor. Fuente: elaboración propia.': CAPTURES_DIR / 'songs-player.png',
        'Reproductor persistente y streaming de audio. Fuente: elaboración propia.': CAPTURES_DIR / 'player-lyrics.png',
    }
    for figure in section.find_all('div', class_='figure'):
        caption = figure.find('div', class_='caption')
        if caption is None:
            continue
        key = re.sub(r'^Figura\s+\d+\.\s*', '', caption.get_text(' ', strip=True))
        capture = figure_map.get(key)
        if capture and capture.exists():
            for child in list(figure.children):
                if isinstance(child, Tag) and child.get('class') == ['caption']:
                    continue
                if isinstance(child, NavigableString) and not child.strip():
                    child.extract()
                    continue
                if isinstance(child, Tag) and child is not caption:
                    child.extract()
            image = section.new_tag('img', attrs={
                'src': url_path(capture),
                'alt': key.replace('Fuente: elaboración propia.', '').strip(),
                'class': 'screenshot',
            })
            caption.insert_before(image)
            figure['data-caption-core'] = key.replace('Pantalla', 'Captura').replace('Fuente: elaboración propia.', 'Fuente: captura real de la aplicación.')
        elif caption and key.startswith('Pantalla de administración'):
            figure['data-caption-core'] = 'Vista funcional del panel de administración. Fuente: representación visual basada en la interfaz implementada.'
        elif caption and key.startswith('Pantalla de listado de canciones y reproductor'):
            figure['data-caption-core'] = 'Vista funcional del listado de canciones y del reproductor. Fuente: representación visual basada en la interfaz implementada.'
        elif caption and key.startswith('Reproductor persistente y streaming de audio'):
            figure['data-caption-core'] = 'Vista funcional del reproductor persistente y del panel de letras. Fuente: representación visual basada en la interfaz implementada.'


def apply_text_replacements(soup: BeautifulSoup) -> None:
    replacements = {
        'RamaFran-Flujo/Back': 'implementación actual del backend',
        'En la rama ': 'En la versión actual del proyecto ',
        'la rama analizada': 'la versión actual del proyecto',
        'La rama analizada': 'La versión actual del proyecto',
        'en la rama analizada': 'en la versión actual del proyecto',
        'En la rama analizada': 'En la versión actual del proyecto',
        'esta rama': 'esta versión del proyecto',
        'Esta rama': 'Esta versión del proyecto',
        'rama estudiada': 'versión actual del proyecto',
        'Rama utilizada': 'Versión utilizada',
        'La rama utilizada': 'La versión utilizada',
    }
    for text_node in soup.find_all(string=True):
        if not isinstance(text_node, NavigableString):
            continue
        parent = text_node.parent
        if parent and parent.name in {'code', 'pre', 'caption'}:
            continue
        original = str(text_node)
        updated = original
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if updated != original:
            text_node.replace_with(updated)
    for code in soup.find_all('code'):
        if code.string and 'RamaFran-Flujo/Back' in code.string:
            code.string = code.string.replace('RamaFran-Flujo/Back', 'implementación actual del backend')


def number_figures_and_tables(soup: BeautifulSoup) -> tuple[dict[int, int], dict[int, int], dict[str, int]]:
    fig_map: dict[int, int] = {}
    tbl_map: dict[int, int] = {}
    placeholder_map: dict[str, int] = {}

    figures = soup.find_all('div', class_='figure')
    for index, figure in enumerate(figures, start=1):
        caption = figure.find('div', class_='caption')
        if caption is None:
            continue
        old_match = re.search(r'Figura\s+(\d+)', caption.get_text(' ', strip=True))
        if old_match:
            fig_map[int(old_match.group(1))] = index
        core = figure.get('data-caption-core') or re.sub(r'^Figura\s+\d+\.\s*', '', caption.get_text(' ', strip=True))
        core = re.sub(r'\s+', ' ', core).strip()
        caption.string = f'Figura {index}. {core}'
        ref_key = figure.get('data-ref-key')
        if ref_key:
            placeholder_map[ref_key] = index
        figure['id'] = f'fig-{slugify(core)}'

    tables: list[Tag] = []
    for table in soup.find_all('table'):
        section = table.find_parent('section')
        classes = set(section.get('class', [])) if section else set()
        if 'cover' in classes or 'frontmatter' in classes:
            continue
        tables.append(table)
    for index, table in enumerate(tables, start=1):
        caption = table.find('caption')
        if caption is None:
            caption = soup.new_tag('caption')
            table.insert(0, caption)
        old_match = re.search(r'Tabla\s+(\d+)', caption.get_text(' ', strip=True))
        if old_match:
            tbl_map[int(old_match.group(1))] = index
        core = table.get('data-caption-core') or re.sub(r'^Tabla\s+\d+\.\s*', '', caption.get_text(' ', strip=True))
        core = re.sub(r'\s+', ' ', core).strip()
        caption.string = f'Tabla {index}. {core}'
        ref_key = table.get('data-ref-key')
        if ref_key:
            placeholder_map[ref_key] = index
        table['id'] = f'tbl-{slugify(core)}'

    return fig_map, tbl_map, placeholder_map


def update_reference_numbers(soup: BeautifulSoup, fig_map: dict[int, int], tbl_map: dict[int, int], placeholder_map: dict[str, int]) -> None:
    placeholder_replacements = {f'@@{key}@@': str(value) for key, value in placeholder_map.items()}
    for text_node in soup.find_all(string=True):
        if not isinstance(text_node, NavigableString):
            continue
        parent = text_node.parent
        if parent and (parent.name in {'caption', 'code', 'pre'} or 'caption' in (parent.get('class') or [])):
            continue
        updated = str(text_node)
        updated = re.sub(r'\bFigura\s+(\d+)\b', lambda m: f'Figura {fig_map.get(int(m.group(1)), int(m.group(1)))}', updated)
        updated = re.sub(r'\bTabla\s+(\d+)\b', lambda m: f'Tabla {tbl_map.get(int(m.group(1)), int(m.group(1)))}', updated)
        for token, value in placeholder_replacements.items():
            updated = updated.replace(token, value)
        if updated != str(text_node):
            text_node.replace_with(updated)


def assign_heading_ids(body: Tag) -> None:
    used: set[str] = set()
    for heading in body.find_all(re.compile(r'^h[1-4]$')):
        base = slugify(heading.get_text(' ', strip=True))
        candidate = base
        counter = 2
        while candidate in used:
            candidate = f'{base}-{counter}'
            counter += 1
        heading['id'] = candidate
        used.add(candidate)


def build_index_section(document: BeautifulSoup, title: str, entries: list[tuple[str, str, str]]) -> Tag:
    section = document.new_tag('section', attrs={'class': 'frontmatter'})
    h1 = document.new_tag('h1')
    h1.string = title
    section.append(h1)
    ol = document.new_tag('ol', attrs={'class': 'toc-links'})
    section.append(ol)
    for href, label, level_class in entries:
        li = document.new_tag('li')
        li['class'] = level_class
        a = document.new_tag('a', href=href)
        span = document.new_tag('span', attrs={'class': 'label'})
        span.string = label
        a.append(span)
        page_ref = document.new_tag('span', attrs={'class': 'page-ref', 'data-target-id': href.lstrip('#')})
        a.append(page_ref)
        li.append(a)
        ol.append(li)
    return section


def build_indexes(document: BeautifulSoup, body: Tag) -> None:
    remove_section_by_title(body, 'Índice de contenidos')
    remove_section_by_title(body, 'Índice de figuras')
    remove_section_by_title(body, 'Índice de tablas')

    abstract_section = find_section(body, 'Abstract')
    abbreviations = find_section(body, 'Índice de abreviaturas y acrónimos')

    toc_entries: list[tuple[str, str, str]] = []
    for section in body.find_all('section', recursive=False):
        if 'chapter' not in (section.get('class') or []):
            continue
        for heading in section.find_all(['h1', 'h2', 'h3']):
            level = {'h1': '', 'h2': 'lvl2', 'h3': 'lvl3'}[heading.name]
            toc_entries.append((f"#{heading['id']}", heading.get_text(' ', strip=True), level))

    figure_entries: list[tuple[str, str, str]] = []
    for figure in body.find_all('div', class_='figure'):
        caption = figure.find('div', class_='caption')
        if caption is None:
            continue
        figure_entries.append((f"#{figure['id']}", caption.get_text(' ', strip=True), ''))

    table_entries: list[tuple[str, str, str]] = []
    for table in body.find_all('table'):
        section = table.find_parent('section')
        classes = set(section.get('class', [])) if section else set()
        if 'cover' in classes or 'frontmatter' in classes:
            continue
        caption = table.find('caption')
        if caption is None:
            continue
        table_entries.append((f"#{table['id']}", caption.get_text(' ', strip=True), ''))

    toc_section = build_index_section(document, 'Índice general', toc_entries)
    figure_section = build_index_section(document, 'Índice de figuras', figure_entries)
    table_section = build_index_section(document, 'Índice de tablas', table_entries)

    abbreviations.insert_before(toc_section)
    abbreviations.insert_before(figure_section)
    abbreviations.insert_before(table_section)


def build_cover_and_body_markdown(body: Tag) -> str:
    content = ''.join(str(child) for child in body.children if not (isinstance(child, NavigableString) and not child.strip()))
    return f'---\ntitle: "MusicPlayer"\nlang: "es"\n---\n\n{content}\n'


def build_literal_markdown(html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.body
    if body is None:
        raise RuntimeError('El HTML fuente no contiene cuerpo.')
    content = ''.join(str(child) for child in body.children if not (isinstance(child, NavigableString) and not child.strip()))
    return f'---\ntitle: "MusicPlayer"\nlang: "es"\n---\n\n{content}\n'


def build_pandoc_html(markdown_path: Path) -> str:
    return pypandoc.convert_file(
        str(markdown_path),
        'html5',
        format='markdown+raw_html+yaml_metadata_block',
        extra_args=['--wrap=none'],
    )


def wrap_html(fragment: str, css: str) -> str:
    return textwrap.dedent(
        f"""\
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>MusicPlayer — Memoria técnica</title>
          <style>
        {css}
          </style>
        </head>
        <body>
        {fragment}
        </body>
        </html>
        """
    )


def build_css(base_css: str) -> str:
    extras = textwrap.dedent(
        """

        .toc-links {
          margin-left: 0;
          padding-left: 0;
          list-style: none;
          text-align: left;
        }
        .toc-links li {
          margin-bottom: 4pt;
        }
        .toc-links .lvl2 {
          margin-left: 0.45cm;
        }
        .toc-links .lvl3 {
          margin-left: 0.9cm;
        }
        .toc-links a {
          color: inherit;
          text-decoration: none;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.25cm;
        }
        .toc-links .label {
          display: block;
          flex: 1 1 auto;
        }
        .toc-links .page-ref {
          display: inline-block;
          min-width: 1.2cm;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .entity-model {
          max-height: 18cm;
          width: 100%;
          object-fit: contain;
          background: white;
          border: 1px solid #bbb;
        }
        .figure .screenshot {
          border: 1px solid #999;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
          max-height: 17cm;
          object-fit: contain;
          background: white;
        }
        h1[id], h2[id], h3[id], h4[id],
        .figure[id], table[id] {
          scroll-margin-top: 1cm;
        }
        table code {
          font-size: 9.5pt;
        }
        """
    ).strip()
    return f'{base_css}\n{extras}\n'


def write_support_files() -> None:
    metadata = textwrap.dedent(
        """
        ---
        title: "MusicPlayer"
        subtitle: "Memoria técnica del proyecto intermodular"
        author:
          - "Francisco Huisa"
          - "Giovanni Alejandro"
        lang: "es-ES"
        ---
        """
    ).strip() + '\n'
    header = textwrap.dedent(
        r"""
        % Archivo preparado para un futuro flujo Pandoc + XeLaTeX.
        % En este entorno no se dispone de xelatex, por lo que la compilación
        % efectiva se realiza mediante Pandoc -> HTML -> WeasyPrint.
        \usepackage{geometry}
        \geometry{a4paper,top=2.5cm,bottom=2.5cm,left=3cm,right=3cm}
        \usepackage{setspace}
        \onehalfspacing
        \usepackage{fontspec}
        \setmainfont{Times New Roman}
        \setsansfont{Arial}
        """
    ).strip() + '\n'
    write_text(METADATA_FILE, metadata)
    write_text(HEADER_FILE, header)


def count_pdf_pages(pdf_path: Path) -> int:
    return len(PdfReader(str(pdf_path)).pages)


def render_pdf_with_playwright(html_path: Path, pdf_path: Path) -> None:
    html_uri = html_path.resolve().as_uri()
    script = textwrap.dedent(
        f"""
        const {{ chromium }} = await import('playwright');
        const browser = await chromium.launch({{ headless: true }});
        const page = await browser.newPage({{ viewport: {{ width: 1280, height: 1600 }} }});
        await page.goto({html_uri!r}, {{ waitUntil: 'networkidle' }});
        await page.pdf({{
          path: {str(pdf_path)!r},
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true
        }});
        await browser.close();
        """
    ).strip()
    subprocess.run(['node', '--input-type=module', '-e', script], cwd=PROJECT_ROOT, check=True)


def normalize_lookup_text(value: str) -> str:
    value = value.lower()
    value = (
        value.replace('á', 'a')
        .replace('é', 'e')
        .replace('í', 'i')
        .replace('ó', 'o')
        .replace('ú', 'u')
        .replace('ü', 'u')
        .replace('ñ', 'n')
    )
    value = re.sub(r'<[^>]+>', '', value)
    value = re.sub(r'\s+', ' ', value)
    return value.strip()


def build_search_candidates(label: str) -> list[str]:
    cleaned = re.sub(r'\s+', ' ', label).strip()
    candidates = [cleaned]
    candidates.append(re.sub(r'^\d+(?:\.\d+)*\.\s*', '', cleaned))
    candidates.append(re.sub(r'^Figura\s+\d+\.\s*', '', cleaned))
    candidates.append(re.sub(r'^Tabla\s+\d+\.\s*', '', cleaned))
    candidates.append(cleaned.split('Fuente:')[0].strip())
    candidates = [normalize_lookup_text(candidate) for candidate in candidates if candidate.strip()]
    deduped: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in deduped:
            deduped.append(candidate)
    return deduped


def build_page_lookup_targets(body: Tag) -> dict[str, str]:
    targets: dict[str, str] = {}
    for heading in body.find_all(['h1', 'h2', 'h3']):
        if heading.get('id'):
            targets[heading['id']] = heading.get_text(' ', strip=True)
    for figure in body.find_all('div', class_='figure'):
        caption = figure.find('div', class_='caption')
        if caption and figure.get('id'):
            targets[figure['id']] = caption.get_text(' ', strip=True)
    for table in body.find_all('table'):
        section = table.find_parent('section')
        classes = set(section.get('class', [])) if section else set()
        if 'cover' in classes or 'frontmatter' in classes:
            continue
        caption = table.find('caption')
        if caption and table.get('id'):
            targets[table['id']] = caption.get_text(' ', strip=True)
    return targets


def locate_pages(pdf_path: Path, targets: dict[str, str]) -> dict[str, int]:
    reader = PdfReader(str(pdf_path))
    pages = [normalize_lookup_text(page.extract_text() or '') for page in reader.pages]
    chapter_one_candidates = build_search_candidates(targets.get('1-introduccion-y-objetivos-del-proyecto', '1. Introducción y objetivos del proyecto'))
    chapter_one_matches: list[int] = []
    for page_number, page_text in enumerate(pages, start=1):
        for candidate in chapter_one_candidates:
            if candidate and candidate in page_text:
                chapter_one_matches.append(page_number)
                break
    content_start = chapter_one_matches[-1] if chapter_one_matches else 1
    lookup: dict[str, int] = {}
    for target_id, label in targets.items():
        candidates = build_search_candidates(label)
        match_page: int | None = None
        for candidate in candidates:
            if len(candidate) < 12:
                continue
            for page_number, page_text in enumerate(pages, start=1):
                if page_number < content_start:
                    continue
                if candidate and candidate in page_text:
                    match_page = page_number
                    break
            if match_page is not None:
                break
        if match_page is None:
            for candidate in candidates:
                for page_number, page_text in enumerate(pages, start=1):
                    if page_number < content_start:
                        continue
                    if candidate and candidate in page_text:
                        match_page = page_number
                        break
                if match_page is not None:
                    break
        if match_page is not None:
            lookup[target_id] = match_page
    return lookup


def fill_index_pages(body: Tag, page_lookup: dict[str, int]) -> None:
    for page_ref in body.find_all('span', class_='page-ref'):
        target_id = page_ref.get('data-target-id')
        if target_id and target_id in page_lookup:
            page_ref.string = str(page_lookup[target_id])
        else:
            page_ref.string = '—'


def clean_annex_headings(annex_section: Tag) -> None:
    heading_map = {
        '8.7. Anexo G: Diccionario de datos': '8.5. Anexo E: Diccionario de datos',
        '8.8. Anexo H: Guía de mantenimiento': '8.6. Anexo F: Guía de mantenimiento',
    }
    for old, new in heading_map.items():
        try:
            heading = find_heading(annex_section, old)
        except RuntimeError:
            continue
        heading.string = new


def build_final_soup(source_html: str) -> BeautifulSoup:
    soup = BeautifulSoup(source_html, 'html.parser')
    body = soup.body
    if body is None:
        raise RuntimeError('El HTML fuente no contiene body.')

    remove_section_by_title(body, 'Índice de contenidos')
    remove_section_by_title(body, 'Índice de figuras')

    section3 = find_section(body, '3. Diseño del sistema')
    replace_block(find_heading(section3, '3.2. Modelo entidad-relación explicado'), build_er_fragment())
    replace_block(
        find_heading(section3, '3.5. Diseño de flujos técnicos'),
        '\n'.join([build_access_flow_figure(), build_sequence_figure(), build_backend_components_figure()]),
    )

    section4 = find_section(body, '4. Desarrollo')
    sweetalert_paragraph = """
    <p><strong>SweetAlert2.</strong> En el frontend se ha utilizado además <code>SweetAlert2</code> para confirmaciones y mensajes de interacción. La librería aparece en operaciones de administración de usuarios, edición de artistas, alta de géneros y acciones sobre playlists, mejorando la claridad de los cuadros modales frente a las alertas nativas del navegador.</p>
    """
    insert_before(find_heading(section4, '4.2. Backend y API REST'), sweetalert_paragraph)
    replace_block(find_heading(section4, '4.2.4. Gestión de ficheros y streaming'), build_streaming_fragment())
    update_frontend_screenshot_figures(section4)

    section5 = find_section(body, '5. Pruebas realizadas y validación')
    section8 = find_section(body, '8. Anexos')
    trace_heading = find_heading(section8, '8.5. Anexo E: Matriz de trazabilidad')
    trace_html = extract_block_html(trace_heading)
    remove_block(trace_heading)
    trace_html = trace_html.replace('8.5. Anexo E: Matriz de trazabilidad', '5.5. Matriz de trazabilidad')
    insert_before(find_heading(section5, '5.5. Criterios de aceptación final'), trace_html)
    acceptance = find_heading(section5, '5.5. Criterios de aceptación final')
    acceptance.string = '5.6. Criterios de aceptación final'

    remove_block(find_heading(section8, '8.6. Anexo F: Checklist de calidad de la memoria'))
    remove_block(find_heading(section8, '8.9. Anexo I: Criterios de estilo académico aplicados'))

    maintenance = find_heading(section8, '8.8. Anexo H: Guía de mantenimiento')
    stop = next_heading_at_or_above(maintenance, 2)
    sibling = maintenance.next_sibling
    while sibling is not None and sibling is not stop:
        next_sibling = sibling.next_sibling
        if isinstance(sibling, Tag) and sibling.name == 'p' and 'rama estable' in sibling.get_text(' ', strip=True):
            sibling.decompose()
            break
        sibling = next_sibling

    clean_annex_headings(section8)
    apply_text_replacements(soup)
    assign_heading_ids(body)
    fig_map, tbl_map, placeholder_map = number_figures_and_tables(soup)
    update_reference_numbers(soup, fig_map, tbl_map, placeholder_map)
    build_indexes(soup, body)
    return soup


def main() -> None:
    run(['node', str(SOURCE_JS)])

    generator_source = read_text(SOURCE_JS)
    base_css = extract_generator_css(generator_source)
    css = build_css(base_css)
    write_support_files()
    write_text(CSS_FILE, css)

    source_html = read_text(SOURCE_HTML)
    literal_md = build_literal_markdown(source_html)
    write_text(LITERAL_MD, literal_md)

    final_soup = build_final_soup(source_html)
    final_md = build_cover_and_body_markdown(final_soup.body)  # type: ignore[arg-type]
    write_text(FINAL_MD, final_md)
    pandoc_fragment = build_pandoc_html(FINAL_MD)
    final_html = wrap_html(pandoc_fragment, css)
    write_text(FINAL_HTML, final_html)
    render_pdf_with_playwright(FINAL_HTML, FINAL_PDF)

    page_lookup = locate_pages(FINAL_PDF, build_page_lookup_targets(final_soup.body))  # type: ignore[arg-type]
    fill_index_pages(final_soup.body, page_lookup)  # type: ignore[arg-type]

    final_md = build_cover_and_body_markdown(final_soup.body)  # type: ignore[arg-type]
    write_text(FINAL_MD, final_md)
    pandoc_fragment = build_pandoc_html(FINAL_MD)
    final_html = wrap_html(pandoc_fragment, css)
    write_text(FINAL_HTML, final_html)
    render_pdf_with_playwright(FINAL_HTML, FINAL_PDF)

    literal_pages = count_pdf_pages(SOURCE_PDF)
    final_pages = count_pdf_pages(FINAL_PDF)
    print(f'HTML base regenerado desde: {SOURCE_JS.name}')
    print(f'Markdown literal creado: {LITERAL_MD.name}')
    print(f'Markdown final creado: {FINAL_MD.name}')
    print(f'HTML final creado con Pandoc: {FINAL_HTML.name}')
    print(f'PDF final creado: {FINAL_PDF.name}')
    print(f'Paginas PDF original: {literal_pages}')
    print(f'Paginas PDF final: {final_pages}')
    print('Compilacion realizada con Pandoc -> HTML y Chromium en dos pasadas, porque XeLaTeX y WeasyPrint no estan disponibles en este entorno.')


if __name__ == '__main__':
    main()
