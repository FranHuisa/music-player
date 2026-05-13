import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outBase = path.join(__dirname, 'MemoriaTecnica Borja');
const erImage = path.join(__dirname, 'diagrama5pngMYSQL.png').replaceAll('\\', '/');
const today = '12 de mayo de 2026';

const css = `
  @page {
    size: A4;
    margin: 2.5cm 3cm 2.5cm 3cm;
    @bottom-center {
      content: counter(page);
      font-family: "Times New Roman", serif;
      font-size: 10pt;
      color: #333;
    }
  }
  @page:first {
    @bottom-center { content: ""; }
  }
  :root {
    --ink: #161616;
    --muted: #555;
    --line: #b9b9b9;
    --soft: #f2f4f7;
    --accent: #1f6f5f;
    --accent-2: #324f8f;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: var(--ink);
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    text-align: justify;
    background: white;
  }
  h1, h2, h3, h4 {
    font-family: Arial, Helvetica, sans-serif;
    text-align: left;
    color: #111;
    page-break-after: avoid;
    break-after: avoid;
    margin: 0 0 0.35cm;
    line-height: 1.2;
  }
  h1 { font-size: 19pt; margin-top: 0; }
  h2 { font-size: 16pt; margin-top: 0.7cm; border-bottom: 1px solid var(--line); padding-bottom: 0.12cm; }
  h3 { font-size: 13.5pt; margin-top: 0.55cm; }
  h4 { font-size: 12.2pt; margin-top: 0.4cm; }
  p { margin: 0 0 6pt; }
  a { color: var(--accent-2); text-decoration: none; }
  ul, ol { margin: 0 0 6pt 0.55cm; padding-left: 0.2cm; }
  li { margin-bottom: 3pt; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.15cm 0 0.45cm;
    font-size: 10pt;
    line-height: 1.25;
    text-align: left;
    page-break-inside: auto;
    break-inside: auto;
  }
  thead { display: table-header-group; }
  tbody { display: table-row-group; }
  tr, img, svg, pre { break-inside: avoid; }
  caption {
    caption-side: top;
    text-align: left;
    font-weight: bold;
    margin-bottom: 0.12cm;
    font-family: Arial, Helvetica, sans-serif;
  }
  th, td {
    border: 1px solid #999;
    padding: 0.13cm 0.16cm;
    vertical-align: top;
  }
  th { background: #e7edf4; }
  code {
    font-family: "Courier New", monospace;
    font-size: 10pt;
    background: #f3f3f3;
    padding: 0 2pt;
  }
  pre {
    white-space: pre-wrap;
    font-family: "Courier New", monospace;
    font-size: 9.5pt;
    line-height: 1.25;
    background: #f6f6f6;
    border: 1px solid #ccc;
    padding: 0.25cm;
    text-align: left;
  }
  .cover {
    min-height: 24cm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    page-break-after: always;
  }
  .cover h1 {
    font-size: 24pt;
    text-align: center;
    margin-bottom: 0.5cm;
  }
  .cover .subtitle {
    font-size: 16pt;
    font-family: Arial, Helvetica, sans-serif;
    color: var(--accent-2);
    text-align: center;
    margin-bottom: 2cm;
  }
  .cover table {
    width: 80%;
    margin: 0 auto;
    font-size: 12pt;
    line-height: 1.45;
  }
  .cover td { border: 0; border-bottom: 1px solid #ddd; padding: 0.2cm 0; }
  .cover td:first-child { font-weight: bold; width: 36%; text-align: right; padding-right: 0.35cm; }
  .frontmatter, .chapter { page-break-before: auto; break-before: auto; }
  .frontmatter + .frontmatter,
  .frontmatter + .chapter,
  .chapter + .chapter {
    margin-top: 0.9cm;
  }
  .toc-list { margin-left: 0; padding-left: 0; list-style: none; text-align: left; }
  .toc-list li { margin-bottom: 4pt; }
  .toc-list .lvl2 { margin-left: 0.45cm; }
  .toc-list .lvl3 { margin-left: 0.9cm; color: #333; }
  .keywords {
    margin-top: 0.3cm;
    padding: 0.25cm;
    border-left: 4px solid var(--accent);
    background: #f5f8f7;
  }
  .figure {
    margin: 0.25cm auto 0.4cm;
    text-align: center;
    page-break-inside: auto;
    break-inside: auto;
  }
  .figure svg, .figure img, .screen {
    max-width: 100%;
    max-height: 19.5cm;
    margin: 0 auto;
    display: block;
  }
  .caption {
    font-size: 10pt;
    line-height: 1.25;
    color: #333;
    text-align: center;
    margin-top: 0.15cm;
  }
  .note {
    font-size: 10pt;
    line-height: 1.3;
    color: #333;
    background: #f6f6f6;
    border-left: 4px solid #999;
    padding: 0.2cm 0.25cm;
    margin: 0.2cm 0 0.35cm;
  }
  .avoid { page-break-inside: avoid; break-inside: avoid; }
  .forced-page { page-break-before: auto; break-before: auto; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35cm; text-align: left; }
  .card {
    border: 1px solid #bbb;
    padding: 0.25cm;
    background: #fbfbfb;
  }
  .ref-list p {
    padding-left: 0.8cm;
    text-indent: -0.8cm;
    text-align: left;
    margin-bottom: 0.25cm;
  }
  .screen {
    border: 1px solid #999;
    border-radius: 3px;
    overflow: hidden;
    background: #111827;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.5pt;
    text-align: left;
  }
  .screen-bar { height: 0.55cm; background: #e5e7eb; color: #333; padding: 0.09cm 0.2cm; }
  .screen-body { display: grid; grid-template-columns: 2.8cm 1fr; min-height: 5.8cm; }
  .screen-nav { background: #0b111f; padding: 0.28cm; }
  .screen-nav div { margin-bottom: 0.18cm; color: #d7dde8; }
  .screen-main { background: #182033; padding: 0.32cm; }
  .screen-title { font-size: 15pt; font-weight: bold; margin-bottom: 0.25cm; }
  .tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.18cm; }
  .tile { background: #24314e; border: 1px solid #3f4f74; padding: 0.22cm; min-height: 1.25cm; }
  .track-row { display: grid; grid-template-columns: 0.7cm 1fr 1.6cm 1.5cm; gap: 0.12cm; padding: 0.14cm; border-bottom: 1px solid #39445c; }
  .player { background: #070b12; border-top: 1px solid #303849; padding: 0.22cm; display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 0.2cm; align-items: center; }
  .mini-btn { display: inline-block; width: 0.42cm; height: 0.42cm; border-radius: 50%; background: #1db954; margin: 0 0.04cm; }
  .bar { height: 0.08cm; background: #64748b; border-radius: 3px; overflow: hidden; }
  .bar span { display: block; height: 100%; background: #1db954; }
`;

const architectureSvg = `
<svg viewBox="0 0 900 380" role="img" aria-label="Arquitectura general">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
    </marker>
  </defs>
  <rect x="20" y="40" width="220" height="130" rx="8" fill="#e8f4ef" stroke="#1f6f5f" stroke-width="2"/>
  <text x="130" y="75" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700">Frontend Angular</text>
  <text x="130" y="105" text-anchor="middle" font-family="Arial" font-size="13">SPA, rutas y componentes</text>
  <text x="130" y="127" text-anchor="middle" font-family="Arial" font-size="13">Interfaz responsive</text>
  <text x="130" y="149" text-anchor="middle" font-family="Arial" font-size="13">JWT en cliente</text>

  <rect x="340" y="35" width="230" height="145" rx="8" fill="#eef2ff" stroke="#324f8f" stroke-width="2"/>
  <text x="455" y="70" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700">Backend Spring Boot</text>
  <text x="455" y="100" text-anchor="middle" font-family="Arial" font-size="13">API REST</text>
  <text x="455" y="122" text-anchor="middle" font-family="Arial" font-size="13">Servicios, DTO y MapStruct</text>
  <text x="455" y="144" text-anchor="middle" font-family="Arial" font-size="13">Spring Security + JWT</text>

  <rect x="660" y="45" width="210" height="120" rx="8" fill="#fff7ed" stroke="#a16207" stroke-width="2"/>
  <text x="765" y="80" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700">Base de datos</text>
  <text x="765" y="110" text-anchor="middle" font-family="Arial" font-size="13">MySQL / H2 tests</text>
  <text x="765" y="132" text-anchor="middle" font-family="Arial" font-size="13">Liquibase</text>

  <rect x="330" y="235" width="250" height="105" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
  <text x="455" y="270" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700">Ficheros y streaming</text>
  <text x="455" y="298" text-anchor="middle" font-family="Arial" font-size="13">uploads/ y /api/upload/stream</text>
  <text x="455" y="320" text-anchor="middle" font-family="Arial" font-size="13">Audio servido por Spring MVC</text>

  <path d="M240 105 H340" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="290" y="92" text-anchor="middle" font-family="Arial" font-size="12">HTTP/JSON</text>
  <path d="M570 105 H660" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="615" y="92" text-anchor="middle" font-family="Arial" font-size="12">JPA</text>
  <path d="M240 150 C300 245 330 280 330 288" stroke="#334155" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  <text x="280" y="238" text-anchor="middle" font-family="Arial" font-size="12">audio</text>
</svg>`;

const logicalDbSvg = `
<svg viewBox="0 0 1260 860" role="img" aria-label="Modelo relacional lógico basado en el esquema proporcionado">
  <defs>
    <marker id="dbArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
    </marker>
  </defs>
  ${dbTable(780, 18, 'roles', [['id', 'TINYINT (PK)'], ['name', 'USER / ARTIST / ADMIN']], 220)}
  ${dbTable(590, 135, 'users', [['id', 'BIGINT (PK)'], ['username', 'VARCHAR(50)'], ['email', 'VARCHAR(120)'], ['password', 'VARCHAR(255)'], ['name', 'VARCHAR(100)'], ['bio', 'TEXT'], ['profile_image', 'VARCHAR(255)'], ['role_id', 'FK roles.id'], ['created_at', 'TIMESTAMP']], 245)}
  ${dbTable(930, 155, 'user_followers', [['PK', '(follower_id, followed_id)'], ['follower_id', 'FK users.id'], ['followed_id', 'FK users.id'], ['created_at', 'TIMESTAMP']], 245)}
  ${dbTable(410, 135, 'playlists', [['id', 'BIGINT (PK)'], ['name', 'VARCHAR(100)'], ['description', 'TEXT'], ['user_id', 'FK users.id'], ['is_public', 'BOOLEAN'], ['cover_image', 'VARCHAR(255)'], ['created_at', 'TIMESTAMP'], ['updated_at', 'TIMESTAMP']], 240)}
  ${dbTable(500, 365, 'playlist_songs', [['PK', '(playlist_id, song_id)'], ['playlist_id', 'FK playlists.id'], ['song_id', 'FK songs.id'], ['position', 'SMALLINT'], ['added_at', 'TIMESTAMP']], 250)}
  ${dbTable(720, 355, 'plays', [['id', 'BIGINT (PK)'], ['user_id', 'FK users.id'], ['song_id', 'FK songs.id'], ['played_at', 'TIMESTAMP'], ['duration_listened', 'INT']], 220)}
  ${dbTable(950, 370, 'likes', [['PK', '(user_id, song_id)'], ['user_id', 'FK users.id'], ['song_id', 'FK songs.id'], ['created_at', 'TIMESTAMP']], 220)}
  ${dbTable(35, 620, 'artists', [['id', 'BIGINT (PK)'], ['name', 'VARCHAR(100)'], ['bio', 'TEXT'], ['image', 'VARCHAR(255)'], ['country', 'VARCHAR(2)'], ['verified', 'BOOLEAN'], ['created_at', 'TIMESTAMP']], 225)}
  ${dbTable(270, 652, 'song_artists', [['PK', '(song_id, artist_id)'], ['song_id', 'FK songs.id'], ['artist_id', 'FK artists.id']], 220)}
  ${dbTable(470, 620, 'songs', [['id', 'BIGINT (PK)'], ['title', 'VARCHAR(150)'], ['album_id', 'FK albums.id'], ['genre_id', 'FK genres.id'], ['file_url', 'VARCHAR(255)'], ['cover_image', 'VARCHAR(255)'], ['lyrics', 'TEXT'], ['release_date', 'DATE'], ['active', 'BOOLEAN'], ['artist_id', 'FK artists.id']], 250)}
  ${dbTable(760, 655, 'genres', [['id', 'TINYINT (PK)'], ['name', 'VARCHAR(50) UNIQUE']], 220)}
  ${dbTable(980, 620, 'albums', [['id', 'BIGINT (PK)'], ['title', 'VARCHAR(150)'], ['artist_id', 'FK artists.id'], ['genre_id', 'FK genres.id'], ['cover_image', 'VARCHAR(255)'], ['release_date', 'DATE'], ['album_type', 'ENUM'], ['created_at', 'TIMESTAMP']], 235)}

  <line x1="890" y1="92" x2="890" y2="135" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="830" y1="255" x2="930" y2="255" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="650" y1="250" x2="530" y2="250" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="530" y1="325" x2="530" y2="365" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="720" y1="325" x2="720" y2="355" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="720" y1="325" x2="720" y2="190" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="950" y1="325" x2="950" y2="370" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="565" y1="760" x2="760" y2="760" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="720" y1="585" x2="720" y2="490" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="740" y1="680" x2="980" y2="680" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="980" y1="700" x2="720" y2="700" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="470" y1="760" x2="270" y2="760" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="270" y1="760" x2="160" y2="760" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="160" y1="620" x2="160" y2="470" stroke="#374151" stroke-width="2" />
  <line x1="160" y1="470" x2="500" y2="470" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="1030" y1="480" x2="720" y2="760" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
  <line x1="1095" y1="620" x2="1095" y2="520" stroke="#374151" stroke-width="2" />
  <line x1="1095" y1="520" x2="840" y2="520" stroke="#374151" stroke-width="2" marker-end="url(#dbArrow)" />
</svg>`;

const classSvg = `
<svg viewBox="0 0 920 560" role="img" aria-label="Diagrama de clases simplificado">
  <defs>
    <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
    </marker>
  </defs>
  ${classBox(40, 30, 'Genre', ['id: Long', 'name: String'], '#ecfdf5')}
  ${classBox(350, 30, 'Artist', ['id: Long', 'name: String', 'country: String', 'verified: Boolean'], '#eff6ff')}
  ${classBox(660, 30, 'Album', ['id: Long', 'title: String', 'releaseDate: LocalDate', 'albumType: AlbumType'], '#fff7ed')}
  ${classBox(350, 210, 'Song', ['id: Long', 'title: String', 'duration: Integer', 'fileUrl: String', 'lyrics: TextBlob'], '#f8fafc')}
  ${classBox(40, 390, 'Playlist', ['id: Long', 'name: String', 'isPublic: Boolean', 'createdAt: Instant'], '#fef2f2')}
  ${classBox(350, 390, 'PlaylistSong', ['id: Long', 'position: Integer', 'addedAt: Instant'], '#fdf4ff')}
  ${classBox(660, 300, 'Play', ['id: Long', 'playedAt: Instant', 'durationListened: Integer'], '#f1f5f9')}
  ${classBox(660, 430, 'Like', ['id: Long', 'createdAt: Instant'], '#f1f5f9')}
  <line x1="570" y1="100" x2="660" y2="100" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="615" y="88" text-anchor="middle" font-family="Arial" font-size="12">1..N</text>
  <line x1="460" y1="160" x2="460" y2="210" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="492" y="190" font-family="Arial" font-size="12">N..M</text>
  <line x1="660" y1="140" x2="570" y2="250" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="615" y="220" font-family="Arial" font-size="12">1..N</text>
  <line x1="240" y1="95" x2="350" y2="250" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <line x1="240" y1="95" x2="660" y2="95" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <line x1="350" y1="440" x2="240" y2="440" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <line x1="510" y1="390" x2="510" y2="340" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <line x1="660" y1="345" x2="570" y2="300" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
  <line x1="660" y1="465" x2="570" y2="310" stroke="#475569" stroke-width="2" marker-end="url(#arrow2)"/>
</svg>`;

function classBox(x, y, title, attrs, fill) {
  const rows = attrs.map((a, i) => `<text x="${x + 16}" y="${y + 62 + i * 22}" font-family="Arial" font-size="12">${a}</text>`).join('');
  return `
    <rect x="${x}" y="${y}" width="200" height="${72 + attrs.length * 22}" rx="6" fill="${fill}" stroke="#64748b"/>
    <rect x="${x}" y="${y}" width="200" height="38" rx="6" fill="#dbe4ef" stroke="#64748b"/>
    <text x="${x + 100}" y="${y + 25}" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700">${title}</text>
    ${rows}`;
}

