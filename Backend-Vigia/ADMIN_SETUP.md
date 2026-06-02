# 🔐 Configuración Automática de Usuario ADMIN

## Resumen

Cuando ejecutas `docker compose up --build`, el sistema **automáticamente** crea un usuario administrador sin que tengas que hacer nada manualmente.

## ¿Qué se crea automáticamente?

### 1. **Base de Datos (micro-usuarios)**
El archivo de migración Flyway ejecuta automáticamente:
- **Archivo**: `micro-usuarios/src/main/resources/db/migration/V3__seed_default_admin.sql`
- **Crea**: Usuario en la tabla `usuarios`
  - Email: `admin@sistema.com`
  - Usuario: `admin.sistema`
  - Rol: `ADMIN`
  - Cédula: `00000001` (parámetro único)

### 2. **Keycloak (Autenticación)**
El contenedor `keycloak-init` ejecuta automáticamente:
- **Archivo**: `Keycloak/init-admin-user.sh`
- **Crea**: Usuario en Keycloak
  - Email: `admin@sistema.com`
  - Usuario: `admin.sistema`
  - Contraseña: `admin`
  - Rol: `admin`

## 📋 Proceso de Inicialización

```
1. docker compose up --build
   ↓
2. Keycloak inicia y está listo (healthcheck)
   ↓
3. micro-usuarios ejecuta V3__seed_default_admin.sql
   ↓
4. keycloak-init ejecuta init-admin-user.sh
   ↓
5. ✅ Usuario ADMIN completamente configurado
```

## 🔑 Credenciales por Defecto

```
Email:       admin@sistema.com
Usuario:     admin.sistema
Contraseña:  admin
Rol:         ADMIN
```

## 🚀 Cómo Usar

### Opción 1: Primera vez (Recomendado)
```bash
docker compose up --build
```

Espera a que todos los servicios estén listos (unos 30-40 segundos).

### Opción 2: Ya hay contenedores
```bash
docker compose up
```

Si los contenedores ya existen, omitirá la creación del usuario (por el `ON CONFLICT`).

### Opción 3: Forzar recreación
```bash
docker compose down -v
docker compose up --build
```

## ✅ Verificar que Funcionó

### Base de Datos
```bash
docker compose exec postgres-usuarios psql -U postgres -d micro_usuarios -c "SELECT email, username, rol FROM usuarios WHERE email='admin@sistema.com';"
```

Deberías ver:
```
         email          |   username   | rol
------------------------+--------------+-----
 admin@sistema.com      | admin.sistema| ADMIN
```

### Keycloak
```bash
curl -X POST http://localhost:8180/realms/security-realm-dev/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=admin-cli" \
  -d "username=admin.sistema" \
  -d "password=admin" \
  -d "grant_type=password"
```

Si funciona, obtendrás un JWT token.

## 🔄 Cambiar las Credenciales por Defecto

### Cambiar en la Base de Datos
Edita `micro-usuarios/src/main/resources/db/migration/V3__seed_default_admin.sql`:
```sql
-- Cambiar estos valores:
'00000001',           -- cedula
'admin@sistema.com',  -- email
'admin.sistema',      -- username
```

### Cambiar en Keycloak
Edita `Keycloak/init-admin-user.sh`:
```bash
NEW_USER="admin.sistema"      # Usuario
NEW_EMAIL="admin@sistema.com" # Email
NEW_PASSWORD="admin"          # Contraseña
```

Luego recrea los contenedores:
```bash
docker compose down -v
docker compose up --build
```

## ⚠️ Notas Importantes

1. **Idempotente**: El script es seguro ejecutar múltiples veces
   - Si el usuario ya existe, no lo duplica
   - Usa `ON CONFLICT` en SQL
   - Verifica existencia en Keycloak

2. **No Sobrescribe**: Si el usuario existe, no cambia su contraseña
   - Útil para desarrollo sin perder cambios
   - En producción, considerar políticas de contraseñas

3. **Dependencias**:
   - `keycloak-init` espera a que Keycloak esté healthy
   - `micro-usuarios` espera a que postgres esté healthy
   - Todos los servicios están en la red `backend`

## 🐛 Troubleshooting

### El usuario no se crea en Keycloak
```bash
docker compose logs keycloak-init
```

Verifica:
- Keycloak está en puerto 8080
- Las credenciales de admin son correctas en `.env`
- El realm `security-realm-dev` existe

### El usuario no se crea en la BD
```bash
docker compose logs micro-usuarios
```

Verifica:
- PostgreSQL está disponible
- El archivo V3__seed_default_admin.sql existe
- Flyway ejecutó las migraciones

### Login sigue fallando
1. Verifica que el usuario existe en ambos lugares (arriba)
2. Intenta con email en lugar de username
3. Revisa los logs del API Gateway: `docker compose logs api-gateway`

## 📚 Archivos Relacionados

- `docker-compose.yml` - Configuración de contenedores y servicios de init
- `micro-usuarios/src/main/resources/db/migration/V3__seed_default_admin.sql` - Migración Flyway
- `Keycloak/init-admin-user.sh` - Script de inicialización de Keycloak
- `.env` - Variables de entorno con credenciales

---

**Versión**: 1.0  
**Última actualización**: 2026-05-11  
**Autor**: Sistema de Inicialización Automática
