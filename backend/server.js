const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { leer, guardar } = require("./db");
const { distanciaKm } = require("./haversine");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const TIPOS_VALIDOS = ["necesidad", "donacion", "albergue", "acopio", "colapso"];

// Tipos que participan en el emparejamiento por oferta/demanda.
// albergue, acopio y colapso son puntos informativos del mapa (no se
// "emparejan", pero sí se visualizan y actualizan igual).
const TIPOS_EMPAREJABLES = ["necesidad", "donacion"];

// --- Crear un punto -------------------------------------------------
app.post("/api/puntos", (req, res) => {
  const { tipo, nombre, categoria, detalle, contacto, lat, lng } = req.body;

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ error: `tipo inválido. Usa uno de: ${TIPOS_VALIDOS.join(", ")}` });
  }
  if (!nombre || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "nombre, lat y lng son obligatorios" });
  }

  const data = leer();
  const punto = {
    id: randomUUID(),
    tipo,
    nombre,
    categoria: categoria || "General",
    detalle: detalle || "",
    contacto: contacto || "",
    lat: Number(lat),
    lng: Number(lng),
    estado: TIPOS_EMPAREJABLES.includes(tipo) ? "pendiente" : "activo",
    creado_en: new Date().toISOString(),
  };
  data.puntos.push(punto);
  guardar(data);

  res.status(201).json(punto);
});

// --- Listar puntos (con filtros opcionales) --------------------------
app.get("/api/puntos", (req, res) => {
  const { tipo, estado } = req.query;
  let { puntos } = leer();

  if (tipo) puntos = puntos.filter((p) => p.tipo === tipo);
  if (estado) puntos = puntos.filter((p) => p.estado === estado);

  res.json(puntos);
});

// --- Actualizar estado de un punto (ej: marcar necesidad abastecida) --
app.patch("/api/puntos/:id/estado", (req, res) => {
  const { estado } = req.body;
  const data = leer();
  const punto = data.puntos.find((p) => p.id === req.params.id);

  if (!punto) return res.status(404).json({ error: "punto no encontrado" });

  punto.estado = estado;
  punto.actualizado_en = new Date().toISOString();
  guardar(data);

  res.json(punto);
});

// --- Emparejamientos: para cada necesidad pendiente, las donaciones --
// pendientes de la misma categoría ordenadas por distancia.
app.get("/api/emparejamientos", (req, res) => {
  const { puntos } = leer();
  const necesidades = puntos.filter((p) => p.tipo === "necesidad" && p.estado === "pendiente");
  const donaciones = puntos.filter((p) => p.tipo === "donacion" && p.estado === "pendiente");

  const resultado = necesidades.map((necesidad) => {
    const candidatas = donaciones
      .filter((d) => d.categoria === necesidad.categoria)
      .map((d) => ({
        donacion_id: d.id,
        nombre: d.nombre,
        contacto: d.contacto,
        distancia_km: Number(distanciaKm(necesidad, d).toFixed(2)),
      }))
      .sort((a, b) => a.distancia_km - b.distancia_km);

    return {
      necesidad_id: necesidad.id,
      necesidad_nombre: necesidad.nombre,
      categoria: necesidad.categoria,
      candidatas,
    };
  });

  res.json(resultado);
});

// --- Estadísticas para el panel (cuántos abastecidos, pendientes...) -
app.get("/api/estadisticas", (req, res) => {
  const { puntos } = leer();
  const stats = {};

  for (const tipo of TIPOS_VALIDOS) {
    const delTipo = puntos.filter((p) => p.tipo === tipo);
    stats[tipo] = {
      total: delTipo.length,
      pendiente: delTipo.filter((p) => p.estado === "pendiente").length,
      abastecido: delTipo.filter((p) => p.estado === "abastecido").length,
      activo: delTipo.filter((p) => p.estado === "activo").length,
    };
  }

  res.json(stats);
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`API corriendo en http://localhost:${PUERTO}`));
