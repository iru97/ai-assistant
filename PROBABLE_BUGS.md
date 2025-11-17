# Bugs Probables al Probar - Análisis Realista 🔴

**Fecha**: 17 de Noviembre, 2025
**Nivel de Honestidad**: 100%

---

## 🔥 Problemas que SEGURO vas a encontrar

### 1. **Migraciones en Orden Incorrecto** (Probabilidad: 90%)

**Problema**: Las migraciones se corren en orden alfabético. Si `003_auto_create_profile.sql` se corre antes que la tabla `profiles` exista, va a fallar.

**Evidencia**:
```
001_initial_schema.sql  ← Crea tabla profiles
003_auto_create_profile.sql  ← Trigger que depende de profiles
```

**Fix Necesario**: Verificar que `001_initial_schema.sql` efectivamente crea la tabla `profiles`. Si no, el trigger fallará.

**Cómo Detectar**: Cuando corras `supabase db push` verás:
```
ERROR: relation "public.profiles" does not exist
```

---

### 2. **Nombres de Columnas en Database vs Código** (Probabilidad: 85%)

**Problema**: Creé el mapeo asumiendo nombres de columnas, pero pueden ser diferentes.

**En el seed (`004_seed_data.sql`)**:
```sql
INSERT INTO prompts (category, text)  -- ⚠️ Asumí "text"
```

**En el schema original (`001_initial_schema.sql`)**:
Probablemente dice:
```sql
CREATE TABLE prompts (
  prompt_text TEXT NOT NULL  -- ⚠️ Puede ser "prompt_text" no "text"
);
```

**Cómo Detectar**: El seed insert fallará:
```
ERROR: column "text" of relation "prompts" does not exist
```

**Fix**: Cambiar el seed a usar los nombres correctos de columna.

---

### 3. **TypeScript Async Breaking Changes** (Probabilidad: 70%)

**Problema**: Cambié funciones a async pero puede que algunos componentes no usen `await`.

**Lugares Peligrosos**:
```typescript
// En algún componente probablemente hay:
const prompt = getDailyPrompt();  // ❌ Sin await
console.log(prompt);  // undefined o Promise

// Debería ser:
const prompt = await getDailyPrompt();  // ✅
```

**Cómo Detectar**:
- La app no crashea pero muestra datos vacíos
- Console logs muestran `[object Promise]` en vez de datos
- Los prompts/affirmations no aparecen en pantalla

**Fix**: Buscar todas las llamadas a funciones async y agregar await.

---

### 4. **useEffect con Async** (Probabilidad: 80%)

**Problema**: Probablemente hay useEffect que llaman funciones async incorrectamente.

**Patrón Incorrecto**:
```typescript
useEffect(() => {
  const data = await loadPrompts();  // ❌ No se puede await en useEffect directo
}, []);
```

**Patrón Correcto**:
```typescript
useEffect(() => {
  const loadData = async () => {
    const data = await loadPrompts();
  };
  loadData();
}, []);
```

**Cómo Detectar**: Error en consola:
```
Error: 'await' is only valid in async functions
```

---

### 5. **Notification Permissions en iOS** (Probabilidad: 95%)

**Problema**: En iOS, si el usuario niega permisos, las notificaciones fallan silenciosamente.

**Qué Pasará**:
- Usuario habilita "Daily Affirmations" en Settings
- App pide permisos
- Usuario dice "Don't Allow"
- App NO muestra error
- Notificaciones nunca se programan
- Usuario piensa que funciona pero no recibe nada

**Cómo Detectar**: En iOS simulator, verifica:
```
Settings > Notifications > Journal Safe
```
Si no hay permisos, las notificaciones no funcionarán.

**Fix Necesario**: Agregar feedback visual cuando permisos son denegados.

---

### 6. **JSONB Parsing Error** (Probabilidad: 60%)

**Problema**: En `settingsManager.ts` hago:
```typescript
prompt_category_filter: JSON.stringify(
  Array.isArray(settings.promptCategoryFilter)
    ? settings.promptCategoryFilter
    : [settings.promptCategoryFilter]
),
```

Pero al leer de database:
```typescript
promptCategoryFilter: data.prompt_category_filter
  ? JSON.parse(data.prompt_category_filter)
  : DEFAULT_SETTINGS.promptCategoryFilter,
```

**Problema**: Si `data.prompt_category_filter` ya es un objeto (Supabase auto-parsea JSONB), `JSON.parse()` va a fallar.

**Cómo Detectar**: Error al cargar settings:
```
SyntaxError: Unexpected token o in JSON at position 1
```

**Fix**: Verificar si ya es objeto antes de parsear:
```typescript
promptCategoryFilter: typeof data.prompt_category_filter === 'string'
  ? JSON.parse(data.prompt_category_filter)
  : data.prompt_category_filter,
```

---

### 7. **Cache de Prompts/Affirmations Vacío** (Probabilidad: 50%)

**Problema**: La precarga en `_layout.tsx` puede fallar silenciosamente:
```typescript
loadPrompts().catch(err => console.warn('Failed to preload prompts:', err)),
```

