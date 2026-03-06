[aseo-waldorf.html](https://github.com/user-attachments/files/25793464/aseo-waldorf.html)
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aseo del Aula · Calendario</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --verde: #2d5a27;
    --verde-claro: #4a7c42;
    --crema: #f5f0e8;
    --crema-oscuro: #ede5d4;
    --tierra: #8b6914;
    --tierra-claro: #c4a244;
    --rojo-suave: #c0392b;
    --gris: #6b7280;
    --blanco: #fefcf8;
    --sombra: 0 4px 24px rgba(45,90,39,0.10);
    --radio: 16px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--crema);
    color: #2c2c2c;
    min-height: 100vh;
  }

  /* ── FONDO ORGÁNICO ── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 10% 20%, rgba(74,124,66,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 90% 80%, rgba(196,162,68,0.07) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .contenedor {
    max-width: 680px;
    margin: 0 auto;
    padding: 0 16px 80px;
    position: relative;
    z-index: 1;
  }

  /* ── HEADER ── */
  header {
    text-align: center;
    padding: 48px 0 32px;
    position: relative;
  }

  .hoja-deco {
    font-size: 42px;
    display: block;
    margin-bottom: 8px;
    animation: balanceo 4s ease-in-out infinite;
  }

  @keyframes balanceo {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: var(--verde);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  header p {
    color: var(--gris);
    font-size: 0.9rem;
    font-weight: 300;
  }

  .badge-semana {
    display: inline-block;
    background: var(--verde);
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 4px 14px;
    border-radius: 99px;
    margin-top: 12px;
    letter-spacing: 0.05em;
  }

  /* ── TARJETA ESTA SEMANA ── */
  .esta-semana {
    background: var(--verde);
    border-radius: var(--radio);
    padding: 28px 24px;
    margin-bottom: 24px;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(45,90,39,0.25);
  }

  .esta-semana::before {
    content: '🌿';
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 48px;
    opacity: 0.2;
  }

  .esta-semana .etiqueta {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.7;
    margin-bottom: 8px;
  }

  .esta-semana .fecha-grande {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    margin-bottom: 20px;
    font-style: italic;
  }

  .familias-turno {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .familia-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 12px 16px;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
  }

  .familia-chip:hover { background: rgba(255,255,255,0.22); }

  .familia-chip .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .familia-chip .nombre { font-weight: 500; font-size: 1rem; }
  .familia-chip .es-tuya {
    margin-left: auto;
    font-size: 0.72rem;
    background: rgba(255,255,255,0.3);
    padding: 3px 10px;
    border-radius: 99px;
  }

  /* ── SELECTOR DE FAMILIA ── */
  .selector-bloque {
    background: var(--blanco);
    border-radius: var(--radio);
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--sombra);
    border: 1px solid var(--crema-oscuro);
  }

  .selector-bloque label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--verde);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    display: block;
    margin-bottom: 10px;
  }

  .selector-bloque select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid var(--crema-oscuro);
    background: var(--crema);
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    color: #2c2c2c;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%232d5a27' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    cursor: pointer;
  }

  /* ── TABS ── */
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .tab {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: var(--blanco);
    color: var(--gris);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: var(--sombra);
    border: 1.5px solid transparent;
  }

  .tab.activo {
    background: var(--verde);
    color: white;
    border-color: var(--verde);
  }

  .tab:not(.activo):hover {
    border-color: var(--verde-claro);
    color: var(--verde);
  }

  /* ── PANEL CALENDARIO ── */
  .panel { display: none; }
  .panel.activo { display: block; }

  .semana-card {
    background: var(--blanco);
    border-radius: var(--radio);
    padding: 18px 20px;
    margin-bottom: 12px;
    box-shadow: var(--sombra);
    border: 1.5px solid var(--crema-oscuro);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: default;
  }

  .semana-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(45,90,39,0.13); }

  .semana-card.es-actual {
    border-color: var(--verde);
    background: linear-gradient(135deg, #f0f7ee 0%, var(--blanco) 100%);
  }

  .semana-card.es-tuya {
    border-color: var(--tierra-claro);
    background: linear-gradient(135deg, #fdf8ee 0%, var(--blanco) 100%);
  }

  .semana-fecha {
    flex-shrink: 0;
    width: 56px;
    text-align: center;
    background: var(--crema-oscuro);
    border-radius: 10px;
    padding: 8px 4px;
  }

  .semana-fecha .dia { font-size: 1.4rem; font-weight: 600; color: var(--verde); line-height: 1; }
  .semana-fecha .mes { font-size: 0.7rem; color: var(--gris); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

  .semana-info { flex: 1; }
  .semana-info .familias-lista {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .pill {
    font-size: 0.8rem;
    padding: 4px 12px;
    border-radius: 99px;
    background: var(--crema-oscuro);
    color: #444;
    font-weight: 500;
  }

  .pill.destacada { background: var(--verde); color: white; }
  .pill.vacia { background: #f5f5f5; color: #bbb; font-style: italic; }

  .badge-actual {
    font-size: 0.7rem;
    background: var(--verde);
    color: white;
    padding: 2px 8px;
    border-radius: 99px;
    margin-bottom: 4px;
    display: inline-block;
  }

  .badge-tuya {
    font-size: 0.7rem;
    background: var(--tierra);
    color: white;
    padding: 2px 8px;
    border-radius: 99px;
    margin-bottom: 4px;
    display: inline-block;
  }

  /* ── FORMULARIO INTERCAMBIO ── */
  .form-intercambio {
    background: var(--blanco);
    border-radius: var(--radio);
    padding: 24px;
    box-shadow: var(--sombra);
    border: 1.5px solid var(--crema-oscuro);
  }

  .form-intercambio h3 {
    font-family: 'Playfair Display', serif;
    color: var(--verde);
    font-size: 1.2rem;
    margin-bottom: 6px;
  }

  .form-intercambio p {
    font-size: 0.85rem;
    color: var(--gris);
    margin-bottom: 20px;
  }

  .campo {
    margin-bottom: 16px;
  }

  .campo label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--verde);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    display: block;
    margin-bottom: 6px;
  }

  .campo select, .campo input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid var(--crema-oscuro);
    background: var(--crema);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: #2c2c2c;
    transition: border-color 0.2s;
  }

  .campo select:focus, .campo input:focus {
    outline: none;
    border-color: var(--verde-claro);
  }

  .campo textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid var(--crema-oscuro);
    background: var(--crema);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: #2c2c2c;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.2s;
  }

  .campo textarea:focus { outline: none; border-color: var(--verde-claro); }

  .divisor {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: var(--gris);
    font-size: 0.8rem;
  }
  .divisor::before, .divisor::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--crema-oscuro);
  }

  .btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primario {
    background: var(--verde);
    color: white;
  }
  .btn-primario:hover { background: var(--verde-claro); transform: translateY(-1px); }
  .btn-primario:active { transform: translateY(0); }
  .btn-primario:disabled { background: #ccc; cursor: not-allowed; transform: none; }

  /* ── INTERCAMBIOS PENDIENTES ── */
  .intercambio-card {
    background: var(--blanco);
    border-radius: var(--radio);
    padding: 18px 20px;
    margin-bottom: 12px;
    box-shadow: var(--sombra);
    border: 1.5px solid #fde8a0;
    background: linear-gradient(135deg, #fffdf0 0%, var(--blanco) 100%);
  }

  .intercambio-card .meta {
    font-size: 0.78rem;
    color: var(--gris);
    margin-bottom: 6px;
  }

  .intercambio-card .descripcion {
    font-size: 0.95rem;
    color: #2c2c2c;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  .intercambio-card .descripcion strong { color: var(--verde); }

  .acciones-intercambio {
    display: flex;
    gap: 8px;
  }

  .btn-confirmar {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: var(--verde);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-confirmar:hover { background: var(--verde-claro); }

  .btn-rechazar {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1.5px solid #e0d0d0;
    background: transparent;
    color: var(--rojo-suave);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-rechazar:hover { background: #fff5f5; }

  /* ── ESTADÍSTICAS ── */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: var(--blanco);
    border-radius: var(--radio);
    padding: 18px;
    box-shadow: var(--sombra);
    border: 1.5px solid var(--crema-oscuro);
    text-align: center;
  }

  .stat-card .numero {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: var(--verde);
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-card .etiqueta {
    font-size: 0.78rem;
    color: var(--gris);
    font-weight: 300;
  }

  .ranking-item {
    background: var(--blanco);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 8px;
    box-shadow: var(--sombra);
    border: 1.5px solid var(--crema-oscuro);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ranking-pos {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--crema-oscuro);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--gris);
    flex-shrink: 0;
  }

  .ranking-nombre { flex: 1; font-weight: 500; }

  .barra-progreso {
    flex: 2;
    height: 8px;
    background: var(--crema-oscuro);
    border-radius: 99px;
    overflow: hidden;
  }

  .barra-fill {
    height: 100%;
    border-radius: 99px;
    background: var(--verde);
    transition: width 0.6s ease;
  }

  .barra-fill.excedida { background: var(--tierra-claro); }
  .barra-fill.exacta { background: var(--verde); }
  .barra-fill.faltante { background: #e8b4b4; }

  .ranking-num {
    font-size: 0.82rem;
    color: var(--gris);
    min-width: 50px;
    text-align: right;
  }

  /* ── CONFIGURACIÓN ── */
  .config-bloque {
    background: var(--blanco);
    border-radius: var(--radio);
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: var(--sombra);
    border: 1.5px solid var(--crema-oscuro);
  }

  .config-bloque h4 {
    font-family: 'Playfair Display', serif;
    color: var(--verde);
    margin-bottom: 14px;
    font-size: 1.1rem;
  }

  .config-campo {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .config-campo label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--gris);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .config-campo input {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1.5px solid var(--crema-oscuro);
    background: var(--crema);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
  }

  .config-campo input:focus { outline: none; border-color: var(--verde-claro); }

  .btn-guardar-config {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: var(--tierra);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 4px;
  }
  .btn-guardar-config:hover { background: var(--tierra-claro); }

  /* ── MENSAJES ── */
  .mensaje {
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    display: none;
  }
  .mensaje.exito { background: #e8f5e3; color: #2d5a27; border: 1px solid #b7d9ae; display: block; }
  .mensaje.error { background: #fde8e8; color: var(--rojo-suave); border: 1px solid #f5b8b8; display: block; }
  .mensaje.info { background: #e8f0fe; color: #1a56b0; border: 1px solid #b8d0f8; display: block; }

  /* ── LOADING ── */
  .loading {
    text-align: center;
    padding: 40px;
    color: var(--gris);
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--crema-oscuro);
    border-top-color: var(--verde);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── ESTADO VACÍO ── */
  .vacio {
    text-align: center;
    padding: 40px 20px;
    color: var(--gris);
  }
  .vacio .icono { font-size: 40px; margin-bottom: 12px; }
  .vacio p { font-size: 0.9rem; }

  /* ── INSTRUCCIONES CONFIG ── */
  .instrucciones {
    background: #fffbf0;
    border: 1.5px solid #fde8a0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #5a4500;
  }
  .instrucciones strong { color: var(--tierra); }
  .instrucciones code {
    background: #fde8a0;
    padding: 1px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
  }

  /* ── FOOTER ── */
  footer {
    text-align: center;
    padding: 20px;
    color: var(--gris);
    font-size: 0.8rem;
    font-weight: 300;
  }
</style>
</head>
<body>

<div class="contenedor">

  <header>
    <span class="hoja-deco">🌿</span>
    <h1>Aseo del Aula</h1>
    <p>Calendario de familias colaboradoras</p>
    <span class="badge-semana" id="badge-semana">Cargando...</span>
  </header>

  <!-- SELECTOR FAMILIA -->
  <div class="selector-bloque">
    <label>¿De qué familia sos?</label>
    <select id="mi-familia" onchange="guardarMiFamilia()">
      <option value="">— Seleccioná tu familia —</option>
    </select>
  </div>

  <!-- ESTA SEMANA -->
  <div class="esta-semana" id="card-esta-semana">
    <div class="etiqueta">Esta semana · Viernes</div>
    <div class="fecha-grande" id="fecha-esta-semana">Cargando...</div>
    <div class="familias-turno" id="familias-esta-semana">
      <div style="opacity:0.6;font-size:0.9rem">Conectando con el calendario...</div>
    </div>
  </div>

  <!-- MENSAJE GLOBAL -->
  <div class="mensaje" id="mensaje-global"></div>

  <!-- TABS -->
  <div class="tabs">
    <button class="tab activo" onclick="cambiarTab('calendario', this)">📅 Calendario</button>
    <button class="tab" onclick="cambiarTab('intercambios', this)">🔄 Intercambios</button>
    <button class="tab" onclick="cambiarTab('estadisticas', this)">📊 Estadísticas</button>
    <button class="tab" onclick="cambiarTab('config', this)">⚙️</button>
  </div>

  <!-- PANEL: CALENDARIO -->
  <div class="panel activo" id="panel-calendario">
    <div id="lista-calendario">
      <div class="loading"><div class="spinner"></div>Cargando calendario...</div>
    </div>
  </div>

  <!-- PANEL: INTERCAMBIOS -->
  <div class="panel" id="panel-intercambios">

    <div class="form-intercambio" style="margin-bottom:20px">
      <h3>Pedir un intercambio</h3>
      <p>Si no podés ir en tu fecha, pedí un cambio con otra familia.</p>

      <div class="campo">
        <label>Mi familia</label>
        <select id="int-familia-a">
          <option value="">— Seleccioná —</option>
        </select>
      </div>

      <div class="campo">
        <label>La fecha en que no puedo ir</label>
        <select id="int-fecha-a">
          <option value="">— Primero seleccioná tu familia —</option>
        </select>
      </div>

      <div class="divisor">intercambiar con</div>

      <div class="campo">
        <label>Familia con quien quiero cambiar</label>
        <select id="int-familia-b">
          <option value="">— Seleccioná —</option>
        </select>
      </div>

      <div class="campo">
        <label>La fecha en que va esa familia (y yo iré)</label>
        <select id="int-fecha-b">
          <option value="">— Primero seleccioná la otra familia —</option>
        </select>
      </div>

      <div class="campo">
        <label>Nota (opcional)</label>
        <textarea id="int-nota" placeholder="Ej: Tenemos viaje familiar ese fin de semana"></textarea>
      </div>

      <button class="btn btn-primario" onclick="pedirIntercambio()">Solicitar intercambio</button>
    </div>

    <h3 style="font-family:'Playfair Display',serif; color:var(--verde); margin-bottom:12px; font-size:1.1rem;">
      Solicitudes pendientes
    </h3>
    <div id="lista-intercambios">
      <div class="loading"><div class="spinner"></div>Cargando...</div>
    </div>
  </div>

  <!-- PANEL: ESTADÍSTICAS -->
  <div class="panel" id="panel-estadisticas">
    <div class="stats-grid" id="stats-resumen">
      <div class="stat-card">
        <div class="numero" id="stat-semanas">–</div>
        <div class="etiqueta">Semanas totales</div>
      </div>
      <div class="stat-card">
        <div class="numero" id="stat-familias">–</div>
        <div class="etiqueta">Familias</div>
      </div>
    </div>
    <div id="lista-ranking">
      <div class="loading"><div class="spinner"></div>Cargando...</div>
    </div>
  </div>

  <!-- PANEL: CONFIGURACIÓN -->
  <div class="panel" id="panel-config">
    <div class="instrucciones">
      <strong>📋 Cómo conectar con Google Sheets:</strong><br><br>
      1. Abrí tu Google Sheets<br>
      2. Menú <strong>Extensiones → Apps Script</strong><br>
      3. Pegá el código del archivo <code>apps-script-api.gs</code><br>
      4. Hacé clic en <strong>Implementar → Nueva implementación</strong><br>
      5. Tipo: <strong>App web</strong>, acceso: <strong>Cualquier persona</strong><br>
      6. Copiá la URL que te da y pegala abajo<br>
    </div>

    <div class="config-bloque">
      <h4>Conexión con Google Sheets</h4>
      <div class="config-campo">
        <label>URL de tu Apps Script (API)</label>
        <input type="url" id="config-url" placeholder="https://script.google.com/macros/s/..." />
      </div>
      <button class="btn-guardar-config" onclick="guardarConfig()">Guardar y conectar</button>
    </div>

    <div class="config-bloque">
      <h4>Sobre esta app</h4>
      <p style="font-size:0.85rem; color:var(--gris); line-height:1.6;">
        Esta app se conecta directamente con tu planilla de Google Sheets. Los datos viven ahí, no en esta página. Podés seguir usando la planilla para la administración avanzada (generar calendario, reasignar ausencias) y esta app es la cara visible para todas las familias.
      </p>
    </div>
  </div>

</div>

<footer>🌿 Escuela Waldorf · Aseo colaborativo</footer>

<script>
// ════════════════════════════════════════════════
// ESTADO GLOBAL
// ════════════════════════════════════════════════
const estado = {
  apiUrl: localStorage.getItem('waldorf_api_url') || '',
  miFamilia: localStorage.getItem('waldorf_mi_familia') || '',
  calendario: [],
  familias: [],
  intercambios: [],
  cargado: false
};

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async () => {
  cargarConfigGuardada();
  if (estado.apiUrl) {
    await cargarTodo();
  } else {
    mostrarEstadoSinConfig();
  }
});

function cargarConfigGuardada() {
  const urlInput = document.getElementById('config-url');
  if (urlInput && estado.apiUrl) urlInput.value = estado.apiUrl;
}

function mostrarEstadoSinConfig() {
  document.getElementById('badge-semana').textContent = 'Sin configurar';
  document.getElementById('fecha-esta-semana').textContent = 'Configuración pendiente';
  document.getElementById('familias-esta-semana').innerHTML =
    '<div style="opacity:0.7;font-size:0.88rem">⚙️ Andá a Configuración e ingresá la URL de tu Apps Script</div>';
  document.getElementById('lista-calendario').innerHTML =
    '<div class="vacio"><div class="icono">⚙️</div><p>Configurá la conexión con Google Sheets en la pestaña ⚙️</p></div>';
  document.getElementById('lista-intercambios').innerHTML = '';
  document.getElementById('lista-ranking').innerHTML = '';
}

// ════════════════════════════════════════════════
// COMUNICACIÓN CON APPS SCRIPT
// ════════════════════════════════════════════════
async function llamarAPI(accion, datos = {}) {
  if (!estado.apiUrl) throw new Error('Sin URL de API configurada');
  const url = `${estado.apiUrl}?accion=${accion}&datos=${encodeURIComponent(JSON.stringify(datos))}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
  const json = await resp.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

async function cargarTodo() {
  try {
    const data = await llamarAPI('obtenerTodo');
    estado.calendario = data.calendario || [];
    estado.familias = data.familias || [];
    estado.intercambios = data.intercambios || [];
    estado.cargado = true;
    renderizarTodo();
  } catch (e) {
    mostrarMensaje('No se pudo conectar con Google Sheets. Verificá la URL en Configuración.', 'error');
    mostrarEstadoSinConfig();
  }
}

// ════════════════════════════════════════════════
// RENDERIZADO
// ════════════════════════════════════════════════
function renderizarTodo() {
  popularSelectores();
  renderizarEstaSemana();
  renderizarCalendario();
  renderizarIntercambios();
  renderizarEstadisticas();
}

function popularSelectores() {
  const fams = estado.familias;
  const opciones = fams.map(f => `<option value="${f}">${f}</option>`).join('');

  ['mi-familia', 'int-familia-a', 'int-familia-b'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = `<option value="">— Seleccioná —</option>${opciones}`;
    if (val) sel.value = val;
  });

  if (estado.miFamilia) {
    document.getElementById('mi-familia').value = estado.miFamilia;
    document.getElementById('int-familia-a').value = estado.miFamilia;
    actualizarFechasIntercambio('a');
  }
}

function renderizarEstaSemana() {
  const hoy = new Date();
  // Buscar el próximo viernes o el viernes de esta semana
  let semanaActual = null;
  let semanaProxima = null;

  estado.calendario.forEach(sem => {
    const fecha = parsearFecha(sem.fecha);
    if (!fecha) return;
    const diff = (fecha - hoy) / (1000 * 60 * 60 * 24);
    if (diff >= -6 && diff <= 0 && !semanaActual) semanaActual = sem;
    if (diff > 0 && !semanaProxima) semanaProxima = sem;
  });

  const semana = semanaActual || semanaProxima;
  if (!semana) {
    document.getElementById('fecha-esta-semana').textContent = 'Sin fechas próximas';
    document.getElementById('familias-esta-semana').innerHTML = '';
    document.getElementById('badge-semana').textContent = 'Sin datos';
    return;
  }

  document.getElementById('fecha-esta-semana').textContent = `Viernes ${semana.fecha}`;
  document.getElementById('badge-semana').textContent = semanaActual ? 'Esta semana' : 'Próxima semana';

  const miFam = estado.miFamilia;
  const html = semana.familias.map(f => {
    if (!f) return '';
    const inicial = f.charAt(0).toUpperCase();
    const esYo = miFam && f === miFam;
    return `
      <div class="familia-chip">
        <div class="avatar">${inicial}</div>
        <div class="nombre">${f}</div>
        ${esYo ? '<span class="es-tuya">¡Sos vos! 👋</span>' : ''}
      </div>
    `;
  }).join('');

  document.getElementById('familias-esta-semana').innerHTML = html || '<div style="opacity:0.6">Sin asignaciones</div>';
}

function renderizarCalendario() {
  const container = document.getElementById('lista-calendario');
  const hoy = new Date();
  const miFam = estado.miFamilia;

  if (!estado.calendario.length) {
    container.innerHTML = '<div class="vacio"><div class="icono">📅</div><p>No hay fechas en el calendario</p></div>';
    return;
  }

  // Mostrar próximas 20 semanas desde hoy
  const proximas = estado.calendario.filter(sem => {
    const f = parsearFecha(sem.fecha);
    return f && (f - hoy) > -7 * 24 * 60 * 60 * 1000;
  }).slice(0, 20);

  const html = proximas.map((sem, idx) => {
    const fecha = parsearFecha(sem.fecha);
    const diff = (fecha - hoy) / (1000 * 60 * 60 * 24);
    const esActual = diff >= -6 && diff <= 0;
    const esTuya = miFam && sem.familias.includes(miFam);

    const partes = sem.fecha.split('-');
    const dia = partes[0];
    const meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const mes = meses[parseInt(partes[1])] || partes[1];

    const pillsHTML = sem.familias.map(f => {
      if (!f) return `<span class="pill vacia">Libre</span>`;
      const dest = miFam && f === miFam ? ' destacada' : '';
      return `<span class="pill${dest}">${f}</span>`;
    }).join('');

    let badges = '';
    if (esActual) badges += '<span class="badge-actual">Esta semana</span> ';
    if (esTuya && !esActual) badges += '<span class="badge-tuya">Te toca 🌿</span> ';

    return `
      <div class="semana-card ${esActual ? 'es-actual' : ''} ${esTuya ? 'es-tuya' : ''}">
        <div class="semana-fecha">
          <div class="dia">${dia}</div>
          <div class="mes">${mes}</div>
        </div>
        <div class="semana-info">
          ${badges}
          <div class="familias-lista">${pillsHTML}</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html || '<div class="vacio"><div class="icono">✅</div><p>No hay semanas próximas</p></div>';
}

function renderizarIntercambios() {
  const container = document.getElementById('lista-intercambios');
  const miFam = estado.miFamilia;

  const pendientes = estado.intercambios.filter(i => i.estado === 'Pendiente');

  if (!pendientes.length) {
    container.innerHTML = '<div class="vacio"><div class="icono">✅</div><p>No hay intercambios pendientes</p></div>';
    return;
  }

  const html = pendientes.map((int, idx) => {
    const esParaMi = miFam && int.familiaB === miFam;
    return `
      <div class="intercambio-card">
        <div class="meta">Solicitud #${idx + 1} · ${int.observacion ? int.observacion.substring(0, 60) : ''}</div>
        <div class="descripcion">
          <strong>${int.familiaA}</strong> quiere cambiar el <strong>${int.fechaA}</strong>
          con <strong>${int.familiaB}</strong> (que va el <strong>${int.fechaB}</strong>)
        </div>
        ${esParaMi ? `
          <div class="acciones-intercambio">
            <button class="btn-confirmar" onclick="responderIntercambio(${idx}, true)">✅ Aceptar</button>
            <button class="btn-rechazar" onclick="responderIntercambio(${idx}, false)">✗ Rechazar</button>
          </div>
        ` : `<div style="font-size:0.8rem;color:var(--gris)">Esperando respuesta de ${int.familiaB}</div>`}
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function renderizarEstadisticas() {
  const cal = estado.calendario;
  const fams = estado.familias;

  document.getElementById('stat-semanas').textContent = cal.length;
  document.getElementById('stat-familias').textContent = fams.length;

  if (!fams.length) {
    document.getElementById('lista-ranking').innerHTML = '<div class="vacio"><div class="icono">📊</div><p>Sin datos</p></div>';
    return;
  }

  // Contar participaciones
  const conteo = {};
  fams.forEach(f => conteo[f] = 0);
  cal.forEach(sem => sem.familias.forEach(f => { if (f && conteo.hasOwnProperty(f)) conteo[f]++; }));

  const max = Math.max(...Object.values(conteo), 1);
  const objetivo = cal.length > 0 ? Math.round(cal.length * 3 / fams.length) : 0;

  const ordenadas = [...fams].sort((a, b) => conteo[b] - conteo[a]);

  const html = ordenadas.map((f, i) => {
    const real = conteo[f];
    const pct = Math.min((real / max) * 100, 100);
    const clase = real > objetivo ? 'excedida' : real === objetivo ? 'exacta' : 'faltante';
    return `
      <div class="ranking-item">
        <div class="ranking-pos">${i + 1}</div>
        <div class="ranking-nombre">${f}</div>
        <div class="barra-progreso">
          <div class="barra-fill ${clase}" style="width:${pct}%"></div>
        </div>
        <div class="ranking-num">${real}/${objetivo}</div>
      </div>
    `;
  }).join('');

  document.getElementById('lista-ranking').innerHTML = html;
}

// ════════════════════════════════════════════════
// ACCIONES
// ════════════════════════════════════════════════
function guardarMiFamilia() {
  const val = document.getElementById('mi-familia').value;
  estado.miFamilia = val;
  localStorage.setItem('waldorf_mi_familia', val);
  document.getElementById('int-familia-a').value = val;
  actualizarFechasIntercambio('a');
  renderizarEstaSemana();
  renderizarCalendario();
  renderizarIntercambios();
}

function actualizarFechasIntercambio(cual) {
  const familia = document.getElementById(`int-familia-${cual}`).value;
  const selectFecha = document.getElementById(`int-fecha-${cual}`);

  if (!familia) {
    selectFecha.innerHTML = '<option value="">— Primero seleccioná una familia —</option>';
    return;
  }

  const fechas = estado.calendario
    .filter(sem => sem.familias.includes(familia))
    .map(sem => sem.fecha);

  if (!fechas.length) {
    selectFecha.innerHTML = '<option value="">No tiene fechas asignadas</option>';
    return;
  }

  selectFecha.innerHTML = '<option value="">— Seleccioná una fecha —</option>' +
    fechas.map(f => `<option value="${f}">${f}</option>`).join('');
}

async function pedirIntercambio() {
  const famA = document.getElementById('int-familia-a').value;
  const fechaA = document.getElementById('int-fecha-a').value;
  const famB = document.getElementById('int-familia-b').value;
  const fechaB = document.getElementById('int-fecha-b').value;
  const nota = document.getElementById('int-nota').value;

  if (!famA || !fechaA || !famB || !fechaB) {
    mostrarMensaje('Completá todos los campos del intercambio', 'error');
    return;
  }
  if (famA === famB) {
    mostrarMensaje('No podés intercambiar con tu misma familia', 'error');
    return;
  }

  const btn = document.querySelector('#panel-intercambios .btn-primario');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    await llamarAPI('pedirIntercambio', { famA, fechaA, famB, fechaB, nota });
    mostrarMensaje(`✅ Solicitud enviada. Ahora ${famB} debe confirmar.`, 'exito');
    await cargarTodo();
    document.getElementById('int-nota').value = '';
  } catch (e) {
    mostrarMensaje(`Error: ${e.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Solicitar intercambio';
  }
}

async function responderIntercambio(idx, aceptar) {
  const pendientes = estado.intercambios.filter(i => i.estado === 'Pendiente');
  const intercambio = pendientes[idx];
  if (!intercambio) return;

  try {
    await llamarAPI('responderIntercambio', {
      fila: intercambio.fila,
      aceptar,
      famA: intercambio.familiaA,
      fechaA: intercambio.fechaA,
      famB: intercambio.familiaB,
      fechaB: intercambio.fechaB
    });
    mostrarMensaje(aceptar ? '✅ Intercambio confirmado y aplicado al calendario' : '❌ Intercambio rechazado', aceptar ? 'exito' : 'info');
    await cargarTodo();
  } catch (e) {
    mostrarMensaje(`Error: ${e.message}`, 'error');
  }
}

async function guardarConfig() {
  const url = document.getElementById('config-url').value.trim();
  if (!url) { mostrarMensaje('Ingresá la URL', 'error'); return; }
  estado.apiUrl = url;
  localStorage.setItem('waldorf_api_url', url);
  mostrarMensaje('Conectando...', 'info');
  await cargarTodo();
  if (estado.cargado) mostrarMensaje('✅ Conectado correctamente', 'exito');
}

// ════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════
function cambiarTab(nombre, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('activo'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
  document.getElementById(`panel-${nombre}`).classList.add('activo');
  btn.classList.add('activo');
}

function mostrarMensaje(texto, tipo) {
  const el = document.getElementById('mensaje-global');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  setTimeout(() => { el.className = 'mensaje'; }, 5000);
}

function parsearFecha(str) {
  if (!str) return null;
  const p = String(str).includes('/') ? str.split('/') : str.split('-');
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}

// Actualizar selectores de intercambio al cambiar familia
document.addEventListener('DOMContentLoaded', () => {
  const selA = document.getElementById('int-familia-a');
  const selB = document.getElementById('int-familia-b');
  if (selA) selA.addEventListener('change', () => actualizarFechasIntercambio('a'));
  if (selB) selB.addEventListener('change', () => actualizarFechasIntercambio('b'));
});
</script>
</body>
</html>
