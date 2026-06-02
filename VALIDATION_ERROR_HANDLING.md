# Manejo de Errores de Validación - Registro de Usuarios

## ✅ Cambios Realizados

### Backend (micro-usuarios)

#### 1. **Nueva Excepción** - `CedulaAlreadyExistsException.java`
```java
public class CedulaAlreadyExistsException extends RuntimeException {
    public CedulaAlreadyExistsException(String message) {
        super(message);
    }
}
```

#### 2. **Actualización del Repositorio** - `UsuarioRepository.java`
Agregado método para buscar usuarios por cédula:
```java
Optional<Usuario> findByCedula(String cedula);
```

#### 3. **Validación en Servicio** - `UsuarioServiceImpl.java`
Agregadas validaciones antes de crear el usuario:
```java
if (usuarioRepository.findByCedula(dto.getCedula()).isPresent()) {
    throw new CedulaAlreadyExistsException("La cédula " + dto.getCedula() + " ya está registrada");
}

if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
    throw new EmailAlreadyExistsException("El email " + dto.getEmail() + " ya está registrado");
}

if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
    throw new UsernameAlreadyExistsException("El username " + dto.getUsername() + " ya existe");
}
```

#### 4. **Manejador de Excepciones** - `GlobalExceptionHandler.java`
Agregado handler para convertir excepciones en respuestas HTTP 400 (Bad Request):
```java
@ExceptionHandler(CedulaAlreadyExistsException.class)
public ResponseEntity<ApiError> handleCedulaExists(
        CedulaAlreadyExistsException ex,
        HttpServletRequest request) {
    // Devuelve error 400 en lugar de 500
}
```

### Frontend (CreateUserDrawer.tsx)

#### **Mejora de Manejo de Errores**
- Extrae tanto el `message` como el `error` (tipo de error) de la respuesta del servidor
- Mapea tipos de error específicos a mensajes amigables para el usuario
- Muestra errores claros en el formulario sin caerse

```typescript
// Mapeo de errores
if (errorType === 'CEDULA_ALREADY_EXISTS') {
    displayMessage = 'Esta cédula ya está registrada.';
} else if (errorType === 'EMAIL_ALREADY_EXISTS') {
    displayMessage = 'Este email ya está registrado.';
} else if (errorType === 'USERNAME_ALREADY_EXISTS') {
    displayMessage = 'Este nombre de usuario ya existe.';
}
```

---

## 🔄 Flujo Actual de Validación

### 1️⃣ Frontend Valida
- Campos obligatorios
- Formato (email, teléfono, etc.)
- Requisitos de contraseña

### 2️⃣ Backend Valida
- **Cédula** única (antes no se validaba)
- **Email** único
- **Username** único
- Municipio existe

### 3️⃣ Respuesta Clara
```json
{
  "status": 400,
  "error": "CEDULA_ALREADY_EXISTS",
  "message": "La cédula 1059236672 ya está registrada",
  "path": "/usuarios/registrar",
  "timestamp": "2026-05-15T14:40:50.131Z"
}
```

### 4️⃣ Usuario Ve Mensaje
El formulario muestra: `"Esta cédula ya está registrada."`

---

## 🎯 Beneficios

✅ **No más errores 500** - Las validaciones devuelven 400 (Bad Request)
✅ **Mensajes claros** - El usuario entiende qué está mal
✅ **Prevención de datos duplicados** - Se valida ANTES de insertar en BD
✅ **Logs para debugging** - Se registran los errores en consola del navegador

---

## 📝 Próximas Mejoras Opcionales

Si quieres mejorar aún más la validación, podrías:

1. **Validación en tiempo real (debounce)**
   - Verificar disponibilidad de email/username mientras escribe

2. **Sugerencias automáticas**
   - Si email existe: "¿Quisiste decir...?"

3. **Validación de cédula**
   - Verificar formato (7-11 dígitos)
   - Validar dígito verificador (si aplica en Colombia)

4. **Campos de ayuda**
   - Mostrar requisitos antes de que falle la validación

---

## 🧪 Cómo Probar

1. Intenta registrar un usuario con cédula `1059236672` (ya existe)
2. Deberías ver mensaje: `"Esta cédula ya está registrada."`
3. En consola (F12): Verás logs con los detalles

---

## 📊 Cambios Resumidos

| Archivo | Cambio | Tipo |
|---------|--------|------|
| `CedulaAlreadyExistsException.java` | ✨ Nuevo | Excepción |
| `UsuarioRepository.java` | 📝 +1 método | Validación BD |
| `UsuarioServiceImpl.java` | 📝 +3 validaciones | Lógica backend |
| `GlobalExceptionHandler.java` | 📝 +1 handler | Error handling |
| `CreateUserDrawer.tsx` | 📝 +20 líneas | Error handling frontend |

