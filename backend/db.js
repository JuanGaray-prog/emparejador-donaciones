// db.js — almacenamiento simple en archivo JSON.
// Pensado para poder migrar fácil a Postgres/MySQL/SQLite cuando el
// proyecto crezca: toda la lógica de lectura/escritura pasa por aquí.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "db.json");

function leer() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ puntos: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function guardar(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { leer, guardar };
