# Guía de Testing en Dispositivo Real 📱

**Última actualización**: 17 de Noviembre, 2025
**Bugs críticos fixeados**: 2/2 ✅
**Estado del código**: Listo para testing

---

## ✅ Bugs Críticos Ya Fixeados

Antes de probar, estos bugs **YA están fixeados**:

1. ✅ **UUID vs number** - Todos los IDs ahora usan string (UUID)
2. ✅ **Infinite recursion** - Protegido contra datos vacíos
3. ✅ **Column names** - prompt_text y affirmation_text mapeados correctamente

---

## 📋 Pre-Requisitos

### Software Necesario

```bash
# 1. Node.js y npm (ya deberías tenerlos)
node --version  # v18+ recomendado
npm --version   # v9+ recomendado

# 2. Expo CLI global (si no lo tienes)
npm install -g expo-cli

# 3. EAS CLI para builds
npm install -g eas-cli

# 4. Supabase CLI (para migraciones)
npm install -g supabase
```

### En tu Dispositivo

**iOS**:
- Descargar "Expo Go" de App Store
- iOS 13.0 o superior

**Android**:
- Descargar "Expo Go" de Google Play Store
- Android 5.0 o superior

---

## 🚀 Paso 1: Setup Inicial (Sin Supabase)

Este paso verifica que el código funciona con el fallback a JSON (sin base de datos).

### 1.1 Instalar Dependencias

```bash
cd /home/user/ai-assistant

# Instalar todas las dependencias
npm install

# Si hay errores de peer dependencies:
npm install --legacy-peer-deps
```

### 1.2 Verificar que NO hay .env

```bash
# Asegúrate que .env NO existe (para forzar JSON fallback)
test -f .env && mv .env .env.backup || echo "No .env file - OK"
```

### 1.3 Iniciar Metro Bundler

```bash
# Opción A: Modo normal
npx expo start

# Opción B: Limpiar cache si hay problemas
npx expo start --clear

# Opción C: Modo tunnel (si estás en red diferente)
npx expo start --tunnel
```

**Deberías ver**:
```
› Metro waiting on exp://192.168.X.X:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 1.4 Conectar desde tu Dispositivo

**iOS**:
1. Abre la app "Cámara" nativa
2. Apunta al código QR en la terminal
3. Tap la notificación "Abrir en Expo Go"

**Android**:
1. Abre la app "Expo Go"
2. Tap "Scan QR code"
3. Escanea el código QR

### 1.5 Test Sin Supabase (5 minutos)

Cuando la app arranque, verifica:

- [ ] App arranca sin crashear
- [ ] Ves la pantalla de Login
- [ ] Console muestra warnings de Supabase (esperado):
  ```
  Failed to load prompts from Supabase, using JSON fallback
  Failed to load affirmations from Supabase, using JSON fallback
  ```
- [ ] Puedes ver prompts en Journal (de JSON)
- [ ] Puedes ver affirmations (de JSON)

**Si algo falla aquí**: El problema es el código React Native, NO Supabase.

---

## 🔧 Paso 2: Configurar Supabase

Ahora vamos a conectar a la base de datos real.

### 2.1 Crear Proyecto Supabase

1. Ve a https://supabase.com
2. Click "New Project"
3. Rellena:
   - Name: `journal-safe-mvp`
   - Database Password: **GUARDA ESTO** (generado automáticamente es más seguro)
   - Region: Elige el más cercano a ti
4. Click "Create new project"
5. **Espera 2-3 minutos** mientras se crea

### 2.2 Obtener Credenciales

En el dashboard de Supabase:

1. Click "Settings" (⚙️) en sidebar
2. Click "API"
3. **Copia estos valores**:
   - `Project URL`: `https://xxxxx.supabase.co`
   - `anon public`: `eyJhbGc...` (token largo)

### 2.3 Crear archivo .env

```bash
cd /home/user/ai-assistant

# Crear .env con tus credenciales
cat > .env << 'EOF'
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...tu-token-aqui...

# Environment
NODE_ENV=development
EOF
```

**IMPORTANTE**: Reemplaza `xxxxx.supabase.co` y el token con tus valores reales.

### 2.4 Inicializar Supabase CLI

```bash
# Link a tu proyecto
supabase link --project-ref xxxxx

# Te pedirá:
# - Database password (la que guardaste arriba)
# - Confirma

# Deberías ver:
# ✔ Linked to project xxxxx
```

### 2.5 Correr Migraciones

```bash
# Aplicar el schema a tu base de datos
supabase db push

# Deberías ver:
# Applying migration 001_initial_schema.sql...
# Applying migration 003_auto_create_profile.sql...
# Applying migration 004_seed_data.sql...
# Applying migration 005_complete_user_settings.sql...
# ✔ Finished supabase db push
```

**Si ves errores aquí**:
```bash
# Ver detalles del error
supabase db push --debug

# Errores comunes:
# - "column already exists" → Ignorar si el schema ya existe
# - "permission denied" → Verificar database password
# - "syntax error" → Contactarme con el error exacto
```

### 2.6 Verificar Schema

