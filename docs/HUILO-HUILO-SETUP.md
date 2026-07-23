# Setup: Huilo Huilo Hoteles Portal

## Objetivo
Cuando `huilohuilo@seguria.tech` se loguea en SegurIA, debe llegar al portal cliente (`/app`) con acceso a datos específicos de Huilo Huilo Hoteles.

## Pasos de Setup (en Supabase SQL Editor)

### PASO 1: Ejecutar SQL de Infraestructura
Ve a Supabase Dashboard → SQL Editor → copia y ejecuta esto:

```sql
-- Crear tabla de operaciones
CREATE TABLE IF NOT EXISTS public.operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text,
  status text DEFAULT 'active',
  image_url text,
  description text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Crear tabla de relación user-operation
CREATE TABLE IF NOT EXISTS public.user_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  operation_id uuid NOT NULL REFERENCES public.operations ON DELETE CASCADE,
  role text DEFAULT 'operator',
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, operation_id)
);

-- Insertar Huilo Huilo
INSERT INTO public.operations (id, name, type, location, status, description)
VALUES (
  'f0d84e4f-8c8f-4e8c-9e8c-huilo001',
  'Huilo Huilo Hoteles',
  'hotel',
  'Región del Bio-Bío, Chile',
  'active',
  'Red de hoteles boutique con enfoque en sostenibilidad'
)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read operations they belong to" ON public.operations
  FOR SELECT USING (id IN (
    SELECT operation_id FROM public.user_operations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can read their operation links" ON public.user_operations
  FOR SELECT USING (user_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_operations_user_id ON public.user_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_operations_operation_id ON public.user_operations(operation_id);
```

### PASO 2: Obtener ID del Usuario
En Supabase SQL Editor, ejecuta:

```sql
SELECT id FROM auth.users WHERE email = 'huilohuilo@seguria.tech';
```

Copia el UUID que devuelve (ej: `6e76e857-11c4-4eb0-a868-77cd5ad016e4`)

### PASO 3: Asociar Usuario a Huilo Huilo
Reemplaza `USER_ID` con el UUID del Paso 2 y ejecuta:

```sql
-- Asociar usuario a operación Huilo Huilo
INSERT INTO public.user_operations (user_id, operation_id, role)
VALUES ('USER_ID', 'f0d84e4f-8c8f-4e8c-9e8c-huilo001', 'owner');

-- Actualizar rol a 'client'
UPDATE public.users SET role = 'client' WHERE email = 'huilohuilo@seguria.tech';
```

### PASO 4: Verificar
Ejecuta esto para confirmar:

```sql
SELECT u.email, u.role, uo.role as operation_role, o.name
FROM public.users u
LEFT JOIN public.user_operations uo ON u.id = uo.user_id
LEFT JOIN public.operations o ON uo.operation_id = o.id
WHERE u.email = 'huilohuilo@seguria.tech';
```

Deberías ver:
- email: `huilohuilo@seguria.tech`
- role: `client`
- operation_role: `owner`
- name: `Huilo Huilo Hoteles`

## Resultado Final
Cuando `huilohuilo@seguria.tech` se loguea:
1. ✅ Entra en `/login` con email y password
2. ✅ API de login valida credenciales en Supabase Auth
3. ✅ Crea sesión con `role: 'client'`
4. ✅ Redirige a `/app` (portal cliente)
5. ✅ Ve solo datos de **Huilo Huilo Hoteles**

## URLs
- Login: https://seguria.tech/login
- Portal (después de login): https://seguria.tech/app
- Credenciales: `huilohuilo@seguria.tech` / `seguria2026`
