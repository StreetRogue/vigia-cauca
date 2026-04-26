# Estadísticas del Dashboard — Vigía Cauca

**Endpoint principal:** `GET /api/v1/reportes/estadisticas/dashboard`  
Retorna todo en un único objeto `DashboardCompletoDTO`.

---

## 1. Tarjetas KPI — `ResumenKPIDTO`

| Métrica | Descripción |
|---|---|
| `totalEventos` | Total de incidentes registrados |
| `totalMuertos` | Total de muertes (civiles + FF.PP. + ilegales) |
| `totalHeridos` | Total de heridos |
| `totalDesplazados` | Total de personas desplazadas |
| `totalConfinados` | Total de personas confinadas |

**Filtros aplicables:** año, mes, municipio, categoría, nivel de confianza

---

## 2. Serie Temporal — `List<SerieTemporalDTO>`

Datos mes a mes para gráfico de línea o barras.

| Campo | Descripción |
|---|---|
| `anio`, `mes`, `nombreMes` | Período |
| `totalEventos` | Total de incidentes en el período |
| `totalMuertos` | Total de muertes en el período |
| `totalHeridos` | Total de heridos en el período |
| `totalDesplazados` | Total de desplazados en el período |
| `frecuenciaRelativa` | Porcentaje del total general |
| `frecuenciaAcumulada` | Acumulado progresivo |

---

## 3. Mapa de Calor por Municipio — `List<EstadisticaMunicipioDTO>`

| Campo | Descripción |
|---|---|
| `municipio` | Nombre del municipio |
| `totalEventos` | Incidentes en ese municipio |
| `totalMuertos` | Muertes en ese municipio |
| `totalHeridos` | Heridos en ese municipio |
| `totalDesplazados` | Desplazados en ese municipio |
| `frecuenciaRelativa` | % respecto al total departamental |
| `frecuenciaAcumulada` | Acumulado progresivo |

---

## 4. Incidentes por Actor Armado — `List<EstadisticaActorDTO>`

Ideal para gráfico de torta o barras horizontales.

| Actor | Descripción |
|---|---|
| `FUERZA_PUBLICA` | Fuerza Pública colombiana |
| `ELN` | Ejército de Liberación Nacional |
| `SEGUNDA_MARQUETALIA` | Segunda Marquetalia (disidencias FARC) |
| `GRUPO_ARMADO_ORGANIZADO` | Otros grupos armados organizados |
| `GUARDIA_INDIGENA` | Guardia Indígena |
| `COMUNIDAD_CIVIL` | Comunidad civil |
| `NO_IDENTIFICADO` | Actor no identificado |
| `OTRO` | Otro actor |

**Retorna por actor:** `actor + totalEventos`

---

## 5. Desglose por Categoría de Evento — `List<EstadisticaCategoriaDTO>`

| Categoría | |
|---|---|
| `ENFRENTAMIENTO` | `HOSTIGAMIENTO` |
| `ATENTADO_TERRORISTA` | `ATAQUE_CON_DRON` |
| `HOMICIDIO` | `SECUESTRO` |
| `RETEN_ILEGAL` | `RECLUTAMIENTO_ILICITO` |
| `ACCION_DE_PROTESTA` | `HALLAZGO_DE_MATERIAL` |
| `OTRO` | |

**Retorna por categoría:** `categoria + totalEventos + totalMuertos`

---

## 6. Panel Demográfico de Víctimas — `EstadisticasVictimasDTO`

Tres distribuciones con: `etiqueta + frecuenciaAbsoluta + frecuenciaRelativa (%) + frecuenciaAcumulada`

### Por Género
| Valor | Etiqueta |
|---|---|
| `MASCULINO` | Masculino |
| `FEMENINO` | Femenino |
| `LGBTI_PLUS` | LGBTI+ |
| `NO_ESPECIFICADO` | No especificado |

### Por Rango de Edad
| Valor | Rango |
|---|---|
| `0-19` | 0 a 19 años |
| `20-39` | 20 a 39 años |
| `40-59` | 40 a 59 años |
| `60-79` | 60 a 79 años |
| `80+` | 80 años o más |
| `NO_IDENTIFICADO` | No identificado |

### Por Grupo Poblacional
| Valor | Descripción |
|---|---|
| `NINO` | Niño/a |
| `ADOLESCENTE` | Adolescente |
| `ADULTO` | Adulto/a |
| `ADULTO_MAYOR` | Adulto/a mayor |
| `INDIGENA` | Indígena |
| `AFRODESCENDIENTE` | Afrodescendiente |
| `CAMPESINO` | Campesino/a |
| `DISCAPACIDAD` | Persona con discapacidad |
| `OTRO` | Otro grupo poblacional |

---

## 7. Filtros Globales

Todos los endpoints aceptan estos filtros opcionales combinables con lógica AND:

| Filtro | Tipo | Ejemplo |
|---|---|---|
| `anio` | Número | `2024` |
| `mes` | Número (1–12) | `3` |
| `municipio` | Texto exacto | `"Popayán"` |
| `categoria` | Enum CategoriaEvento | `"HOMICIDIO"` |
| `actor` | Enum Actor | `"ELN"` |
| `nivelConfianza` | Enum | `"CONFIRMADO"` |
| `genero` | Enum Genero | `"FEMENINO"` *(solo víctimas)* |
| `grupoPoblacional` | Enum GrupoPoblacional | `"INDIGENA"` *(solo víctimas)* |

### Control de Visibilidad por Rol

| Rol | Datos accesibles |
|---|---|
| `ADMIN` | Públicos + Privados |
| `OPERADOR` | Públicos + Privados |
| `VISITANTE` | Solo Públicos |

**Header requerido:** `X-User-Role`

---

## 8. Endpoints Individuales

| Endpoint | Propósito |
|---|---|
| `GET /estadisticas/resumen` | Solo KPIs (tarjetas) |
| `GET /estadisticas/serie-temporal` | Solo línea de tiempo |
| `GET /estadisticas/por-actor` | Solo distribución por actor |
| `GET /estadisticas/mapa-calor` | Solo datos por municipio |
| `GET /estadisticas/por-categoria` | Solo desglose por categoría |
| `GET /estadisticas/dashboard` | Todo en una sola llamada |

---

## 9. Exportación Excel

**Endpoint:** `GET /api/v1/reportes/documentos/descargar`

| Parámetro | Tipo |
|---|---|
| `fechaInicio` | Date |
| `fechaFin` | Date |
| `municipio` | String |
| `categoria` | Enum |
| `actor1` | Enum |
| `nivelConfianza` | Enum |

---

## 10. Actualización en Tiempo Real (SSE)

**Endpoint:** `GET /api/v1/reportes/sse/stream`

- Heartbeat cada **30 segundos**
- Timeout tras **5 minutos** de inactividad
- `GET /sse/status` → número de clientes conectados actualmente

---

## Resumen para el Prototipo

El dashboard se compone de **6 secciones visuales**:

1. **KPIs** → 5 tarjetas numéricas (eventos, muertos, heridos, desplazados, confinados)
2. **Línea de tiempo** → gráfico temporal mes a mes
3. **Mapa de calor** → distribución geográfica por municipio
4. **Actores armados** → gráfico de torta o barras horizontales
5. **Categorías de eventos** → barras por tipo de incidente
6. **Demografía de víctimas** → paneles de género, edad y grupo poblacional

Todo el dashboard es **filtrable dinámicamente** y soporta **exportación a Excel** y **streaming en tiempo real** vía SSE.