```bash
# Ver las tablas creadas
supabase db pull

# Deberías ver archivos en supabase/migrations/
# Si todo está bien, significa que el schema se aplicó correctamente
```

---

## 📱 Paso 3: Test Con Supabase

### 3.1 Reiniciar App

```bash
# En la terminal donde corre Metro:
# Presiona 'r' para reload

# O desde el dispositivo:
# Shake device → "Reload"
```

### 3.2 Checklist de Testing

#### Test 1: Signup (5 min)

- [ ] Abre app
- [ ] Click "Sign Up"
- [ ] Ingresa email: `test@test.com`
- [ ] Ingresa password: `Test123456!`
- [ ] Click "Sign Up"
- [ ] **Espera** email de verificación (puede tardar 1-2 min)
- [ ] Verifica en Supabase Dashboard:
  - Settings → Auth → Users → Deberías ver `test@test.com`
  - Table Editor → profiles → Debería existir 1 row con tu user ID
  - Table Editor → user_settings → Debería existir 1 row con defaults

**Si falla**:
```bash
# Ver logs de Supabase
# Dashboard → Logs → Auth Logs
# Busca errores relacionados con tu email
```

#### Test 2: Prompts desde Database (2 min)

- [ ] Después de login, ve a "Journal"
- [ ] Deberías ver un prompt
- [ ] En Metro console, busca:
  ```
  Preloading prompts and affirmations...
  Prompts and affirmations preloaded successfully
  ```
- [ ] **NO deberías ver**: "using JSON fallback"
- [ ] Click shuffle (icono 🔀)
- [ ] Prompt cambia (confirma que los 100 prompts se cargaron)

**Si ves JSON fallback**:
- Verifica que .env tiene las credenciales correctas
- Verifica que hiciste `supabase db push`
- Verifica en Supabase Dashboard → Table Editor → prompts (debería tener 100 rows)

#### Test 3: Affirmations desde Database (2 min)

- [ ] Ve a tab "Affirmations"
- [ ] Deberías ver una affirmation
- [ ] Click "New Affirmation" (🔄)
- [ ] Affirmation cambia
- [ ] Verifica en Supabase Dashboard → Table Editor → affirmations (50 rows)

#### Test 4: Settings Sync (5 min)

- [ ] Ve a tab "Settings"
- [ ] Cambia Language: "English" → "Español"
- [ ] Cambia Theme: "Light" → "Dark"
- [ ] **Cierra app completamente** (swipe up en iOS, back button en Android)
- [ ] **Reabre app**
- [ ] Settings deberían persistir (Dark theme, Español)
- [ ] Verifica en Supabase Dashboard → Table Editor → user_settings:
  - `language` = 'es'
  - `theme` = 'dark'

#### Test 5: Notifications (Solo si habilitas)

**iOS** (requiere permisos):
- [ ] Settings → "Daily Affirmations" → Enable
- [ ] Deberías ver popup: "Journal Safe would like to send you notifications"
- [ ] Click "Allow"
- [ ] Verifica que en Settings del iOS (fuera de la app):
  - Settings > Notifications > Expo Go > Notifications Allowed
- [ ] **Para probar sin esperar**:
  - En código puedes temporalmente cambiar el tiempo a 1 minuto en el futuro
  - O usa la función `sendTestNotification()` si la expones

**Android** (permisos usualmente auto-granted):
- [ ] Settings → "Daily Affirmations" → Enable
- [ ] Verifica en Metro console:
  ```
  Scheduling daily affirmation at 08:00
  ```

#### Test 6: Offline Mode (3 min)

- [ ] Con la app abierta, **activa Airplane Mode** en tu dispositivo
- [ ] Ve a Journal → Prompts deberían seguir apareciendo (del cache)
- [ ] Ve a Affirmations → Deberían seguir apareciendo (del cache)
- [ ] **Cierra app**
- [ ] **Abre app de nuevo** (sin internet)
- [ ] Deberías ver mensaje: "Failed to load prompts from Supabase, using JSON fallback"
- [ ] Prompts/affirmations deberían cargar de JSON
- [ ] **Desactiva Airplane Mode**
- [ ] Reload app (shake → reload)
- [ ] Debería volver a cargar de Supabase

---

## 🐛 Problemas Comunes y Soluciones

### Error: "Cannot connect to Metro bundler"

**Causa**: Firewall o red diferente

**Solución**:
```bash
# Opción 1: Usa tunnel
npx expo start --tunnel

# Opción 2: Verifica firewall
# En Linux:
sudo ufw allow 8081/tcp

# En macOS:
# System Preferences → Security → Firewall → Allow Expo
```

### Error: "Network request failed" en Supabase calls

**Causa**: URL o ANON_KEY incorrectos

**Solución**:
```bash
# 1. Verifica .env
cat .env

# 2. Verifica que empiece con EXPO_PUBLIC_
# NO uses REACT_APP_ (eso es para Create React App)

# 3. Reinicia Metro después de cambiar .env
# Ctrl+C → npx expo start --clear
```

### Error: "Column 'prompt_text' does not exist"

