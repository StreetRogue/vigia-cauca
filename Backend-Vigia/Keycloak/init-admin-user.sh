#!/bin/sh
set -e

KC="http://keycloak:8080"
REALM="security-realm-dev"
CLIENT_ID="api-gateway"
CLIENT_SECRET="nygy6iYITC4WuG4rGTNff0zLLJuJ2IO0"

# ── 1. Esperar Keycloak ────────────────────────────────────────────────────
echo "[init] Esperando a Keycloak..."
until curl -sf "$KC/health/ready" > /dev/null 2>&1; do
  echo "[init] No listo aun, reintentando en 5s..."
  sleep 5
done
echo "[init] Keycloak listo."

# ── 2. Token de master admin ───────────────────────────────────────────────
get_token() {
  curl -sf -X POST "$KC/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=admin-cli&username=admin&password=admin&grant_type=password" \
    | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

T=$(get_token)
[ -z "$T" ] && echo "[init] ERROR obteniendo token" && exit 1
echo "[init] Token obtenido."

# ── 3. Crear realm si no existe ───────────────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $T" "$KC/admin/realms/$REALM")
if [ "$HTTP" != "200" ]; then
  echo "[init] Creando realm $REALM..."
  curl -sf -X POST "$KC/admin/realms" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "{\"realm\":\"$REALM\",\"enabled\":true,\"accessTokenLifespan\":28800,\"ssoSessionIdleTimeout\":28800,\"ssoSessionMaxLifespan\":86400}"
  T=$(get_token)
fi
echo "[init] Realm OK."

# ── 4. Roles ───────────────────────────────────────────────────────────────
for ROLE in ADMIN OPERADOR; do
  curl -s -X POST "$KC/admin/realms/$REALM/roles" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$ROLE\",\"description\":\"Rol $ROLE del sistema\"}" > /dev/null 2>&1 || true
done
echo "[init] Roles OK."

# ── 5. Cliente api-gateway ─────────────────────────────────────────────────
CLIENT_EXISTS=$(curl -s -H "Authorization: Bearer $T" \
  "$KC/admin/realms/$REALM/clients?clientId=$CLIENT_ID" | grep -c "\"clientId\"" || true)

if [ "$CLIENT_EXISTS" = "0" ]; then
  echo "[init] Creando cliente $CLIENT_ID..."
  curl -sf -X POST "$KC/admin/realms/$REALM/clients" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "{\"clientId\":\"$CLIENT_ID\",\"enabled\":true,\"publicClient\":false,\"secret\":\"$CLIENT_SECRET\",\"directAccessGrantsEnabled\":true,\"standardFlowEnabled\":true,\"serviceAccountsEnabled\":true,\"clientAuthenticatorType\":\"client-secret\",\"redirectUris\":[\"*\"],\"webOrigins\":[\"*\"]}"
fi

# Siempre forzar el secret y redirectUris correctos
CLIENT_UUID=$(curl -sf -H "Authorization: Bearer $T" \
  "$KC/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

curl -sf -X PUT "$KC/admin/realms/$REALM/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $T" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$CLIENT_UUID\",\"clientId\":\"$CLIENT_ID\",\"enabled\":true,\"publicClient\":false,\"secret\":\"$CLIENT_SECRET\",\"directAccessGrantsEnabled\":true,\"standardFlowEnabled\":true,\"clientAuthenticatorType\":\"client-secret\",\"redirectUris\":[\"*\"],\"webOrigins\":[\"*\"]}"
echo "[init] Cliente y secret OK."

# ── 6. Crear usuarios de prueba ────────────────────────────────────────────

# Función para crear usuario
create_user() {
  local USERNAME=$1
  local EMAIL=$2
  local PASSWORD=$3
  local ROLE=$4

  echo "[init] Creando usuario $USERNAME con rol $ROLE..."

  USER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$KC/admin/realms/$REALM/users" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"firstName\":\"$USERNAME\",\"lastName\":\"Test\",\"enabled\":true,\"emailVerified\":true,\"requiredActions\":[],\"credentials\":[{\"type\":\"password\",\"value\":\"$PASSWORD\",\"temporary\":false}]}")

  if [ "$USER_HTTP" = "201" ] || [ "$USER_HTTP" = "409" ]; then
    USER_ID=$(curl -sf -H "Authorization: Bearer $T" \
      "$KC/admin/realms/$REALM/users?username=$USERNAME" \
      | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    # Siempre actualizar email por si cambió
    curl -sf -X PUT "$KC/admin/realms/$REALM/users/$USER_ID" \
      -H "Authorization: Bearer $T" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"emailVerified\":true}" > /dev/null 2>&1 || true

    ROLE_ID=$(curl -sf -H "Authorization: Bearer $T" \
      "$KC/admin/realms/$REALM/roles/$ROLE" \
      | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ ! -z "$ROLE_ID" ]; then
      curl -sf -X POST "$KC/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
        -H "Authorization: Bearer $T" \
        -H "Content-Type: application/json" \
        -d "[{\"id\":\"$ROLE_ID\",\"name\":\"$ROLE\"}]" > /dev/null 2>&1 || true
      echo "[init] Usuario $USERNAME creado con rol $ROLE"
    fi
  else
    echo "[init] Error creando usuario $USERNAME (HTTP $USER_HTTP)"
  fi
}

# Crear usuarios de prueba
create_user "admin" "bitnova@cauca.gov.co" "admin" "ADMIN"
create_user "operador" "operador@vigia.gov.co" "operador123" "OPERADOR"

# ── 7. Sincronizar usuarios admin/operador en la BD micro_usuarios ────────
if [ ! -z "$USUARIOS_DB_HOST" ]; then
  echo "[init] Sincronizando usuarios en BD micro_usuarios..."

  # Obtener IDs de Keycloak para los dos usuarios quemados
  T=$(get_token)
  ADMIN_KC_ID=$(curl -sf -H "Authorization: Bearer $T" \
    "$KC/admin/realms/$REALM/users?username=admin" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  OPERADOR_KC_ID=$(curl -sf -H "Authorization: Bearer $T" \
    "$KC/admin/realms/$REALM/users?username=operador" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  export PGPASSWORD="$USUARIOS_DB_PASSWORD"

  # ADMIN
  psql -h "$USUARIOS_DB_HOST" -U "$USUARIOS_DB_USER" -d "$USUARIOS_DB_NAME" -v ON_ERROR_STOP=1 -c "
    INSERT INTO usuarios (id_keycloak, cedula, nombre, telefono, email, id_municipio, username, rol, estado, fecha_creacion, creado_por)
    VALUES ('$ADMIN_KC_ID', '000000001', 'Administrador del Sistema', '3000000000', 'bitnova@cauca.gov.co', 19001, 'admin', 'ADMIN', 'ACTIVO', NOW(), 'SYSTEM')
    ON CONFLICT (id_keycloak) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      email = EXCLUDED.email,
      estado = 'ACTIVO',
      fecha_actualizacion = NOW();
  " > /dev/null 2>&1 && echo "[init] Usuario admin sincronizado en BD" || echo "[init] Error sync admin BD"

  # OPERADOR
  psql -h "$USUARIOS_DB_HOST" -U "$USUARIOS_DB_USER" -d "$USUARIOS_DB_NAME" -v ON_ERROR_STOP=1 -c "
    INSERT INTO usuarios (id_keycloak, cedula, nombre, telefono, email, id_municipio, username, rol, estado, fecha_creacion, creado_por)
    VALUES ('$OPERADOR_KC_ID', '000000002', 'Operador del Sistema', '3000000001', 'operador@vigia.gov.co', 19001, 'operador', 'OPERADOR', 'ACTIVO', NOW(), 'SYSTEM')
    ON CONFLICT (id_keycloak) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      email = EXCLUDED.email,
      estado = 'ACTIVO',
      fecha_actualizacion = NOW();
  " > /dev/null 2>&1 && echo "[init] Usuario operador sincronizado en BD" || echo "[init] Error sync operador BD"
fi

# ── 8. Configurar SMTP para reset de contraseña ──────────────────────────
if [ ! -z "$SMTP_HOST" ]; then
  echo "[init] Configurando SMTP..."
  T=$(get_token)
  curl -sf -X PUT "$KC/admin/realms/$REALM" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "{
      \"realm\": \"$REALM\",
      \"resetPasswordAllowed\": true,
      \"smtpServer\": {
        \"host\": \"$SMTP_HOST\",
        \"port\": \"$SMTP_PORT\",
        \"ssl\": \"$SMTP_SSL\",
        \"starttls\": \"$SMTP_STARTTLS\",
        \"auth\": \"$SMTP_AUTH\",
        \"from\": \"$SMTP_FROM\",
        \"fromDisplayName\": \"$SMTP_FROM_DISPLAY_NAME\",
        \"user\": \"$SMTP_USER\",
        \"password\": \"$SMTP_PASSWORD\"
      }
    }" > /dev/null 2>&1 && echo "[init] SMTP configurado." || echo "[init] Error configurando SMTP"
fi

# ── 9. Habilitar acción requerida UPDATE_PASSWORD ─────────────────────────
# Sin esto, el flujo de "olvidé mi contraseña" NO muestra el formulario de
# nueva contraseña: Keycloak loguea al usuario y lo deja en la Account Console.
echo "[init] Habilitando UPDATE_PASSWORD..."
T=$(get_token)
curl -sf -X PUT "$KC/admin/realms/$REALM/authentication/required-actions/UPDATE_PASSWORD" \
  -H "Authorization: Bearer $T" \
  -H "Content-Type: application/json" \
  -d '{"alias":"UPDATE_PASSWORD","name":"Update Password","providerId":"UPDATE_PASSWORD","enabled":true,"defaultAction":false,"priority":30,"config":{}}' \
  > /dev/null 2>&1 && echo "[init] UPDATE_PASSWORD habilitado." || echo "[init] Error habilitando UPDATE_PASSWORD"

echo "================================================"
echo "[init] Keycloak inicializado correctamente"
echo "[init] Usuario ADMIN: admin | Password: admin"
echo "[init] Usuario OPERADOR: operador | Password: operador123"
echo "================================================"
