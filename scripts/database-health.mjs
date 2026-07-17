import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function readEnvFile(path) {
  if (!fs.existsSync(path)) return {}
  return Object.fromEntries(
    fs.readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')]
      })
  )
}

const env = { ...readEnvFile('.env.local'), ...readEnvFile('.env'), ...process.env }
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

const checks = [
  {
    name: 'organizations',
    table: 'organizations',
    columns: 'id,name,slug,status,created_at,updated_at',
  },
  {
    name: 'memberships',
    table: 'memberships',
    columns: 'organization_id,user_id,role,created_at,updated_at',
  },
  {
    name: 'properties',
    table: 'properties',
    columns: 'id,organization_id,name,address,status,created_at,updated_at',
  },
  {
    name: 'spaces',
    table: 'spaces',
    columns: 'id,organization_id,property_id,name,kind,created_at,updated_at',
  },
  {
    name: 'gateways',
    table: 'gateways',
    columns: 'id,organization_id,property_id,public_id,name,status,secret_hash,last_seen_at,created_at,updated_at',
  },
  {
    name: 'integrations',
    table: 'integrations',
    columns: 'id,organization_id,property_id,gateway_id,provider,display_name,status,endpoint,external_account_ref,last_sync_at,metadata,created_at,updated_at',
  },
  {
    name: 'integration_credentials',
    table: 'integration_credentials',
    columns: 'id,organization_id,property_id,integration_id,provider,label,account_identifier,credential_kind,secret_ciphertext,secret_hint,status,rotation_due_at,last_validated_at,created_at,updated_at',
  },
  {
    name: 'devices',
    table: 'devices',
    columns: 'id,organization_id,property_id,space_id,integration_id,external_id,name,kind,status,last_seen_at,metadata,created_at,updated_at',
  },
  {
    name: 'entities',
    table: 'entities',
    columns: 'id,organization_id,property_id,device_id,external_id,domain,device_class,name,unit,writable,enabled,metadata,created_at,updated_at',
  },
  {
    name: 'entity_states',
    table: 'entity_states',
    columns: 'entity_id,organization_id,property_id,state,severity,attributes,occurred_at,received_at,updated_at',
  },
  {
    name: 'events',
    table: 'events',
    columns: 'id,organization_id,property_id,gateway_id,device_id,entity_id,external_event_id,event_type,severity,state,source,occurred_at,received_at,payload_version,payload',
  },
  {
    name: 'incidents',
    table: 'incidents',
    columns: 'id,organization_id,property_id,primary_event_id,assigned_to,title,description,severity,status,acknowledged_at,resolved_at,created_at,updated_at',
  },
  {
    name: 'incident_actions',
    table: 'incident_actions',
    columns: 'id,organization_id,property_id,incident_id,actor_user_id,action_type,from_status,to_status,comment,metadata,created_at',
  },
  {
    name: 'notifications',
    table: 'notifications',
    columns: 'id,organization_id,property_id,incident_id,recipient_user_id,severity,title,body,status,due_at,read_at,acknowledged_at,escalated_at,created_at,updated_at',
  },
  {
    name: 'automation_templates',
    table: 'automation_templates',
    columns: 'id,organization_id,template_key,name,description,trigger_kind,version,default_config,created_at,updated_at',
  },
  {
    name: 'property_automations',
    table: 'property_automations',
    columns: 'id,organization_id,property_id,template_id,name,status,desired_status,config,last_run_at,created_at,updated_at',
  },
  {
    name: 'automation_runs',
    table: 'automation_runs',
    columns: 'id,organization_id,property_id,automation_id,result,details,started_at,completed_at',
  },
  {
    name: 'camera_snapshots',
    table: 'camera_snapshots',
    columns: 'id,organization_id,property_id,device_id,object_path,mime_type,size_bytes,captured_at,created_at',
  },
  {
    name: 'camera_stream_sessions',
    table: 'camera_stream_sessions',
    columns: 'id,organization_id,property_id,device_id,gateway_id,requested_by,status,session_token_hash,gateway_stream_ref,expires_at,started_at,ended_at,last_heartbeat_at,metadata,created_at,updated_at',
  },
  {
    name: 'leads',
    table: 'leads',
    columns: 'id,name,email,phone,property_type,message,source,status,ip_hash,user_agent,source_path,consent,created_at,updated_at',
  },
  {
    name: 'contact_submissions',
    table: 'contact_submissions',
    columns: 'id,name,email,phone,message,status,created_at,updated_at',
  },
  {
    name: 'audit_log',
    table: 'audit_log',
    columns: 'id,organization_id,property_id,actor_user_id,action,target_type,target_id,payload,created_at',
  },
]

async function checkTable({ name, table, columns }) {
  const { count, error } = await supabase.from(table).select(columns, { count: 'exact', head: true })
  return {
    name,
    ok: !error,
    count: count ?? 0,
    error: error?.message,
  }
}

async function checkEvidenceBucket() {
  const { data, error } = await supabase.storage.getBucket('seguria-evidence')
  return {
    name: 'storage:seguria-evidence',
    ok: !error && data?.name === 'seguria-evidence',
    private: data ? data.public === false : undefined,
    error: error?.message,
  }
}

const results = []
for (const check of checks) {
  results.push(await checkTable(check))
}
results.push(await checkEvidenceBucket())

const failed = results.filter((result) => !result.ok)

console.log(JSON.stringify({
  ok: failed.length === 0,
  checkedAt: new Date().toISOString(),
  totalChecks: results.length,
  failedChecks: failed.length,
  results,
}, null, 2))

if (failed.length > 0) process.exit(1)
