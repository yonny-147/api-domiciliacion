"use strict";

const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;

// --- Datos -----------------------------------------------------------------
// Las 3 primeras facturas son las originales, sin cambios.
const BASE = [
  {
    id_factura: "001",
    tipo_id: "CC",
    numero_id: 10251205,
    nombre: "Carlos Ramirez",
    descripcion: "Servicio de acueducto mensual periodo enero 2024",
    fecha_vencimiento: "2026-12-12",
    valor: 30000,
  },
  {
    id_factura: "002",
    tipo_id: "CC",
    numero_id: 10251206,
    nombre: "Mario Ramirez",
    descripcion: "Servicio de acueducto mensual periodo enero 2024",
    fecha_vencimiento: "2026-12-12",
    valor: 32000,
  },
  {
    id_factura: "003",
    tipo_id: "CC",
    numero_id: 10251208,
    nombre: "Juan Ramirez",
    descripcion: "Servicio de acueducto mensual periodo enero 2024",
    fecha_vencimiento: "2026-12-12",
    valor: 42000,
  },
];

const NOMBRES = [
  "Ana Torres", "Luis Gomez", "Sofia Castro", "Pedro Mejia", "Laura Rios",
  "Diego Herrera", "Camila Vargas", "Andres Molina", "Valentina Ospina",
  "Felipe Cardona", "Daniela Restrepo", "Jorge Salazar", "Paula Giraldo",
  "Santiago Arango", "Maria Ruiz", "Sebastian Duque", "Natalia Pineda",
  "Camilo Zapata", "Isabela Montoya", "Mateo Quintero",
];

const SERVICIOS = [
  "Servicio de acueducto mensual",
  "Servicio de energia mensual",
  "Servicio de gas natural mensual",
  "Servicio de aseo mensual",
  "Servicio de internet hogar mensual",
];

const PERIODOS = ["enero 2024", "febrero 2024", "marzo 2024", "abril 2024"];

// Vencimientos variados (futuros y uno vencido) para probar distintos casos.
const VENCIMIENTOS = [
  "2026-12-12", "2026-12-20", "2027-01-10", "2027-01-31", "2025-11-13",
];

const TOTAL = 50; // total de facturas (001 a 050)

function generar() {
  const facturas = BASE.map((f) => ({ ...f }));
  const tipos = ["CC", "CC", "CE", "NIT"];
  for (let i = BASE.length + 1; i <= TOTAL; i++) {
    const n = i - 1;
    facturas.push({
      id_factura: String(i).padStart(3, "0"),
      tipo_id: tipos[n % tipos.length],
      numero_id: 10251208 + i, // 10251212 en adelante, sin chocar con los originales
      nombre: NOMBRES[n % NOMBRES.length],
      descripcion: `${SERVICIOS[n % SERVICIOS.length]} periodo ${PERIODOS[n % PERIODOS.length]}`,
      fecha_vencimiento: VENCIMIENTOS[n % VENCIMIENTOS.length],
      valor: 20000 + ((n * 7919) % 130) * 1000, // entre 20.000 y 149.000, en miles
    });
  }
  return facturas;
}

const FACTURAS = generar();

// --- Servidor --------------------------------------------------------------
function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(data);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method !== "GET") {
    return send(res, 405, { error: "Metodo no permitido" });
  }

  if (path === "/health") {
    return send(res, 200, { status: "ok", total_facturas: FACTURAS.length });
  }

  if (path === "/consulta/facturas") {
    // Sin filtros devuelve todas, igual que el mock original.
    // Filtros opcionales: ?id_factura=004  ?numero_id=10251212  ?tipo_id=CC
    const id = url.searchParams.get("id_factura");
    const numero = url.searchParams.get("numero_id");
    const tipo = url.searchParams.get("tipo_id");
    let resultado = FACTURAS;
    if (id) resultado = resultado.filter((f) => f.id_factura === id);
    if (numero) resultado = resultado.filter((f) => String(f.numero_id) === numero);
    if (tipo) resultado = resultado.filter((f) => f.tipo_id === tipo);
    return send(res, 200, resultado);
  }

  // Una factura por id: /consulta/facturas/004
  const m = path.match(/^\/consulta\/facturas\/([^/]+)$/);
  if (m) {
    const f = FACTURAS.find((x) => x.id_factura === decodeURIComponent(m[1]));
    return f ? send(res, 200, f) : send(res, 404, { error: "Factura no encontrada" });
  }

  if (path === "/") {
    return send(res, 200, {
      servicio: "API de facturas (pruebas)",
      endpoints: [
        "GET /consulta/facturas",
        "GET /consulta/facturas?id_factura=004",
        "GET /consulta/facturas/:id_factura",
        "GET /health",
      ],
    });
  }

  return send(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`API de facturas escuchando en el puerto ${PORT} (${FACTURAS.length} facturas)`);
});
