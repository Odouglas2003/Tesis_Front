import { Project, AssignmentUI, ProjectRef } from "@/types/interface";
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  let d: Date;
  if (typeof date === 'string') {
    const isoDate = date.split('T')[0];
    const [year, month, day] = isoDate.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = date;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};
export function formatDateUTC(v: Date | string | null | undefined): string {
  if (!v) return "-";
  const dt = v instanceof Date ? v : new Date(v as string);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

export const startOfUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));

export function daysDiffUTC(from: Date, to: Date): number {
  const a = startOfUTC(from).getTime();
  const b = startOfUTC(to).getTime();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return Math.ceil((b - a) / ONE_DAY);
}


export const formatId = (id: number | string | null): string => {
  if (!id) return '';
  const digits = String(id).replace(/\D/g, '');
  return digits.replace(/^(\d{2})(\d{3})(\d{3}).*/, '$1.$2.$3');
}


export const formatPesoARS = (amount: number | string | null): string => {
  if (amount === null || amount === undefined || amount === '') return '';
  // Convertir a número (reemplaza coma decimal por punto si viene en string)
  const value =
    typeof amount === 'string'
      ? parseFloat(amount.replace(/\./g, '').replace(/,/g, '.'))
      : amount;

  if (isNaN(value)) return '';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
export function toProjectRef(
  raw: unknown,
  projects: Project[]
): ProjectRef | null {
  if (raw && typeof raw === "object" && "id" in (raw as Record<string, unknown>)) {
    const r = raw as { id?: string; name?: string };
    if (typeof r.id === "string") {
      const name =
        r.name ??
        projects.find((p) => p.id === r.id)?.name ??
        "";
      return { id: r.id, name };
    }
  }
  if (typeof raw === "string") {
    const found = projects.find((p) => p.id === raw);
    if (found) return { id: found.id, name: found.name };
    return { id: raw, name: "" };
  }
  return null;
}

export function uniformAssignments(
  arr: Array<unknown> | undefined,
  projects: Project[]
): AssignmentUI[] {
  const src = Array.isArray(arr) ? arr : [];
  return src
    .map((a) => {
      const item = a as {
        projectId?: unknown;
        rol?: string;
        seniority?: string;
        horasAsignadas?: number;
      };
      const pref = toProjectRef(item.projectId, projects);
      if (!pref) return null;
      return {
        projectId: pref,
        rol: item.rol ?? "",
        seniority: item.seniority ?? "",
        horasAsignadas: Number(item.horasAsignadas ?? 0),
      } satisfies AssignmentUI;
    })
    .filter((x): x is AssignmentUI => x !== null);
}