# 🔒 Política de Seguridad - Vigía Cauca

---

## Reportar una Vulnerabilidad

Si descubriste una vulnerabilidad de seguridad en Vigía Cauca, **POR FAVOR NO LA PUBLIQUES PÚBLICAMENTE**. En su lugar, repórtala de forma privada para que podamos solucionarla rápidamente.

### Cómo Reportar

1. **Envía un email a:** security@vigia-cauca.dev
   - Incluye: Descripción de la vulnerabilidad
   - Incluye: Pasos para reproducirla
   - Incluye: Potencial impacto
   - Incluye: Tu nombre y contacto (opcional)

2. **O usa GitHub Security Advisory:**
   - Ve a: https://github.com/bitnova-unicauca/vigia-cauca/security/advisories
   - Haz click en "Report a vulnerability"
   - Completa el formulario

### Tiempo de Respuesta

Nos comprometemos a:
- ✅ Confirmar recepción en **24 horas**
- ✅ Investigar en **5-7 días**
- ✅ Comunicar solución en **14 días**
- ✅ Dar crédito (si lo deseas) en release

---

## Medidas de Seguridad

### 1. Autenticación y Autorización

- ✅ JWT para tokens de sesión
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Bloqueo de cuenta después de 3 intentos fallidos
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Sesiones expiran por inactividad (15 minutos)

### 2. Validación de Datos

- ✅ Validación en cliente (React)
- ✅ Validación en servidor (Backend)
- ✅ Sanitización de inputs
- ✅ Validación de tipos con TypeScript (futuro)
- ✅ Prevención de inyección SQL

### 3. Comunicación

- ✅ HTTPS forzado en producción
- ✅ Headers de seguridad (CSP, X-Frame-Options, etc)
- ✅ Cookies con flags Secure, HttpOnly, SameSite
- ✅ CORS configurado restrictivamente

### 4. Datos Sensibles

- ✅ No se almacenan passwords en logs
- ✅ Datos de víctimas protegidos por roles
- ✅ Auditoría de accesos a datos sensibles
- ✅ Cumplimiento con LGPD/GDPR

### 5. Código

- ✅ ESLint para detectar problemas de seguridad
- ✅ CodeQL análisis automático en CI
- ✅ Dependabot para alertar vulnerabilidades
- ✅ Reviews de código obligatorios

---

## Dependencias Seguras

### Mantenimiento de Dependencias

Usamos **Dependabot** para:
- Alertar de vulnerabilidades conocidas
- Proponer actualizaciones automáticas
- Bloquear PRs si hay vulnerabilidades

```bash
# Verificar vulnerabilidades manualmente
npm audit

# Arreglar vulnerabilidades encontradas
npm audit fix
```

### Política de Updates

- ✅ Actualizamos dependencias críticas inmediatamente
- ✅ Actualizamos menores/patches semanalmente
- ✅ Revisa breaking changes antes de actualizar
- ✅ Ejecuta tests después de actualizar

---

## Seguridad en Despliegue

### Variables de Entorno

**NUNCA** commits credenciales. Usa `.env.local`:

```bash
# ✅ Bien - .env.example
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Vigía Cauca

# ❌ Mal - nunca commits estos valores reales
VITE_API_PASSWORD=tu_password_secreto
VITE_JWT_SECRET=supersecretkey123
```

### Secretos en GitHub

Configura secretos en: `Settings → Secrets and variables → Actions`

Usa en workflows:
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

---

## Auditoría y Logs

### Qué Se Audita

- ✅ Login/Logout de usuarios
- ✅ Creación/Modificación/Eliminación de registros
- ✅ Cambios de rol o permisos
- ✅ Accesos a datos sensibles
- ✅ Errores de seguridad

### Retención de Logs

- Logs operacionales: 30 días
- Logs de auditoría: 2 años
- Logs de error: 90 días

### Acceso a Logs

- Solo administradores pueden acceder
- Acceso registrado en auditoría (meta-auditoría)
- No se exportan fuera del servidor

---

## Incidentes de Seguridad

### Si Ocurre un Incidente

1. **Detecta** - Monitoreo automático con alertas
2. **Contiene** - Aisla el componente afectado
3. **Investiga** - Determina causa y alcance
4. **Remedía** - Implementa fix
5. **Comunica** - Notifica a usuarios si aplica
6. **Aprende** - Post-mortem y mejoras

### Comunicación de Incidentes

Si un incidente afecta datos de usuarios:
- ✅ Notificamos en 24 horas
- ✅ Explicamos qué pasó
- ✅ Indicamos qué datos fueron afectados
- ✅ Damos pasos de mitigación

---

## Buenas Prácticas

### Para Desarrolladores

```javascript
// ❌ MAL - Exponiendo secretos
const API_KEY = 'sk-1234567890abcdef';

// ✅ BIEN - Usando variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY;

// ❌ MAL - Sin validación
app.post('/novedad', (req, res) => {
  const novedad = req.body; // ¿Validado?
  db.save(novedad);
});

// ✅ BIEN - Con validación
app.post('/novedad', validate(novedadSchema), (req, res) => {
  const novedad = req.body; // Ya validado
  db.save(novedad);
});

// ❌ MAL - Contraseña en log
console.log('Usuario:', user.email, 'Password:', user.password);

// ✅ BIEN - Solo información segura
console.log('Usuario creado:', user.email);
```

### Para Operaciones

- ✅ Backups regulares (diarios)
- ✅ Pruebas de restauración (semanales)
- ✅ Monitoreo de uptime (24/7)
- ✅ Alertas de CPU/Memoria/Disco
- ✅ Plan de recuperación ante desastres

---

## Compliance

### Regulaciones Aplicables

- 🔐 **GDPR** - Protección de datos europeos
- 🔐 **LGPD** - Protección de datos en Brasil
- 🔐 **Resolución 0312/2022** - Datos sensibles en Colombia

### Estándares

- ✅ OWASP Top 10
- ✅ CWE/SANS Top 25
- ✅ ISO 27001 (objetivo futuro)

---

## Preguntas Frecuentes

**P: ¿Qué hago si encuentro una vulnerabilidad?**
R: Reporta privadamente a security@vigia-cauca.dev. NO la publiques.

**P: ¿Cuánto tiempo tardará en arreglarse?**
R: Trabajamos en un fix en 14 días. Los críticos se arreglan en < 7 días.

**P: ¿Qué información debo incluir en mi reporte?**
R: Descripción clara, pasos para reproducir, impacto potencial, evidencia si es posible.

**P: ¿Tendré derecho de autor por reportar?**
R: Sí, si lo deseas, te daremos crédito en la versión que fix la vulnerabilidad.

**P: ¿Hay bug bounty?**
R: Actualmente no, pero reconocemos públicamente a quienes reportan vulnerabilidades.

---

## Contactos de Seguridad

| Rol | Nombre | Email |
|-----|--------|-------|
| Jefe de Seguridad | Henry Laniado | hlaniado@unicauca.edu.co |
| Scrum Master | Ana Sofía Arango | ana.arango@unicauca.edu.co |
| Desarrollador Lead | Juan Esteban Martínez | je.martinez@unicauca.edu.co |

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-03-XX | Política inicial |

---

<div align="center">

**La seguridad es responsabilidad de todos 🔒**

[⬆ Volver al inicio](#-política-de-seguridad---vigía-cauca)

</div>
