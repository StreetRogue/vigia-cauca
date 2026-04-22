-- Departamento Popayán (19001) - 1 ADMIN + 1 OPERADOR
INSERT INTO usuarios (id_usuario, cedula, nombre, telefono, email, id_municipio, username, rol, estado, fecha_creacion, creado_por)
VALUES
    (gen_random_uuid(), '10000001', 'Admin Popayán',    '3001000001', 'admin.popayan@test.com',    19001, 'admin.popayan',    'ADMIN',    'ACTIVO', NOW(), 'system'),
    (gen_random_uuid(), '10000002', 'Operador Popayán', '3001000002', 'operador.popayan@test.com', 19001, 'oper.popayan',     'OPERADOR', 'ACTIVO', NOW(), 'system'),

-- Santander de Quilichao (19698)
    (gen_random_uuid(), '10000003', 'Admin Quilichao',    '3001000003', 'admin.quilichao@test.com',    19698, 'admin.quilichao',  'ADMIN',    'ACTIVO', NOW(), 'system'),
    (gen_random_uuid(), '10000004', 'Operador Quilichao', '3001000004', 'operador.quilichao@test.com', 19698, 'oper.quilichao',   'OPERADOR', 'ACTIVO', NOW(), 'system'),

-- Puerto Tejada (19573)
    (gen_random_uuid(), '10000005', 'Admin Pto Tejada',    '3001000005', 'admin.ptejada@test.com',    19573, 'admin.ptejada',    'ADMIN',    'ACTIVO', NOW(), 'system'),
    (gen_random_uuid(), '10000006', 'Operador Pto Tejada', '3001000006', 'operador.ptejada@test.com', 19573, 'oper.ptejada',     'OPERADOR', 'ACTIVO', NOW(), 'system'),

-- Usuario INACTIVO para probar ese estado
    (gen_random_uuid(), '10000007', 'Usuario Inactivo', '3001000007', 'inactivo@test.com', 19001, 'usuario.inactivo', 'OPERADOR', 'INACTIVO', NOW(), 'system')

ON CONFLICT (cedula) DO NOTHING;