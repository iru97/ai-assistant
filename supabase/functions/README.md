# Supabase Edge Functions

## Chat Function

Esta función maneja las peticiones a la API de OpenAI de forma segura, ocultando la API key del cliente.

### Deployment

Para desplegar las Edge Functions a Supabase:

1. Instala Supabase CLI:
```bash
npm install -g supabase
```

2. Login a Supabase:
```bash
supabase login
```

3. Link con tu proyecto:
```bash
supabase link --project-ref your-project-ref
```

4. Configura el secret de OpenAI:
```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

5. Despliega la función:
```bash
supabase functions deploy chat
```

### Testing Locally

Para probar localmente:

```bash
supabase functions serve chat --env-file .env
```

### Endpoint

Una vez desplegada, la función estará disponible en:
```
https://your-project-ref.supabase.co/functions/v1/chat
```

### Request Format

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

### Headers Required

- `Authorization`: Bearer token del usuario autenticado
- `Content-Type`: application/json
