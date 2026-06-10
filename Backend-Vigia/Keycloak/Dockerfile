FROM quay.io/keycloak/keycloak:24.0.3

USER root

# Copiar el certificado raíz de Google (GTS Root R1).
# Está incluido en el repo para no depender de DNS/internet durante el build.
COPY gtsr1.pem /tmp/gtsr1.pem

# Importar el cert al cacerts del JDK que viene con Keycloak.
# Soluciona "PKIX path building failed" al enviar correos vía Gmail SMTP.
RUN CACERTS=$(find /opt/keycloak -name "cacerts" 2>/dev/null | head -1); \
    if [ -z "$CACERTS" ]; then \
      CACERTS=$(find / -name "cacerts" 2>/dev/null | head -1); \
    fi && \
    echo "[cert-import] Usando cacerts en: $CACERTS" && \
    keytool -import -trustcacerts -noprompt -alias gtsr1 \
      -file /tmp/gtsr1.pem -keystore "$CACERTS" -storepass changeit && \
    rm /tmp/gtsr1.pem

USER 1000