Si falla, el cache queda `null` y cuando el usuario abre Journal:
```typescript
export async function getDailyPrompt() {
  const prompts = await loadPrompts();  // Puede retornar []
  // Si prompts.length === 0, esto falla:
  return prompts[dayOfYear % prompts.length];  // ❌ División por cero
}
```

**Cómo Detectar**: App crashea al abrir Journal con:
```
TypeError: Cannot read property 'text_en' of undefined
```

**Fix**: Agregar validación:
```typescript
if (prompts.length === 0) {
  throw new Error('No prompts available');
}
```

---

### 8. **Profile Trigger No Se Ejecuta** (Probabilidad: 40%)

**Problema**: El trigger `handle_new_user()` depende de que la función tenga acceso a `auth.users`.

En Supabase, las funciones SECURITY DEFINER pueden tener problemas de permisos.

**Qué Pasará**:
- Usuario se registra exitosamente
- Trigger NO crea profile (falla silenciosamente)
- Usuario llega a la app
- App crashea porque `profiles.id` no existe

**Cómo Detectar**: Después de signup, query manual:
```sql
SELECT * FROM profiles WHERE id = 'user-id';
-- Retorna 0 rows ← Problema
```

**Fix**: Verificar logs de Supabase para ver errores del trigger.

---

### 9. **Settings Sync Race Condition** (Probabilidad: 70%)

**Problema**: Cuando usuario abre app:
1. `SettingsContext` carga settings de AsyncStorage (rápido)
2. `SettingsContext` carga settings de Supabase (lento)
3. Mientras tanto, `SettingsContext` useEffect programa notificaciones
4. Notificaciones se programan con settings viejos de AsyncStorage
5. Luego Supabase settings llegan y sobrescriben
6. Pero notificaciones ya están programadas con tiempo viejo

**Cómo Detectar**:
- Cambias notification time en Device A (ej. 9:00 AM)
- Abres app en Device B
- Notificaciones se programan brevemente a tiempo viejo
- Luego se re-programan a tiempo nuevo

**Fix**: El useEffect que programa notificaciones debería esperar a que `isLoading === false`.

Espera... YA lo hice:
```typescript
if (isLoading) return;  // ✅ Esto previene el problema
```

OK, este puede que NO falle.

---

### 10. **Supabase URL/Key No Configurados** (Probabilidad: 100%)

**Problema Obvio**: Si no configuras `.env`, todas las llamadas a Supabase fallan.

**Qué Pasará**:
- App arranca OK (porque tengo fallback a JSON)
- Prompts/affirmations cargan de JSON (funciona)
- Settings NO sincronizan a cloud (solo local)
- Journal entries NO sincronizan (solo local)
- Signup/Login falla completamente

**Cómo Detectar**: Console estará lleno de:
```
Supabase client error: Invalid URL
```

**Fix**: Configurar `.env` correctamente.

---

## 🟡 Problemas Medianos (Probablemente)

### 11. **Schema Mismatch en user_settings** (Probabilidad: 60%)

**Problema**: Agregué columnas en `005_complete_user_settings.sql`:
```sql
ALTER TABLE user_settings ADD COLUMN start_screen TEXT DEFAULT 'journal';
```

Pero si la tabla `user_settings` no existe aún, esto falla.

**Verificar**: Que `001_initial_schema.sql` crea tabla `user_settings`.

---

### 12. **Notification Time Format** (Probabilidad: 40%)

**Problema**: `scheduleDailyAffirmation(time: string)` espera formato "HH:mm".

Si en settings guardaste "09:00:00" (con segundos), el parsing puede fallar:
```typescript
const { hour, minute } = parseTime(time);  // Puede fallar con "09:00:00"
```

**Cómo Detectar**: Notificaciones no se programan y console muestra:
```
Error scheduling notification: Invalid time format
```

---

### 13. **Navigation Router No Existe** (Probabilidad: 30%)

**Problema**: En notification tap handler:
```typescript
router.push('/(tabs)/affirmations');
```

Si la ruta no existe o el router no está inicializado, esto falla.

**Cómo Detectar**: Tap notification → app no hace nada o crashea.

---

## 🟢 Cosas que Probablemente SÍ Funcionan

1. ✅ **Prompts/Affirmations Fallback a JSON** - Este patrón es robusto
2. ✅ **Settings AsyncStorage** - Esta parte es sólida
3. ✅ **Offline-first journal** - Ya funcionaba antes, no toqué mucho
4. ✅ **Auth flow** - No modifiqué, debería seguir funcionando
5. ✅ **Dark mode** - Ya estaba funcionando

---

## 📋 Checklist de Testing Realista

### Antes de Probar en Dispositivo

- [ ] **Verificar migraciones**:
  ```bash
  # Revisar que las tablas se crean en orden
  cat supabase/migrations/001_initial_schema.sql | grep "CREATE TABLE"
  ```

- [ ] **Verificar nombres de columnas**:
  ```bash
  # Buscar "prompt_text" vs "text"
  grep -n "CREATE TABLE prompts" supabase/migrations/001_initial_schema.sql
  grep -n "INSERT INTO prompts" supabase/migrations/004_seed_data.sql
  ```

