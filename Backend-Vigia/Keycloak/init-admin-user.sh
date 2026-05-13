#!/bin/sh
set -e

KC="http://keycloak:8080"
REALM="security-realm-dev"
CLIENT_ID="api-gateway"
CLIENT_SECRET="IbFLyi0YoqRirQz1c2Bh5qB16eXh3tKg"

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
for ROLE in admin operador; do
  curl -s -X POST "$KC/admin/realms/$REALM/roles" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$ROLE\"}" > /dev/null 2>&1 || true
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

# ── 6. Usuario admin ───────────────────────────────────────────────────────
USER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$KC/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $T" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"email\":\"admin@vigia.gov.co\",\"firstName\":\"Admin\",\"lastName\":\"Sistema\",\"enabled\":true,\"emailVerified\":true,\"credentials\":[{\"type\":\"password\",\"value\":\"admin\",\"temporary\":false}]}")

if [ "$USER_HTTP" = "201" ]; then
  USER_ID=$(curl -sf -H "Authorization: Bearer $T" \
    "$KC/admin/realms/$REALM/users?username=admin" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  ROLE_ID=$(curl -sf -H "Authorization: Bearer $T" \
    "$KC/admin/realms/$REALM/roles/admin" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  curl -sf -X POST "$KC/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $T" \
    -H "Content-Type: application/json" \
    -d "[{\"id\":\"$ROLE_ID\",\"name\":\"admin\"}]"
  echo "[init] Usuario admin creado y rol asignado."
else
  echo "[init] Usuario admin ya existia (HTTP $USER_HTTP)."
fi

echo "================================================"
echo "[init] Keycloak inicializado correctamente"
echo "[init] Usuario: admin | Password: admin"
echo "================================================"
