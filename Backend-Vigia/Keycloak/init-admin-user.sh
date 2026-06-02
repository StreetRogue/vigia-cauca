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
    -d "{\"clientId\":\"$CLIENT_ID\",\"enabled\":true,\"publicClient\":false,\"secret\":\"$CLIENT_SECRET\",\"directAccessGrantsEnabled\":true,\"standardFlowEnabled\":true,\"serviceAccountsEnabled\":true,\"clientAuthenticatorType\":\"client-secret\"}"
fi

# Siempre forzar el secret correcto
CLIENT_UUID=$(curl -sf -H "Authorization: Bearer $T" \
  "$KC/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

curl -sf -X PUT "$KC/admin/realms/$REALM/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $T" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$CLIENT_UUID\",\"clientId\":\"$CLIENT_ID\",\"enabled\":true,\"publicClient\":false,\"secret\":\"$CLIENT_SECRET\",\"directAccessGrantsEnabled\":true,\"clientAuthenticatorType\":\"client-secret\"}"
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
create_user "admin" "admin@vigia.gov.co" "admin" "ADMIN"
create_user "operador" "operador@vigia.gov.co" "operador123" "OPERADOR"

echo "================================================"
echo "[init] Keycloak inicializado correctamente"
echo "[init] Usuario ADMIN: admin | Password: admin"
echo "[init] Usuario OPERADOR: operador | Password: operador123"
echo "================================================"
