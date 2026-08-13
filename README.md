# Emparejador de Ayuda — Terremoto Valle del Cauca

Plataforma web que conecta en tiempo real a personas que necesitan ayuda con
quienes pueden ofrecerla, tras el terremoto del 10 de agosto de 2026 en el
Valle del Cauca. Funciona como un mapa vivo de la emergencia, alimentado por
los propios afectados y voluntarios — un "Waze de la ayuda humanitaria"
donde la necesidad y la donación se encuentran en el mapa, en vez de
perderse en cadenas de WhatsApp o publicaciones dispersas en redes sociales.

## Qué hace

- **Registro de puntos en el mapa.** Cualquier persona puede marcar su
  ubicación (tocando el mapa, sin necesidad de escribir una dirección) y
  registrar uno de cinco tipos de punto: una *necesidad* (agua, alimentos,
  medicamentos, etc.), una *donación* disponible, un *albergue*, un *punto
  de acopio*, o un *lugar colapsado* que requiere rescate.
- **Emparejamiento automático.** El sistema cruza las necesidades pendientes
  con las donaciones disponibles de la misma categoría, y las ordena por
  cercanía real (distancia entre coordenadas, fórmula de Haversine), para
  que la ayuda llegue a quien la necesita más cerca, más rápido.
- **Mapa en vivo.** Todos los puntos se ven en un mapa interactivo,
  diferenciados por color según su tipo, con la información de contacto y
  estado de cada uno.
- **Seguimiento de estado.** Cada necesidad o donación puede marcarse como
  *abastecida* una vez atendida, así el sistema refleja en tiempo real
  cuántos casos ya fueron resueltos y cuántos siguen pendientes — evitando
  esfuerzos duplicados o ayuda que llega donde ya no se necesita.
- **Actualización constante.** El panel se refresca automáticamente para que
  todos los usuarios vean los cambios de los demás casi en tiempo real, sin
  recargar la página.

## Estructura
- `backend/` — API en Express (Node.js), guarda los datos en `backend/data/db.json`
- `frontend/dashboard.html` — mapa en vivo, formulario de registro y panel de emparejamientos

## Correr en local
```bash
cd backend
npm install
node server.js
```
Luego abre `frontend/dashboard.html` en el navegador (o sirve `frontend/`
con cualquier servidor estático; el backend ya está configurado para
servirlo directamente en http://localhost:3000).

## Desplegar en Render
1. Sube este repositorio a GitHub.
2. En Render, crea un **Web Service** apuntando al repo.
3. Root directory: `backend` · Build command: `npm install` · Start command: `node server.js`.
4. Render asigna el puerto automáticamente (el código ya usa `process.env.PORT`).
5. Una vez desplegado, entra a `https://tu-proyecto.onrender.com/dashboard.html`.

> El plan gratuito de Render tiene disco efímero y el servicio "duerme" tras
> ~15 min sin tráfico: bueno para probar, pero antes de usarlo con gente
> real hay que migrar el almacenamiento (ver abajo).

## Tipos de punto
- `necesidad` y `donacion` — participan en el emparejamiento automático por categoría + cercanía
- `albergue`, `acopio`, `colapso` — puntos informativos del mapa, no se emparejan pero se ven y se actualizan igual

## Endpoints
- `POST /api/puntos` — registrar un punto de cualquier tipo
- `GET /api/puntos?tipo=&estado=` — listar (con filtros opcionales)
- `PATCH /api/puntos/:id/estado` — actualizar estado (ej. marcar `abastecido`)
- `GET /api/emparejamientos` — necesidades pendientes con sus donaciones candidatas ordenadas por distancia
- `GET /api/estadisticas` — conteos por tipo/estado para el panel

## Siguiente paso para producción
`db.json` funciona para probar, pero un archivo plano no aguanta escrituras
concurrentes de muchos usuarios a la vez. Antes de lanzarlo de verdad, migra
`db.js` a una base real — el cambio es solo en ese archivo, el resto de la
API no cambia:
- **Rápido de montar**: Supabase (Postgres gratis, con panel) o SQLite con
  `better-sqlite3` si te quedas en un solo servidor.
- **Hosting recomendado**: Railway o Render (soportan Node + base de datos
  persistente en su capa gratuita/económica) — evita Vercel/Netlify para el
  backend, esas son para sitios estáticos y no mantienen un proceso Node
  corriendo con archivo persistente.
