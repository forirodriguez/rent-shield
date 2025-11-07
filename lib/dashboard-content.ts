import { UserRole } from "@prisma/client";

export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
  trend?: {
    label: string;
    positive: boolean;
  };
}

export interface DashboardSpotlight {
  title: string;
  description: string;
  bullets: string[];
}

export interface DashboardNextStep {
  title: string;
  description: string;
  badge?: string;
}

export interface RoleDashboardContent {
  title: string;
  description: string;
  stats: DashboardStat[];
  spotlight: DashboardSpotlight;
  nextSteps: DashboardNextStep[];
}

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/super-admin/dashboard",
  [UserRole.OWNER]: "/owner/dashboard",
  [UserRole.MANAGER]: "/manager/dashboard",
  [UserRole.TENANT]: "/tenant/dashboard",
};

export const ROLE_DASHBOARD_CONTENT: Record<UserRole, RoleDashboardContent> = {
  [UserRole.SUPER_ADMIN]: {
    title: "Panel Administrativo Global",
    description:
      "Monitorea el estado general de la plataforma, seguridad y cumplimiento.",
    stats: [
      {
        label: "Cuentas activas",
        value: "42",
        helper: "Organizaciones verificadas",
        trend: { label: "+3 esta semana", positive: true },
      },
      {
        label: "Propiedades sincronizadas",
        value: "18,240",
        helper: "Across all portfolios",
        trend: { label: "+12% MoM", positive: true },
      },
      {
        label: "Alertas críticas",
        value: "6",
        helper: "Seguridad y pagos",
        trend: { label: "2 nuevas", positive: false },
      },
    ],
    spotlight: {
      title: "Auditoría y cumplimiento",
      description:
        "Revisa los eventos sensibles antes del cierre contable mensual.",
      bullets: [
        "3 owners pendientes de subir documentación KYC",
        "Último respaldo completado hace 2 horas",
        "OAuth scopes alineados con la política 2024",
      ],
    },
    nextSteps: [
      {
        title: "Revisar bitácora de seguridad",
        description: "Exporta los eventos críticos y comparte al comité.",
        badge: "Prioridad alta",
      },
      {
        title: "Validar onboarding de nuevos owners",
        description: "Autoriza accesos solo para portfolios aprobados.",
      },
      {
        title: "Sincronizar métricas con BI",
        description: "Habilita el dataset semanal para finanzas.",
      },
    ],
  },
  [UserRole.OWNER]: {
    title: "Portfolio del Propietario",
    description:
      "Controla ingresos, ocupación y rendimiento de tus propiedades.",
    stats: [
      {
        label: "Propiedades rentadas",
        value: "86%",
        helper: "34 de 40 unidades ocupadas",
        trend: { label: "+4 pts vs mes anterior", positive: true },
      },
      {
        label: "Ingresos del mes",
        value: "$92,400",
        helper: "Pagos confirmados",
        trend: { label: "+6% vs forecast", positive: true },
      },
      {
        label: "Pendientes críticos",
        value: "3",
        helper: "Contratos por renovar",
        trend: { label: "Resuelve antes de 30 días", positive: false },
      },
    ],
    spotlight: {
      title: "Propiedades con mayor retorno",
      description:
        "Sigue optimizando tus unidades de alto rendimiento para maximizar ocupación.",
      bullets: [
        "Loft Universitario - 98% ocupación",
        "Residencial Norte - 24% ROI anualizado",
        "Local Comercial Centro - renegociación abierta",
      ],
    },
    nextSteps: [
      {
        title: "Renovar contratos",
        description: "3 contratos vencen durante las próximas 4 semanas.",
      },
      {
        title: "Validar depósitos",
        description: "Confirma los abonos pendientes para liberar reportes.",
      },
      {
        title: "Programar inspecciones",
        description: "Elige fechas sugeridas por el property manager.",
      },
    ],
  },
  [UserRole.MANAGER]: {
    title: "Operación diaria",
    description:
      "Supervisa mantenimiento, tickets y comunicación con inquilinos.",
    stats: [
      {
        label: "Tickets activos",
        value: "27",
        helper: "18 en progreso · 9 nuevos",
        trend: { label: "Resolver 6 hoy", positive: false },
      },
      {
        label: "Visitas programadas",
        value: "12",
        helper: "Próximas 48 horas",
        trend: { label: "Sin retrasos", positive: true },
      },
      {
        label: "Encuestas positivas",
        value: "94%",
        helper: "Último trimestre",
        trend: { label: "+2 pts", positive: true },
      },
    ],
    spotlight: {
      title: "SLA de mantenimiento",
      description:
        "Mantén el tiempo medio de resolución por debajo de 24h para conservar la satisfacción.",
      bullets: [
        "Prioriza tickets eléctricos y de agua",
        "Confirma disponibilidad de proveedores",
        "Actualiza a los tenants con el nuevo estatus",
      ],
    },
    nextSteps: [
      {
        title: "Asignar técnicos",
        description: "Revisa la carga diaria antes de las 9:00 AM.",
      },
      {
        title: "Actualizar bitácora de visitas",
        description: "Comparte evidencia después de cada inspección.",
      },
      {
        title: "Enviar recordatorios",
        description: "Notifica a los tenants sobre trabajos programados.",
      },
    ],
  },
  [UserRole.TENANT]: {
    title: "Panel del Inquilino",
    description:
      "Consulta pagos, solicitudes de servicio y documentos de tu arrendamiento.",
    stats: [
      {
        label: "Estado de pago",
        value: "Al día",
        helper: "Próximo pago: 05/02/2025",
      },
      {
        label: "Solicitudes activas",
        value: "1",
        helper: "Grifo con fuga · En progreso",
      },
      {
        label: "Documentos firmados",
        value: "4",
        helper: "Contrato + anexos vigentes",
      },
    ],
    spotlight: {
      title: "Recordatorios rápidos",
      description:
        "Mantente informado sobre tus compromisos principales dentro del contrato.",
      bullets: [
        "Actualiza tu seguro de responsabilidad cada 12 meses",
        "Reporta incidencias urgentes por la app móvil",
        "Consulta el historial de pagos desde aquí mismo",
      ],
    },
    nextSteps: [
      {
        title: "Descargar recibo",
        description: "Obtén el comprobante de tu último pago.",
      },
      {
        title: "Agendar visita de mantenimiento",
        description: "Propón una fecha alternativa si necesitas ajustes.",
      },
      {
        title: "Actualizar contacto de emergencia",
        description: "Asegura que la administración pueda localizarte.",
      },
    ],
  },
};
