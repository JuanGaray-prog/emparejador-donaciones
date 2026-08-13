// haversine.js — distancia en kilómetros entre dos puntos lat/lng.

function distanciaKm(a, b) {
  const R = 6371; // radio de la Tierra en km
  const dLat = gradARad(b.lat - a.lat);
  const dLng = gradARad(b.lng - a.lng);
  const lat1 = gradARad(a.lat);
  const lat2 = gradARad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function gradARad(grados) {
  return (grados * Math.PI) / 180;
}

module.exports = { distanciaKm };