function dbTable(x, y, title, rows, width = 220) {
  const leftWidth = Math.max(74, Math.floor(width * 0.34));
  const rowHeight = 19;
  const titleHeight = 24;
  const height = titleHeight + rows.length * rowHeight;
  const lines = rows
    .map((row, index) => {
      const rowY = y + titleHeight + index * rowHeight;
      const textY = rowY + 13;
      const separator = index === 0 ? '' : `<line x1="${x}" y1="${rowY}" x2="${x + width}" y2="${rowY}" stroke="#a3a3a3" />`;
      return `${separator}
        <text x="${x + 8}" y="${textY}" font-family="Arial" font-size="10">${row[0]}</text>
        <text x="${x + leftWidth + 8}" y="${textY}" font-family="Arial" font-size="10">${row[1]}</text>`;
    })
    .join('');

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#ffffff" stroke="#525252" />
      <rect x="${x}" y="${y}" width="${width}" height="${titleHeight}" fill="#f3f4f6" stroke="#525252" />
      <line x1="${x + leftWidth}" y1="${y + titleHeight}" x2="${x + leftWidth}" y2="${y + height}" stroke="#a3a3a3" />
      <text x="${x + width / 2}" y="${y + 16}" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700">${title}</text>
      ${lines}
    </g>`;
}

const loginActivitySvg = `
<svg viewBox="0 0 720 520" role="img" aria-label="Actividad de autenticación">
  <defs><marker id="arr3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#334155"/></marker></defs>
  ${flowNode(260, 25, 'Inicio', true)}
  ${flowNode(215, 95, 'Introducir credenciales')}
  ${flowNode(215, 165, 'POST /api/authenticate')}
  ${diamond(300, 260, '¿Válidas?')}
  ${flowNode(70, 350, 'Mostrar error')}
  ${flowNode(390, 350, 'Guardar JWT')}
  ${flowNode(390, 420, 'Redirigir por rol')}
  ${flowNode(260, 485, 'Fin', true)}
  ${arrow(360, 65, 360, 95)}
  ${arrow(360, 135, 360, 165)}
  ${arrow(360, 205, 360, 236)}
  ${arrow(285, 285, 190, 350)}
  ${arrow(170, 390, 250, 115)}
  ${arrow(435, 285, 480, 350)}
  ${arrow(480, 390, 480, 420)}
  ${arrow(480, 460, 360, 485)}
  <text x="235" y="316" font-family="Arial" font-size="12">No</text>
  <text x="440" y="316" font-family="Arial" font-size="12">Sí</text>
</svg>`;

const createSongSvg = `
<svg viewBox="0 0 760 560" role="img" aria-label="Actividad de gestión de canción">
  <defs><marker id="arr4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#334155"/></marker></defs>
  ${flowNode(280, 20, 'Inicio', true)}
  ${flowNode(230, 90, 'Usuario editor abre /song/new')}
  ${flowNode(230, 160, 'Completar formulario')}
  ${diamond(320, 255, '¿Formulario válido?')}
  ${flowNode(55, 360, 'Mostrar validaciones')}
  ${flowNode(440, 360, 'POST /api/songs')}
  ${diamond(520, 455, '¿Permiso correcto?')}
  ${flowNode(255, 500, 'Respuesta 403')}
  ${flowNode(545, 500, '201 Created')}
  ${arrow(380, 60, 380, 90)}
  ${arrow(380, 130, 380, 160)}
  ${arrow(380, 200, 380, 232)}
  ${arrow(305, 280, 175, 360)}
  ${arrow(175, 400, 260, 180)}
  ${arrow(455, 280, 530, 360)}
  ${arrow(530, 400, 530, 431)}
  ${arrow(480, 480, 350, 500)}
  ${arrow(570, 480, 610, 500)}
  <text x="275" y="325" font-family="Arial" font-size="12">No</text>
  <text x="485" y="325" font-family="Arial" font-size="12">Sí</text>
</svg>`;

function flowNode(x, y, text, terminal = false) {
  const rx = terminal ? 28 : 6;
  return `<rect x="${x}" y="${y}" width="200" height="40" rx="${rx}" fill="${terminal ? '#dcfce7' : '#eff6ff'}" stroke="#475569"/><text x="${x + 100}" y="${y + 25}" text-anchor="middle" font-family="Arial" font-size="13">${text}</text>`;
}
function diamond(cx, cy, text) {
  return `<polygon points="${cx},${cy - 45} ${cx + 85},${cy} ${cx},${cy + 45} ${cx - 85},${cy}" fill="#fff7ed" stroke="#475569"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Arial" font-size="13">${text}</text>`;
}
function arrow(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#334155" stroke-width="1.8" marker-end="url(#arr3)"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#334155" stroke-width="1.8" marker-end="url(#arr4)"/>`;
}

const testPyramidSvg = `
<svg viewBox="0 0 760 420" role="img" aria-label="Pirámide de pruebas">
  <polygon points="380,30 650,360 110,360" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
  <polygon points="210,250 550,250 650,360 110,360" fill="#dcfce7" stroke="#475569"/>
  <polygon points="285,155 475,155 550,250 210,250" fill="#e0f2fe" stroke="#475569"/>
  <polygon points="380,30 475,155 285,155" fill="#fef3c7" stroke="#475569"/>
  <text x="380" y="320" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700">Integración backend: JUnit + Spring Boot Test</text>
  <text x="380" y="215" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700">Unitarias frontend: Vitest</text>
  <text x="380" y="115" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700">Funcionales manuales</text>
  <text x="380" y="390" text-anchor="middle" font-family="Arial" font-size="13">Mayor automatización en la base; validación de experiencia completa en la parte superior.</text>
</svg>`;

