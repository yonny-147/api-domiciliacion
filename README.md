# API de facturas (mock para pruebas)

Servicio sin dependencias externas (solo Node.js) que reemplaza el mock de Beeceptor
`/consulta/facturas`. Trae las 3 facturas originales (001, 002, 003) sin cambios y
47 más (hasta la 050).

## Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/consulta/facturas` | Arreglo con las 50 facturas (igual que el mock original) |
| GET | `/consulta/facturas?id_factura=004` | Arreglo filtrado (también `numero_id` y `tipo_id`) |
| GET | `/consulta/facturas/:id_factura` | Una factura, o 404 |
| GET | `/health` | `{"status":"ok","total_facturas":50}` |

## Probar en local

```bash
npm start
curl http://localhost:3000/consulta/facturas
```

## Desplegar en Render

1. Sube esta carpeta a un repositorio de GitHub.
2. En Render: **New → Blueprint** y elige el repositorio (usa `render.yaml`).
   Alternativa manual: **New → Web Service**, Runtime `Node`, Build `npm install`, Start `npm start`.
3. Cuando termine, la URL será `https://<nombre>.onrender.com/consulta/facturas`.

Nota: en el plan gratuito de Render el servicio se duerme tras inactividad y la primera
petición puede tardar cerca de un minuto en responder.

## Datos

- `001` a `003`: facturas originales.
- `004` a `050`: generadas de forma determinista (siempre los mismos datos), con servicios
  variados (acueducto, energía, gas, aseo, internet), tipos de documento `CC`, `CE` y `NIT`,
  valores entre 20.000 y 149.000 y vencimientos futuros, más algunas ya vencidas (2025-11-13).

Para cambiar la cantidad, edita la constante `TOTAL` en `server.js`.