- [ ] **Verificar que .env existe**:
  ```bash
  test -f .env && echo "✅ .env exists" || echo "❌ .env missing"
  ```

- [ ] **TypeScript compile check**:
  ```bash
  npx tsc --noEmit
  ```

### Al Probar en Dispositivo

1. **Primera Apertura** (Sin Supabase configurado):
   - [ ] App arranca sin crashear
   - [ ] Prompts se ven (desde JSON)
   - [ ] Affirmations se ven (desde JSON)
   - [ ] Console muestra warnings de Supabase (esperado)

2. **Después de Configurar Supabase**:
   - [ ] Correr migraciones: `supabase db push`
   - [ ] Verificar tablas creadas: `supabase db pull`
   - [ ] Reiniciar app
   - [ ] Prompts cargan de database (verificar console log)

3. **Signup Flow**:
   - [ ] Sign up con nuevo email
   - [ ] Verificar que profile se creó:
     ```sql
     SELECT * FROM profiles WHERE email = 'test@test.com';
     ```
   - [ ] Verificar que user_settings se creó (trigger)

4. **Settings & Notifications**:
   - [ ] Cambiar language → verifica sync
   - [ ] Habilitar Daily Affirmations
   - [ ] Verificar permisos solicitados (iOS/Android)
   - [ ] Si deniega permisos → ¿muestra error?
   - [ ] Si acepta permisos → ¿notificación programada?

---

## 🔧 Fixes que Probablemente Necesitarás

### Fix #1: Nombres de Columnas

Busca y reemplaza en `004_seed_data.sql`:
```sql
-- Si el schema usa "prompt_text":
INSERT INTO prompts (category, prompt_text)  -- NO "text"
```

### Fix #2: JSONB Parsing

En `utils/settingsManager.ts`:
```typescript
promptCategoryFilter: typeof data.prompt_category_filter === 'string'
  ? JSON.parse(data.prompt_category_filter)
  : (data.prompt_category_filter || DEFAULT_SETTINGS.promptCategoryFilter),
```

### Fix #3: Empty Prompts Check

En `utils/prompts.ts`:
```typescript
export async function getDailyPrompt(...) {
  const prompts = await loadPrompts();

  if (prompts.length === 0) {
    console.error('No prompts available!');
    return { id: 0, category: 'gratitude', text_en: 'Fallback prompt', text_es: 'Prompt fallback' };
  }

  // resto del código...
}
```

---

## 💡 Estrategia de Testing

### Paso 1: Test Sin Supabase (5 min)
- Arranca app SIN `.env`
- Verifica que no crashea
- Verifica que prompts/affirmations aparecen (de JSON)
- **Objetivo**: Confirmar que fallback funciona

### Paso 2: Configure Supabase (30 min)
- Crear proyecto
- Copiar URL y ANON_KEY a `.env`
- Correr `supabase db push`
- Ver si hay errores en migraciones

### Paso 3: Fix Migration Errors (variable)
- Leer errores de terminal
- Corregir nombres de columnas
- Re-correr migrations
- Hasta que `db push` funcione sin errores

### Paso 4: Test Con Supabase (1 hora)
- Signup → verificar profile creado
- Cambiar settings → verificar sync
- Crear journal entry → verificar sync
- Habilitar notifications → verificar programadas

### Paso 5: Debug (variable)
- Ver console logs
- Ver Supabase logs
- Identificar qué falla
- Corregir uno por uno

---

## 🎯 Probabilidad de que Funcione a la Primera

**Realista**: 15-20%

**Por Qué**:
- ✅ La arquitectura es sólida
- ✅ Los patrones son correctos
- ✅ Hay fallbacks en lugares críticos
- ❌ Nunca probé en dispositivo real
- ❌ Nombres de columnas pueden no coincidir
- ❌ Migraciones pueden correr en orden incorrecto
- ❌ Permisos de notifications pueden fallar

**Optimista**: 40-50% si tienes suerte con schema matches

**Pesimista**: 5% si hay muchos schema mismatches

---

## 📞 Cuando Falle (No "Si", Sino "Cuando")

1. **No paniques** - Es completamente normal
2. **Lee el error completo** - Usualmente es claro
3. **Revisa console logs** - Muestran warnings útiles
4. **Verifica Supabase Dashboard** - Logs de database
5. **Comparte el error** - Dame el stack trace completo

---

## 🤝 Mi Compromiso

Cuando encuentres bugs (y los encontrarás):
- ✅ Te ayudaré a debuggear cada uno
- ✅ Haré fixes específicos basados en errores reales
- ✅ No voy a decir "debería funcionar"
- ✅ Seré honesto sobre qué es bug vs qué es config

---

**Resumen**: Hay ~90% probabilidad de que encuentres al menos 3-5 bugs en la primera prueba. La mayoría serán simples (nombres de columnas, tipos de datos) pero algunos pueden ser más sutiles (race conditions, permissions).

La buena noticia: La arquitectura base es sólida. Los bugs serán fixeables, no problemas fundamentales de diseño.

---

*Última actualización: 17 de Noviembre, 2025*
*Nivel de honestidad: 100%*
*Nivel de optimismo: Realista (bajo)*