function table(caption, headers, rows) {
  return `<table><caption>${caption}</caption><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

function fig(num, html, caption) {
  return `<div class="figure" id="fig-${num}">${html}<div class="caption">Figura ${num}. ${caption}. Fuente: elaboración propia.</div></div>`;
}

function screenAdmin() {
  return `<div class="screen">
    <div class="screen-bar">MusicPlayer - Panel de administración</div>
    <div class="screen-body">
      <div class="screen-nav"><div>Inicio</div><div>Usuarios</div><div>Catálogo</div><div>Sistema</div></div>
      <div class="screen-main">
        <div class="screen-title">Panel de Administración</div>
        <div class="tile-grid">
          <div class="tile">Gestión de usuarios<br><small>roles y cuentas</small></div>
          <div class="tile">Catálogo musical<br><small>canciones, álbumes, artistas</small></div>
          <div class="tile">Sistema<br><small>métricas, salud y logs</small></div>
          <div class="tile">Actividad<br><small>reproducciones y favoritos</small></div>
          <div class="tile">Autoridades<br><small>ADMIN, USER, EDITOR, ARTIST</small></div>
          <div class="tile">Configuración<br><small>monitorización</small></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenSongs() {
  return `<div class="screen">
    <div class="screen-bar">MusicPlayer - Lista de canciones</div>
    <div class="screen-main">
      <div class="screen-title">Canciones</div>
      <div class="track-row" style="font-weight:700;color:#cbd5e1"><div>#</div><div>TÍTULO</div><div>ÁLBUM</div><div>GÉNERO</div></div>
      <div class="track-row"><div>1</div><div>Nombre de canción<br><small>Artista principal</small></div><div>Álbum #1</div><div>Rock</div></div>
      <div class="track-row"><div>2</div><div>Segundo tema<br><small>Artista colaborador</small></div><div>EP #2</div><div>Pop</div></div>
      <div class="track-row"><div>3</div><div>Canción nueva<br><small>Artista verificado</small></div><div>Single</div><div>Indie</div></div>
      <div class="player"><div>Canción actual<br><small>Artista</small></div><div style="text-align:center"><span class="mini-btn"></span><span class="mini-btn"></span><span class="mini-btn"></span><div class="bar"><span style="width:45%"></span></div></div><div>Volumen <div class="bar"><span style="width:70%"></span></div></div></div>
    </div>
  </div>`;
}

function screenLyrics() {
  return `<div class="screen">
    <div class="screen-bar">MusicPlayer - Reproductor persistente</div>
    <div class="screen-main">
      <div style="border:1px solid #475569;background:#101827;padding:.25cm;margin-bottom:.3cm">
        <strong>Streaming local</strong>
        <p style="text-align:left;margin:.15cm 0 0;color:#dbeafe">El servicio del reproductor construye la ruta <code style="background:#1e293b;color:#fff">/api/upload/stream/{filename}</code> y delega la reproducción en la API Audio del navegador.</p>
      </div>
      <div class="player"><div>No hay canción<br><small>Selecciona una canción</small></div><div style="text-align:center"><span class="mini-btn"></span><span class="mini-btn"></span><span class="mini-btn"></span><div class="bar"><span style="width:20%"></span></div></div><div>Volumen y progreso<br><div class="bar"><span style="width:70%"></span></div></div></div>
    </div>
  </div>`;
}

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>MemoriaTecnica Borja</title>
  <style>${css}</style>
</head>
<body>
  <section class="cover">
    <h1>MusicPlayer</h1>
    <div class="subtitle">Memoria técnica del proyecto intermodular</div>
    <table>
      <tr><td>Título</td><td>MusicPlayer: plataforma web de gestión y reproducción musical</td></tr>
      <tr><td>Autor/a</td><td>Francisco Huisa y Giovanni Alejandro</td></tr>
      <tr><td>Ciclo</td><td>Desarrollo de Aplicaciones Web</td></tr>
      <tr><td>Centro</td><td>IES Isidra de Guzmán</td></tr>
      <tr><td>Tutor</td><td>Borja Bergua</td></tr>
      <tr><td>Fecha</td><td>${today}</td></tr>
    </table>
  </section>

  <section class="frontmatter">
    <h1>Resumen</h1>
    <p>MusicPlayer es una aplicación web orientada a la gestión de un catálogo musical y a la reproducción organizada de canciones mediante listas, favoritos e historial. El proyecto se ha construido sobre una arquitectura monolítica generada con JHipster 9.0.0, con backend Spring Boot 4.0.3, API REST, persistencia JPA, migraciones Liquibase y frontend Angular 21. El objetivo principal consiste en ofrecer una base funcional para una plataforma musical autogestionada por una organización, con usuarios autenticados, roles diferenciados y operaciones de catálogo controladas.</p>
    <p>La solución integra autenticación mediante JSON Web Tokens, control de acceso por autoridades, entidades de dominio para artistas, álbumes, canciones, géneros, playlists, reproducciones y favoritos, además de vistas Angular para administración, edición y consulta del catálogo. La memoria describe el problema abordado, los requisitos funcionales y no funcionales, el diseño de base de datos, la arquitectura por capas, los diagramas de actividad principales, las tecnologías seleccionadas, las pruebas realizadas y las mejoras futuras. También se incluyen anexos de instalación y uso para facilitar la reproducción del entorno.</p>
    <div class="keywords"><strong>Palabras clave:</strong> MusicPlayer, Angular, Spring Boot, JHipster, JWT, Liquibase.</div>
  </section>

  <section class="frontmatter">
    <h1>Abstract</h1>
    <p>MusicPlayer is a web application designed to manage a music catalogue and organise playback through playlists, likes and listening history. The project is based on a monolithic architecture generated with JHipster 9.0.0, using a Spring Boot 4.0.3 backend, REST API, JPA persistence, Liquibase migrations and an Angular 21 frontend. Its main purpose is to provide a functional foundation for a self-managed music platform operated by an organisation, with authenticated users, differentiated roles and controlled catalogue operations.</p>
    <p>The solution integrates JSON Web Token authentication, authority-based access control, domain entities for artists, albums, songs, genres, playlists, plays and likes, as well as Angular views for administration, editing and catalogue browsing. This report describes the problem statement, functional and non-functional requirements, database design, layered architecture, main activity diagrams, selected technologies, validation tests and future improvements. Installation and user-oriented annexes are also included to make the development environment reproducible.</p>
    <div class="keywords"><strong>Keywords:</strong> MusicPlayer, Angular, Spring Boot, JHipster, JWT, Liquibase.</div>
  </section>

  <section class="frontmatter">
    <h1>Índice de contenidos</h1>
    <ol class="toc-list">
      <li>1. Introducción y objetivos del proyecto</li>
      <li class="lvl2">1.1. Contexto y motivación</li>
      <li class="lvl2">1.2. Objetivos generales y específicos</li>
      <li class="lvl2">1.3. Alcance del trabajo</li>
      <li>2. Análisis del problema y justificación de la solución</li>
      <li class="lvl2">2.1. Necesidades detectadas</li>
      <li class="lvl2">2.2. Requisitos funcionales</li>
      <li class="lvl2">2.3. Requisitos no funcionales</li>
      <li class="lvl2">2.4. Casos de uso principales</li>
      <li class="lvl2">2.5. Riesgos y decisiones de mitigación</li>
      <li class="lvl2">2.6. Estado del arte y alternativas</li>
      <li>3. Diseño del sistema</li>
      <li class="lvl2">3.1. Arquitectura general</li>
      <li class="lvl2">3.2. Modelo entidad-relación explicado</li>
      <li class="lvl3">3.2.1. Funcionamiento lógico de la base de datos</li>
      <li class="lvl3">3.2.2. Correspondencia con la rama RamaFran-Flujo/Back</li>
      <li class="lvl2">3.3. Diagrama de clases explicado</li>
      <li class="lvl3">3.3.1. Responsabilidad de las clases del dominio</li>
      <li class="lvl3">3.3.2. Clases técnicas de soporte</li>
      <li class="lvl2">3.4. Diagramas de actividad</li>
      <li class="lvl2">3.5. Diseño de flujos técnicos</li>
      <li>4. Desarrollo</li>
      <li class="lvl2">4.1. Tecnologías y herramientas</li>
      <li class="lvl2">4.2. Backend y API REST</li>
      <li class="lvl3">4.2.1. Clases backend principales</li>
      <li class="lvl3">4.2.2. Fragmentos de código explicados</li>
      <li class="lvl3">4.2.3. Flujo backend de creación y publicación de canciones</li>
      <li class="lvl3">4.2.4. Gestión de ficheros y streaming</li>
      <li class="lvl2">4.3. Frontend Angular</li>
      <li class="lvl3">4.3.1. Clases frontend principales</li>
      <li class="lvl3">4.3.2. Organización de pantallas y navegación</li>
      <li class="lvl3">4.3.3. Estado reactivo y sincronización del reproductor</li>
      <li class="lvl2">4.4. Persistencia y migraciones</li>
      <li class="lvl3">4.4.1. Migraciones Liquibase clave</li>
      <li class="lvl3">4.4.2. Correspondencia entre JDL, entidades y tablas</li>
      <li class="lvl2">4.5. Seguridad e internacionalización</li>
      <li class="lvl3">4.5.1. Recorrido de una petición JWT</li>
      <li class="lvl2">4.6. Despliegue y ejecución</li>
      <li class="lvl2">4.7. Planificación temporal</li>
      <li class="lvl2">4.8. Estimación económica</li>
      <li>5. Pruebas realizadas y validación</li>
      <li class="lvl2">5.1. Estrategia de pruebas</li>
      <li class="lvl2">5.2. Casos de prueba funcionales</li>
      <li class="lvl2">5.3. Validación técnica</li>
      <li class="lvl3">5.3.1. Evidencias automáticas disponibles</li>
      <li class="lvl3">5.3.2. Riesgos no cubiertos completamente</li>
      <li class="lvl2">5.4. Resultados por módulo</li>
      <li class="lvl2">5.5. Criterios de aceptación final</li>
      <li>6. Conclusiones y mejoras futuras</li>
      <li>7. Bibliografía y recursos consultados</li>
      <li>8. Anexos</li>
      <li class="lvl2">8.5. Matriz de trazabilidad</li>
      <li class="lvl2">8.6. Checklist de calidad de la memoria</li>
      <li class="lvl2">8.7. Diccionario de datos</li>
      <li class="lvl2">8.8. Guía de mantenimiento</li>
      <li class="lvl2">8.9. Criterios de estilo académico aplicados</li>
    </ol>
  </section>

  <section class="frontmatter">
    <h1>Índice de figuras</h1>
    <ol>
      <li>Figura 1. Arquitectura general de MusicPlayer.</li>
      <li>Figura 2. Diagrama entidad-relación lógico de la base de datos.</li>
      <li>Figura 3. Diagrama de clases simplificado del dominio.</li>
      <li>Figura 4. Diagrama de actividad del inicio de sesión.</li>
      <li>Figura 5. Diagrama de actividad de creación de canción.</li>
      <li>Figura 6. Pantalla de administración.</li>
      <li>Figura 7. Pantalla de listado de canciones y reproductor.</li>
      <li>Figura 8. Reproductor persistente y streaming de audio.</li>
      <li>Figura 9. Pirámide de pruebas del proyecto.</li>
    </ol>
    <h1>Índice de tablas</h1>
    <ol>
      <li>Tabla 1. Requisitos funcionales.</li>
      <li>Tabla 2. Requisitos no funcionales.</li>
      <li>Tabla 3. Casos de uso principales.</li>
      <li>Tabla 4. Entidades del dominio.</li>
      <li>Tabla 5. Tecnologías empleadas.</li>
      <li>Tabla 6. Estrategia de pruebas.</li>
      <li>Tabla 7. Casos de prueba funcionales.</li>
      <li>Tabla 8. Recursos REST principales.</li>
      <li>Tabla 9. Comparativa de alternativas.</li>
      <li>Tabla 10. Riesgos técnicos y mitigación.</li>
      <li>Tabla 11. Planificación temporal.</li>
      <li>Tabla 12. Estimación económica.</li>
      <li>Tabla 13. Resultados por módulo.</li>
      <li>Tabla 14. Matriz de trazabilidad.</li>
      <li>Tabla 15. Checklist de calidad documental.</li>
      <li>Tabla 16. Diccionario de datos.</li>
      <li>Tabla 17. Operaciones de mantenimiento.</li>
      <li>Tabla 18. Revisión de estilo académico.</li>
      <li>Tabla 19. Responsabilidades de clases del dominio y soporte.</li>
      <li>Tabla 20. Migraciones Liquibase clave.</li>
      <li>Tabla 21. Correspondencia entre modelo lógico y modelo físico.</li>
      <li>Tabla 22. Evidencias de validación técnica.</li>
    </ol>
  </section>

  <section class="frontmatter">
    <h1>Índice de abreviaturas y acrónimos</h1>
    ${table('Tabla A. Abreviaturas utilizadas en la memoria', ['Acrónimo', 'Significado'], [
      ['API', 'Application Programming Interface; interfaz de programación usada por el frontend para comunicarse con el backend.'],
      ['CRUD', 'Create, Read, Update, Delete; conjunto básico de operaciones sobre entidades.'],
      ['DTO', 'Data Transfer Object; objeto usado para transportar datos entre capas.'],
      ['JWT', 'JSON Web Token; token firmado que identifica al usuario autenticado.'],
      ['JPA', 'Java Persistence API; especificación de persistencia usada con Hibernate.'],
      ['SPA', 'Single Page Application; aplicación web que carga una única página y cambia vistas desde el cliente.'],
      ['TFG', 'Trabajo de Fin de Grado o proyecto final equivalente.'],
    ])}
  </section>

  <section class="chapter">
    <h1>1. Introducción y objetivos del proyecto</h1>
    <h2>1.1. Contexto y motivación</h2>
    <p>El consumo musical actual se apoya en plataformas digitales que permiten acceder a catálogos completos desde el navegador o desde dispositivos móviles. Sin embargo, la mayoría de estas plataformas se ofrecen como servicios cerrados, gestionados por empresas externas y orientados a grandes volúmenes de usuarios. Esta situación deja un espacio para aplicaciones autogestionadas que puedan ser instaladas por una organización pequeña, un centro educativo, un colectivo cultural o un equipo de artistas que necesite publicar y organizar su propio contenido sin depender de una plataforma comercial.</p>
    <p>MusicPlayer se plantea como una respuesta académica y técnica a ese escenario. No pretende competir con servicios de escala global, sino demostrar cómo se puede diseñar una aplicación musical completa con tecnologías actuales de desarrollo web: autenticación segura, API REST, persistencia relacional, migraciones reproducibles, interfaz responsive y separación clara entre cliente y servidor.</p>
    <p>La motivación formativa del proyecto consiste en integrar competencias de desarrollo frontend, backend, bases de datos, seguridad y pruebas. La memoria técnica se ha redactado con un enfoque explicativo para que el lector pueda comprender por qué se ha elegido cada solución y cómo se relacionan las partes del sistema.</p>

    <h2>1.2. Objetivos generales y específicos</h2>
    <p>El objetivo general es desarrollar una plataforma web que permita gestionar un catálogo musical y ofrecer a los usuarios autenticados una experiencia básica de consulta, organización y reproducción visual del contenido. La aplicación debía organizar entidades musicales, controlar permisos por rol y mantener una base de datos reproducible mediante migraciones.</p>
    <p>Como objetivos específicos se establecen los siguientes:</p>
    <ul>
      <li>Diseñar un modelo de datos relacional para representar artistas, álbumes, canciones, géneros, playlists, reproducciones y favoritos.</li>
      <li>Implementar una API REST que permita operar con las entidades del dominio de forma paginada, validada y segura.</li>
      <li>Configurar autenticación JWT y autorización basada en roles de usuario.</li>
      <li>Construir una interfaz Angular con pantallas de administración, edición y consulta para los distintos perfiles.</li>
      <li>Integrar reproducción de audio y consulta de letras almacenadas dentro del propio modelo de canción.</li>
      <li>Definir pruebas unitarias, de integración y funcionales que validen los flujos principales.</li>
      <li>Documentar la instalación, el uso básico y los límites actuales de la solución.</li>
    </ul>

    <h2>1.3. Alcance del trabajo</h2>
    <p>La versión documentada incluye la generación y personalización de una aplicación JHipster con Angular y Spring Boot. Se implementan entidades de negocio, servicios, repositorios, DTO, mappers, controladores REST, rutas Angular, formularios y listados. También se incluye la gestión estándar de usuarios de JHipster, la seguridad JWT y los roles <code>ROLE_ADMIN</code>, <code>ROLE_USER</code>, <code>ROLE_EDITOR</code> y <code>ROLE_ARTIST</code>.</p>
    <p>El alcance funcional cubre la gestión de catálogo, la organización de playlists, el registro de reproducciones, los favoritos, la visualización de letras almacenadas y una primera solución de reproducción de audio. En la rama <code>RamaFran-Flujo/Back</code> la subida y el streaming de archivos ya se encuentran presentes mediante <code>FileUploadResource</code> y la carpeta <code>uploads</code>, aunque su endurecimiento para producción queda identificado como mejora futura.</p>
    <p>El proyecto se presenta como prototipo funcional y base ampliable. Por tanto, se valora especialmente la coherencia del diseño, la reproducibilidad del entorno, la claridad de la arquitectura y la trazabilidad entre requisitos, implementación y pruebas.</p>
  </section>

  <section class="chapter">
    <h1>2. Análisis del problema y justificación de la solución</h1>
    <h2>2.1. Necesidades detectadas</h2>
    <p>Una plataforma musical autogestionada necesita resolver tres grupos de necesidades. En primer lugar, necesita gestionar contenido: canciones, artistas, álbumes y géneros deben guardarse con información suficiente para poder ser buscados, ordenados y relacionados. En segundo lugar, debe permitir que los usuarios organicen ese contenido mediante playlists, favoritos e historial. En tercer lugar, debe proteger las operaciones sensibles para que la administración del catálogo no quede expuesta a cualquier usuario autenticado.</p>
    <p>La solución elegida se justifica por la combinación de Spring Boot y Angular. Spring Boot proporciona una base robusta para exponer una API REST y aplicar seguridad. Angular facilita una interfaz modular y escalable. JHipster permite unir ambas tecnologías con una estructura inicial coherente, generando capas, pruebas y migraciones que después se adaptan al dominio musical.</p>

    <h2>2.2. Requisitos funcionales</h2>
    <p>La Tabla 1 recoge los requisitos funcionales principales. Se han redactado en términos verificables para facilitar su relación con los casos de prueba.</p>
    ${table('Tabla 1. Requisitos funcionales', ['ID', 'Requisito', 'Rol principal'], [
      ['RF-01', 'El sistema debe permitir autenticarse con usuario y contraseña y recibir un token JWT.', 'Todos'],
      ['RF-02', 'El sistema debe permitir registrar usuarios y gestionar la cuenta mediante los mecanismos estándar de JHipster.', 'Público / usuario'],
      ['RF-03', 'El sistema debe permitir crear, consultar, modificar y eliminar canciones con título, duración, URL de archivo, portada, letra y fecha de lanzamiento.', 'ADMIN, EDITOR, ARTIST'],
      ['RF-04', 'El sistema debe permitir gestionar álbumes asociados a artistas y clasificados por tipo: álbum, single, EP o serie de podcast.', 'ADMIN, EDITOR, ARTIST'],
      ['RF-05', 'El sistema debe permitir gestionar artistas con biografía, imagen, país y estado de verificación.', 'ADMIN, EDITOR'],
      ['RF-06', 'El sistema debe permitir gestionar géneros musicales y relacionarlos con álbumes y canciones.', 'ADMIN, EDITOR'],
      ['RF-07', 'El sistema debe permitir crear playlists públicas o privadas y añadir canciones con una posición determinada.', 'USER'],
      ['RF-08', 'El sistema debe registrar reproducciones asociadas a usuario y canción.', 'USER'],
      ['RF-09', 'El sistema debe permitir marcar canciones como favoritas mediante la entidad Like.', 'USER'],
      ['RF-10', 'El sistema debe mostrar dashboards diferenciados para administración, edición y usuario final.', 'Todos'],
      ['RF-11', 'El sistema debe ofrecer una barra de reproductor persistente con controles visuales de reproducción, volumen, progreso, repetición y aleatorio.', 'Todos'],
      ['RF-12', 'El sistema debe permitir reproducir audio mediante el reproductor persistente y consultar letras almacenadas en la información de la canción.', 'Todos'],
    ])}

    <h2>2.3. Requisitos no funcionales</h2>
    <p>La Tabla 2 enumera los requisitos no funcionales. Estos requisitos condicionan las decisiones de arquitectura y validación.</p>
    ${table('Tabla 2. Requisitos no funcionales', ['ID', 'Requisito', 'Criterio de validación'], [
      ['RNF-01', 'Seguridad', 'Las rutas de API bajo <code>/api/**</code> requieren autenticación salvo autenticación, registro y recuperación de cuenta.'],
      ['RNF-02', 'Control de acceso', 'Las rutas de administración requieren <code>ROLE_ADMIN</code> y las vistas de edición de catálogo limitan el acceso a roles autorizados.'],
      ['RNF-03', 'Mantenibilidad', 'El proyecto mantiene separación entre dominio, repositorio, servicio, DTO, mapper y controlador REST.'],
      ['RNF-04', 'Reproducibilidad', 'El esquema de base de datos se versiona mediante 16 changelogs Liquibase.'],
      ['RNF-05', 'Internacionalización', 'La interfaz dispone de recursos en español e inglés mediante ngx-translate.'],
      ['RNF-06', 'Usabilidad', 'La interfaz usa dashboards, navegación lateral, formularios validados y paginación.'],
      ['RNF-07', 'Observabilidad', 'El backend incluye Actuator para salud, métricas y configuración, restringiendo endpoints sensibles.'],
      ['RNF-08', 'Pruebas', 'El repositorio incluye 87 pruebas Java y 116 especificaciones frontend TypeScript.'],
    ])}

    <h2>2.4. Casos de uso principales</h2>
    <p>Los casos de uso resumen las interacciones más importantes entre actores y sistema. La Tabla 3 muestra los casos que sirven de base a los flujos explicados en el diseño.</p>
    ${table('Tabla 3. Casos de uso principales', ['Código', 'Actor', 'Descripción', 'Resultado esperado'], [
      ['CU-01', 'Usuario no autenticado', 'Iniciar sesión mediante formulario.', 'El sistema valida credenciales, emite JWT y redirige al dashboard correspondiente.'],
      ['CU-02', 'Administrador', 'Gestionar usuarios, roles y monitorización.', 'Se accede a las pantallas de administración y a endpoints protegidos.'],
      ['CU-03', 'Editor o artista', 'Crear o modificar contenido del catálogo.', 'La canción, álbum o artista queda persistido y visible en listados.'],
      ['CU-04', 'Usuario final', 'Crear una playlist y añadir canciones.', 'La playlist queda asociada al usuario y mantiene el orden de canciones.'],
      ['CU-05', 'Usuario final', 'Marcar canciones como favoritas.', 'Se crea o actualiza una relación Like entre usuario y canción.'],
      ['CU-06', 'Usuario final', 'Reproducir una canción y consultar su información adicional.', 'El reproductor solicita el audio al backend y la vista muestra la letra almacenada si existe.'],
    ])}

    <h2>2.5. Riesgos y decisiones de mitigación</h2>
    <p>El principal riesgo técnico del proyecto es que el uso de un generador como JHipster produzca documentación automática poco explicada. Para mitigarlo, esta memoria separa claramente la descripción del generador de las decisiones propias del dominio. Otro riesgo es la gestión directa de ficheros multimedia en disco, mitigada mediante validación de tipos, publicación controlada del directorio <code>uploads</code> y comprobaciones de seguridad en el endpoint de streaming. También existe riesgo de discrepancia entre entornos de base de datos; por ello se utiliza Liquibase como mecanismo de evolución y validación del esquema.</p>
    ${table('Tabla 10. Riesgos técnicos y mitigación', ['Riesgo', 'Impacto', 'Mitigación aplicada o propuesta'], [
      ['Gestión local de audio e imágenes', 'Un fichero malicioso o una ruta manipulada podría comprometer el servidor.', 'Validación de tipo MIME, normalización de rutas y publicación controlada de <code>uploads</code>.'],
      ['Desfase entre documentación y código', 'La memoria podría prometer funcionalidades no implementadas.', 'Revisión de JDL, rutas, servicios y componentes antes de redactar la versión final.'],
      ['Exposición de operaciones sensibles', 'Usuarios no autorizados podrían modificar catálogo o usuarios.', 'JWT, reglas de Spring Security, rutas protegidas y directivas de autoridad en Angular.'],
      ['Crecimiento del modelo de datos', 'Relaciones complejas pueden dificultar consultas y mantenimiento.', 'DTO, MapStruct, repositorios separados y modelo explicado con diagramas.'],
      ['Migraciones inconsistentes', 'Un entorno podría tener un esquema distinto al esperado.', 'Uso de Liquibase y changelogs versionados en el repositorio.'],
      ['Acoplamiento excesivo frontend-backend', 'Cambios en entidades podrían romper pantallas.', 'Comunicación por API REST y modelos TypeScript generados por entidad.'],
    ])}

    <h2>2.6. Estado del arte y alternativas</h2>
    <p>Antes de justificar MusicPlayer conviene situarlo frente a alternativas existentes. Las grandes plataformas comerciales ofrecen una experiencia muy completa, pero no están diseñadas para que una organización pequeña instale su propia instancia y controle usuarios, catálogo y permisos. Las alternativas de código abierto, por su parte, suelen centrarse en bibliotecas personales o servidores musicales ya consolidados, pero no siempre ofrecen una arquitectura didáctica que combine backend Java, frontend moderno, seguridad JWT y generación reproducible de entidades.</p>
    <p>La Tabla 9 compara MusicPlayer con varias categorías de soluciones. El objetivo de esta comparación no es afirmar superioridad funcional frente a plataformas maduras, sino explicar el hueco académico y técnico que cubre el proyecto: una aplicación autogestionable, comprensible y ampliable como ejercicio completo de desarrollo web.</p>
    ${table('Tabla 9. Comparativa de alternativas', ['Solución', 'Ventaja principal', 'Limitación para el caso del proyecto', 'Aporte de MusicPlayer'], [
      ['Spotify / Apple Music', 'Catálogo masivo, experiencia de usuario muy pulida y recomendaciones avanzadas.', 'No son autogestionables y no permiten controlar una instancia propia.', 'Modelo instalable y adaptable a una organización concreta.'],
      ['YouTube Music', 'Gran variedad de contenido y fuerte integración con el ecosistema Google.', 'Dependencia total de una plataforma externa y catálogo no controlado por la organización.', 'Control del catálogo y de la base de usuarios.'],
      ['SoundCloud', 'Facilita la publicación de artistas independientes.', 'Sistema cerrado y menor control administrativo por parte de una entidad externa.', 'Roles diferenciados y administración interna.'],
      ['Navidrome / Ampache', 'Servidores musicales de código abierto para bibliotecas propias.', 'Objetivos distintos y menor integración didáctica con una arquitectura Spring + Angular.', 'Proyecto académico con API REST, DTO, pruebas y frontend integrado.'],
      ['Aplicación desarrollada desde cero', 'Control completo del código desde el primer archivo.', 'Mayor tiempo de configuración de seguridad, build, migraciones y pruebas.', 'JHipster acelera la base técnica y permite centrarse en el dominio musical.'],
    ])}
    <p>La decisión de usar JHipster tiene sentido en este contexto porque reduce el tiempo dedicado a infraestructura repetitiva. No obstante, se ha evitado presentar el resultado como una simple salida del generador. La memoria explica qué elementos se han aprovechado, cómo se han adaptado al dominio musical y qué partes requieren evolución para alcanzar una plataforma de streaming plenamente productiva.</p>
  </section>

  <section class="chapter">
    <h1>3. Diseño del sistema</h1>
    <h2>3.1. Arquitectura general</h2>
    <p>MusicPlayer sigue una arquitectura de aplicación web monolítica con cliente Angular y servidor Spring Boot. Aunque ambos forman parte del mismo proyecto Maven/JHipster, se comunican mediante HTTP y JSON. La Figura 1 muestra esta estructura general: el navegador ejecuta la SPA Angular, el backend expone la API REST, la base de datos almacena el estado persistente y el subsistema de ficheros sirve imágenes y audio desde la carpeta <code>uploads</code>.</p>
    ${fig(1, architectureSvg, 'Arquitectura general de MusicPlayer')}
    <p>La decisión de usar esta arquitectura se justifica por el alcance del proyecto. Un diseño de microservicios no aportaría beneficios claros para un prototipo académico y aumentaría la complejidad operativa. En cambio, el monolito modular permite separar capas dentro de un único despliegue: controlador REST, servicio, repositorio, entidad, mapper y configuración MVC para recursos estáticos.</p>

    <h2>3.2. Modelo entidad-relación explicado</h2>
    <p>El dominio se organiza alrededor de la canción. Una canción puede pertenecer a un álbum y a un género, y puede estar asociada a varios artistas mediante una relación muchos a muchos. Las playlists se modelan con una entidad intermedia, PlaylistSong, para poder guardar la posición de cada canción dentro de la lista. Las reproducciones y favoritos relacionan usuario y canción, permitiendo construir historial y biblioteca personal. En la Figura 2 se presenta primero el modelo entidad-relación lógico, más limpio y directo para explicar el diseño del sistema antes de entrar en la vista física de MySQL Workbench.</p>
    ${fig(2, logicalDbSvg, 'Diagrama entidad-relación lógico de la base de datos. Fuente: elaboración propia a partir del diseño del proyecto')}
    <p>La Tabla 4 describe la función de cada entidad. Esta explicación evita que el diagrama quede como una imagen aislada: cada relación responde a una necesidad funcional del sistema.</p>
    ${table('Tabla 4. Entidades del dominio', ['Entidad', 'Responsabilidad', 'Relaciones principales'], [
      ['Genre', 'Clasifica canciones y álbumes mediante un nombre único.', 'Uno a muchos con Album y Song.'],
      ['Artist', 'Representa artistas musicales con información descriptiva y estado de verificación.', 'Uno a muchos con Album y muchos a muchos con Song.'],
      ['Album', 'Agrupa canciones bajo un título, portada, fecha y tipo de publicación.', 'Muchos a uno con Artist y Genre; uno a muchos con Song.'],
      ['Song', 'Elemento central del catálogo: título, duración, URL de archivo, portada, letra y fecha.', 'Muchos a uno con Album y Genre; muchos a muchos con Artist; uno a muchos con Play, Like y PlaylistSong.'],
      ['Playlist', 'Lista creada por un usuario con visibilidad pública o privada.', 'Muchos a uno con User; uno a muchos con PlaylistSong.'],
      ['PlaylistSong', 'Entidad de unión que añade posición y fecha de alta de una canción dentro de una playlist.', 'Muchos a uno con Playlist y Song.'],
      ['Play', 'Registro de escucha con fecha y duración escuchada.', 'Muchos a uno con User y Song.'],
      ['Like', 'Marca una canción como favorita para un usuario.', 'Muchos a uno con User y Song.'],
    ])}
    <h3>3.2.1. Funcionamiento lógico de la base de datos</h3>
    <p>La base de datos se puede entender en cuatro bloques. El primer bloque es identidad y permisos: usuarios y roles determinan quién accede al sistema y qué operaciones puede realizar. El segundo bloque es el catálogo musical: artistas, álbumes, géneros y canciones describen el contenido principal. El tercer bloque es la interacción del usuario con ese contenido: playlists, favoritos y reproducciones. El cuarto bloque es el soporte a relaciones complejas, representado por tablas intermedias como <code>playlist_songs</code> y <code>song_artists</code>.</p>
    <p>El flujo normal de persistencia es el siguiente. Un usuario autenticado crea o gestiona contenido; si dispone de rol de artista o editor, la aplicación registra canciones vinculándolas a su identidad de artista. Cada canción conserva su relación con álbum, género y artista principal, mientras que las colaboraciones se representan en una tabla de unión. Cuando otro usuario escucha una canción, el sistema puede registrar una fila en <code>plays</code>; si la marca como favorita, se crea la relación correspondiente en <code>likes</code>; si la añade a una lista, se inserta una fila en <code>playlist_songs</code> con la posición concreta dentro de la playlist.</p>
    <p>La tabla <code>playlist_songs</code> merece atención especial porque no es una unión trivial. No solo conecta playlist y canción, sino que añade atributos propios como el orden y la fecha de inserción. Esta decisión de diseño evita perder información de negocio. De forma parecida, la relación <code>song_artists</code> permite distinguir entre artista principal y artistas colaboradores sin duplicar datos en la tabla de canciones.</p>
    <p>La lectura literal de la Figura 2 ayuda a entender este reparto. En la parte superior derecha aparecen <code>roles</code> y <code>users</code>, lo que indica que la seguridad y la identidad se resuelven antes de entrar en el catálogo musical. A la izquierda de ese bloque se sitúa <code>playlists</code>, enlazada con <code>users</code> porque cada lista pertenece a una cuenta concreta. Justo debajo se observa <code>playlist_songs</code>, que conecta listas y canciones y añade el atributo <code>position</code>, imprescindible para conservar el orden interno.</p>
    <p>En la zona central de la imagen se encuentran <code>plays</code> y <code>likes</code>. Ambas tablas apuntan a <code>users</code> y <code>songs</code>, lo que refleja dos comportamientos del usuario sobre la canción: escucharla o marcarla como favorita. Esta colocación central no es casual, ya que ambas tablas se apoyan en el catálogo pero no forman parte de la definición de la canción en sí misma. Sirven para registrar actividad y personalización.</p>
    <p>En la parte inferior se concentra el bloque musical principal. <code>artists</code> queda a la izquierda, <code>songs</code> en el centro, <code>genres</code> algo más a la derecha y <code>albums</code> en el extremo derecho. Esta disposición facilita visualizar que la canción actúa como tabla central del catálogo: recibe claves foráneas desde álbum y género, puede enlazarse con un artista principal y además se asocia con colaboradores mediante <code>song_artists</code>. Al leer la figura de izquierda a derecha se entiende que un artista publica álbumes, los álbumes contienen canciones y cada canción se clasifica en un género y puede ser reutilizada por playlists, favoritos e historial.</p>
    <p>La base de datos también muestra una diferencia importante entre datos maestros y datos transaccionales. Artistas, álbumes, géneros y canciones cambian con menor frecuencia y constituyen el catálogo estable. En cambio, <code>plays</code>, <code>likes</code> y <code>playlist_songs</code> crecen a medida que los usuarios interactúan con la plataforma. Esta distinción resulta útil al pensar en escalabilidad, consultas y mantenimiento, porque no todas las tablas soportan el mismo ritmo de escritura.</p>
    <p>Desde la perspectiva de una persona usuaria de la aplicación, esta estructura se traduce en comportamientos muy concretos. Cuando una persona crea una playlist, en realidad el sistema guarda una cabecera en <code>playlists</code> y después una fila en <code>playlist_songs</code> por cada canción añadida. Cuando pulsa “me gusta”, se crea un registro en <code>likes</code>. Cuando escucha una canción, el sistema puede registrar esa escucha en <code>plays</code>. Es decir, la base de datos no es un elemento ajeno a la experiencia de uso: sostiene directamente las funciones visibles de biblioteca, favoritos, historial y organización musical.</p>
    <h3>3.2.2. Correspondencia con la rama RamaFran-Flujo/Back</h3>
    <p>La memoria queda ligada a la rama <code>RamaFran-Flujo/Back</code> porque la explicación anterior se contrasta con su implementación real. En esa rama, JHipster materializa la autenticación mediante las tablas <code>jhi_user</code>, <code>jhi_authority</code> y <code>jhi_user_authority</code>, que desempeñan el mismo papel conceptual que el bloque de usuarios y roles mostrado en la Figura 2. Del mismo modo, la tabla de relación de artistas colaboradores aparece físicamente como <code>rel_song__artists</code>, mientras que el vínculo entre artista principal y canción se refuerza con una migración específica que añade <code>artist_id</code> a <code>song</code>.</p>
    <pre>&lt;addColumn tableName="song"&gt;
  &lt;column name="artist_id" type="BIGINT" /&gt;
&lt;/addColumn&gt;
&lt;addForeignKeyConstraint
  baseTableName="song"
  baseColumnNames="artist_id"
  referencedTableName="artist"
  referencedColumnNames="id" /&gt;</pre>
    <p>El fragmento anterior, tomado de un changelog Liquibase de la rama analizada, muestra cómo evoluciona la estructura sin editar manualmente la base de datos. Este enfoque es importante en una memoria técnica porque demuestra que el modelo no solo se ha dibujado, sino que también se mantiene de forma versionada y reproducible.</p>

    <h2>3.3. Diagrama de clases explicado</h2>
    <p>La Figura 3 simplifica el diagrama de clases del dominio. No se representan todos los métodos generados por JHipster porque no aportarían comprensión al lector. En su lugar, se muestran atributos relevantes y cardinalidades. Esta decisión responde a la recomendación del tutor: el diagrama debe explicar el diseño, no convertirse en un volcado automático de clases.</p>
    ${fig(3, classSvg, 'Diagrama de clases simplificado del dominio')}
    <p>En la rama analizada destacan varias clases por su papel estructural. <code>Song</code> concentra la mayor parte del dominio musical, ya que enlaza con <code>Album</code>, <code>Genre</code>, <code>Artist</code>, colaboradores y datos propios como <code>fileUrl</code>, <code>lyrics</code> o <code>active</code>. <code>Artist</code> añade la relación con <code>User</code>, lo que permite que una canción pueda asociarse automáticamente al artista autenticado. <code>PlaylistSong</code> se comporta como una clase de asociación enriquecida y resuelve el problema del orden dentro de una lista.</p>
    <p>El uso de DTO y MapStruct evita exponer directamente las entidades JPA en la API. Cada recurso REST recibe y devuelve objetos de transferencia, mientras que los mappers convierten entre DTO y entidad. Esto mejora la mantenibilidad porque permite cambiar detalles internos del modelo sin modificar necesariamente el contrato público. En este proyecto, esta separación también sirve para aplicar reglas de negocio en servidor, por ejemplo al impedir que el cliente asigne libremente el artista propietario de una canción.</p>
    <h3>3.3.1. Responsabilidad de las clases del dominio</h3>
    <p>La explicación del diagrama de clases no debe quedarse en una enumeración de nombres. Cada clase existe para resolver una necesidad concreta. <code>Song</code> actúa como agregado central del catálogo y coordina información editorial, relaciones con otras entidades y visibilidad pública. <code>Album</code> agrupa canciones bajo una publicación reconocible, mientras que <code>Genre</code> ofrece clasificación temática y facilita filtros. <code>Artist</code> aporta contexto autoral, biografía, imagen y vinculación con el usuario autenticado que gestiona el contenido.</p>
    <p>Las clases <code>Playlist</code>, <code>PlaylistSong</code>, <code>Like</code> y <code>Play</code> no definen el catálogo, sino el comportamiento del usuario sobre él. Esta separación entre catálogo e interacción evita cargar la entidad canción con datos que pertenecen a la experiencia personalizada. Gracias a ello, el sistema puede escalar conceptualmente: una canción es la misma para todos, pero cada usuario mantiene su propio historial, sus favoritos y sus listas.</p>
    ${table('Tabla 19. Responsabilidades de clases del dominio y soporte', ['Clase o componente', 'Papel técnico', 'Valor dentro del proyecto'], [
      ['Song', 'Entidad principal del catálogo musical.', 'Concentra título, duración, fichero, letra, fecha, estado y relaciones musicales.'],
      ['Artist', 'Entidad asociada a la autoría y gestión musical.', 'Permite ligar catálogo con identidad de usuario y propiedad del contenido.'],
      ['Album', 'Agrupador editorial de canciones.', 'Aporta contexto de publicación y mejora la navegación del catálogo.'],
      ['PlaylistSong', 'Clase de asociación con atributos propios.', 'Conserva el orden de reproducción y la fecha de inserción.'],
      ['SongDTO', 'Contrato de transporte entre API y cliente.', 'Evita exponer entidades JPA completas y facilita validación.'],
      ['SongMapper', 'Conversión entre DTO y entidad.', 'Centraliza el mapeo y protege campos sensibles como el artista propietario.'],
      ['SongServiceImpl', 'Lógica de negocio de canciones.', 'Aplica reglas reales de publicación, propiedad y visibilidad.'],
      ['SongRepository', 'Acceso a datos y consultas especializadas.', 'Resuelve filtros públicos, búsquedas y listados paginados.'],
    ])}
    <h3>3.3.2. Clases técnicas de soporte</h3>
    <p>Además del dominio puro, la aplicación depende de varias clases técnicas que unen infraestructura y negocio. <code>DomainUserDetailsService</code> traduce un usuario persistido a un objeto comprensible para Spring Security. <code>AuthenticateController</code> crea el token JWT que viaja en cada petición autenticada. <code>FileUploadResource</code> abstrae la entrada y salida de ficheros. Por su parte, <code>PlayerService</code> en Angular convierte la selección de una canción en un estado reactivo y en una reproducción real sobre la API <code>Audio</code> del navegador.</p>
    <p>Estas clases no son accesorias. Son las responsables de que el modelo musical pueda utilizarse en una aplicación real. Un catálogo sin autenticación permitiría accesos indebidos; una canción sin controlador de subida no podría asociarse a un audio real; un listado sin servicio de reproducción no ofrecería la experiencia mínima esperable. Por eso la memoria incorpora su explicación y no se limita a mostrar entidades.</p>

    <h2>3.4. Diagramas de actividad</h2>
    <p>El inicio de sesión es el primer flujo crítico. Como se muestra en la Figura 4, el usuario introduce credenciales, el backend valida la autenticación y, si es correcta, el cliente guarda el JWT y redirige según el rol. Si las credenciales son incorrectas, el formulario muestra un error sin crear sesión.</p>
    ${fig(4, loginActivitySvg, 'Diagrama de actividad del inicio de sesión')}
    <p>El segundo flujo crítico corresponde a la creación de canciones, representado en la Figura 5. La validación se realiza en dos niveles: el formulario Angular comprueba campos obligatorios antes de enviar la petición y el backend vuelve a validar el DTO mediante Bean Validation y seguridad por rol. Esta doble validación evita depender únicamente del cliente.</p>
    ${fig(5, createSongSvg, 'Diagrama de actividad de creación de canción')}
    <h2>3.5. Diseño de flujos técnicos</h2>
    <p>Más allá de los diagramas de actividad, el diseño del sistema puede entenderse como una cadena de responsabilidades. Cuando una petición nace en el navegador, pasa por un componente o servicio Angular, atraviesa interceptores, llega a un controlador REST, entra en la capa de servicio, usa repositorios y termina afectando a base de datos o sistema de ficheros. Esta secuencia explica por qué el proyecto se ha organizado en capas y por qué la memoria necesita describirlas una a una.</p>
    <p>En el flujo de autenticación, el formulario de login recoge las credenciales, el cliente llama a <code>/api/authenticate</code>, el backend valida usuario y contraseña, emite un JWT y el cliente solicita después la identidad completa del usuario. En el flujo de creación de canción, el frontend prepara el formulario, puede subir previamente imagen y audio, envía el <code>SongDTO</code>, el servicio backend resuelve el artista propietario a partir del usuario autenticado y persiste la entidad. En el flujo de reproducción, el cliente decide la URL de audio, el backend valida la ruta y devuelve el recurso binario con el tipo MIME apropiado.</p>
    <p>Diseñar estos recorridos de manera explícita evita varios problemas frecuentes en proyectos académicos: duplicar lógica entre frontend y backend, mezclar validación visual con validación de seguridad, o convertir el acceso a disco en una operación improvisada. La arquitectura elegida no elimina toda complejidad, pero la distribuye en puntos comprensibles y mantenibles.</p>
  </section>

  <section class="chapter">
    <h1>4. Desarrollo</h1>
    <h2>4.1. Tecnologías y herramientas utilizadas</h2>
    <p>La Tabla 5 resume las herramientas empleadas. Se han incluido únicamente las tecnologías con impacto directo sobre la arquitectura o el proceso de desarrollo.</p>
    ${table('Tabla 5. Tecnologías empleadas', ['Tecnología', 'Versión / uso', 'Justificación'], [
      ['JHipster', '9.0.0', 'Generación de base Spring Boot + Angular, seguridad JWT, estructura de capas y Liquibase.'],
      ['Java', '21', 'Lenguaje del backend y versión configurada en Maven.'],
      ['Spring Boot', '4.0.3', 'Servidor REST, inyección de dependencias, seguridad, validación, Actuator y mail.'],
      ['Angular', '21.2.2', 'Frontend SPA, rutas, componentes standalone y señales reactivas.'],
      ['TypeScript', '5.9.3', 'Tipado del frontend y mejora de mantenibilidad.'],
      ['MySQL', '8 / configuración local', 'Base de datos relacional para entornos de desarrollo y producción.'],
      ['Liquibase', 'Maven plugin y changelogs XML', 'Migraciones reproducibles y versionadas.'],
      ['MapStruct', '1.6.3', 'Conversión entre entidades y DTO.'],
      ['Bootstrap / ng-bootstrap', '5.3.8 / 20.0.0', 'Componentes visuales, formularios, dropdowns y paginación.'],
      ['Vitest y JUnit 5', 'Pruebas frontend y backend', 'Validación automática de servicios, componentes y recursos REST.'],
    ])}

    <h2>4.2. Backend y API REST</h2>
    <p>El backend se encuentra en el paquete <code>com.musicplayer</code> y sigue la estructura habitual de JHipster. Las entidades JPA están en <code>domain</code>, los repositorios en <code>repository</code>, la lógica de aplicación en <code>service</code>, los DTO en <code>service.dto</code>, los mappers en <code>service.mapper</code> y los controladores en <code>web.rest</code>. Esta organización permite localizar rápidamente la responsabilidad de cada clase.</p>
    <p>La API REST expone 12 recursos principales, incluyendo los recursos de negocio y los recursos de administración de usuarios/autoridades. Las operaciones de lista emplean paginación y devuelven la cabecera <code>X-Total-Count</code>, lo que permite al frontend mostrar paginadores sin descargar todos los registros. Las operaciones de creación y actualización aplican validaciones declaradas en los DTO o entidades generadas.</p>
    <p>La configuración de seguridad declara la aplicación como stateless: no se almacenan sesiones de servidor, sino que cada petición autenticada incluye un token en la cabecera <code>Authorization</code>. Las rutas públicas quedan limitadas a autenticación, registro, activación, recuperación de contraseña, contenido estático y endpoints de salud. El resto de rutas bajo <code>/api/**</code> requiere autenticación.</p>
    <p>Un aspecto relevante es el uso de roles personalizados. Además de <code>ROLE_ADMIN</code> y <code>ROLE_USER</code>, se han incorporado <code>ROLE_EDITOR</code> y <code>ROLE_ARTIST</code>. Estos roles permiten distinguir entre usuarios que consumen contenido y usuarios que pueden gestionar catálogo. La base de datos incluye migraciones para registrar estas autoridades.</p>
    <h3>4.2.1. Clases backend principales</h3>
    <p><code>SongResource</code> es el punto de entrada REST para el catálogo musical. Su responsabilidad no se limita a exponer CRUD: también separa vistas públicas, vistas del artista autenticado y vistas de administración mediante rutas como <code>/api/songs</code>, <code>/api/songs/my-songs</code> y <code>/api/songs/admin</code>. Esta distinción hace visible, en la propia API, que no todos los consumidores operan sobre el mismo subconjunto de datos.</p>
    <p><code>SongServiceImpl</code> concentra la lógica de aplicación asociada a canciones. Aquí se decide qué artista debe quedar vinculado al registro, qué campos se pueden actualizar, cómo se filtran las canciones públicas y qué ocurre al activar o desactivar un tema. <code>SongRepository</code> encapsula consultas más específicas, por ejemplo recuperar solo canciones activas y ya publicables según su fecha de lanzamiento.</p>
    <p><code>FileUploadResource</code> y <code>StaticResourceConfig</code> son dos clases especialmente importantes en esta rama porque materializan una funcionalidad que afecta al uso real de la plataforma: la carga y el servido de ficheros. La primera valida y guarda audio e imágenes; la segunda publica la carpeta configurada en <code>app.upload.dir</code> bajo la ruta <code>/uploads/**</code>.</p>
    <h3>4.2.2. Fragmentos de código explicados</h3>
    <p>El primer fragmento relevante aparece en <code>SongMapper</code>:</p>
    <pre>@Mapping(target = "id", ignore = true)
@Mapping(target = "artist", ignore = true)
Song toEntity(SongDTO songDTO);</pre>
    <p>La omisión del campo <code>artist</code> no es accidental. El mapper impide que el cliente construya directamente una entidad <code>Song</code> con un artista arbitrario. De esta forma, la propiedad del contenido no queda en manos del formulario enviado por el navegador.</p>
    <p>Esa decisión se completa en <code>SongServiceImpl.save</code>:</p>
    <pre>String login = SecurityUtils.getCurrentUserLogin().orElseThrow(...);
Artist artist = artistRepository.findByUserLogin(login).orElseThrow(...);
song.setArtist(artist);
song = songRepository.save(song);</pre>
    <p>Aquí se observa una regla de negocio real del proyecto: la canción se asigna al artista vinculado al usuario autenticado. Este comportamiento hace que la memoria explique algo más útil que un simple listado de métodos, porque muestra cómo se protege la coherencia entre identidad y catálogo.</p>
    <p>Otro fragmento clave se encuentra en <code>SongRepository</code>:</p>
    <pre>@Query("SELECT s FROM Song s WHERE s.active = true
AND (s.releaseDate IS NULL OR s.releaseDate &lt;= :today)")</pre>
    <p>La consulta anterior define qué canciones son públicas. No basta con que una canción exista; además debe estar activa y no tener una fecha futura de publicación. Este detalle convierte la base de datos en parte activa de la lógica de publicación y evita resolver todo en el frontend.</p>
    <p>Por último, el backend protege el acceso al sistema de ficheros en <code>FileUploadResource</code>:</p>
    <pre>Path filePath = uploadPath.resolve(filename).normalize();
if (!filePath.startsWith(uploadPath)) {
  return ResponseEntity.badRequest().build();
}</pre>
    <p>La normalización y la comprobación de prefijo bloquean rutas manipuladas que intenten salir de la carpeta autorizada. Se trata de una comprobación sencilla, pero técnicamente significativa, porque evita exponer archivos ajenos al directorio de subida.</p>
    <p>La autenticación también merece una explicación explícita. En <code>DomainUserDetailsService</code> se decide cómo localizar al usuario que intenta entrar:</p>
    <pre>if (new EmailValidator().isValid(login, null)) {
  return userRepository.findOneWithAuthoritiesByEmailIgnoreCase(login) ...;
}
String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);
return userRepository.findOneWithAuthoritiesByLogin(lowercaseLogin) ...;</pre>
    <p>Este código permite autenticarse tanto con correo electrónico como con nombre de usuario. Además, normaliza el login a minúsculas para evitar inconsistencias por mayúsculas y minúsculas. No es una cuestión estética: afecta directamente a la robustez de la autenticación y a la experiencia del usuario.</p>
    <p>La misma clase incorpora otra regla importante:</p>
    <pre>if (!user.isActivated()) {
  throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
}</pre>
    <p>Con esta comprobación se impide que una cuenta no activada obtenga acceso, aunque sus credenciales sean correctas. La memoria debe subrayar este punto porque muestra que el sistema no solo valida contraseña, sino también el estado administrativo de la cuenta.</p>
    <p>Una vez autenticado el usuario, <code>AuthenticateController</code> construye el JWT:</p>
    <pre>JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
  .issuedAt(now)
  .expiresAt(validity)
  .subject(authentication.getName())
  .claim(AUTHORITIES_CLAIM, authorities);
if (authentication.getPrincipal() instanceof UserWithId user) {
  builder.claim(USER_ID_CLAIM, user.getId());
}</pre>
    <p>Este fragmento es relevante porque explica qué contiene realmente el token. No solo guarda el nombre del usuario: también incluye las autoridades y el identificador interno. Gracias a ello, el backend puede autorizar peticiones futuras sin mantener sesión de servidor, y el sistema conserva el modelo stateless propio de JWT.</p>
    <p>Otra pieza corta, pero muy expresiva, aparece en <code>SecurityConfiguration</code>:</p>
    <pre>.requestMatchers("/api/authenticate", "/api/register", "/api/activate").permitAll()
.requestMatchers("/api/admin/**").hasAuthority(AuthoritiesConstants.ADMIN)
.requestMatchers("/api/**").authenticated();</pre>
    <p>Estas reglas resumen la política general del backend. Algunas rutas deben ser públicas para poder iniciar sesión o registrar una cuenta; las rutas administrativas requieren un rol concreto; y el resto de la API exige autenticación. Explicarlo en la memoria es útil porque conecta el diseño de seguridad con el comportamiento visible del sistema.</p>
    <h3>4.2.3. Flujo backend de creación y publicación de canciones</h3>
    <p>Conviene explicar este flujo con más literalidad porque concentra varias decisiones relevantes del proyecto. Cuando un usuario autorizado crea una canción, el controlador REST recibe un <code>SongDTO</code>. Ese DTO no se persiste directamente. Primero se transforma en entidad mediante <code>SongMapper</code>, después se consulta el login autenticado y, finalmente, se localiza el artista asociado a ese login. Solo entonces se rellena el campo <code>artist</code> y se guarda el objeto.</p>
    <p>Esta secuencia evita una vulnerabilidad muy típica en aplicaciones CRUD: que el cliente pueda falsificar la propiedad del contenido enviando un identificador de artista distinto. El backend no confía en el formulario para decidir la autoría principal, sino que deriva esa autoría del contexto de seguridad. En términos documentales, es una regla de negocio importante porque convierte una simple operación de guardado en un flujo de control de integridad.</p>
    <p>La publicación pública sigue un principio parecido. La consulta no devuelve automáticamente toda canción persistida. Las consultas <code>findPublicSongs</code> y <code>findPublicSongsByAlbumId</code> exigen que la canción esté activa y que la fecha de lanzamiento no sea futura. Por tanto, el catálogo visible para el usuario final es un subconjunto filtrado del catálogo total. Esta decisión deja preparada la plataforma para trabajar con borradores, lanzamientos diferidos o desactivación temporal de contenidos.</p>
    <p>El método <code>toggleActive</code> merece también una lectura funcional. No es solo un atajo de interfaz; representa una capacidad editorial para retirar o publicar un contenido sin borrarlo físicamente. En proyectos donde el historial o las relaciones importan, esta aproximación suele ser más razonable que eliminar filas de forma permanente.</p>
    <h3>4.2.4. Gestión de ficheros y streaming</h3>
    <p>La rama analizada incorpora una pieza que ya permite hablar de reproducción real: la subida de imágenes y audios. <code>FileUploadResource</code> expone dos rutas de carga, una para imágenes y otra para audio. En ambos casos se valida el tipo MIME, se crea el directorio si todavía no existe y se genera un nombre aleatorio con <code>UUID</code> para reducir colisiones. El resultado devuelto al cliente contiene la URL pública y, en el caso del audio, también el nombre de fichero que luego utilizará el reproductor.</p>
    <pre>String filename = UUID.randomUUID().toString() + extension;
Path filePath = uploadPath.resolve(filename);
Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);</pre>
    <p>En el endpoint de streaming el objetivo ya no es guardar, sino servir el recurso correcto sin abrir la puerta a rutas arbitrarias. Por eso se normaliza el nombre recibido, se comprueba que el fichero siga dentro de la carpeta autorizada y solo después se construye un <code>UrlResource</code>. La respuesta declara además <code>Content-Disposition: inline</code> y <code>Accept-Ranges: bytes</code>, lo cual deja preparada la base para una evolución futura hacia streaming más completo.</p>
    <p>Desde un punto de vista arquitectónico, esta solución separa bien tres responsabilidades: la base de datos conserva metadatos y relaciones, el sistema de ficheros almacena binarios y la API REST controla la exposición pública. En una memoria técnica, explicar esta triada es más valioso que copiar largas listas de propiedades, porque aclara cómo funciona de verdad la reproducción del proyecto.</p>

    <h2>4.3. Frontend Angular</h2>
    <p>El frontend está organizado por rutas y componentes standalone. Las pantallas de entidades se encuentran en <code>src/main/webapp/app/entities</code>, mientras que los servicios de autenticación, interceptores y utilidades comunes se ubican en <code>core</code> y <code>shared</code>. Esta separación replica en el cliente la modularidad del backend.</p>
    <p>El inicio de sesión redirige a dashboards distintos según el rol del usuario. El administrador accede al panel de usuarios, catálogo, actividad y sistema; el editor accede a accesos rápidos de gestión musical; el usuario final accede a playlists, favoritos, historial y exploración del catálogo. La Figura 6 muestra una representación de la pantalla de administración basada en la interfaz implementada.</p>
    ${fig(6, screenAdmin(), 'Pantalla de administración')}
    <p>La lista de canciones ofrece paginación, ordenación, acciones por rol y controles visuales de reproducción. Como se observa en la Figura 7, el diseño separa información musical, relaciones de álbum/género y acciones de mantenimiento. Los botones de creación, edición y eliminación solo se muestran a roles autorizados.</p>
    ${fig(7, screenSongs(), 'Pantalla de listado de canciones y reproductor')}
    <h3>4.3.1. Clases frontend principales</h3>
    <p>La clase <code>login.ts</code> combina formulario reactivo, señales de error y redirección por rol. Tras autenticar al usuario, consulta la cuenta actual y decide si debe abrir el dashboard de administrador, editor o usuario. Esta lógica no sustituye a la autorización del backend, pero mejora la experiencia de navegación y muestra que el frontend participa en la adaptación de la interfaz al perfil autenticado.</p>
    <pre>this.accountService.identity().subscribe(account => {
  const roles = account?.authorities ?? [];
  if (roles.includes('ROLE_ADMIN')) {
    this.router.navigate(['/dashboard-admin']);
  } else if (roles.includes('ROLE_EDITOR')) {
    this.router.navigate(['/dashboard-editor']);
  } else {
    this.router.navigate(['/dashboard-user']);
  }
});</pre>
    <p>Este bloque muestra una decisión funcional clara: la misma autenticación conduce a experiencias distintas según el rol. En otras palabras, el frontend no cambia únicamente la decoración de la interfaz; reorganiza el punto de entrada del usuario en función de su responsabilidad dentro de la plataforma.</p>
    <p>El servicio <code>login.service.ts</code> refuerza esta idea con una implementación deliberadamente pequeña:</p>
    <pre>login(credentials: Login): Observable&lt;Account | null&gt; {
  return this.authServerProvider.login(credentials)
    .pipe(mergeMap(() => this.accountService.identity(true)));
}</pre>
    <p>La secuencia es importante. Primero se solicita el token al backend y, a continuación, se recarga la identidad completa del usuario. Separar ambos pasos evita acoplar la interfaz a la estructura exacta de la respuesta JWT y permite que el cliente trabaje después con un objeto <code>Account</code> ya normalizado.</p>
    <p>El servicio <code>player.service.ts</code> es una de las piezas más representativas del cliente porque no se limita a transportar datos: mantiene estado de reproducción mediante <code>signal</code>, calcula iconos y progreso con <code>computed</code> y sincroniza el objeto <code>Audio</code> del navegador usando <code>effect</code> y escuchadores de eventos. Cuando una canción se selecciona, construye la URL de reproducción; si <code>fileUrl</code> ya es una ruta completa la reutiliza, y si no lo es, llama al endpoint de streaming del backend.</p>
    <pre>const fileUrl = song.fileUrl ?? '';
this.audio.src = fileUrl.startsWith('/')
  ? fileUrl
  : \`/api/upload/stream/\${encodeURIComponent(fileUrl)}\`;</pre>
    <p>Este pequeño fragmento resume la integración entre cliente y servidor: el frontend reproduce audio, pero el backend conserva el control sobre cómo se expone físicamente el fichero. La Figura 8 sintetiza este comportamiento dentro del reproductor persistente.</p>
    <p>Además, el propio servicio usa <code>effect</code> para sincronizar el volumen del navegador con el estado reactivo:</p>
    <pre>effect(() => {
  this.audio.volume = this.isMuted() ? 0 : this.volume() / 100;
});</pre>
    <p>Esta línea es breve, pero explica por qué el reproductor responde de manera inmediata a los controles de interfaz. La señal mantiene el estado lógico y el efecto traduce ese estado al objeto nativo <code>Audio</code>. Es un buen ejemplo de cómo Angular y la API del navegador cooperan dentro del proyecto.</p>
    ${fig(8, screenLyrics(), 'Reproductor persistente y streaming de audio')}
    <h3>4.3.2. Organización de pantallas y navegación</h3>
    <p>El frontend no se ha concebido como una única pantalla con controles dispersos, sino como una colección de rutas con responsabilidades claras. Existen pantallas de administración, edición, exploración y detalle. Esta organización mejora la mantenibilidad porque cada vista concentra un objetivo: gestionar usuarios, editar catálogo, consultar listas o reproducir contenido. A la vez, facilita el control de acceso, ya que cada ruta puede protegerse con autoridades diferentes.</p>
    <p>Los dashboards cumplen un papel especialmente importante. Funcionan como puntos de entrada diferenciados según el perfil autenticado. El administrador ve una visión orientada a control del sistema; el editor y el artista necesitan accesos rápidos al mantenimiento del catálogo; el usuario final necesita descubrir música, reproducirla y organizarla. Esta diferencia no es cosmética: expresa que el proyecto contempla varios actores con intereses distintos dentro de la misma plataforma.</p>
    <p>También conviene destacar el uso de componentes de entidad generados por JHipster y después adaptados. Gracias a esa base, el proyecto dispone de formularios, listados, ordenación y paginación consistentes. La personalización posterior añade la lógica musical específica, de manera que el desarrollo no parte de cero, pero tampoco se queda en el código generado automáticamente.</p>
    <h3>4.3.3. Estado reactivo y sincronización del reproductor</h3>
    <p>El reproductor representa una pieza particularmente rica desde el punto de vista del frontend porque combina estado de aplicación y estado nativo del navegador. Las señales <code>currentSong</code>, <code>isPlaying</code>, <code>volume</code>, <code>progress</code> y <code>duration</code> modelan la situación lógica. En paralelo, el objeto <code>Audio</code> mantiene la reproducción real. El servicio actúa como puente entre ambos mundos.</p>
    <p>El comportamiento de cola refuerza esta idea. Cuando se llama a <code>playSong</code>, el servicio no solo carga una canción: conserva la lista de reproducción activa y calcula el índice actual. A partir de ahí, los métodos <code>next</code> y <code>prev</code> pueden avanzar, retroceder o aplicar aleatorio sin que cada componente vuelva a implementar esas reglas. Esta centralización evita divergencias funcionales entre pantallas distintas.</p>
    <p>Los escuchadores de eventos completan la sincronización. <code>timeupdate</code> actualiza progreso y tiempo reproducido, <code>loadedmetadata</code> inicializa la duración y <code>ended</code> decide si se repite la canción o se avanza a la siguiente. Este patrón resulta interesante para la memoria porque demuestra que el proyecto no se limita a consumir CRUD desde Angular, sino que también integra comportamiento multimedia real.</p>

    <h2>4.4. Persistencia y migraciones</h2>
    <p>El modelo de datos se define inicialmente en <code>music.jdl</code>. A partir de esa definición se generan entidades, repositorios, servicios, DTO, mappers, controladores y changelogs. La persistencia se realiza mediante Spring Data JPA e Hibernate. Liquibase versiona el esquema para que cada entorno pueda reproducir la misma estructura sin ejecutar scripts manuales.</p>
    <p>El repositorio contiene 16 archivos de changelog Liquibase. Esto permite evolucionar la base de datos con trazabilidad: creación de entidades, restricciones, datos iniciales, nuevas autoridades y ajustes posteriores como la incorporación de <code>artist_id</code> a la tabla de canciones. La configuración de desarrollo apunta a MySQL en <code>localhost:3307/musicplayer</code>, mientras que producción usa MySQL en <code>localhost:3306/musicplayer</code>. Las pruebas de integración utilizan una configuración específica que permite ejecutar el backend de forma aislada.</p>
    <p>La persistencia de ficheros también forma parte de esta sección porque el audio del proyecto no se queda en un valor abstracto de base de datos. La tabla <code>song</code> guarda la referencia <code>fileUrl</code>, pero el fichero real se almacena en disco y se publica por medio de Spring MVC. De este modo, la base de datos conserva metadatos y relaciones, mientras que el sistema de ficheros mantiene el contenido binario.</p>
    <h3>4.4.1. Migraciones Liquibase clave</h3>
    <p>Dentro de una memoria técnica, las migraciones no deberían presentarse como un detalle secundario. Son el mecanismo que garantiza que el modelo se despliegue igual en todos los entornos. En este proyecto, Liquibase crea tablas, restricciones, relaciones y datos iniciales, y también refleja la evolución del diseño cuando una necesidad aparece más tarde, como ocurre con la asociación entre canción y artista principal.</p>
    ${table('Tabla 20. Migraciones Liquibase clave', ['Changelog o grupo', 'Cambio aplicado', 'Justificación técnica'], [
      ['Creación inicial de entidades', 'Alta de tablas para género, artista, álbum, canción, playlist, reproducciones y favoritos.', 'Materializar el modelo musical definido en JDL con integridad referencial.'],
      ['Relaciones muchos a muchos', 'Creación de tablas intermedias como <code>rel_song__artists</code>.', 'Representar colaboraciones musicales sin duplicar datos en canción o artista.'],
      ['Autoridades personalizadas', 'Inserción de <code>ROLE_EDITOR</code> y <code>ROLE_ARTIST</code>.', 'Ampliar el esquema base de JHipster para separar consumo y edición de catálogo.'],
      ['Ajuste <code>artist_id</code> en canción', 'Nueva columna y clave foránea desde <code>song</code> hacia <code>artist</code>.', 'Resolver la propiedad principal de la canción desde backend y simplificar consultas.'],
      ['Datos y restricciones auxiliares', 'Índices, claves ajenas y valores por defecto.', 'Mantener consistencia y rendimiento mínimo en consultas frecuentes.'],
    ])}
    <p>Este enfoque versionado resulta especialmente valioso en un entorno académico porque facilita repetir el despliegue, corregir errores sin tocar manualmente la base de datos y justificar por qué el modelo actual no surgió de una sola vez. El esquema ha evolucionado con el propio aprendizaje del proyecto y Liquibase deja ese rastro de manera explícita.</p>
    <h3>4.4.2. Correspondencia entre JDL, entidades y tablas</h3>
    <p>El archivo <code>music.jdl</code> actúa como descripción de alto nivel del dominio. A partir de él se generan clases Java, DTO, rutas Angular y tablas SQL, pero la rama estudiada introduce personalizaciones posteriores. Esa combinación entre generación y ajuste manual es importante: el proyecto parte de una herramienta productiva, aunque la solución final ya no sea un simple resultado automático.</p>
    ${table('Tabla 21. Correspondencia entre modelo lógico y modelo físico', ['Nivel', 'Ejemplo en el proyecto', 'Papel en la solución'], [
      ['Modelo conceptual', 'Entidades Song, Album, Artist, Playlist y relaciones musicales.', 'Expresa necesidades de negocio y sirve de base para el diseño.'],
      ['Definición JDL', '<code>music.jdl</code> con entidades, campos y relaciones.', 'Permite generar estructura coherente de backend y frontend.'],
      ['Modelo físico', 'Tablas <code>song</code>, <code>album</code>, <code>artist</code>, <code>playlist_song</code>, etc.', 'Persistencia real en MySQL con claves foráneas y restricciones.'],
      ['Personalización posterior', 'Changelog que añade <code>artist_id</code> y controladores de subida/streaming.', 'Adapta la base generada a necesidades específicas de la rama analizada.'],
    ])}
    <p>La correspondencia entre estos niveles es una de las razones por las que el proyecto resulta adecuado para una memoria técnica. Permite explicar no solo qué tablas existen, sino también cómo se ha llegado a ellas y qué cambios se han hecho para responder a requisitos que no quedaban completamente cubiertos por la generación inicial.</p>
    <p>La Figura 2, basada en el esquema relacional del proyecto, permite relacionar de manera directa el diseño lógico con el funcionamiento real de la aplicación. En la parte superior del diagrama se encuentra el bloque de identidad y permisos, formado por <code>roles</code> y <code>users</code>. Este bloque explica por qué la aplicación puede distinguir entre perfiles con capacidades distintas: administración, edición, gestión artística o consumo normal.</p>
    <p>En el centro aparecen las tablas que conectan el uso cotidiano con el catálogo musical. <code>playlists</code> y <code>playlist_songs</code> explican cómo una persona usuaria crea listas y conserva el orden de las canciones. <code>plays</code> y <code>likes</code> representan dos acciones visibles en la experiencia de uso: reproducir contenido y marcarlo como favorito. No son simples adornos del modelo; son las piezas que permiten que el sistema recuerde actividad, preferencias y organización personal.</p>
    <p>En la franja inferior del diagrama se concentra el catálogo principal, con <code>artists</code>, <code>songs</code>, <code>genres</code> y <code>albums</code>. La tabla <code>songs</code> ocupa una posición central porque es el elemento que finalmente consume el usuario. Una canción puede pertenecer a un álbum, clasificarse en un género y asociarse a uno o varios artistas. Desde el punto de vista funcional, esto hace posible mostrar fichas completas de contenido, agrupar canciones por publicación y permitir búsquedas o listados más coherentes.</p>
    <p>La correspondencia entre JDL, entidades Java y tablas SQL se entiende mejor al leer este diagrama como una traducción gradual. Lo que en el modelo conceptual se formula como “un usuario crea una playlist”, en la base de datos se convierte en una fila en <code>playlists</code> enlazada con <code>users</code>. Lo que en la interfaz se percibe como “marcar me gusta”, se traduce en una relación persistida en <code>likes</code>. Y lo que en el reproductor se presenta como “reproducir una canción”, puede dejar rastro en <code>plays</code>. Esta cadena de correspondencias demuestra que la base de datos no es un apéndice técnico aislado, sino el soporte directo de la experiencia de uso.</p>
    <p>Por eso, aunque el modelo se haya generado inicialmente a partir de <code>music.jdl</code> y después se haya personalizado con migraciones y código adicional, el resultado final mantiene coherencia entre diseño, implementación y comportamiento funcional. Esa coherencia es precisamente la que se espera evidenciar en una memoria técnica bien estructurada.</p>

    <h2>4.5. Seguridad e internacionalización</h2>
    <p>La seguridad combina Spring Security en el backend y guards/directivas en Angular. El backend es la fuente de verdad: aunque el cliente oculte botones, la autorización final se aplica en servidor. En el frontend, las rutas de creación y edición de canciones/álbumes requieren autoridades específicas, y la directiva <code>jhiHasAnyAuthority</code> permite ocultar acciones no permitidas.</p>
    <p>La internacionalización se basa en archivos JSON por idioma en <code>src/main/webapp/i18n</code>. El idioma nativo es español y se incluye inglés como idioma secundario. Esta decisión facilita que las etiquetas de formularios, mensajes de error y textos de navegación puedan ampliarse sin modificar los componentes.</p>
    <h3>4.5.1. Recorrido de una petición JWT</h3>
    <p>La autenticación JWT se entiende mejor si se describe el recorrido completo de una petición. El usuario se autentica enviando login y contraseña. El backend responde con un token firmado que contiene sujeto, autoridades e identificador de usuario. A partir de ese momento, el cliente adjunta el token en la cabecera <code>Authorization: Bearer ...</code>. Spring Security intercepta la petición, valida la firma y reconstruye el contexto autenticado antes de que el controlador de negocio llegue a ejecutarse.</p>
    <p>Este recorrido justifica por qué la memoria insiste en distinguir autenticación y autorización. Autenticarse significa demostrar la identidad y obtener un token válido. Autorizar significa decidir, en cada petición concreta, si ese usuario puede o no realizar la acción solicitada. En la práctica, el proyecto usa ambas capas: primero crea el JWT y después limita determinadas rutas a administradores o a usuarios autenticados.</p>
    <p>La ventaja de este modelo es que reduce dependencia de sesión de servidor y encaja bien con una SPA Angular. Su principal exigencia es mantener una configuración cuidada de expiración, renovación y protección del token en cliente. Aunque el prototipo ya funciona con este esquema, una evolución futura podría reforzar la persistencia segura del token y la gestión de caducidad en escenarios prolongados.</p>

    <h2>4.6. Despliegue y ejecución</h2>
    <p>Durante el desarrollo se ejecutan backend y frontend por separado: Spring Boot en el puerto 8080 y Angular en el puerto 4200. Para producción, Maven genera un paquete ejecutable que sirve la aplicación integrada y usa el perfil <code>prod</code>. La configuración productiva activa compresión, caché HTTP y una conexión MySQL con HikariCP.</p>
    <p>El despliegue no requiere licencias de pago. Todas las tecnologías principales son de código abierto o gratuitas para el contexto del proyecto. Esto favorece que el prototipo pueda instalarse en un entorno educativo o de pruebas con coste reducido.</p>

    <h2>4.7. Planificación temporal</h2>
    <p>La planificación se organizó en fases porque el proyecto combina aprendizaje tecnológico, generación inicial, personalización del dominio, desarrollo visual, pruebas y documentación. En una aplicación generada con JHipster existe la tentación de considerar que la fase inicial resuelve la mayor parte del trabajo. Sin embargo, la experiencia muestra que la generación solo proporciona una base: el tiempo real se invierte en comprenderla, ajustarla, validar los permisos, adaptar la interfaz y documentar las decisiones.</p>
    <p>La Tabla 11 recoge una planificación temporal razonada. Las semanas no deben interpretarse como bloques totalmente aislados; varias tareas se solapan, especialmente pruebas y documentación. Aun así, la división permite entender el avance del proyecto y justificar el orden de ejecución.</p>
    ${table('Tabla 11. Planificación temporal', ['Fase', 'Duración estimada', 'Actividades principales', 'Resultado'], [
      ['Investigación y definición', '2 semanas', 'Análisis de plataformas musicales, selección de tecnologías y definición del alcance.', 'Objetivos, requisitos y enfoque técnico.'],
      ['Modelado del dominio', '1 semana', 'Diseño JDL, entidades, relaciones y validaciones principales.', 'Modelo de datos inicial y generación de entidades.'],
      ['Backend y seguridad', '3 semanas', 'Configuración JWT, roles, recursos REST, DTO, mappers y migraciones.', 'API funcional y persistencia reproducible.'],
      ['Frontend y experiencia de usuario', '3 semanas', 'Dashboards, listados, formularios, navegación, reproductor visual y letras.', 'Interfaz navegable por roles.'],
      ['Pruebas y correcciones', '2 semanas', 'Pruebas unitarias, integración, validaciones manuales y revisión de errores.', 'Plan de pruebas y comportamiento validado.'],
      ['Documentación final', '2 semanas', 'Redacción de memoria, anexos, diagramas, índices, bibliografía y revisión formal.', 'Memoria técnica entregable en PDF/Word.'],
    ])}
    <p>La fase con mayor incertidumbre fue la de seguridad. Aunque JHipster genera una configuración inicial correcta, entender la cadena de filtros, las autoridades y la interacción entre backend y guards de Angular requiere una lectura cuidadosa. Esta dificultad no se percibe al mirar solo las clases generadas, pero sí aparece cuando se intenta explicar el sistema con precisión.</p>

    <h2>4.8. Estimación económica</h2>
    <p>La estimación económica se presenta con finalidad académica. El proyecto se ha desarrollado con herramientas gratuitas y equipos ya disponibles, por lo que no se ha producido un coste directo de licencias. Aun así, para valorar el esfuerzo real se puede estimar el coste de personal y de recursos si el prototipo se encargara como desarrollo profesional.</p>
    ${table('Tabla 12. Estimación económica', ['Concepto', 'Criterio', 'Coste estimado'], [
      ['Equipo de desarrollo', 'Ordenador personal ya disponible.', '0 € de coste adicional.'],
      ['Software base', 'JDK, Node.js, Spring Boot, Angular, JHipster, MySQL Community, Liquibase y VS Code/IDE comunitario.', '0 € en licencias.'],
      ['Infraestructura local', 'Uso de entorno local y Docker para servicios auxiliares.', '0 € en fase de desarrollo.'],
      ['Trabajo de análisis y desarrollo', 'Aproximadamente 13 semanas de trabajo académico parcial.', 'Coste imputable al esfuerzo formativo.'],
      ['Despliegue futuro', 'Servidor VPS básico, dominio y certificado TLS.', 'Pendiente de decisión; no incluido en el prototipo.'],
    ])}
    <p>La principal inversión del proyecto no ha sido económica, sino de aprendizaje y tiempo. Esta observación es relevante porque una memoria técnica no debe limitarse a enumerar herramientas: debe dejar constancia de qué decisiones permitieron reducir coste, cuáles aumentaron la complejidad y qué partes exigirían inversión adicional para producción.</p>
  </section>

  <section class="chapter">
    <h1>5. Pruebas realizadas y validación</h1>
    <h2>5.1. Estrategia de pruebas</h2>
    <p>La validación se organiza en niveles. Las pruebas unitarias del frontend verifican servicios, formularios y componentes; las pruebas de integración del backend arrancan el contexto Spring y validan recursos REST; las pruebas funcionales manuales recorren los flujos completos desde el navegador. La Figura 9 resume esta estrategia en forma de pirámide.</p>
    ${fig(9, testPyramidSvg, 'Pirámide de pruebas del proyecto')}
    ${table('Tabla 6. Estrategia de pruebas', ['Tipo', 'Herramienta', 'Alcance', 'Evidencia'], [
      ['Unitarias frontend', 'Vitest / Angular TestBed', 'Servicios, componentes, formularios y utilidades.', '116 archivos <code>.spec.ts</code>.'],
      ['Integración backend', 'JUnit 5 + Spring Boot Test', 'Controladores REST, repositorios, mappers y seguridad.', '87 archivos Java de prueba.'],
      ['Funcionales manuales', 'Navegador y Postman', 'Login, roles, CRUD, playlists, favoritos y letras.', 'Plan de pruebas documentado.'],
      ['Regresión visual', 'Revisión manual en navegador', 'Coherencia de dashboards, listados, formularios y reproductor.', 'Comparación tras cambios de SCSS/HTML.'],
    ])}

    <h2>5.2. Casos de prueba funcionales</h2>
    <p>La Tabla 7 resume los casos funcionales más representativos. Se han seleccionado los que cubren mayor riesgo: seguridad, catálogo, permisos, playlists y dependencia externa.</p>
    ${table('Tabla 7. Casos de prueba funcionales', ['ID', 'Módulo', 'Pasos resumidos', 'Resultado esperado'], [
      ['AUTH-01', 'Autenticación', 'Entrar en <code>/login</code>, introducir credenciales válidas y enviar.', 'Se obtiene JWT y se redirige al dashboard según rol.'],
      ['AUTH-02', 'Autenticación', 'Introducir credenciales inválidas.', 'Se muestra error y no se crea sesión.'],
      ['AUTH-03', 'Autorización', 'Acceder a una ruta de administración con usuario sin permisos.', 'El sistema deniega el acceso.'],
      ['CAT-01', 'Canciones', 'Listar canciones autenticado.', 'Se muestran registros paginados y cabecera de total.'],
      ['CAT-02', 'Canciones', 'Crear canción como editor con campos válidos.', 'La API devuelve creación correcta y la canción aparece en listado.'],
      ['CAT-03', 'Canciones', 'Intentar crear canción sin título.', 'El formulario o backend rechaza la operación.'],
      ['PL-01', 'Playlists', 'Crear playlist y asociar una canción mediante PlaylistSong.', 'La relación queda persistida con posición.'],
      ['LIKE-01', 'Favoritos', 'Crear un Like entre usuario y canción.', 'La canción aparece como favorita del usuario.'],
      ['LYR-01', 'Letras', 'Abrir panel de letras con canción seleccionada.', 'Se muestra letra o mensaje de no disponible sin romper la interfaz.'],
      ['I18N-01', 'Internacionalización', 'Cambiar idioma de la interfaz.', 'Las etiquetas traducibles cambian entre español e inglés.'],
    ])}

    <h2>5.3. Validación técnica</h2>
    <p>La validación técnica se apoya en la compilación Maven, las pruebas generadas por JHipster, las especificaciones Angular y la comprobación manual de rutas. La existencia de pruebas no garantiza por sí sola la ausencia de defectos, pero proporciona una red de seguridad para cambios en entidades, DTO, controladores y formularios. La memoria no incluye listados completos de código porque no aportan valor documental; los fragmentos técnicos quedan limitados a comandos de instalación en anexos.</p>
    <p>En términos de aceptación, se considera que una funcionalidad supera la validación cuando cumple tres condiciones: la interfaz permite ejecutar el flujo, el backend responde con el estado HTTP esperado y la base de datos conserva la relación correcta entre entidades. Para el caso del audio, además, la reproducción debe resolver correctamente la ruta del fichero y mantener sincronizados el estado visual y el estado real del objeto <code>Audio</code>.</p>
    <h3>5.3.1. Evidencias automáticas disponibles</h3>
    <p>La rama utilizada aporta una base sólida de validación automática gracias a la estructura estándar de JHipster y a las pruebas añadidas en frontend. Esta circunstancia es relevante porque permite comprobar que la aplicación no solo compila, sino que mantiene contratos internos entre capas. Un fallo en un mapper, en una ruta REST o en un formulario suele reflejarse pronto en las suites existentes.</p>
    ${table('Tabla 22. Evidencias de validación técnica', ['Evidencia', 'Qué demuestra', 'Límite de la evidencia'], [
      ['Pruebas JUnit de recursos y servicios', 'Que controladores, mappers y repositorios mantienen contratos mínimos esperados.', 'No sustituyen la validación manual de permisos finos ni de experiencia de usuario.'],
      ['Especificaciones Angular', 'Que servicios, componentes y formularios conservan comportamiento básico.', 'No cubren por sí solas navegación completa de extremo a extremo.'],
      ['Compilación Maven/Angular', 'Que dependencias, tipado y configuración principal son coherentes.', 'Compilar no garantiza que todos los flujos de negocio estén bien resueltos.'],
      ['Comprobación manual de login, catálogo y reproducción', 'Que los flujos principales funcionan de manera integrada.', 'Depende de la disciplina de ejecución y de la cobertura de escenarios elegidos.'],
    ])}
    <p>Desde el punto de vista de la memoria, esta tabla permite demostrar que la validación no se ha reducido a “se ha probado y funciona”. Se identifican evidencias concretas, su alcance y su límite. Esa precisión es importante en un documento académico porque refleja criterio técnico y no solo optimismo sobre el resultado.</p>
    <h3>5.3.2. Riesgos no cubiertos completamente</h3>
    <p>Ningún proyecto académico cubre todos los riesgos posibles, y conviene reconocerlo de forma explícita. En esta rama siguen existiendo áreas que merecerían más validación si la aplicación evolucionara a un entorno productivo: concurrencia en subida de ficheros, límites de almacenamiento, comportamiento ante audios corruptos, soporte real de rangos HTTP, endurecimiento de permisos por entidad y automatización end-to-end de la navegación por roles.</p>
    <p>Nombrar estos riesgos no debilita la memoria; al contrario, la hace más creíble. Un documento técnico sólido no solo enumera aciertos, sino que también marca el perímetro de lo ya resuelto y de lo todavía pendiente. Esa delimitación ayuda al tutor a evaluar el proyecto con criterios realistas.</p>

    <h2>5.4. Resultados por módulo</h2>
    <p>La Tabla 13 resume el estado de validación por módulo. Esta tabla sustituye a los listados extensos de funciones y código por una visión de calidad: qué se ha comprobado, qué resultado se espera y qué riesgo residual queda. De esta forma, la memoria mantiene un enfoque técnico sin convertirse en documentación automática.</p>
    ${table('Tabla 13. Resultados por módulo', ['Módulo', 'Validación realizada', 'Resultado', 'Riesgo residual'], [
      ['Autenticación', 'Login correcto, login incorrecto, persistencia de token y redirección por rol.', 'Flujo principal correcto.', 'Revisar expiración y renovación de token en sesiones largas.'],
      ['Administración', 'Acceso a panel, usuarios, autoridades y endpoints de gestión.', 'Acceso restringido a rol administrador.', 'Añadir auditoría visible de cambios administrativos.'],
      ['Catálogo musical', 'CRUD de canciones, artistas, álbumes y géneros con validaciones.', 'Operaciones disponibles para roles autorizados.', 'Refinar permisos backend por entidad si se separan editor y artista.'],
      ['Playlists', 'Creación de listas y relación ordenada con canciones.', 'Modelo preparado para ordenar contenido.', 'Implementar reglas estrictas de propiedad en todas las operaciones.'],
      ['Favoritos', 'Relación Like entre usuario y canción.', 'Persistencia simple y extensible.', 'Evitar duplicados con restricción única usuario-canción.'],
      ['Reproducciones', 'Registro de Play asociado a usuario y canción.', 'Base para historial y estadísticas.', 'Añadir lógica automática al iniciar reproducción real.'],
      ['Audio y reproducción', 'Construcción de la URL de stream, carga del fichero y actualización del estado del reproductor.', 'Integración funcional entre frontend y backend.', 'Añadir control de rangos, métricas y límites de almacenamiento.'],
      ['Internacionalización', 'Existencia de recursos en español e inglés.', 'Base bilingüe disponible.', 'Completar traducciones de textos personalizados nuevos.'],
    ])}
    <p>La validación también ha servido para identificar límites. En la rama analizada ya existe una primera solución de carga y streaming mediante <code>FileUploadResource</code> y la carpeta <code>uploads</code>, pero una plataforma final debería completar esa base con cuotas, análisis de ficheros, borrado seguro, soporte real de rangos parciales y almacenamiento externo si el volumen crece. Del mismo modo, la entidad Like permite favoritos, pero conviene reforzar las restricciones de unicidad para impedir duplicados por usuario y canción.</p>

    <h2>5.5. Criterios de aceptación final</h2>
    <p>Para considerar el prototipo apto como proyecto intermodular, se establecen criterios de aceptación ligados a los requisitos. Primero, la aplicación debe arrancar de forma reproducible con los comandos documentados. Segundo, un usuario debe poder autenticarse y acceder a vistas protegidas. Tercero, las entidades principales deben poder gestionarse desde API y desde interfaz. Cuarto, las relaciones entre entidades deben conservar integridad referencial. Quinto, la documentación debe permitir entender arquitectura, diseño, pruebas y despliegue sin leer directamente el código fuente.</p>
    <p>La versión de memoria generada cumple además criterios formales: portada, resumen, abstract, índices, numeración de figuras y tablas, bibliografía en formato APA 7, anexos y lenguaje impersonal. Esta revisión formal responde directamente a la observación recibida por correo, donde se indicaba que la entrega anterior parecía documentación generada automáticamente y carecía de explicaciones.</p>
  </section>

  <section class="chapter">
    <h1>6. Conclusiones y mejoras futuras</h1>
    <h2>6.1. Conclusiones</h2>
    <p>El proyecto demuestra que es posible construir una plataforma musical autogestionada usando una pila tecnológica moderna y ampliamente utilizada. La combinación de JHipster, Spring Boot y Angular ha permitido avanzar con rapidez sin renunciar a una estructura profesional: capas separadas, seguridad JWT, migraciones Liquibase, DTO, mappers y pruebas.</p>
    <p>Desde el punto de vista del aprendizaje, el proyecto ha exigido comprender cómo se conectan decisiones de dominio con decisiones de infraestructura. Una entidad aparentemente simple, como PlaylistSong, resuelve una necesidad real de negocio: mantener el orden de las canciones dentro de una playlist. De forma similar, la introducción de roles personalizados permite adaptar una base genérica de JHipster a un contexto musical con administración, edición y consumo.</p>
    <p>La principal limitación actual es que algunas funcionalidades propias de una plataforma comercial de streaming se encuentran implementadas en una primera versión técnica, pero no alcanzan todavía un nivel productivo completo. En particular, la gestión de archivos ya dispone de carga y streaming local en backend, aunque todavía requiere endurecimiento operativo y de seguridad para un entorno real con mayor volumen.</p>

    <h2>6.2. Mejoras futuras</h2>
    <ul>
      <li>Reforzar el servicio backend de subida de audio e imágenes con límites de tamaño, antivirus, trazabilidad y borrado seguro.</li>
      <li>Añadir streaming con soporte real de rangos HTTP y respuestas parciales para permitir saltos dentro del audio con mayor eficiencia.</li>
      <li>Desarrollar un servicio de búsqueda por título, artista, álbum y género con filtros combinados.</li>
      <li>Completar la experiencia social con seguimiento de artistas y perfiles extendidos si se decide activar esas entidades en JHipster.</li>
      <li>Incorporar pruebas end-to-end con Playwright o Cypress para automatizar flujos completos de navegador.</li>
      <li>Mejorar el panel de letras con caché local, timeout y sincronización temporal cuando exista información disponible.</li>
      <li>Preparar un despliegue Docker completo con variables de entorno, secretos externos y configuración TLS.</li>
      <li>Revisar accesibilidad: navegación por teclado, contraste, etiquetas ARIA y mensajes de validación.</li>
    </ul>
  </section>

  <section class="chapter">
    <h1>7. Bibliografía y recursos consultados</h1>
    <div class="ref-list">
      <p>Angular. (s. f.). <em>Angular documentation</em>. Recuperado el 12 de mayo de 2026, de https://angular.dev/</p>
      <p>Bootstrap. (s. f.). <em>Bootstrap documentation 5.3</em>. Recuperado el 12 de mayo de 2026, de https://getbootstrap.com/docs/5.3/</p>
      <p>JHipster. (s. f.). <em>JHipster documentation archive v9.0.0</em>. Recuperado el 12 de mayo de 2026, de https://www.jhipster.tech/documentation-archive/v9.0.0/</p>
      <p>Liquibase. (s. f.). <em>Liquibase documentation</em>. Recuperado el 12 de mayo de 2026, de https://docs.liquibase.com/</p>
      <p>MapStruct. (s. f.). <em>MapStruct reference guide</em>. Recuperado el 12 de mayo de 2026, de https://mapstruct.org/documentation/stable/reference/html/</p>
      <p>MySQL. (s. f.). <em>MySQL documentation</em>. Recuperado el 12 de mayo de 2026, de https://dev.mysql.com/doc/</p>
      <p>OWASP Foundation. (2021). <em>OWASP Top Ten</em>. https://owasp.org/www-project-top-ten/</p>
      <p>Spring. (s. f.). <em>Spring Boot reference documentation</em>. Recuperado el 12 de mayo de 2026, de https://docs.spring.io/spring-boot/</p>
      <p>Spring Security. (s. f.). <em>Spring Security reference</em>. Recuperado el 12 de mayo de 2026, de https://docs.spring.io/spring-security/reference/</p>
      <p>Spring Data. (s. f.). <em>Spring Data JPA reference documentation</em>. Recuperado el 12 de mayo de 2026, de https://docs.spring.io/spring-data/jpa/reference/</p>
    </div>
  </section>

  <section class="chapter">
    <h1>8. Anexos</h1>
    <h2>8.1. Anexo A: Manual de instalación</h2>
    <h3>8.1.1. Requisitos previos</h3>
    <p>Para ejecutar el proyecto se requiere JDK 21, Node.js compatible con el proyecto, Maven o el wrapper incluido, Git y una base de datos MySQL si se usa la configuración local actual. El repositorio incluye wrappers <code>mvnw</code> y <code>npmw</code>, por lo que no es imprescindible instalar Maven o npm globalmente si se trabaja con esos wrappers.</p>
    <h3>8.1.2. Puesta en marcha en desarrollo</h3>
    <pre>git clone &lt;url-del-repositorio&gt;
cd music-player
./npmw install
docker compose -f src/main/docker/mysql.yml up --wait
./mvnw -Dskip.installnodenpm -Dskip.npm
./npmw run start</pre>
    <p>Con esta configuración, el backend queda disponible en <code>http://localhost:8080</code> y el frontend Angular en <code>http://localhost:4200</code>. La configuración de desarrollo del repositorio apunta a MySQL en <code>localhost:3307/musicplayer</code>. Los ficheros subidos quedan, por defecto, en la carpeta <code>uploads</code> definida por la propiedad <code>app.upload.dir</code>.</p>
    <h3>8.1.3. Construcción de producción</h3>
    <pre>./mvnw -Pprod clean verify
java -jar target/*.jar</pre>
    <p>El perfil de producción usa MySQL en <code>localhost:3306/musicplayer</code> según la configuración actual. En un despliegue real se recomienda externalizar credenciales y secretos mediante variables de entorno o un gestor de secretos.</p>

    <h2>8.2. Anexo B: Manual de usuario</h2>
    <h3>8.2.1. Inicio de sesión</h3>
    <p>El usuario accede a la pantalla de login, introduce sus credenciales y pulsa el botón de inicio de sesión. Si los datos son correctos, el sistema obtiene el perfil y lo redirige al panel que corresponde a su rol. Si son incorrectos, permanece en la pantalla de login y muestra un mensaje de error.</p>
    <h3>8.2.2. Gestión de catálogo</h3>
    <p>Los usuarios con rol autorizado pueden crear canciones, álbumes, artistas y géneros desde las rutas de entidad. Cada formulario solicita los campos obligatorios y muestra mensajes de validación cuando falta información requerida. Tras guardar, el usuario regresa al listado y puede consultar el detalle.</p>
    <h3>8.2.3. Playlists, favoritos y reproducciones</h3>
    <p>El usuario final puede navegar al catálogo, consultar canciones, crear playlists y asociar canciones a listas mediante la entidad PlaylistSong. También puede registrar favoritos y consultar el historial de reproducciones si dispone de datos asociados.</p>
    <h3>8.2.4. Reproducción y letras almacenadas</h3>
    <p>Desde la barra de reproducción el usuario puede iniciar, pausar, avanzar o retroceder dentro de la cola actual. El cliente solicita el audio al endpoint <code>/api/upload/stream/{filename}</code> cuando la canción se ha registrado con un nombre de fichero local. Si la canción dispone de letra almacenada en el campo <code>lyrics</code>, esta puede consultarse desde las vistas de detalle o edición sin depender de servicios externos.</p>

    <h2>8.3. Anexo C: Recursos REST principales</h2>
    <p>La Tabla 8 resume los recursos REST de negocio. No se incluyen todos los métodos ni cuerpos JSON para evitar convertir la memoria en una referencia automática de endpoints; el objetivo es ubicar el contrato principal de la API.</p>
    ${table('Tabla 8. Recursos REST principales', ['Recurso', 'Ruta base', 'Responsabilidad'], [
      ['AuthenticateController', '<code>/api/authenticate</code>', 'Autenticación y emisión de JWT.'],
      ['AccountResource', '<code>/api/account</code>', 'Cuenta actual, registro, activación y contraseña.'],
      ['UserResource', '<code>/api/admin/users</code>', 'Administración de usuarios.'],
      ['AuthorityResource', '<code>/api/authorities</code>', 'Gestión de autoridades del sistema.'],
      ['SongResource', '<code>/api/songs</code>', 'CRUD de canciones y relaciones con álbum, género y artistas.'],
      ['AlbumResource', '<code>/api/albums</code>', 'CRUD de álbumes y tipo de publicación.'],
      ['ArtistResource', '<code>/api/artists</code>', 'CRUD de artistas y verificación.'],
      ['GenreResource', '<code>/api/genres</code>', 'CRUD de géneros musicales.'],
      ['PlaylistResource', '<code>/api/playlists</code>', 'CRUD de playlists de usuario.'],
      ['PlaylistSongResource', '<code>/api/playlist-songs</code>', 'Asociación ordenada entre playlists y canciones.'],
      ['PlayResource', '<code>/api/plays</code>', 'Historial de reproducciones.'],
      ['LikeResource', '<code>/api/likes</code>', 'Favoritos de canciones por usuario.'],
    ])}

    <h2>8.4. Anexo D: Glosario</h2>
    <p><strong>Autoridad:</strong> permiso asociado a un usuario en Spring Security, por ejemplo <code>ROLE_ADMIN</code>.</p>
    <p><strong>Changelog:</strong> archivo Liquibase que describe un cambio versionado de base de datos.</p>
    <p><strong>DTO:</strong> objeto de transferencia que desacopla la API de las entidades persistentes.</p>
    <p><strong>Entidad:</strong> clase de dominio persistida en base de datos mediante JPA.</p>
    <p><strong>Guard:</strong> mecanismo Angular que decide si una ruta puede activarse según autenticación y roles.</p>
    <p><strong>Mapper:</strong> componente MapStruct que transforma entidades en DTO y viceversa.</p>
    <p><strong>SPA:</strong> aplicación de una sola página que cambia de vistas en el navegador sin recargar toda la página.</p>

    <h2>8.5. Anexo E: Matriz de trazabilidad</h2>
    <p>La trazabilidad relaciona requisitos, diseño, implementación y pruebas. Su utilidad es demostrar que las secciones de la memoria no son independientes, sino partes conectadas de una misma solución. La Tabla 14 recoge una matriz resumida.</p>
    ${table('Tabla 14. Matriz de trazabilidad', ['Requisito', 'Elemento de diseño', 'Implementación', 'Prueba asociada'], [
      ['RF-01 Autenticación JWT', 'Actividad de inicio de sesión y arquitectura cliente-servidor.', '<code>AuthenticateController</code>, Spring Security y servicio de login Angular.', 'AUTH-01, AUTH-02, AUTH-03.'],
      ['RF-03 Gestión de canciones', 'Entidad Song, relaciones con Album, Genre y Artist.', '<code>SongResource</code>, <code>SongService</code>, rutas <code>/songs</code>.', 'CAT-01, CAT-02, CAT-03.'],
      ['RF-04 Gestión de álbumes', 'Entidad Album y enumeración AlbumType.', '<code>AlbumResource</code>, formulario Angular de álbum.', 'Pruebas CRUD de entidad y revisión manual.'],
      ['RF-07 Playlists', 'Entidades Playlist y PlaylistSong.', '<code>PlaylistResource</code> y <code>PlaylistSongResource</code>.', 'PL-01.'],
      ['RF-09 Favoritos', 'Entidad Like vinculada a User y Song.', '<code>LikeResource</code> y vistas de favoritos.', 'LIKE-01.'],
      ['RF-10 Dashboards por rol', 'Casos de uso de administrador, editor/artista y usuario.', 'Rutas <code>/dashboard-admin</code>, <code>/dashboard-editor</code>, <code>/dashboard-user</code>.', 'Validación manual de navegación por rol.'],
      ['RF-12 Reproducción y letras almacenadas', 'Reproductor persistente, entidad Song y flujo de streaming.', '<code>player.service.ts</code>, <code>FileUploadResource</code> y campo <code>lyrics</code>.', 'Validación manual de reproducción y consulta de detalle.'],
      ['RNF-04 Migraciones', 'Modelo relacional versionado.', 'Changelogs Liquibase.', 'Arranque de backend y pruebas de integración.'],
    ])}

    <h2>8.6. Anexo F: Checklist de calidad de la memoria</h2>
    <p>La Tabla 15 recoge una revisión final frente a las recomendaciones del tutor. Se incluye como evidencia de que la memoria se ha reestructurado para cumplir una guía académica, no para acumular capturas o fragmentos de código.</p>
    ${table('Tabla 15. Checklist de calidad documental', ['Criterio solicitado', 'Estado en esta memoria', 'Observación'], [
      ['Portada con título, autor, tutor y fecha', 'Incluido', 'Portada sin numeración visible.'],
      ['Resumen y abstract', 'Incluido', 'Resumen en español y abstract en inglés con palabras clave.'],
      ['Índice general, figuras y tablas', 'Incluido', 'Secciones numeradas a dos y tres niveles.'],
      ['Introducción y objetivos', 'Incluido', 'Capítulo 1.'],
      ['Análisis, requisitos y casos de uso', 'Incluido', 'Capítulo 2 con tablas explicativas.'],
      ['Diseño con ER, clases y actividad explicados', 'Incluido', 'Capítulo 3 con figuras referenciadas antes de aparecer.'],
      ['Desarrollo, tecnologías, arquitectura y capturas', 'Incluido', 'Capítulo 4 con figuras de interfaz y explicación.'],
      ['Pruebas y validación', 'Incluido', 'Capítulo 5 con estrategia, casos y resultados.'],
      ['Conclusiones y mejoras futuras', 'Incluido', 'Capítulo 6.'],
      ['Bibliografía APA 7', 'Incluido', 'Referencias ordenadas alfabéticamente por entidad autora.'],
      ['Anexos', 'Incluido', 'Instalación, usuario, REST, glosario, trazabilidad y checklist.'],
      ['Evitar código pegado sin sentido', 'Cumplido', 'Solo se incluyen comandos mínimos de instalación.'],
    ])}

    <h2>8.7. Anexo G: Diccionario de datos</h2>
    <p>El diccionario de datos complementa el modelo entidad-relación. Mientras el diagrama permite comprender relaciones, el diccionario ayuda a interpretar el significado de los campos principales y las restricciones que afectan al comportamiento de la aplicación. La Tabla 16 resume los atributos más relevantes.</p>
    ${table('Tabla 16. Diccionario de datos', ['Entidad', 'Campo', 'Tipo', 'Restricción / significado'], [
      ['Genre', 'id', 'Long', 'Clave primaria generada por la base de datos.'],
      ['Genre', 'name', 'String', 'Nombre único del género; obligatorio y limitado a 50 caracteres.'],
      ['Artist', 'id', 'Long', 'Clave primaria del artista.'],
      ['Artist', 'name', 'String', 'Nombre artístico; obligatorio y limitado a 100 caracteres.'],
      ['Artist', 'bio', 'TextBlob', 'Biografía o descripción extendida.'],
      ['Artist', 'image', 'String', 'URL o ruta de imagen representativa.'],
      ['Artist', 'country', 'String', 'Código de país de dos caracteres.'],
      ['Artist', 'verified', 'Boolean', 'Indica si el artista ha sido verificado por la plataforma.'],
      ['Album', 'title', 'String', 'Título del álbum; obligatorio y limitado a 150 caracteres.'],
      ['Album', 'coverImage', 'String', 'Imagen de portada enlazada por URL o ruta.'],
      ['Album', 'releaseDate', 'LocalDate', 'Fecha de publicación.'],
      ['Album', 'albumType', 'Enum', 'Clasificación: ALBUM, SINGLE, EP o PODCAST_SERIES.'],
      ['Song', 'title', 'String', 'Título de la canción; obligatorio y limitado a 150 caracteres.'],
      ['Song', 'duration', 'Integer', 'Duración en segundos.'],
      ['Song', 'fileUrl', 'String', 'Referencia al archivo de audio; obligatoria en el modelo actual.'],
      ['Song', 'coverImage', 'String', 'Imagen asociada a la canción.'],
      ['Song', 'lyrics', 'TextBlob', 'Letra almacenada si se dispone de ella.'],
      ['Song', 'releaseDate', 'LocalDate', 'Fecha de lanzamiento de la canción.'],
      ['Playlist', 'name', 'String', 'Nombre de la lista; obligatorio y limitado a 100 caracteres.'],
      ['Playlist', 'description', 'TextBlob', 'Descripción opcional de la playlist.'],
      ['Playlist', 'isPublic', 'Boolean', 'Determina si la lista es visible para otros usuarios.'],
      ['Playlist', 'coverImage', 'String', 'Imagen de portada de la playlist.'],
      ['PlaylistSong', 'position', 'Integer', 'Orden de la canción dentro de la playlist.'],
      ['PlaylistSong', 'addedAt', 'Instant', 'Fecha y hora de incorporación de la canción.'],
      ['Play', 'playedAt', 'Instant', 'Momento en que se registró la reproducción.'],
      ['Play', 'durationListened', 'Integer', 'Segundos escuchados en la reproducción.'],
      ['Like', 'createdAt', 'Instant', 'Fecha y hora en que se marcó la canción como favorita.'],
    ])}
    <p>El diccionario permite detectar mejoras de integridad. Por ejemplo, en una versión posterior convendría añadir restricciones únicas compuestas en favoritos y playlists para impedir duplicidades no deseadas. También sería recomendable normalizar el almacenamiento de archivos para que <code>fileUrl</code> apunte a recursos controlados por el sistema y no a valores introducidos manualmente.</p>

    <h2>8.8. Anexo H: Guía de mantenimiento</h2>
    <p>El mantenimiento del proyecto debe realizarse con cuidado porque JHipster combina código generado y código personalizado. La recomendación general es no modificar una entidad o relación únicamente desde la base de datos; cualquier cambio estructural debe reflejarse en el JDL, en los DTO, en los mappers, en las migraciones y en las pruebas afectadas.</p>
    ${table('Tabla 17. Operaciones de mantenimiento', ['Operación', 'Procedimiento recomendado', 'Comprobación posterior'], [
      ['Añadir un campo a una entidad', 'Actualizar JDL o entidad, generar/crear changelog Liquibase, ajustar DTO, mapper y formulario Angular.', 'Compilar backend, revisar formulario y ejecutar pruebas de entidad.'],
      ['Cambiar una relación', 'Analizar cardinalidad, impacto en datos existentes y consultas; crear migración reversible si es posible.', 'Validar integridad referencial y listados paginados.'],
      ['Añadir un rol', 'Registrar autoridad en datos iniciales o changelog, actualizar constantes backend/frontend y proteger rutas.', 'Probar login y navegación con usuario que tenga el nuevo rol.'],
      ['Modificar textos de interfaz', 'Actualizar archivos i18n en español e inglés.', 'Cambiar idioma en la aplicación y revisar que no falten claves.'],
      ['Actualizar dependencias frontend', 'Revisar changelog de Angular/librerías, ejecutar instalación controlada y pruebas.', 'Ejecutar build y specs afectadas.'],
      ['Actualizar Spring/JHipster', 'Crear rama separada, revisar breaking changes y aplicar migraciones gradualmente.', 'Compilar, ejecutar pruebas backend y verificar seguridad.'],
      ['Preparar despliegue productivo', 'Externalizar secretos, configurar MySQL, revisar CORS, activar TLS y definir backups.', 'Prueba de arranque, login, operaciones CRUD y restauración de backup.'],
    ])}
    <p>Una práctica útil consiste en mantener una rama estable para entregas y realizar cambios experimentales en ramas separadas. Las migraciones de base de datos deben ser pequeñas y descriptivas. Si se añade una funcionalidad importante, la memoria técnica o la documentación de proyecto debe actualizarse en la misma rama para evitar que vuelva a producirse una separación entre lo que el sistema hace y lo que la documentación afirma.</p>

    <h2 class="forced-page">8.9. Anexo I: Criterios de estilo académico aplicados</h2>
    <p>La revisión final de la memoria se ha realizado con el objetivo de corregir los problemas señalados en la respuesta del tutor. La versión anterior se apoyaba demasiado en contenido generado a partir del código y no explicaba suficientemente los diagramas ni las decisiones. En esta versión se ha priorizado la redacción formal, la relación entre requisitos y diseño, y la explicación previa de cada figura o tabla.</p>
    <p>También se ha evitado incluir bloques extensos de código fuente, consultas SQL o listados automáticos de endpoints. Cuando aparece un comando o una ruta, se utiliza porque ayuda a instalar, ejecutar o identificar un componente concreto. De esta forma, la memoria mantiene un equilibrio entre precisión técnica y claridad académica.</p>
    ${table('Tabla 18. Revisión de estilo académico', ['Aspecto revisado', 'Criterio aplicado', 'Resultado'], [
      ['Persona gramatical', 'Uso preferente de tercera persona y pasiva refleja.', 'Se evita una narración excesivamente personal.'],
      ['Párrafos', 'Extensión moderada y una idea principal por párrafo.', 'Mejora la legibilidad y evita bloques densos.'],
      ['Figuras', 'Referencia en el texto antes de aparecer y pie descriptivo debajo.', 'Cada diagrama queda contextualizado.'],
      ['Tablas', 'Título encima, numeración correlativa y contenido sintético.', 'Las tablas resumen información, no sustituyen la explicación.'],
      ['Código', 'Uso limitado a comandos necesarios en anexos.', 'Se elimina el efecto de documentación automática.'],
      ['Bibliografía', 'Formato APA 7, orden alfabético y fecha de recuperación en documentación viva.', 'Se cumple la pauta de citación solicitada.'],
      ['Anexos', 'Material complementario: instalación, usuario, REST, glosario, trazabilidad y mantenimiento.', 'El cuerpo principal conserva coherencia y los detalles quedan separados.'],
    ])}
    <p>Como resultado, el documento puede leerse de principio a fin como una memoria técnica: primero se presenta el problema, después se justifican requisitos y decisiones, luego se explica el diseño, se describe el desarrollo, se validan los resultados y finalmente se recogen conclusiones y anexos. Esta estructura responde de forma directa a la guía indicada por el tutor.</p>
  </section>
</body>
</html>`;

async function main() {
  await fs.writeFile(`${outBase}.html`, html, 'utf8');
  let docOut = `${outBase}.doc`;
  try {
    await fs.writeFile(docOut, html, 'utf8');
  } catch (error) {
    if (error && error.code === 'EBUSY') {
      docOut = `${outBase} actualizado.doc`;
      await fs.writeFile(docOut, html, 'utf8');
    } else {
      throw error;
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  await page.goto(`file:///${`${outBase}.html`.replaceAll('\\', '/')}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: `${outBase}.pdf`,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });
  await browser.close();

  const pdf = await fs.readFile(`${outBase}.pdf`);
  const pageCount = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`Generados:
- ${outBase}.html
- ${docOut}
- ${outBase}.pdf
Paginas PDF detectadas: ${pageCount}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
