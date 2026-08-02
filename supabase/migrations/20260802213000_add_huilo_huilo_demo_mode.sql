create table if not exists public.wildlife_demo_profiles (
  operation_id uuid primary key references public.operations(id) on delete cascade,
  enabled boolean not null default false,
  version text not null default 'huilo-huilo-v1',
  seeded_by_user_id uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.wildlife_demo_profiles enable row level security;
revoke all on public.wildlife_demo_profiles from anon, authenticated;

alter table public.wildlife_cameras add column if not exists is_demo boolean not null default false;
alter table public.wildlife_inference_jobs add column if not exists is_demo boolean not null default false;
alter table public.wildlife_pilot_batches add column if not exists is_demo boolean not null default false;
alter table public.seguria_alerts add column if not exists is_demo boolean not null default false;
alter table public.seguria_alerts add column if not exists operation_id uuid references public.operations(id) on delete set null;
alter table public.wildlife_evaluation_sets add column if not exists is_demo boolean not null default false;
alter table public.wildlife_evaluation_sets add column if not exists operation_id uuid references public.operations(id) on delete set null;
alter table public.wildlife_evaluation_items add column if not exists is_demo boolean not null default false;

create index if not exists wildlife_cameras_demo_operation_idx on public.wildlife_cameras(operation_id, is_demo);
create index if not exists wildlife_jobs_demo_operation_idx on public.wildlife_inference_jobs(operation_id, is_demo);
create index if not exists wildlife_batches_demo_operation_idx on public.wildlife_pilot_batches(operation_id, is_demo);
create index if not exists seguria_alerts_demo_operation_idx on public.seguria_alerts(operation_id, is_demo);
create index if not exists wildlife_evaluation_sets_demo_operation_idx on public.wildlife_evaluation_sets(operation_id, is_demo);

create or replace function public.set_huilo_huilo_demo_mode(
  p_operation_id uuid,
  p_actor_user_id uuid,
  p_enabled boolean
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_operation_name text;
  v_camera_1 uuid;
  v_camera_2 uuid;
  v_camera_3 uuid;
  v_camera_4 uuid;
  v_batch_1 uuid;
  v_batch_2 uuid;
  v_job_1 uuid;
  v_job_2 uuid;
  v_job_3 uuid;
  v_job_4 uuid;
  v_job_5 uuid;
  v_job_6 uuid;
  v_job_7 uuid;
  v_job_8 uuid;
  v_job_9 uuid;
  v_job_10 uuid;
  v_job_11 uuid;
  v_job_12 uuid;
  v_alert_1 uuid;
  v_alert_2 uuid;
  v_alert_3 uuid;
  v_alert_4 uuid;
  v_evaluation_set uuid;
  v_count_cameras integer;
  v_count_jobs integer;
  v_count_batches integer;
  v_count_alerts integer;
  v_count_evaluations integer;
begin
  select name into v_operation_name
  from public.operations
  where id = p_operation_id;

  if v_operation_name is null then
    raise exception 'operation_not_found';
  end if;

  if lower(v_operation_name) not like '%huilo huilo%' then
    raise exception 'demo_not_available_for_operation';
  end if;

  if not exists (
    select 1
    from public.user_operations
    where operation_id = p_operation_id
      and user_id = p_actor_user_id
      and lower(coalesce(role, '')) in ('owner', 'admin')
  ) then
    raise exception 'demo_management_not_allowed';
  end if;

  v_camera_1 := md5(p_operation_id::text || ':demo:camera:1')::uuid;
  v_camera_2 := md5(p_operation_id::text || ':demo:camera:2')::uuid;
  v_camera_3 := md5(p_operation_id::text || ':demo:camera:3')::uuid;
  v_camera_4 := md5(p_operation_id::text || ':demo:camera:4')::uuid;
  v_batch_1 := md5(p_operation_id::text || ':demo:batch:1')::uuid;
  v_batch_2 := md5(p_operation_id::text || ':demo:batch:2')::uuid;
  v_job_1 := md5(p_operation_id::text || ':demo:job:1')::uuid;
  v_job_2 := md5(p_operation_id::text || ':demo:job:2')::uuid;
  v_job_3 := md5(p_operation_id::text || ':demo:job:3')::uuid;
  v_job_4 := md5(p_operation_id::text || ':demo:job:4')::uuid;
  v_job_5 := md5(p_operation_id::text || ':demo:job:5')::uuid;
  v_job_6 := md5(p_operation_id::text || ':demo:job:6')::uuid;
  v_job_7 := md5(p_operation_id::text || ':demo:job:7')::uuid;
  v_job_8 := md5(p_operation_id::text || ':demo:job:8')::uuid;
  v_job_9 := md5(p_operation_id::text || ':demo:job:9')::uuid;
  v_job_10 := md5(p_operation_id::text || ':demo:job:10')::uuid;
  v_job_11 := md5(p_operation_id::text || ':demo:job:11')::uuid;
  v_job_12 := md5(p_operation_id::text || ':demo:job:12')::uuid;
  v_alert_1 := md5(p_operation_id::text || ':demo:alert:1')::uuid;
  v_alert_2 := md5(p_operation_id::text || ':demo:alert:2')::uuid;
  v_alert_3 := md5(p_operation_id::text || ':demo:alert:3')::uuid;
  v_alert_4 := md5(p_operation_id::text || ':demo:alert:4')::uuid;
  v_evaluation_set := md5(p_operation_id::text || ':demo:evaluation:1')::uuid;

  delete from public.wildlife_evaluation_sets where operation_id = p_operation_id and is_demo;
  delete from public.seguria_alerts where operation_id = p_operation_id and is_demo;
  delete from public.wildlife_inference_jobs where operation_id = p_operation_id and is_demo;
  delete from public.wildlife_pilot_batches where operation_id = p_operation_id and is_demo;
  delete from public.wildlife_cameras where operation_id = p_operation_id and is_demo;

  if p_enabled then
    insert into public.wildlife_cameras (
      id, operation_id, organization_id, created_by_user_id, code, name, zone_label,
      latitude, longitude, active, is_demo, created_at, updated_at
    ) values
      (v_camera_1, p_operation_id, null, p_actor_user_id, 'DEMO-HH-01', 'Sendero Huemul', 'Reserva Biologica', -39.93780, -71.90370, true, true, v_now - interval '45 days', v_now),
      (v_camera_2, p_operation_id, null, p_actor_user_id, 'DEMO-HH-02', 'Bosque de los Ciervos', 'Bosque Humedo', -39.92520, -71.89610, true, true, v_now - interval '40 days', v_now),
      (v_camera_3, p_operation_id, null, p_actor_user_id, 'DEMO-HH-03', 'Portal Norte', 'Acceso Norte', -39.86139, -71.90568, false, true, v_now - interval '35 days', v_now),
      (v_camera_4, p_operation_id, null, p_actor_user_id, 'DEMO-HH-04', 'Salto Huilo Huilo', 'Sendero Turistico', -39.85332, -71.95414, true, true, v_now - interval '30 days', v_now);

    insert into public.wildlife_pilot_batches (
      id, operation_id, organization_id, created_by_user_id, camera_id, name, description,
      zone_label, target_image_count, status, started_at, completed_at, is_demo, created_at, updated_at
    ) values
      (v_batch_1, p_operation_id, null, p_actor_user_id, null, 'Piloto de biodiversidad - Semana 1', 'Lote demostrativo para visualizar revision, especies, costos y calidad de evidencia.', 'Reserva Biologica', 20, 'processing', v_now - interval '4 days', null, true, v_now - interval '4 days', v_now),
      (v_batch_2, p_operation_id, null, p_actor_user_id, v_camera_4, 'Control de accesos y fauna', 'Lote demostrativo cerrado con evidencia revisada y eventos operacionales.', 'Sendero Turistico', 10, 'completed', v_now - interval '10 days', v_now - interval '5 days', true, v_now - interval '10 days', v_now - interval '5 days');

    insert into public.wildlife_inference_jobs (
      id, submitted_by_user_id, organization_id, operation_id, pilot_batch_id, camera_id,
      original_filename, mime_type, byte_size, sha256, provider, model_name, status, review_status,
      result_json, error_code, error_message, reviewed_by_user_id, reviewed_at,
      corrected_common_name, corrected_scientific_name, review_notes, zone_label, captured_at,
      prompt_version, pipeline_version, retry_count, latency_ms, estimated_cost_usd,
      processing_started_at, processing_completed_at, is_demo, created_at, updated_at
    ) values
      (v_job_1, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_1,
       'DEMO_HH01_huemul_001.jpg', 'image/jpeg', 2384000, md5(p_operation_id::text || ':job:1:a') || md5(p_operation_id::text || ':job:1:b'), 'openai', 'seguria-demo-v1', 'completed', 'confirmed',
       '{"detections":[{"species":"huemul","confidence":0.96,"model_confidence":0.91,"confidence_source":"verification","description":"Macho adulto de huemul observado en claro de bosque.","box":{"x1":0.22,"y1":0.18,"x2":0.76,"y2":0.91}}],"scene_summary":"Huemul adulto cruzando un claro al amanecer.","limitations":["Registro demostrativo; requiere validacion cientifica en una operacion real."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","cameraMake":"Browning","cameraModel":"Recon Force Elite","issues":[]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '5 hours', null, null, 'Confirmacion demostrativa.', 'Reserva Biologica', v_now - interval '6 hours',
       'demo-v1', 'demo-v1', 0, 2840, 0.0068, v_now - interval '6 hours 1 minute', v_now - interval '6 hours', true, v_now - interval '6 hours', v_now - interval '5 hours'),
      (v_job_2, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_2,
       'DEMO_HH02_pudu_014.jpg', 'image/jpeg', 1842000, md5(p_operation_id::text || ':job:2:a') || md5(p_operation_id::text || ':job:2:b'), 'openai', 'seguria-demo-v1', 'completed', 'pending',
       '{"detections":[{"species":"pudu","confidence":0.88,"model_confidence":0.84,"confidence_source":"model","description":"Pudu parcialmente visible entre helechos.","box":{"x1":0.35,"y1":0.28,"x2":0.71,"y2":0.86}}],"scene_summary":"Registro infrarrojo de pudu en sotobosque denso.","limitations":["Oclusion parcial por vegetacion."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","cameraMake":"Bushnell","cameraModel":"Core DS","issues":["Captura infrarroja nocturna."]}}'::jsonb,
       null, null, null, null, null, null, null, 'Bosque Humedo', v_now - interval '10 hours',
       'demo-v1', 'demo-v1', 0, 3310, 0.0072, v_now - interval '10 hours 1 minute', v_now - interval '10 hours', true, v_now - interval '10 hours', v_now - interval '10 hours'),
      (v_job_3, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_2,
       'DEMO_HH02_guina_021.jpg', 'image/jpeg', 1650000, md5(p_operation_id::text || ':job:3:a') || md5(p_operation_id::text || ':job:3:b'), 'openai', 'seguria-demo-v1', 'completed', 'confirmed',
       '{"detections":[{"species":"guina","confidence":0.83,"model_confidence":0.79,"confidence_source":"verification","description":"Felino pequeno con patron moteado compatible con guina.","box":{"x1":0.41,"y1":0.31,"x2":0.69,"y2":0.78}}],"scene_summary":"Guina desplazandose de noche junto a tronco caido.","limitations":["Iluminacion baja y oclusion parcial."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","cameraMake":"Bushnell","cameraModel":"Core DS","issues":["Imagen oscura.","Sujeto parcialmente ocluido."]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '22 hours', null, null, 'Patron de pelaje revisado.', 'Bosque Humedo', v_now - interval '1 day',
       'demo-v1', 'demo-v1', 0, 3720, 0.0075, v_now - interval '1 day 1 minute', v_now - interval '1 day', true, v_now - interval '1 day', v_now - interval '22 hours'),
      (v_job_4, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_3,
       'DEMO_HH03_zorro_008.jpg', 'image/jpeg', 2050000, md5(p_operation_id::text || ':job:4:a') || md5(p_operation_id::text || ':job:4:b'), 'openai', 'seguria-demo-v1', 'completed', 'corrected',
       '{"detections":[{"species":"fox","confidence":0.76,"model_confidence":0.70,"confidence_source":"human_review","description":"Canido silvestre observado bajo lluvia.","box":{"x1":0.18,"y1":0.25,"x2":0.73,"y2":0.88}}],"scene_summary":"Zorro cruzando camino de servicio durante lluvia moderada.","limitations":["Contraste reducido por lluvia."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":["Lluvia visible sobre el lente."]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '20 hours', 'Zorro culpeo', 'Lycalopex culpaeus', 'Correccion demostrativa de taxonomia.', 'Acceso Norte', v_now - interval '1 day 4 hours',
       'demo-v1', 'demo-v1', 0, 3980, 0.0079, v_now - interval '1 day 4 hours 1 minute', v_now - interval '1 day 4 hours', true, v_now - interval '1 day 4 hours', v_now - interval '20 hours'),
      (v_job_5, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_4,
       'DEMO_HH04_persona_031.jpg', 'image/jpeg', 2180000, md5(p_operation_id::text || ':job:5:a') || md5(p_operation_id::text || ':job:5:b'), 'openai', 'seguria-demo-v1', 'completed', 'pending',
       '{"detections":[{"species":"human","confidence":0.98,"model_confidence":0.98,"confidence_source":"model","description":"Persona detectada fuera del horario operativo.","box":{"x1":0.30,"y1":0.08,"x2":0.58,"y2":0.96}}],"scene_summary":"Persona caminando por sendero cerrado durante horario nocturno.","limitations":["No se realiza identificacion facial."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":[]}}'::jsonb,
       null, null, null, null, null, null, null, 'Sendero Turistico', v_now - interval '2 hours',
       'demo-v1', 'demo-v1', 0, 2410, 0.0064, v_now - interval '2 hours 1 minute', v_now - interval '2 hours', true, v_now - interval '2 hours', v_now - interval '2 hours'),
      (v_job_6, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_1,
       'DEMO_HH01_vacio_044.jpg', 'image/jpeg', 1320000, md5(p_operation_id::text || ':job:6:a') || md5(p_operation_id::text || ':job:6:b'), 'openai', 'seguria-demo-v1', 'completed', 'confirmed',
       '{"detections":[{"species":"empty_frame","confidence":0.99,"model_confidence":0.99,"confidence_source":"model","description":"Sin fauna, personas o vehiculos visibles.","box":{"x1":0,"y1":0,"x2":1,"y2":1}}],"scene_summary":"Cuadro vacio activado por movimiento de vegetacion.","limitations":[],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":["Cuadro sin sujeto relevante."]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '1 day 20 hours', null, null, 'Cuadro vacio confirmado.', 'Reserva Biologica', v_now - interval '2 days',
       'demo-v1', 'demo-v1', 0, 1980, 0.0059, v_now - interval '2 days 1 minute', v_now - interval '2 days', true, v_now - interval '2 days', v_now - interval '1 day 20 hours'),
      (v_job_7, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_2,
       'DEMO_HH02_indeterminado_052.jpg', 'image/jpeg', 980000, md5(p_operation_id::text || ':job:7:a') || md5(p_operation_id::text || ':job:7:b'), 'openai', 'seguria-demo-v1', 'completed', 'unidentifiable',
       '{"detections":[{"species":"unknown_animal","confidence":0.54,"model_confidence":0.54,"confidence_source":"model","description":"Silueta animal sin rasgos suficientes para clasificacion.","box":{"x1":0.49,"y1":0.38,"x2":0.72,"y2":0.76}}],"scene_summary":"Silueta borrosa al fondo del sendero.","limitations":["Desenfoque por movimiento.","Sujeto pequeno y distante."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":["Desenfoque severo."]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '2 days 18 hours', null, null, 'No existen rasgos diagnosticos suficientes.', 'Bosque Humedo', v_now - interval '3 days',
       'demo-v1', 'demo-v1', 0, 4200, 0.0082, v_now - interval '3 days 1 minute', v_now - interval '3 days', true, v_now - interval '3 days', v_now - interval '2 days 18 hours'),
      (v_job_8, p_actor_user_id, null, p_operation_id, v_batch_1, v_camera_2,
       'DEMO_HH02_error_060.jpg', 'image/jpeg', 760000, md5(p_operation_id::text || ':job:8:a') || md5(p_operation_id::text || ':job:8:b'), 'openai', 'seguria-demo-v1', 'failed', 'pending',
       null, 'provider_timeout', 'El proveedor no respondio dentro del tiempo esperado.', null, null, null, null, null, 'Bosque Humedo', v_now - interval '4 days',
       'demo-v1', 'demo-v1', 1, 30000, 0, v_now - interval '4 days 1 minute', v_now - interval '4 days', true, v_now - interval '4 days', v_now - interval '4 days'),
      (v_job_9, p_actor_user_id, null, p_operation_id, v_batch_2, v_camera_1,
       'DEMO_HH01_huemul_071.jpg', 'image/jpeg', 2540000, md5(p_operation_id::text || ':job:9:a') || md5(p_operation_id::text || ':job:9:b'), 'openai', 'seguria-demo-v1', 'completed', 'confirmed',
       '{"detections":[{"species":"huemul","confidence":0.91,"model_confidence":0.88,"confidence_source":"verification","description":"Hembra adulta de huemul en borde de bosque.","box":{"x1":0.25,"y1":0.16,"x2":0.72,"y2":0.92}}],"scene_summary":"Huemul observado con nieve ligera en el entorno.","limitations":["Nieve parcial reduce contraste en extremidades."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":["Nieve en la escena."]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '6 days 20 hours', null, null, 'Registro prioritario confirmado.', 'Reserva Biologica', v_now - interval '7 days',
       'demo-v1', 'demo-v1', 0, 3150, 0.0071, v_now - interval '7 days 1 minute', v_now - interval '7 days', true, v_now - interval '7 days', v_now - interval '6 days 20 hours'),
      (v_job_10, p_actor_user_id, null, p_operation_id, v_batch_2, v_camera_4,
       'DEMO_HH04_perro_078.jpg', 'image/jpeg', 1960000, md5(p_operation_id::text || ':job:10:a') || md5(p_operation_id::text || ':job:10:b'), 'openai', 'seguria-demo-v1', 'completed', 'rejected',
       '{"detections":[{"species":"dog","confidence":0.86,"model_confidence":0.86,"confidence_source":"model","description":"Canino domestico en sendero de conservacion.","box":{"x1":0.19,"y1":0.25,"x2":0.77,"y2":0.90}}],"scene_summary":"Perro sin correa en sendero cercano al area protegida.","limitations":[],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":[]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '7 days 18 hours', null, null, 'Descartado como registro de fauna silvestre.', 'Sendero Turistico', v_now - interval '8 days',
       'demo-v1', 'demo-v1', 0, 2670, 0.0066, v_now - interval '8 days 1 minute', v_now - interval '8 days', true, v_now - interval '8 days', v_now - interval '7 days 18 hours'),
      (v_job_11, p_actor_user_id, null, p_operation_id, v_batch_2, v_camera_4,
       'DEMO_HH04_vehiculo_083.jpg', 'image/jpeg', 2210000, md5(p_operation_id::text || ':job:11:a') || md5(p_operation_id::text || ':job:11:b'), 'openai', 'seguria-demo-v1', 'completed', 'pending',
       '{"detections":[{"species":"vehicle","confidence":0.97,"model_confidence":0.97,"confidence_source":"model","description":"Vehiculo ingresando a zona restringida.","box":{"x1":0.08,"y1":0.31,"x2":0.91,"y2":0.89}}],"scene_summary":"Vehiculo detenido junto al acceso de servicio.","limitations":["No se realiza lectura de patente."],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":[]}}'::jsonb,
       null, null, null, null, null, null, null, 'Sendero Turistico', v_now - interval '5 hours',
       'demo-v1', 'demo-v1', 0, 2290, 0.0062, v_now - interval '5 hours 1 minute', v_now - interval '5 hours', true, v_now - interval '5 hours', v_now - interval '5 hours'),
      (v_job_12, p_actor_user_id, null, p_operation_id, v_batch_2, v_camera_2,
       'DEMO_HH02_pudu_091.jpg', 'image/jpeg', 1730000, md5(p_operation_id::text || ':job:12:a') || md5(p_operation_id::text || ':job:12:b'), 'openai', 'seguria-demo-v1', 'completed', 'confirmed',
       '{"detections":[{"species":"pudu","confidence":0.93,"model_confidence":0.89,"confidence_source":"verification","description":"Pudu adulto en sendero de bosque humedo.","box":{"x1":0.28,"y1":0.24,"x2":0.68,"y2":0.88}}],"scene_summary":"Pudu adulto alimentandose junto a vegetacion baja.","limitations":[],"image_metadata":{"available":true,"source":"camera_trap","capturedAtSource":"exif","locationStatus":"validated","issues":[]}}'::jsonb,
       null, null, p_actor_user_id, v_now - interval '5 days 20 hours', null, null, 'Identificacion confirmada.', 'Bosque Humedo', v_now - interval '6 days',
       'demo-v1', 'demo-v1', 0, 2890, 0.0069, v_now - interval '6 days 1 minute', v_now - interval '6 days', true, v_now - interval '6 days', v_now - interval '5 days 20 hours');

    insert into public.seguria_alerts (
      id, operation_id, organization_id, owner_user_id, module, alert_type, severity, status,
      source_type, source_id, camera_id, fingerprint, title, summary, zone_label, detected_at,
      payload, acknowledged_by_user_id, acknowledged_at, is_demo, created_at, updated_at
    ) values
      (v_alert_1, p_operation_id, null, p_actor_user_id, 'vision', 'priority_species', 'critical', 'open', 'wildlife_inference_job', v_job_1, v_camera_1, 'demo:' || p_operation_id::text || ':priority-huemul', 'Huemul detectado en zona prioritaria', 'Registro de alta confianza pendiente de seguimiento operacional.', 'Reserva Biologica', v_now - interval '6 hours', jsonb_build_object('species','huemul','confidence',0.96,'reviewStatus','confirmed','locationStatus','validated','cameraCode','DEMO-HH-01','cameraName','Sendero Huemul','sensitiveZone',true,'requiresHumanReview',false,'demo',true), null, null, true, v_now - interval '6 hours', v_now - interval '6 hours'),
      (v_alert_2, p_operation_id, null, p_actor_user_id, 'vision', 'human_intrusion', 'high', 'acknowledged', 'wildlife_inference_job', v_job_5, v_camera_4, 'demo:' || p_operation_id::text || ':human-intrusion', 'Presencia humana fuera de horario', 'Persona detectada en sendero cerrado durante horario nocturno.', 'Sendero Turistico', v_now - interval '2 hours', jsonb_build_object('species','human','confidence',0.98,'reviewStatus','pending','locationStatus','validated','cameraCode','DEMO-HH-04','cameraName','Salto Huilo Huilo','sensitiveZone',true,'requiresHumanReview',true,'demo',true), p_actor_user_id, v_now - interval '90 minutes', true, v_now - interval '2 hours', v_now - interval '90 minutes'),
      (v_alert_3, p_operation_id, null, p_actor_user_id, 'vision', 'camera_inactive', 'medium', 'open', 'wildlife_camera', v_camera_3, v_camera_3, 'demo:' || p_operation_id::text || ':camera-inactive', 'Camara sin actividad reciente', 'Portal Norte no registra evidencia reciente y requiere revision tecnica.', 'Acceso Norte', v_now - interval '3 days', jsonb_build_object('locationStatus','validated','cameraCode','DEMO-HH-03','cameraName','Portal Norte','inactiveHours',72,'requiresHumanReview',false,'demo',true), null, null, true, v_now - interval '3 days', v_now - interval '3 days'),
      (v_alert_4, p_operation_id, null, p_actor_user_id, 'vision', 'low_confidence', 'medium', 'open', 'wildlife_inference_job', v_job_7, v_camera_2, 'demo:' || p_operation_id::text || ':low-confidence', 'Identificacion incierta', 'Silueta animal con baja confianza requiere revision especializada.', 'Bosque Humedo', v_now - interval '3 days', jsonb_build_object('species','unknown_animal','confidence',0.54,'reviewStatus','unidentifiable','locationStatus','validated','cameraCode','DEMO-HH-02','cameraName','Bosque de los Ciervos','requiresHumanReview',true,'demo',true), null, null, true, v_now - interval '3 days', v_now - interval '3 days');

    insert into public.seguria_alert_activity (alert_id, actor_user_id, action, previous_status, new_status, note, metadata, created_at)
    values
      (v_alert_1, null, 'created', null, 'open', null, '{"producer":"demo-seed-v1"}'::jsonb, v_now - interval '6 hours'),
      (v_alert_2, null, 'created', null, 'open', null, '{"producer":"demo-seed-v1"}'::jsonb, v_now - interval '2 hours'),
      (v_alert_2, p_actor_user_id, 'acknowledged', 'open', 'acknowledged', 'Evento revisado por el equipo de turno.', '{"producer":"demo-seed-v1"}'::jsonb, v_now - interval '90 minutes'),
      (v_alert_3, null, 'created', null, 'open', null, '{"producer":"demo-seed-v1"}'::jsonb, v_now - interval '3 days'),
      (v_alert_4, null, 'created', null, 'open', null, '{"producer":"demo-seed-v1"}'::jsonb, v_now - interval '3 days');

    insert into public.wildlife_evaluation_sets (
      id, operation_id, organization_id, created_by_user_id, name, description, status,
      target_image_count, started_at, completed_at, is_demo, created_at, updated_at
    ) values (
      v_evaluation_set, p_operation_id, null, p_actor_user_id,
      'Evaluacion demo - Fauna Huilo Huilo',
      'Muestra demostrativa para visualizar precision, calidad y resultados de revision.',
      'active', 20, v_now - interval '10 days', null, true, v_now - interval '10 days', v_now
    );

    insert into public.wildlife_evaluation_items (
      evaluation_set_id, job_id, expected_common_name, expected_scientific_name,
      observed_outcome, image_quality, reviewer_notes, reviewed_by_user_id,
      reviewed_at, is_demo, created_at, updated_at
    ) values
      (v_evaluation_set, v_job_1, 'Huemul', 'Hippocamelus bisulcus', 'true_positive', 'good', 'Identificacion y ubicacion consistentes.', p_actor_user_id, v_now - interval '5 hours', true, v_now - interval '5 hours', v_now - interval '5 hours'),
      (v_evaluation_set, v_job_2, 'Pudu', 'Pudu puda', 'true_positive', 'infrared', 'Correcto, pendiente de cierre humano.', p_actor_user_id, v_now - interval '9 hours', true, v_now - interval '9 hours', v_now - interval '9 hours'),
      (v_evaluation_set, v_job_3, 'Guina', 'Leopardus guigna', 'true_positive', 'dark', 'Rasgos visibles pese a baja iluminacion.', p_actor_user_id, v_now - interval '20 hours', true, v_now - interval '20 hours', v_now - interval '20 hours'),
      (v_evaluation_set, v_job_4, 'Zorro culpeo', 'Lycalopex culpaeus', 'true_positive', 'rain', 'Taxonomia corregida por revisor.', p_actor_user_id, v_now - interval '19 hours', true, v_now - interval '19 hours', v_now - interval '19 hours'),
      (v_evaluation_set, v_job_6, null, null, 'true_negative', 'empty', 'Cuadro vacio correctamente identificado.', p_actor_user_id, v_now - interval '1 day 18 hours', true, v_now - interval '1 day 18 hours', v_now - interval '1 day 18 hours'),
      (v_evaluation_set, v_job_7, null, null, 'unidentifiable', 'blurred', 'No existe evidencia suficiente para clasificar.', p_actor_user_id, v_now - interval '2 days 16 hours', true, v_now - interval '2 days 16 hours', v_now - interval '2 days 16 hours');
  end if;

  insert into public.wildlife_demo_profiles (operation_id, enabled, version, seeded_by_user_id, updated_at)
  values (p_operation_id, p_enabled, 'huilo-huilo-v1', p_actor_user_id, v_now)
  on conflict (operation_id) do update
    set enabled = excluded.enabled,
        version = excluded.version,
        seeded_by_user_id = excluded.seeded_by_user_id,
        updated_at = excluded.updated_at;

  select count(*) into v_count_cameras from public.wildlife_cameras where operation_id = p_operation_id and is_demo;
  select count(*) into v_count_jobs from public.wildlife_inference_jobs where operation_id = p_operation_id and is_demo;
  select count(*) into v_count_batches from public.wildlife_pilot_batches where operation_id = p_operation_id and is_demo;
  select count(*) into v_count_alerts from public.seguria_alerts where operation_id = p_operation_id and is_demo;
  select count(*) into v_count_evaluations from public.wildlife_evaluation_sets where operation_id = p_operation_id and is_demo;

  return jsonb_build_object(
    'enabled', p_enabled,
    'version', 'huilo-huilo-v1',
    'cameras', v_count_cameras,
    'jobs', v_count_jobs,
    'batches', v_count_batches,
    'alerts', v_count_alerts,
    'evaluation_sets', v_count_evaluations
  );
end;
$$;

revoke all on function public.set_huilo_huilo_demo_mode(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_huilo_huilo_demo_mode(uuid, uuid, boolean) to service_role;
