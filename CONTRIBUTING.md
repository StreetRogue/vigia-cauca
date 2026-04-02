# 📖 Guía de Contribución - Vigía Cauca

Gracias por tu interés en contribuir a **Vigía Cauca**. Este documento describe cómo participar en el desarrollo del proyecto.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [¿Cómo Empezar?](#-cómo-empezar)
- [Estándar de Ramas](#-estándar-de-ramas)
- [Estándar de Commits](#-estándar-de-commits)
- [Estándar de Pull Requests](#-estándar-de-pull-requests)
- [Estándar de Código](#-estándar-de-código)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Proceso de Review](#-proceso-de-review)
- [Preguntas?](#-preguntas)

---

## ✨ Código de Conducta

### Nuestro Compromiso

En el interés de fomentar un ambiente abierto y acogedor, nosotros, como colaboradores y mantenedores, nos comprometemos a hacer de la participación en nuestro proyecto y nuestra comunidad una experiencia libre de acoso para todos.

### Nuestros Estándares

Los ejemplos de comportamiento que contribuyen a crear un ambiente positivo incluyen:

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con los puntos de vista y experiencias divergentes
- Aceptar crítica constructiva con elegancia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

Lee el archivo [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) para más detalles.

---

## 🚀 ¿Cómo Empezar?

### 1. Fork el Repositorio
```bash
# Ve a https://github.com/bitnova-unicauca/vigia-cauca y haz click en "Fork"
```

### 2. Clona tu Fork
```bash
git clone https://github.com/TU_USUARIO/vigia-cauca.git
cd vigia-cauca
```

### 3. Agrega el Repositorio Original como Upstream
```bash
git remote add upstream https://github.com/bitnova-unicauca/vigia-cauca.git
```

### 4. Crea una Rama de Desarrollo Local
```bash
git checkout -b tu-rama-de-desarrollo
```

### 5. Instala Dependencias
```bash
cd frontend
npm install
```

### 6. Inicia el Servidor de Desarrollo
```bash
npm run dev
```

---

## 🌿 Estándar de Ramas

Usamos **GitHub Flow** con nomenclatura específica:

### Formato de Rama
```
<tipo>/<identificador>/<descripcion-corta>
```

### Tipos de Rama

| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| `feature` | Nueva funcionalidad | `feature/HE-02/crear-novedad` |
| `bugfix` | Corrección de bug | `bugfix/BUG-123/validacion-fecha` |
| `refactor` | Mejora de código | `refactor/core/simplificar-auth` |
| `docs` | Documentación | `docs/actualizar-readme` |
| `test` | Tests | `test/HE-03/dashboard-filters` |
| `chore` | Mantenimiento | `chore/actualizar-deps` |

### Reglas Importantes

✅ **Haz:**
- Crear rama desde `develop` (o `main` si es hotfix)
- Usar minúsculas
- Usar hifens para separar palabras
- Incluir número de Historia (HE-XX) si aplica

❌ **No hagas:**
- Usar mayúsculas
- Usar espacios o guiones bajos
- Commits directo en `main` o `develop`

### Ejemplo Completo
```bash
# 1. Actualiza develop
git checkout develop
git pull upstream develop

# 2. Crea tu rama
git checkout -b feature/HE-02/crear-novedad

# 3. Haz tu trabajo...

# 4. Push a tu fork
git push origin feature/HE-02/crear-novedad

# 5. Abre PR en GitHub
```

---

## 📝 Estándar de Commits

Usamos **[Conventional Commits](https://www.conventionalcommits.org/es/)** para mantener el historial limpio y generar changelogs automáticos.

### Formato
```
<tipo>(<alcance>): <descripción>

<cuerpo (opcional)>

<pie (opcional)>
```

### Tipos de Commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva característica | `feat(auth): agregar login con JWT` |
| `fix` | Corrección de bug | `fix(novedad): corregir validación de fecha` |
| `docs` | Documentación | `docs: actualizar README con ejemplos` |
| `style` | Formato, sin lógica | `style: aplicar prettier a App.jsx` |
| `refactor` | Código, sin cambios funcionales | `refactor(auth): simplificar flujo de autenticación` |
| `test` | Tests | `test(dashboard): agregar tests de filtros` |
| `chore` | Dependencias, config | `chore: actualizar eslint a v8.0` |
| `perf` | Performance | `perf(dashboard): optimizar cálculo de KPIs` |

### Ejemplo Completo
```bash
# Commit simple
git commit -m "feat(novedad): agregar validación de municipios"

# Commit con descripción detallada
git commit -m "feat(dashboard): implementar filtro por rango de fechas

- Agregar selector de fecha inicio/fin
- Validar que inicio sea anterior a fin
- Actualizar gráficas en tiempo real
- Agregar tests de filtro

Closes #45"
```

### Reglas Importantes

✅ **Haz:**
- Commits pequeños y enfocados
- Descripción clara en presente
- Mencionar issue si cierra: `Closes #123`
- Escribir en español (o inglés, sé consistente)

❌ **No hagas:**
- Commits gigantes con múltiples cambios
- Mensajes vagos: "update stuff"
- Commits sin contexto

---

## 🔄 Estándar de Pull Requests

### Antes de Abrir PR

✅ Verifica que:
- [ ] Tu rama está actualizada con `develop`: `git pull upstream develop`
- [ ] Tests pasan: `npm test`
- [ ] Linting pasa: `npm run lint`
- [ ] Código formateado: `npm run format`
- [ ] Documentación actualizada (si aplica)

### Abriendo el PR

1. **Título claro y corto:**
   ```
   ✅ Bien: feat(HE-02): implementar creación de novedades
   ❌ Mal: updates
   ```

2. **Descripción detallada (usa el template):**
   ```markdown
   ## 📋 Historia de Usuario
   Closes #IssueNumber
   
   ## 🎯 ¿Qué hace este PR?
   Breve descripción de los cambios
   
   ## 🔗 Tipos de cambio
   - [ ] Feature nueva
   - [ ] Bugfix
   - [ ] Refactor
   - [x] Documentación
   
   ## ✅ Checklist
   - [x] Tests escritos y pasando
   - [x] Código lintado
   - [x] Documentación actualizada
   - [x] No hay cambios de breaking
   ```

3. **Asigna labels:**
   - `feature`, `bug`, `documentation`, etc.
   - `atomic-design` (si toca componentes)
   - `hexagonal` (si toca lógica de negocio)
   - `HE-XX` (el épica correspondiente)

4. **Solicita review:**
   - Al menos 1 miembro del equipo
   - Asigna a Juan Esteban Martínez Marín (Web Master)

### Durante el Review

- ✅ Responde a comentarios con PR updates
- ✅ Resuelve conflictos si los hay
- ❌ No hagas force push (a menos que sea pedido)
- ❌ No mergees tu propio PR

### Después de Aprobación

```bash
# Actualiza tu rama
git pull origin develop

# Mergea en GitHub (solo si CI pasa)
# La interfaz de GitHub te dirá si está lista
```

---

## 🎨 Estándar de Código

### JavaScript / React

```javascript
// ✅ Bien
const obtenerUsuarios = async () => {
  try {
    const response = await httpClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// ❌ Mal
const getUsers = async () => {
  const res = await httpClient.get('/users');
  return res.data;
};
```

### Componentes React

```javascript
// ✅ Bien - Atomic Design
import styles from './Button.module.css';

/**
 * Button - Atom
 * Componente reutilizable de botón
 * @param {string} variant - primary, secondary, danger
 * @param {string} size - sm, md, lg
 */
export const Button = ({ children, variant = 'primary', size = 'md', ...props }) => {
  return (
    <button 
      className={`${styles.button} ${styles[`button--${variant}`]}`}
      {...props}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';
```

### Nombres de Variables

```javascript
// ✅ Bien - claro y descriptivo
const usuarioAutenticado = true;
const registrosNovedades = [];
const calcularTasaLetalidadPorMunicipio = () => {};

// ❌ Mal - vago o confuso
const auth = true;
const data = [];
const calc = () => {};
```

### Configuración ESLint y Prettier

El proyecto ya tiene configurado:
- **.eslintrc.cjs** - Reglas de linting
- **.prettierrc.json** - Formato de código

```bash
# Validar código
npm run lint

# Validar y arreglar
npm run lint:fix

# Formatear código
npm run format

# Verificar formato sin cambiar
npm run format:check
```

---

## 🧪 Testing

### Cobertura Mínima

- **Atoms:** 100% cobertura
- **Molecules:** 100% cobertura
- **Organisms:** 80%+ cobertura
- **Casos de uso:** 100% cobertura
- **Utilidades:** 100% cobertura

### Estructura de Tests

```javascript
// src/presentation/atoms/Button/Button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el botón con texto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ejecuta el callback al hacer clic', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('desactiva el botón cuando disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Ejecutar Tests

```bash
# Ejecutar tests una vez
npm test

# Modo watch (re-ejecuta en cambios)
npm run test:watch

# Ver cobertura
npm run test:coverage
```

---

## 📚 Documentación

### Comentarios en Código

```javascript
// ✅ Bien - JSDoc completo
/**
 * Valida que una fecha no sea futura
 * @param {Date} fecha - La fecha a validar
 * @returns {boolean} true si la fecha es válida
 * @throws {Error} Si la fecha es futura
 */
export const validarFechaNoFutura = (fecha) => {
  if (fecha > new Date()) {
    throw new Error('La fecha no puede ser futura');
  }
  return true;
};

// ❌ Mal - Sin contexto
export const validateDate = (date) => {
  if (date > new Date()) throw new Error('invalid date');
  return true;
};
```

### Documentación de Componentes

Cada componente debe tener:
- Descripción breve
- Props documentadas
- Ejemplo de uso (en Storybook, futuro)

```javascript
/**
 * FormField - Molecule
 * Campo de formulario reutilizable que combina Label + Input
 * 
 * @component
 * @example
 * <FormField label="Email" type="email" required />
 * 
 * @param {string} label - Texto de la etiqueta
 * @param {string} type - Tipo de input (text, email, number, etc)
 * @param {boolean} required - Si el campo es obligatorio
 */
export const FormField = ({ label, type = 'text', required = false, ...props }) => {
  // ...
};
```

### Actualizar README

Si tus cambios afectan:
- Instalación → Actualiza sección "Instalación"
- Features → Actualiza sección "Características"
- Scripts → Actualiza tabla de comandos
- Estructura → Actualiza árbol de carpetas

---

## 👀 Proceso de Review

### Responsabilidades del Revisor

- ✅ Verificar que el código cumple estándares
- ✅ Validar que tests cubren los cambios
- ✅ Revisar que documentación está actualizada
- ✅ Checklist antes de aprobar

### Checklist de Review

- [ ] Código limpio y legible
- [ ] Tests pasan y tienen buena cobertura
- [ ] Sin console.log() de debug
- [ ] Commits bien estructurados
- [ ] Documentación actualizada
- [ ] No hay cambios innecesarios
- [ ] Manejo de errores adecuado
- [ ] Sin secretos/credenciales

### Feedback Constructivo

Cuando hagas review, sé respetuoso:

```
✅ Bien:
"Podrías extraer esta lógica a una función separada para mejor reutilización?"

❌ Mal:
"Esto está mal escrito"
```

---

## 🆘 Preguntas?

### Dónde Preguntar

1. **Sobre el proyecto:** Issues en GitHub
2. **Sobre la guía:** Discussions en GitHub
3. **Chat rápido:** Slack del equipo (si estás en BitNova)
4. **Llamadas:** Google Meet (coordina con Ana Sofía)

### Contacto del Equipo

- **Ana Sofía Arango Yanza** (Scrum Master) - Preguntas sobre procesos
- **Juan Esteban Martínez Marín** (Web Master) - Preguntas técnicas
- **Henry Laniado** (Tutor) - Preguntas académicas

---

## 📊 Resumen Rápido

| Actividad | Comando |
|-----------|---------|
| Clonar repo | `git clone https://github.com/bitnova-unicauca/vigia-cauca.git` |
| Instalar deps | `npm install` |
| Ejecutar dev | `npm run dev` |
| Tests | `npm test` |
| Linting | `npm run lint` |
| Formatear | `npm run format` |
| Build | `npm run build` |

---

## 📜 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la licencia MIT del proyecto.

---

<div align="center">

**¡Gracias por contribuir a Vigía Cauca! 🙌**

[⬆ Volver al inicio](#-guía-de-contribución---vigía-cauca)

</div>
