-- Usuario admin inicial del sistema
-- IMPORTANTE: cambiar email y cedula antes de desplegar
INSERT INTO usuarios (id_usuario, cedula, nombre, telefono, email, id_municipio, username, rol, estado, fecha_creacion, creado_por)
VALUES (
           gen_random_uuid(),
           '00000001',
           'Administrador Sistema',
           '0000000000',
           'admin@sistema.com',
           19001,
           'admin.sistema',
           'ADMIN',
           'ACTIVO',
           NOW(),
           'system'
       )
ON CONFLICT (cedula) DO NOTHING;