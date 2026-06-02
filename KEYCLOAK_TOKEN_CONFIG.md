# Configuración de Token JWT en Keycloak

## ⏱️ Cambios Realizados

Se actualizó el tiempo de expiración del token JWT de Keycloak en el archivo:
```
Backend-Vigia/Keycloak/realms/security-realm-dev.json
```

### Nuevos Tiempos:

| Campo | Valor Anterior | Valor Nuevo | Significado |
|-------|---|---|---|
| `accessTokenLifespan` | 28800 seg (8h) | **3600 seg (1h)** | ✅ Tiempo de vida del Access Token |
| `ssoSessionIdleTimeout` | 28800 seg (8h) | **86400 seg (24h)** | ⏰ Sesión inactiva antes de logout |
| `ssoSessionMaxLifespan` | 86400 seg (24h) | **604800 seg (7d)** | 📅 Máximo tiempo de sesión |

---

## 🔄 Cómo Aplicar los Cambios

### Opción 1: Usando Docker Compose (Recomendado)

```bash
# 1. Detén los contenedores
cd "C:\Users\Ana_Sofia\OneDrive\Documentos\UNI\Proyecto 1\V2-Codigo\vigia-cauca\Backend-Vigia"
docker-compose down

# 2. Elimina el volumen de Keycloak (importante para que lea la nueva config)
docker volume rm vigia-cauca_keycloak-data

# 3. Inicia de nuevo
docker-compose up -d

# 4. Espera 30-60 segundos a que Keycloak se levante
# Accede a: http://localhost:8180
```

### Opción 2: Manualmente en Keycloak Admin

Si prefieres no reiniciar:

1. Ve a **http://localhost:8180/admin**
2. Login con: usuario: `admin` / contraseña: `admin`
3. Selecciona realm **security-realm-dev**
4. Ve a **Realm Settings** → **General** → **Tokens**
5. Actualiza los valores:
   - **Access Token Lifespan**: 3600 (segundos)
   - **SSO Session Idle**: 86400 (segundos)
   - **SSO Session Max**: 604800 (segundos)
6. Click **Save**

---

## ✅ Verificar que Funciona

Después de cambiar la configuración:

```bash
# 1. Login con un usuario
# Usuario: admin
# Contraseña: admin

# 2. Abre DevTools (F12 → Storage → Cookies)
# Busca la cookie: kc_state

# 3. Permanece logueado por 1 hora sin problemas
# El token se debería refrescar automáticamente después de 59 minutos
```

---

## 🔍 Cómo Verificar el Token

En la consola del navegador (F12 → Console):

```javascript
// Ver el contenido del token
const token = localStorage.getItem('kc-token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expira en:', new Date(payload.exp * 1000));
console.log('Tiempo de vida:', (payload.exp - payload.iat), 'segundos');
```

---

## 🤖 Auto-Refresh en el Frontend

El frontend ya tiene auto-refresh configurado en `src/context/AuthContext.tsx`:

- Refresca el token **60 segundos ANTES** de que expire
- Si el refresh falla, hace logout automático
- El refresh token tiene vida más larga (7 días)

---

## ⚠️ Troubleshooting

**Si aún se cierra sesión rápido:**

1. **Verifica que Keycloak está usando la nueva config:**
   ```bash
   docker-compose logs keycloak | grep -i token
   ```

2. **Limpia localStorage en el navegador:**
   - F12 → Storage → Local Storage → Elimina entries `kc-token`, `kc-refresh`, `kc-role`
   - F5 para refrescar y hacer login de nuevo

3. **Verifica el reloj del sistema:**
   - Si hay desincronización de tiempo (Clock Skew), los tokens pueden parecer expirados
   - Sincroniza la hora: `net start w32time` (Windows)

4. **Revisa logs de Keycloak:**
   ```bash
   docker-compose logs keycloak
   ```

---

## 📚 Referencias

- [Keycloak Token Lifespan](https://www.keycloak.org/server/all-config#token)
- [JWT Expiration Best Practices](https://tools.ietf.org/html/rfc7519#section-4.1.4)

---

## 📝 Notas

- Los cambios se guardaron en `security-realm-dev.json`
- Cuando hagas deploy a producción, revisa `realm-dev.json` también si lo usas
- El refresh automático debería evitar que el usuario vea "expired token" en la práctica
