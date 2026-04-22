CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_auth0            VARCHAR(255) UNIQUE,
    cedula              VARCHAR(20)  NOT NULL UNIQUE,
    nombre              VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20)  NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    id_municipio        BIGINT       NOT NULL,
    username            VARCHAR(100) NOT NULL UNIQUE,
    rol                 VARCHAR(20)  NOT NULL,
    estado              VARCHAR(20)  NOT NULL,
    fecha_creacion      TIMESTAMP    NOT NULL,
    fecha_actualizacion TIMESTAMP,
    creado_por          VARCHAR(255) NOT NULL,
    editado_por         VARCHAR(255)
);