**Causa**: Migraciones no se aplicaron correctamente

**Solución**:
```bash
# Reset completo de database (CUIDADO: borra todo)
supabase db reset

# Re-aplicar migraciones
supabase db push

# Verificar schema
supabase db pull
```

### Error: "Permission denied for table prompts"

**Causa**: Row Level Security (RLS) activado pero sin políticas

**Solución**:
```sql
-- En Supabase Dashboard → SQL Editor, corre:

-- Permitir lectura pública de prompts
CREATE POLICY "Allow public read access to prompts"
  ON prompts FOR SELECT
  TO public
  USING (true);

-- Permitir lectura pública de affirmations
CREATE POLICY "Allow public read access to affirmations"
  ON affirmations FOR SELECT
  TO public
  USING (true);
```

### Error: "Profile not found" después de signup

**Causa**: Trigger no se ejecutó

**Solución**:
```bash
# Ver logs de database
# Supabase Dashboard → Logs → Postgres Logs

# Busca errores del trigger handle_new_user()

# Si el trigger no existe:
supabase db push  # Re-aplicar 003_auto_create_profile.sql

# Crear profile manualmente para testing:
# SQL Editor:
INSERT INTO profiles (id, display_name)
VALUES (
  'tu-user-id-aqui',
  'Test User'
);
```

---

## 🔒 Evitar Conflictos de Permisos

### Permiso de Escritura en Proyecto

```bash
# Si ves "Permission denied" al correr npm commands:

# Opción 1: Fix ownership (recomendado)
sudo chown -R $USER:$USER /home/user/ai-assistant

# Opción 2: Usar npm con --unsafe-perm (NO recomendado)
npm install --unsafe-perm

# Verificar permisos
ls -la /home/user/ai-assistant
# Deberías ser owner de todos los archivos
```

### Permiso de Puerto 8081

```bash
# Si dice "Port 8081 already in use":

# Opción 1: Matar proceso existente
lsof -ti:8081 | xargs kill -9

# Opción 2: Usar otro puerto
npx expo start --port 8082

# Opción 3: Encontrar qué está usando el puerto
lsof -i :8081
```

### Permiso de Expo Go en iOS

Si Expo Go no puede abrir la app:

1. iOS Settings → General → Device Management
2. Tap "Expo Inc"
3. Tap "Trust Expo Inc"

### Permiso de ADB en Android

```bash
# Si Android no detecta via USB:

# 1. Habilitar USB Debugging en Android:
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → USB Debugging ON

# 2. Verificar conexión
adb devices
# Deberías ver tu dispositivo

# 3. Si dice "no permissions":
sudo adb kill-server
sudo adb start-server
adb devices
```

---

## 📊 Checklist Final

Antes de considerar testing completo:

### Funcionalidad Básica
- [ ] App arranca sin crashear
- [ ] Signup crea user + profile + settings
- [ ] Login funciona
- [ ] Logout funciona

### Data Loading
- [ ] Prompts cargan de Supabase (100 total)
- [ ] Affirmations cargan de Supabase (50 total)
- [ ] JSON fallback funciona si Supabase falla
- [ ] Cache funciona (no re-fetch constante)

### Settings
- [ ] Los 16 campos sincronizan correctamente
- [ ] Language cambia UI
- [ ] Theme cambia (si está implementado)
- [ ] Settings persisten después de cerrar app

### Offline
- [ ] App funciona sin internet (JSON fallback)
- [ ] Datos en cache disponibles offline
- [ ] Sincroniza cuando vuelve internet

### Notificaciones (Opcional)
- [ ] Permisos se solicitan correctamente
- [ ] Notificaciones se programan
- [ ] Tap notification abre Affirmations screen

---

## 🆘 Si Nada Funciona

### Último Recurso: Reset Completo

```bash
# 1. Limpiar todo el proyecto
rm -rf node_modules
rm -rf .expo
rm package-lock.json

# 2. Re-instalar
npm install

# 3. Reset Supabase (si es necesario)
supabase db reset

# 4. Re-aplicar migraciones
supabase db push

# 5. Limpiar cache y reiniciar
npx expo start --clear
```

### Pedir Ayuda

Si sigues con problemas, provee:

1. **Screenshot del error**
2. **Metro console logs** (últimas 50 líneas)
3. **Supabase logs** (Dashboard → Logs)
4. **Paso exacto donde falla**
5. **Plataforma** (iOS vs Android)
6. **Versión del dispositivo**

---

## 📈 Próximos Pasos Después de Testing

Una vez que el testing básico funcione:

1. **Bug Fixes**: Corregir cualquier bug encontrado
2. **Build para Production**:
   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android
   ```
3. **Beta Testing**: Distribuir a 5-10 usuarios
4. **Monitoring**: Configurar Sentry para error tracking
5. **Performance**: Optimizar tiempos de carga
6. **Legal**: Revisión de Privacy Policy con abogado

---

**Última actualización**: 17 de Noviembre, 2025
**Mantenido por**: Claude (AI Assistant)
**Soporte**: Provee logs y screenshots si encuentras bugs
