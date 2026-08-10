import type { Locale } from '@/lib/locales'

export const marketing = {
  es: {
    nav: {
      solutions: 'Soluciones',
      portal: 'Portal',
      contact: 'Contacto',
      language: 'EN',
    },
    footer: {
      description:
        'SegurIA Security Suite. Unimos infraestructura, incidentes, evidencia, Vision, Edge y respuesta en una sola experiencia operacional.',
      solutions: 'Soluciones',
      seeSolution: 'Ver solucion',
      clientPortal: 'Portal cliente',
      company: 'Empresa',
      platform: 'Plataforma',
      askAdvice: 'Solicitar asesoria',
      contact: 'Contacto',
      rights: '© 2026 SegurIA. Todos los derechos reservados.',
      line: 'Security Suite. Powered by N3uralia.',
    },
    home: {
      eyebrow: 'SegurIA Security Suite',
      title: 'Lo que proteges, por fin habla claro.',
      description:
        'SegurIA es una Security Suite que conecta tus camaras, sensores y sistemas actuales con Centro de Control, Infraestructura, Incidentes, Evidencia, Vision y Edge para convertir señales de terreno en decisiones y respuesta operacional.',
      chips: ['Aprovecha lo instalado', 'Alertas con IA', 'Mejor reaccion'],
      primary: 'Ver la suite',
      secondary: 'Disenar mi operacion',
      panelBadge: 'Operacion protegida',
      proof: [
        { label: 'Sitios', value: 'visibles' },
        { label: 'Eventos', value: 'claros' },
        { label: 'Respuesta', value: 'a tiempo' },
      ],
      sectionEyebrow: 'Que incluye la Security Suite',
      sectionTitle: 'Una sola capa operacional sobre la seguridad que ya tienes.',
      sectionDescription:
        'SegurIA unifica infraestructura, eventos, incidentes, evidencia y analisis inteligente sobre tus sistemas existentes. Los motores tecnologicos reutilizables pertenecen a N3uralia; SegurIA los especializa para seguridad y continuidad operacional.',
      benefits: [
        {
          title: 'Mejoramos lo que ya tienes',
          description:
            'Nos integramos a tus camaras, sensores, accesos y sistemas actuales para darles una capa de inteligencia, no para obligarte a partir de cero.',
        },
        {
          title: 'Alertas con IA, no ruido',
          description:
            'La plataforma mira cambios, cruza eventos y avisa cuando algo merece atencion, con contexto suficiente para actuar bien.',
        },
        {
          title: 'Evidencia lista para decidir',
          description:
            'Cada alerta deja una historia clara: que paso, donde paso, que camara o sensor lo vio y que decision conviene tomar.',
        },
      ],
      whyEyebrow: 'Las seis superficies de SegurIA',
      whyTitle: 'Una Security Suite, seis superficies conectadas.',
      whyDescription:
        'Cada superficie resuelve una parte del flujo de seguridad, pero todas comparten contexto, ownership y trazabilidad dentro de la misma suite.',
      wins: [
        'Centro de Control — estado general, prioridades, propiedades, dispositivos e incidentes',
        'Infraestructura — camaras, sensores, gateways, inventario, heartbeat y estado operacional',
        'Incidentes — alertas, severidad, reconocimiento, resolucion y trazabilidad',
        'Evidencia — snapshots, media protegida, actividad y contexto operacional',
        'Vision — analisis visual, quality diagnostics, revision humana e inferencia derivada',
        'Edge — RTSP local, seleccion de frames, spool offline y reintentos',
      ],
      placesEyebrow: 'Donde se aplica',
      placesTitle: 'La misma Security Suite, adaptada al ritmo de cada lugar.',
      finalTitle: 'Seguridad integral, sin hacer compleja la vida de nadie.',
      finalDescription:
        'Cuentanos que lugares quieres proteger y armamos una ruta clara para unir infraestructura, monitoreo, evidencia, incidentes, Vision y respuesta en una sola experiencia.',
    },
    solutions: {
      heroTitle: 'SegurIA Security Suite para operar con claridad.',
      heroDescription:
        'Conectamos tus sistemas actuales de camaras, alarmas, sensores y accesos con infraestructura, incidentes, evidencia, Vision, Edge y automatizacion operacional.',
      sectionTitle: 'Inteligencia sobre lo que ya existe.',
      sectionDescription:
        'SegurIA no parte borrando tu infraestructura. La conecta, la ordena y la convierte en una operacion integrada de seguridad.',
      cta: 'Ver solucion',
    },
    routes: {
      fields: {
        eyebrow: 'Campos Inteligentes',
        title: 'El campo despierta antes que el riesgo.',
        description:
          'Perimetros, portones, bodegas, caminos y zonas remotas con vigilancia que avisa antes de que el problema avance.',
        href: '/campos-inteligentes',
        image:
          "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=70&w=1400&auto=format&fit=crop')",
        cards: [
          ['Ganaderia sin sorpresas', 'Rebanos, accesos y zonas criticas visibles incluso de noche.'],
          ['Agricultura que responde', 'Clima, riego, bodegas y movimiento conectados a alertas utiles.'],
          ['Sitios remotos conectados', 'La operacion sigue reportando aunque el lugar este lejos.'],
        ],
      },
      properties: {
        eyebrow: 'Propiedades Inteligentes',
        title: 'Tu casa tranquila. Tu mundo en orden.',
        description:
          'Aprovechamos camaras, alarmas, accesos y sensores actuales para transformar una propiedad en un sistema que avisa con inteligencia.',
        href: '/propiedades-inteligentes',
        image:
          "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=70&w=1400&auto=format&fit=crop')",
        cards: [
          ['Accesos claros', 'Sabes quien entra, cuando entra y que evento merece atencion.'],
          ['Hogar en calma', 'Alertas comprensibles para cuidar sin perseguir pantallas.'],
          ['Propiedades y negocios', 'Patios, oficinas, bodegas y condominios en una sola lectura.'],
        ],
      },
      hospitality: {
        eyebrow: 'Hoteleria Inteligente',
        title: 'Tu hotel sereno. Cada detalle bajo control.',
        description:
          'Integramos camaras, accesos, alarmas y sistemas operativos para que la IA detecte lo importante sin incomodar al huesped.',
        href: '/hoteleria-inteligente',
        image:
          "linear-gradient(to bottom, rgba(10, 27, 46, 0.3), rgba(10, 27, 46, 0.9)), url('/portal/huilo-huilo.jpg')",
        cards: [
          ['Huespedes tranquilos', 'Seguridad discreta que cuida sin romper la experiencia.'],
          ['Staff coordinado', 'Eventos, accesos y respuesta ordenados para operar mejor.'],
          ['Gerencia con evidencia', 'Cada incidente llega con contexto, lugar y accion recomendada.'],
        ],
      },
    },
    detail: {
      applications: 'Aplicaciones',
      capabilities: 'Capacidades clave',
      process: 'Como trabajamos',
      processItems: [
        ['01', 'Levantamos el sitio', 'Entendemos riesgos, equipos existentes y puntos ciegos reales.'],
        ['02', 'Conectamos lo importante', 'Ordenamos camaras, sensores, accesos y reglas en una sola experiencia.'],
        ['03', 'Activamos alertas utiles', 'La operacion recibe senales claras para responder a tiempo.'],
        ['04', 'Medimos y mejoramos', 'Cada evento deja evidencia, aprendizaje y trazabilidad.'],
      ],
      ctaTitle: 'Conecta tu seguridad con una solucion que se entiende.',
      ctaText: 'Disenamos una experiencia clara para operar con menos friccion y mas control.',
    },
    integrations: {
      title: 'Conectamos tu seguridad actual y la volvemos inteligente.',
      description:
        'SegurIA se integra a camaras, alarmas, sensores, accesos y sistemas operativos existentes. Sobre esa base agregamos IA, alertas utiles y evidencia ordenada.',
      items: ['Camaras y sistemas actuales', 'IA sobre eventos reales', 'Alertas faciles de entender', 'Evidencia agrupada por incidente'],
    },
    contact: {
      title: 'Cuentanos que necesitas y lo ordenamos en una propuesta clara.',
      description:
        'Te respondemos con foco en tu operacion, tu tipo de sitio y el nivel de control que necesitas.',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Solicitar asesoria',
    },
  },
  en: {
    nav: {
      solutions: 'Solutions',
      portal: 'Portal',
      contact: 'Contact',
      language: 'ES',
    },
    footer: {
      description:
        'SegurIA Security Suite. Infrastructure, incidents, evidence, Vision, Edge and response in one operational experience.',
      solutions: 'Solutions',
      seeSolution: 'View solution',
      clientPortal: 'Client portal',
      company: 'Company',
      platform: 'Platform',
      askAdvice: 'Request advisory',
      contact: 'Contact',
      rights: '© 2026 SegurIA. All rights reserved.',
      line: 'Security Suite. Powered by N3uralia.',
    },
    home: {
      eyebrow: 'SegurIA Security Suite',
      title: 'Everything you protect, finally speaks clearly.',
      description:
        'SegurIA is a Security Suite that connects your current cameras, sensors and security systems with Control Center, Infrastructure, Incidents, Evidence, Vision and Edge to turn field signals into operational decisions and response.',
      chips: ['Use what is already installed', 'AI alerts', 'Better response'],
      primary: 'View the suite',
      secondary: 'Design my operation',
      panelBadge: 'Protected operation',
      proof: [
        { label: 'Sites', value: 'visible' },
        { label: 'Events', value: 'clear' },
        { label: 'Response', value: 'on time' },
      ],
      sectionEyebrow: 'What the Security Suite includes',
      sectionTitle: 'One operational layer on top of the security you already have.',
      sectionDescription:
        'SegurIA unifies infrastructure, events, incidents, evidence and intelligent analysis across your existing systems. Reusable technology engines belong to N3uralia; SegurIA specializes them for security and operational continuity.',
      benefits: [
        {
          title: 'We improve what you already have',
          description:
            'We integrate with your current cameras, sensors, access and systems to add intelligence without forcing you to start over.',
        },
        {
          title: 'AI alerts, not noise',
          description:
            'The platform watches changes, connects events and alerts only when something deserves attention, with enough context to act well.',
        },
        {
          title: 'Evidence ready for decisions',
          description:
            'Every alert leaves a clear story: what happened, where it happened, which camera or sensor saw it and what decision should follow.',
        },
      ],
      whyEyebrow: 'The six SegurIA surfaces',
      whyTitle: 'One Security Suite, six connected surfaces.',
      whyDescription:
        'Each surface solves one part of the security workflow, while all of them share context, ownership and traceability inside the same suite.',
      wins: [
        'Control Center — overall state, priorities, properties, devices and incidents',
        'Infrastructure — cameras, sensors, gateways, inventory, heartbeat and operational state',
        'Incidents — alerts, severity, acknowledgement, resolution and traceability',
        'Evidence — snapshots, protected media, activity and operational context',
        'Vision — visual analysis, quality diagnostics, human review and derived inference',
        'Edge — local RTSP, frame selection, offline spool and retries',
      ],
      placesEyebrow: 'Where it applies',
      placesTitle: 'The same Security Suite, adapted to the rhythm of each place.',
      finalTitle: 'Integrated security without making life complex.',
      finalDescription:
        'Tell us what places you need to protect and we will build a clear path to unite infrastructure, monitoring, evidence, incidents, Vision and response in one experience.',
    },
    solutions: {
      heroTitle: 'SegurIA Security Suite for clear operations.',
      heroDescription:
        'We connect your current cameras, alarms, sensors and access systems with infrastructure, incidents, evidence, Vision, Edge and operational automation.',
      sectionTitle: 'Intelligence on top of what already exists.',
      sectionDescription:
        'SegurIA does not begin by replacing your infrastructure. It connects it, organizes it and turns it into an integrated security operation.',
      cta: 'View solution',
    },
    routes: {
      fields: {
        eyebrow: 'Smart Fields',
        title: 'The field wakes up before risk advances.',
        description:
          'Perimeters, gates, storage areas, roads and remote zones with monitoring that alerts before the problem grows.',
        href: '/campos-inteligentes',
        image:
          "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=70&w=1400&auto=format&fit=crop')",
        cards: [
          ['Livestock without surprises', 'Herds, access points and critical zones visible even at night.'],
          ['Agriculture that responds', 'Weather, irrigation, storage and movement connected to useful alerts.'],
          ['Remote sites connected', 'The operation keeps reporting even when the place is far away.'],
        ],
      },
      properties: {
        eyebrow: 'Smart Properties',
        title: 'Your home calm. Your world in order.',
        description:
          'We use current cameras, alarms, access and sensors to transform a property into a system that alerts intelligently.',
        href: '/propiedades-inteligentes',
        image:
          "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=70&w=1400&auto=format&fit=crop')",
        cards: [
          ['Clear access', 'You know who enters, when they enter and what event deserves attention.'],
          ['Calm at home', 'Readable alerts that help you care without chasing screens.'],
          ['Properties and businesses', 'Patios, offices, warehouses and communities in one view.'],
        ],
      },
      hospitality: {
        eyebrow: 'Smart Hospitality',
        title: 'Your hotel serene. Every detail under control.',
        description:
          'We integrate cameras, access, alarms and operational systems so AI detects what matters without disturbing the guest.',
        href: '/hoteleria-inteligente',
        image:
          "linear-gradient(to bottom, rgba(10, 27, 46, 0.3), rgba(10, 27, 46, 0.9)), url('/portal/huilo-huilo.jpg')",
        cards: [
          ['Calm guests', 'Discreet security that protects without breaking the experience.'],
          ['Coordinated staff', 'Events, access and response organized for better operations.'],
          ['Management with evidence', 'Every incident arrives with context, location and recommended action.'],
        ],
      },
    },
    detail: {
      applications: 'Applications',
      capabilities: 'Key capabilities',
      process: 'How we work',
      processItems: [
        ['01', 'We map the site', 'We understand risks, existing equipment and real blind spots.'],
        ['02', 'We connect what matters', 'We organize cameras, sensors, access and rules into one experience.'],
        ['03', 'We activate useful alerts', 'The operation receives clear signals to respond on time.'],
        ['04', 'We measure and improve', 'Every event leaves evidence, learning and traceability.'],
      ],
      ctaTitle: 'Connect your security to a solution people understand.',
      ctaText: 'We design a clear operational experience with less friction and more control.',
    },
    integrations: {
      title: 'We connect your current security and make it intelligent.',
      description:
        'SegurIA integrates with existing cameras, alarms, sensors, access and operational systems. On that base we add AI, useful alerts and ordered evidence.',
      items: ['Current cameras and systems', 'AI on real events', 'Easy-to-understand alerts', 'Evidence grouped by incident'],
    },
    contact: {
      title: 'Tell us what you need and we will shape it into a clear proposal.',
      description:
        'We respond focused on your operation, your type of site and the level of control you need.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Request advisory',
    },
  },
} satisfies Record<Locale, unknown>

export type MarketingCopy = (typeof marketing)[Locale]
