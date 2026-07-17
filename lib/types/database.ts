export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          role: 'admin' | 'manager' | 'user' | 'viewer'
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          company_name?: string
          phone?: string
          role?: 'admin' | 'manager' | 'user' | 'viewer'
          status?: 'active' | 'inactive' | 'pending'
        }
        Update: {
          email?: string
          full_name?: string
          company_name?: string
          phone?: string
          role?: 'admin' | 'manager' | 'user' | 'viewer'
          status?: 'active' | 'inactive' | 'pending'
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'campo' | 'propiedad' | 'hotel' | 'negocio' | 'otro'
          address: string | null
          city: string | null
          region: string | null
          latitude: number | null
          longitude: number | null
          description: string | null
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          type: 'campo' | 'propiedad' | 'hotel' | 'negocio' | 'otro'
          address?: string
          city?: string
          region?: string
          latitude?: number
          longitude?: number
          description?: string
          status?: 'active' | 'inactive' | 'pending'
        }
        Update: {
          name?: string
          type?: 'campo' | 'propiedad' | 'hotel' | 'negocio' | 'otro'
          address?: string
          city?: string
          region?: string
          latitude?: number
          longitude?: number
          description?: string
          status?: 'active' | 'inactive' | 'pending'
        }
      }
      devices: {
        Row: {
          id: string
          property_id: string
          name: string
          type: 'camera' | 'sensor' | 'access_point' | 'gateway'
          model: string | null
          serial_number: string | null
          mac_address: string | null
          ip_address: string | null
          status: 'online' | 'offline' | 'error'
          battery_level: number | null
          signal_strength: number | null
          last_seen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          property_id: string
          name: string
          type: 'camera' | 'sensor' | 'access_point' | 'gateway'
          model?: string
          serial_number?: string
          mac_address?: string
          ip_address?: string
          status?: 'online' | 'offline' | 'error'
          battery_level?: number
          signal_strength?: number
          last_seen?: string
        }
        Update: {
          name?: string
          type?: 'camera' | 'sensor' | 'access_point' | 'gateway'
          model?: string
          status?: 'online' | 'offline' | 'error'
          battery_level?: number
          signal_strength?: number
          last_seen?: string
        }
      }
      alerts: {
        Row: {
          id: string
          property_id: string
          device_id: string | null
          alert_type: 'motion' | 'access' | 'temperature' | 'animal' | 'intrusion' | 'offline' | 'battery_low'
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description: string | null
          image_url: string | null
          is_read: boolean
          is_acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          property_id: string
          device_id?: string
          alert_type: 'motion' | 'access' | 'temperature' | 'animal' | 'intrusion' | 'offline' | 'battery_low'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description?: string
          image_url?: string
          is_read?: boolean
          is_acknowledged?: boolean
        }
        Update: {
          is_read?: boolean
          is_acknowledged?: boolean
          acknowledged_at?: string
          acknowledged_by?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          company: string | null
          property_type: 'campo' | 'propiedad' | 'hotel' | 'negocio' | 'otro' | null
          message: string | null
          source: 'web_form' | 'contact_page' | 'demo_request' | 'email' | 'phone' | null
          status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost'
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          email: string
          phone?: string
          company?: string
          property_type?: 'campo' | 'propiedad' | 'hotel' | 'negocio' | 'otro'
          message?: string
          source?: 'web_form' | 'contact_page' | 'demo_request' | 'email' | 'phone'
          status?: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost'
          assigned_to?: string
        }
        Update: {
          name?: string
          email?: string
          phone?: string
          company?: string
          property_type?: 'campo' | 'propiedad' | 'hotel' | 'negocio' | 'otro'
          message?: string
          status?: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost'
          assigned_to?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          status: 'new' | 'read' | 'responded'
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          email: string
          phone?: string
          subject?: string
          message: string
          status?: 'new' | 'read' | 'responded'
        }
        Update: {
          status?: 'new' | 'read' | 'responded'
        }
      }
    }
  }
}
