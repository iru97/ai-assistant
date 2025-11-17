# Guía de Deployment

## Cambios de Seguridad Importantes

Este proyecto ha sido actualizado para **NO exponer la API key de OpenAI** en el cliente. Ahora utiliza **Supabase Edge Functions** como backend serverless para proteger la API key.

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` y configura:
- `EXPO_PUBLIC_SUPABASE_URL`: URL de tu proyecto en Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Anon key de tu proyecto en Supabase

**IMPORTANTE:** NO incluyas `EXPO_PUBLIC_OPENAI_API_KEY` en tu archivo `.env`. Esta key solo debe estar en Supabase como secret.

### 3. Desplegar Supabase Edge Function

#### Instalar Supabase CLI

```bash
npm install -g supabase
```

#### Login y Link del proyecto

```bash
supabase login
supabase link --project-ref your-project-ref
```

Puedes obtener tu `project-ref` desde el dashboard de Supabase en la URL o en Project Settings.

#### Configurar el Secret de OpenAI

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here
```

Este comando almacena tu API key de forma segura en Supabase. Nunca será expuesta al cliente.

#### Desplegar la función

```bash
supabase functions deploy chat
```

### 4. Verificar el deployment

La función debería estar disponible en:
```
https://your-project-ref.supabase.co/functions/v1/chat
```

Puedes probarla con:
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/chat \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

## Ejecutar el Proyecto

### Development

```bash
npm start
```

Luego escanea el QR code con Expo Go en tu dispositivo móvil.

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Web

```bash
npm run web
```

## Testing de Edge Functions Localmente

Para probar las Edge Functions localmente antes de desplegar:

```bash
# Crear archivo .env en supabase/functions/chat/
echo "OPENAI_API_KEY=your-key" > supabase/functions/chat/.env

# Ejecutar localmente
supabase functions serve chat --env-file supabase/functions/chat/.env
```

La función estará disponible en `http://localhost:54321/functions/v1/chat`

## Arquitectura de Seguridad

### Antes (Inseguro ❌)
```
Mobile App → OpenAI API
          (API key expuesta en el cliente)
```

### Ahora (Seguro ✅)
```
Mobile App → Supabase Edge Function → OpenAI API
          (autenticado)        (API key en servidor)
```

**Beneficios:**
- ✅ API key de OpenAI nunca se expone al cliente
- ✅ Autenticación de usuario requerida para usar el chat
- ✅ Control de rate limiting y costos en el backend
- ✅ Posibilidad de agregar logging y analytics
- ✅ Posibilidad de cambiar el modelo o proveedor sin actualizar la app

## Troubleshooting

### Error: "Unauthorized"
- Verifica que el usuario esté autenticado
- Revisa que el token de sesión sea válido

### Error: "Service configuration error"
- Verifica que hayas configurado el secret OPENAI_API_KEY en Supabase
- Usa: `supabase secrets list` para verificar

### Error: "Failed to generate response"
- Verifica que tu cuenta de OpenAI tenga créditos
- Revisa los logs de la función: `supabase functions logs chat`

### Error al desplegar la función
- Asegúrate de tener la última versión de Supabase CLI: `npm install -g supabase@latest`
- Verifica que estés linkeado al proyecto correcto: `supabase projects list`

## Comandos Útiles

```bash
# Ver logs de la función
supabase functions logs chat

# Listar secrets configurados
supabase secrets list

# Eliminar un secret
supabase secrets unset OPENAI_API_KEY

# Ver el estado del proyecto
supabase status
```

## Migraciones Futuras

Si decides migrar de OpenAI a otro proveedor (Claude, Gemini, etc.), solo necesitas:
1. Actualizar la Edge Function
2. Desplegar los cambios
3. No necesitas actualizar la app móvil

Esto es una gran ventaja de tener el backend separado.
