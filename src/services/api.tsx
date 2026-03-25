import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import api from "./http";

import { FieldDef } from "@/components/configuration/CollaboratorSettings/types";

import {
  ColumnConfigColaborador,
  Project,
  Employee,
  RegisterProjectBody,
  Vacancie,
  Skill,
  ResponseGetColabById,
  ColumnConfig,
  User,
  RolSeniorityInfo,
  PayloadIA,
  Job,
  ProjectStatus,
  Client,
  Notification,
  SuggestionResponse,
  DashboardData,
  FullSyncResponse,
  BizneoUser,
  jornada,
  FetchCollaboratorsParams,
  IARequestSnake,
  IARequestCamel,
  BrandConfig,
} from "@/types/interface";

/* ============================================================================
 * Tipos y helpers
 * ========================================================================== */
type ApiStatus = "success" | "error" | string | number;

type ApiBase = {
  status?: ApiStatus;
  message?: string;
  error?: string;
  success?: boolean | string;
  details?: unknown;
  // algunos componentes chequean res.data
  data?: unknown;
};

type ApiOne<T> = ApiBase & { data: T };

export type ResponseLike<T = unknown> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

function toResponseLike<T>(res: AxiosResponse<T>): ResponseLike<T> {
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    json: async () => res.data,
  };
}
function toErrorResponseLike<T>(err: AxiosError<T>): ResponseLike<T> {
  const status = err.response?.status ?? 0;
  const data = (err.response?.data ?? ({} as T)) as T;
  return {
    ok: false,
    status,
    json: async () => data,
  };
}

const jsonHeaders = { "Content-Type": "application/json" };

type TableColumn = {
  displayName: string;
  field: string;
  order: number;
  isAction?: boolean;
};

const DEFAULT_TABLE_COLUMNS: Record<string, TableColumn[]> = {
  collaborador: [
    { displayName: "Nombre", field: "first_name", order: 0 },
    { displayName: "Apellido", field: "last_name", order: 1 },
    { displayName: "Roles", field: "roles", order: 2 },
    { displayName: "Proyectos", field: "Proyectos", order: 3 },
    { displayName: "Tecnologias", field: "tecnologias", order: 4 },
    { displayName: "Modalidad", field: "jornadaId", order: 5 },
    { displayName: "Fin de contrato", field: "fin_contrato", order: 6 },
    { displayName: "Horas asignadas", field: "horasAsignadas", order: 7 },
  ],
  proyecto: [
    { displayName: "Nombre", field: "name", order: 0 },
    { displayName: "Cliente", field: "client", order: 1 },
    { displayName: "Manager", field: "managerName", order: 2 },
    { displayName: "Estado", field: "status", order: 3 },
    { displayName: "Fecha de inicio", field: "startDate", order: 4 },
    { displayName: "Fecha de fin", field: "endDate", order: 5 },
    { displayName: "Categoria", field: "category", order: 6 },
    { displayName: "Colaboradores", field: "assignedPersons", order: 7 },
  ],
  vacante: [
    { displayName: "Nombre", field: "vacancieName", order: 0 },
    { displayName: "Manager", field: "manager_name", order: 1 },
    { displayName: "Horas", field: "time", order: 2 },
    { displayName: "Proyecto", field: "projectId", order: 3 },
    { displayName: "Seniority", field: "seniority", order: 4 },
    { displayName: "Fecha de pedido", field: "orderDate", order: 5 },
    { displayName: "Fecha de inicio", field: "startDate", order: 6 },
    { displayName: "Estado", field: "status", order: 7 },
    { displayName: "Descripcion", field: "description", order: 8 },
  ],
};

function sortColumns<T extends { order: number }>(columns: T[]): T[] {
  return [...columns].sort((a, b) => a.order - b.order);
}

function getDefaultColumns(entity: string): TableColumn[] | null {
  const key = String(entity).trim().toLowerCase();
  const defaults = DEFAULT_TABLE_COLUMNS[key];
  if (!defaults) return null;
  return defaults.map((column) => ({ ...column }));
}

function getColumnsFallback(
  entity: string,
  error: unknown
): TableColumn[] | null {
  const defaults = getDefaultColumns(entity);
  if (!defaults) return null;

  const axiosError = error as AxiosError<{ message?: string }>;
  const status = axiosError.response?.status;

  if (status === 401 || status === 403) {
    return null;
  }

  const message =
    axiosError.response?.data?.message ??
    axiosError.message ??
    "No se pudo obtener la configuracion de columnas.";

  console.warn(
    `Falling back to default columns for "${entity}" because the remote configuration is unavailable.`,
    { status, message }
  );

  return defaults;
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await api.request<T>(config);
    return res.data;
  } catch (e) {
    const err = e as AxiosError;
    if (typeof window === "undefined" && err?.response?.status === 401) {
      const { redirect } = await import("next/navigation");
      redirect("/"); // corta el render del server y manda al login
    }
    throw e;
  }
}

const is2xx = (s: number) => s >= 200 && s < 300;

/* ============================================================================
 * COLABORADOR
 * ========================================================================== */

export const removeAssignedPerson = async (
  projectId: string,
  collaboratorId: string
): Promise<string> => {
  try {
    const data = await request<string | { message?: string }>({
      url: `/api/projects/${projectId}/assigned-persons`,
      method: "DELETE",
      headers: jsonHeaders,
      data: { id: collaboratorId },
    });
    return typeof data === "string" ? data : data.message ?? "";
  } catch (error) {
    console.error("❌ Error eliminando persona:", error);
    throw error;
  }
};

export async function updateCollaboratorServiceedit(
  id: string,
  body: {
    Proyectos: {
      projectId: string;
      rol: string;
      tecnologias: string;
      horasAsignadas: number;
      seniority: string;
    }[];
    dni: number;
    horasAsignadas: number;
    roles: RolSeniorityInfo[];
    created_at: Date | null;
    fin_contrato: Date | null;
    image: string | null;
    last_edited_by: string;
    last_edited_on: string;
  }
) {
  try {
    return await request<ApiBase & { colaborador?: Employee }>({
      url: `/api/collaborator/${id}`,
      method: "PUT",
      headers: jsonHeaders,
      data: body,
    });
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    const txt = err.response?.data?.message ?? err.message;
    console.error("→ Cuerpo de la respuesta de error:", txt);
    throw new Error(txt);
  }
}

export async function addAssignedPersonToProject(
  projectId: string,
  person: {
    id: string;
    name: string;
    rol: string;
    seniority: string;
    tecnologias: string[];
    horasAsignadas: number;
  }
) {
  return request<ApiBase>({
    url: `/api/projects/${projectId}/assigned-persons`,
    method: "POST",
    headers: jsonHeaders,
    data: person,
  });
}

export async function updateAssignedPersonToProject(
  projectId: string,
  collaboratorId: string,
  fieldsToUpdate: {
    name?: string;
    rol?: string;
    seniority?: string;
    tecnologias?: string[];
    horasAsignadas?: number;
  }
) {
  return request<ApiBase>({
    url: `/api/projects/${projectId}/assignedPersons/${collaboratorId}`,
    method: "PUT",
    headers: jsonHeaders,
    data: { id: collaboratorId, ...fieldsToUpdate },
  });
}

export const fetchCollaborators = async (params?: FetchCollaboratorsParams) => {
  try {
    const qs = new URLSearchParams();

    if (params?.estadoAsignacion) {
      qs.set("estadoAsignacion", params.estadoAsignacion);
    }
    if (params?.search) {
      qs.set("search", params.search);
    }

    const url = `/api/collaborator/collaborators${qs.toString() ? `?${qs.toString()}` : ""}`;

    return await request<Employee[]>({
      url,
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener los colaboradores:", error);
    // mantenemos el mismo contrato que tenías (devolver undefined en error)
  }
};

export async function removecollaborator(id: string) {
  return request<{ status: string }>({
    url: `/api/collaborator/${id}`,
    method: "DELETE",
  });
}

export async function getSoftDeletedCollaborators(params?: { 
  search?: string; 
  limit?: number; 
}) {
  try {
    const qs = new URLSearchParams();
    
    if (params?.search) {
      qs.set("search", params.search);
    }
    if (params?.limit) {
      qs.set("limit", String(params.limit));
    }

    const url = `/api/collaborator/soft-deleted${qs.toString() ? `?${qs.toString()}` : ""}`;

    const res = await api.request<{
      status: string;
      message: string;
      data: Employee[];
      total: number;
    }>({
      url,
      method: "GET",
      headers: jsonHeaders,
    });

    if (!is2xx(res.status)) {
      const errorData = res.data as ApiBase;
      const txt = (typeof res.data === "string" ? res.data : errorData.message) || '';
      throw new Error(`Error ${res.status}: ${txt}`);
    }

    return res.data.data;
  } catch (err) {
    console.error("Error getting soft deleted collaborators:", err);
    throw err;
  }
}

export async function restoreCollaborator(id: string) {
  try {
    const res = await api.request<{
      status: string;
      message: string;
      collaborator: Employee;
    }>({
      url: `/api/collaborator/restore/${id}`,
      method: "POST",
      headers: jsonHeaders,
    });
    
    if (!is2xx(res.status)) {
      const errorData = res.data as ApiBase;
      const txt = (typeof res.data === "string" ? res.data : errorData.message) || '';
      throw new Error(`Error ${res.status}: ${txt}`);
    }
    return res.data;
  } catch (err) {
    console.error("Error restoring collaborator:", err);
    
    const axiosErr = err as AxiosError<{message?: string; error?: string}>;
    const errorMessage = axiosErr?.response?.data?.message || 
                        axiosErr?.response?.data?.error || 
                        (err as Error)?.message || 
                        'Error al restaurar colaborador';
    throw new Error(errorMessage);
  }
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const { imageKey } = await request<{ imageKey: string }>({
    url: `/api/upload/image`,
    method: "POST",
    data: formData,
  });
  return imageKey;
}

export async function getImageUrl(imageKey: string) {
  const { url } = await request<{ url: string }>({
    url: `/api/upload/image/${imageKey}`,
    method: "GET",
  });
  return url;
}

/* ============================================================================
 * PROYECTOS / VACANTES
 * ========================================================================== */

export const fetchProjects = async () => {
  try {
    const result = await request<{ data: Project[] }>({
      url: `/api/projects/`,
      method: "GET",
    });
    return (result.data ?? []).filter((p) => !p.delete_at);
  } catch (error) {
    console.error("Error al obtener los proyectos:", error);
    return [];
  }
};

export const fetchVacancies = async () => {
  try {
    const data = await request<Vacancie[]>({
      url: `/api/vacancie/`,
      method: "GET",
    });
    return data.filter((v) => !v.delete_at);
  } catch (error) {
    console.error("Error al cargar las vacantes:", error);
  }
};

export const fetchVacancie = async (id: string): Promise<Vacancie> => {
  const result = await request<{ data: Vacancie }>({
    url: `/api/vacancie/${id}`,
    method: "GET",
  });
  return result.data;
};

export async function getColumns(entity: string): Promise<ColumnConfig[]> {
  try {
    const data = await request<{ columns: ColumnConfig[] }>({
      url: `/api/configuration/columns/${entity}`,
      method: "GET",
    });
    return sortColumns(data.columns ?? []);
  } catch (error) {
    const fallback = getColumnsFallback(entity, error);
    if (fallback) {
      return sortColumns(fallback) as ColumnConfig[];
    }
    throw error;
  }
}

/** Para pantalla de colaboradores necesita ColumnConfigColaborador[] (isAction obligatorio) */
export const fetchTableColumns = async (
  entity: string
): Promise<ColumnConfigColaborador[]> => {
  try {
    const data = await request<{ columns: ColumnConfig[] }>({
      url: `/api/configuration/columns/${entity}`,
      method: "GET",
    });

    const cols = (data.columns || []).map((c) => ({
      ...c,
      isAction: Boolean((c as unknown as { isAction?: boolean }).isAction),
    }));

    return sortColumns(
      cols
    ) as unknown as ColumnConfigColaborador[];
  } catch (error) {
    const fallback = getColumnsFallback(entity, error);
    if (fallback) {
      return sortColumns(
        fallback.map((column) => ({
          ...column,
          isAction: Boolean(column.isAction),
        }))
      ) as unknown as ColumnConfigColaborador[];
    }
    throw error;
  }
};

export async function saveTableColumns(
  entity: string,
  columns: Array<Pick<TableColumn, "displayName" | "field" | "order">>
): Promise<ColumnConfig[]> {
  const data = await request<{ columns: ColumnConfig[] }>({
    url: `/api/configuration/updateColumns`,
    method: "PUT",
    headers: jsonHeaders,
    data: {
      tableType: entity,
      columns,
    },
  });

  return sortColumns(data.columns ?? []);
}

export async function getUsers() {
  return request<User[]>({ url: `/api/user/prueba`, method: "GET" });
}

export async function updateUser(
  email: string,
  payload: { rol: string; status: string }
) {
  const res = await api.request<ApiBase>({
    url: `/api/user/update/${email}`,
    method: "PUT",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const error = res.data;
    throw new Error(
      (error as ApiBase).message || "Error al actualizar usuario"
    );
  }
  return res.data;
}

export async function eliminarUsuarioPorEmail(email: string) {
  const res = await api.request<ApiBase>({
    url: `/api/user/delete/${email}`,
    method: "DELETE",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const error = res.data;
    throw new Error((error as ApiBase).message || "Error al eliminar usuario");
  }
  return res.data;
}

export async function getVacancies(search: string): Promise<Vacancie[]> {
  const data = await request<Vacancie[]>({
    url: `/api/vacancie/`,
    method: "GET",
    params: { search },
  });
  return data.filter((v) => !v.delete_at);
}

export async function editVacancy(id: string, payload: Partial<Vacancie>) {
  return request<{ vacancie: Vacancie; status: string }>({
    url: `/api/vacancie/${id}`,
    method: "PUT",
    headers: jsonHeaders,
    data: payload,
  });
}

export async function deleteVacancy(id: string) {
  return request<{ status: string }>({
    url: `/api/vacancie/${id}`,
    method: "DELETE",
  });
}

export const getColabById = async (
  id: string
): Promise<ResponseGetColabById> => {
  return request<ResponseGetColabById>({
    url: `/api/collaborator/${id}`,
    method: "GET",
  });
};

type AddColabResponse = ApiBase & {
  data?: { id?: string; _id?: string };
  id?: string;
  _id?: string;
  colaborador?: { id?: string; _id?: string };
};

export const fetchAddColab = async (payload: {
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  puesto_trabajo: string;
  estado: string;
  roles: { rol: string; seniority: string }[];
  seniority?: string;
  tecnologias: string[];
  fin_contrato: Date | string | null;
  start_contrato: Date | string | null;
  // honorarios: number;
  image: string | null;
  jornadaId: string;
}): Promise<AddColabResponse> => {
  return request<AddColabResponse>({
    url: `/api/collaborator/`,
    method: "POST",
    headers: jsonHeaders,
    data: payload,
  });
};

export const fetchProjectById = async (
  id: string
): Promise<ApiOne<Project>> => {
  return request<ApiOne<Project>>({
    url: `/api/projects/${id}`,
    method: "GET",
  });
};

export const fetchDeleteProjectById = async (id: string) => {
  return request<ApiBase>({ url: `/api/projects/${id}`, method: "POST" });
};

export async function editProject(id: string, payload: Partial<Project>) {
  return request<{ project: Project; status: string }>({
    url: `/api/projects/${id}`,
    method: "PUT",
    headers: jsonHeaders,
    data: payload,
  });
}

export async function registerVacanteService(body: {
  manager_id: string;
  manager_name: string;
  vacancieName: string;
  projectId: string;
  time: string | number;
  orderDate: string;
  startDate: string;
  seniority: string;
  skills: { technologyId: string; name: string }[];
}) {
  try {
    return await request<ApiBase & { data?: Vacancie }>({
      url: `/api/vacancie/`,
      method: "POST",
      headers: jsonHeaders,
      data: { ...body },
    });
  } catch (e) {
    const err = e as AxiosError<unknown>;
    const txt = (err.response?.data as unknown as string) ?? err.message;
    console.error(`400 Bad Request:`, txt);
    throw new Error(`Error ${err.status ?? ""}: ${txt}`);
  }
}

export async function updateCollaboratorService(
  id: string,
  body: {
    first_name: string;
    last_name: string;
    email: string;
    Proyectos: Array<{
      projectId: string | { id: string; name: string };
      rol?: string;
      tecnologias?: string;
      horasAsignadas?: number;
      seniority?: string;
    }>;
    tecnologias: string[];
    rol: string;
    estado: string;
    horasAsignadas: number;
    last_edited_on: string;
    delete_at: null | string | Date;
  }
) {
  try {
    return await request<ApiBase>({
      url: `/api/collaborator/${id}/asignar`,
      method: "PUT",
      headers: jsonHeaders,
      data: { ...body, id },
    });
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    const txt = err.response?.data?.message ?? err.message;
    console.error("→ Cuerpo de la respuesta de error:", txt);
    throw new Error(txt);
  }
}

export async function registerProjectService(
  body: RegisterProjectBody
): Promise<Project> {
  type RegisterProjectResponse = { project: Project } | Project;
  const hasProjectKey = (x: unknown): x is { project: Project } =>
    typeof x === "object" && x !== null && "project" in x;

  const data = await request<RegisterProjectResponse>({
    url: `/api/projects/register`,
    method: "POST",
    headers: jsonHeaders,
    data: body,
  });
  return hasProjectKey(data) ? data.project : (data as Project);
}

export const fetchManagers = () =>
  api
    .request<User[]>({ url: `/api/user/prueba`, method: "GET" })
    .then((res) => {
      if (!is2xx(res.status)) throw new Error("Error al cargar usuarios");
      return res.data;
    })
    .then((users) =>
      users
        .filter((u) => {
          const r = (u as { rol?: unknown }).rol;
          if (Array.isArray(r))
            return r.some(
              (x) => typeof x === "string" && x.toLowerCase() === "manager"
            );
          if (typeof r === "string") {
            const v = r.toLowerCase();
            return v === "manager" || v === "project manager";
          }
          return false;
        })
        .map((u) => ({
          manager_id: (u as unknown as { id?: string })?.id || "",
          manager_name:
            typeof u.name === "string" && u.name.trim()
              ? u.name.trim()
              : "Manager sin nombre",
        }))
    );

export async function fetchManager() {
  const data = await request<Employee[]>({
    url: `/api/collaborator/`,
    method: "GET",
  });
  return data.filter(
    (colab) =>
      Array.isArray(colab.roles) &&
      colab.roles.some((r) => {
        const rolLower = r.rol?.toLowerCase();
        return rolLower === "manager" || rolLower === "project manager";
      })
  );
}

/* ============================================================================
 * CONFIGURACIÓN / CAMPOS EXTRA (algunas devuelven ResponseLike)
 * ========================================================================== */
export async function getBasicFields() {
  return request<FieldDef[]>({ url: `/api/basic-fields`, method: "GET" });
}

export async function getExtraFields() {
  return request<FieldDef[]>({ url: `/api/extra-fields`, method: "GET" });
}

export async function deleteExtraField(
  id: string
): Promise<ResponseLike<ApiBase>> {
  try {
    const res = await api.request<ApiBase>({
      url: `/api/extra-fields/${id}`,
      method: "DELETE",
    });
    return toResponseLike(res);
  } catch (e) {
    return toErrorResponseLike(e as AxiosError<ApiBase>);
  }
}

export async function createExtraField(
  payload: Partial<FieldDef>
): Promise<ResponseLike<ApiOne<FieldDef> | ApiBase>> {
  try {
    const res = await api.request<ApiOne<FieldDef> | ApiBase>({
      url: `/api/extra-fields`,
      method: "POST",
      headers: jsonHeaders,
      data: payload,
    });
    return toResponseLike(res);
  } catch (e) {
    return toErrorResponseLike(e as AxiosError<ApiOne<FieldDef> | ApiBase>);
  }
}

export async function updateExtraField(
  id: string,
  payload: Partial<FieldDef>
): Promise<ResponseLike<ApiOne<FieldDef> | ApiBase>> {
  try {
    const res = await api.request<ApiOne<FieldDef> | ApiBase>({
      url: `/api/extra-fields/${id}`,
      method: "PUT",
      headers: jsonHeaders,
      data: payload,
    });
    return toResponseLike(res);
  } catch (e) {
    return toErrorResponseLike(e as AxiosError<ApiOne<FieldDef> | ApiBase>);
  }
}

type FieldValue = string | number | boolean | string[] | undefined;

export async function getPersonnel() {
  return request<unknown>({ url: `/api/personnel`, method: "GET" });
}

export async function createPersonnel(payload: {
  idExterno?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  birthDate?: string;
  extraData: Record<string, FieldValue>;
}): Promise<ResponseLike<ApiBase & { data?: unknown }>> {
  try {
    const res = await api.request<ApiBase & { data?: unknown }>({
      url: `/api/personnel`,
      method: "POST",
      headers: jsonHeaders,
      data: payload,
    });
    return toResponseLike(res);
  } catch (e) {
    return toErrorResponseLike(e as AxiosError<ApiBase & { data?: unknown }>);
  }
}

export async function updatePersonnel(
  id: string,
  payload: {
    idExterno?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    birthDate?: string;
    extraData: Record<string, FieldValue>;
  }
): Promise<ResponseLike<ApiBase & { data?: unknown }>> {
  try {
    const res = await api.request<ApiBase & { data?: unknown }>({
      url: `/api/personnel/${id}`,
      method: "PUT",
      headers: jsonHeaders,
      data: payload,
    });
    return toResponseLike(res);
  } catch (e) {
    return toErrorResponseLike(e as AxiosError<ApiBase & { data?: unknown }>);
  }
}

/* ============================================================================
 * NOTIFICACIONES (las pantallas usan .data)
 * ========================================================================== */

export const getAllNotifications = async (): Promise<{
  data: Notification[];
}> => {
  const res = await api.request<{ data: Notification[] }>({
    url: `/api/notification/all`,
    method: "GET",
  });
  if (!is2xx(res.status)) throw new Error("Error en la carga de datos");
  return res.data;
};

export const getNotificationsOrdered = async (
  order: "newest" | "oldest" = "newest"
): Promise<{ data: Notification[] }> => {
  const res = await api.request<{ data: Notification[] }>({
    url: `/api/notification/ordered`,
    method: "GET",
    params: { order },
  });
  if (!is2xx(res.status)) {
    const errorText =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.data;
};

export const getNotificationsByManager = async (
  emails: string[]
): Promise<{ data: Notification[] }> => {
  const res = await api.request<{ data: Notification[] }>({
    url: `/api/notification/byManager`,
    method: "GET",
    params: { emails: emails.join(",") },
  });
  if (!is2xx(res.status)) {
    const errorText =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.data;
};

export const getNotificationsByUser = async (
  email: string
): Promise<{ data: Notification[] }> => {
  const res = await api.request<{ data: Notification[] }>({
    url: `/api/notification/byUser/${email}`,
    method: "GET",
  });
  if (!is2xx(res.status)) throw new Error("Error al filtrar notificaciones");
  return res.data;
};

export const markNotificationAsRead = async (
  email: string,
  referenceId: string,
  type: string
) => {
  const res = await api.request<ApiBase>({
    url: `/api/notification/markAsRead`,
    method: "POST",
    headers: jsonHeaders,
    data: { email, referenceId, type },
  });
  if (!is2xx(res.status)) throw new Error("Error al marcar como leída");
  return res.data;
};

export const markAllNotificationsAsRead = async (email: string) => {
  const res = await api.request<ApiBase>({
    url: `/api/notification/markAllAsRead`,
    method: "POST",
    headers: jsonHeaders,
    data: { email },
  });
  if (!is2xx(res.status)) throw new Error("Error al marcar todas como leídas");
  return res.data;
};

export const checkProjectExpiration = async () => {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/notification/notiProjects`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) throw new Error("Error al verificar la expiración");
  return res.data;
};

export const checkContractExpiration = async () => {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/notification/notiContracts`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) throw new Error("Error al verificar la expiración");
  return res.data;
};

/* ============================================================================
 * ASIGNACIONES
 * ========================================================================== */

export const addAssignedPerson = async (
  projectId: string,
  person: {
    id: string;
    name: string;
    rol: string;
    seniority: string;
    tecnologias: string[];
    horasAsignadas: number;
  }
) => {
  const res = await api.request<ApiBase>({
    url: `/api/projects/${projectId}/assigned-persons`,
    method: "POST",
    headers: jsonHeaders,
    data: person,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
};

export const updateAssignedPerson = async (
  projectId: string,
  collaboratorId: string,
  fieldsToUpdate: { horasAsignadas?: number }
) => {
  const res = await api.request<ApiBase>({
    url: `/api/projects/${projectId}/assignedPersons/${collaboratorId}`,
    method: "PUT",
    headers: jsonHeaders,
    data: { id: collaboratorId, ...fieldsToUpdate },
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
};

export const removeProyectoFromColaborador = async (
  id: string,
  projectId: string
) => {
  const res = await api.request<ApiBase>({
    url: `/api/collaborator/${id}/proyectos`,
    method: "DELETE",
    headers: jsonHeaders,
    data: { projectId },
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
};

/* ============================================================================
 * CATÁLOGOS / SKILLS / JOBS / ESTADOS
 * ========================================================================== */

export const getAllTechnologies = async () => {
  const res = await api.request<Skill[]>({
    url: `/api/technologies/`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
};

export const fetchProjectStates = async (): Promise<ProjectStatus[]> => {
  const res = await api.request<ProjectStatus[]>({
    url: `/api/stateprojects/`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) throw new Error("Error al verificar la expiración");
  return res.data;
};

export async function updateCollaboratorAfterProjectDeletion(
  collaboratorId: string,
  updatedData: {
    Proyectos: {
      projectId: string | { id: string; name: string };
      rol?: string;
      tecnologias?: string;
      horasAsignadas?: number;
      seniority?: string;
    }[];
    setHorasAsignadas: number;
    last_edited_by: string | null;
  }
) {
  try {
    const res = await api.request<ApiBase>({
      url: `/api/collaborator/${collaboratorId}`,
      method: "PUT",
      headers: jsonHeaders,
      data: updatedData,
    });
    if (!is2xx(res.status)) {
      throw new Error(`Error HTTP ${res.status}`);
    }
    return res.data;
  } catch (e) {
    console.error("❌ Error actualizando colaborador:", e);
    return { status: "error", error: (e as Error).message };
  }
}

/* ============================================================================
 * AUTH / IA / DASHBOARD
 * ========================================================================== */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const loginUser = async (email: string, password: string) => {
  try {
    const res = await api.request({
      url: `/api/user/login`,
      method: "POST",
      headers: jsonHeaders,
      data: { email, password },
    });
    const data = res.data as { token?: string; user?: unknown };
    return { ...data, token: String(data.token ?? "") };
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    // Tiramos un Error con el texto que ya viene listo para la UI
    throw new Error(err.response?.data?.message || "No se pudo iniciar sesión");
  }
};

export const recoverPassword = async (email: string) => {
  try {
    return await request<ApiBase>({
      url: `/api/user/auth/editpws`,
      method: "POST",
      headers: jsonHeaders,
      data: { email },
    });
  } catch (error) {
    console.error("Error al recuperar la contraseña:", error);
  }
};

export async function fetchTechnologies(): Promise<Skill[]> {
  const payload = await request<Skill[] | { data: Skill[] }>({
    url: `/api/technologies/`,
    method: "GET",
  });
  return Array.isArray(payload) ? payload : payload.data;
}

export const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  const res = await api.request<ApiBase>({
    url: `/api/user/auth/resetpassword`,
    method: "POST",
    headers: jsonHeaders,
    data: { email, newPassword, confirmPassword },
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
};

export const getJobs = async () => {
  const res = await api.request<Job[]>({
    url: `/api/roles/`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
};

export async function createJob(payload: {
  name: string;
  description: string;
  status: boolean;
}) {
  const res = await api.request<
    ApiBase & { role?: Job; client?: Client; data?: unknown }
  >({
    url: `/api/roles/`,
    method: "POST",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function updateJob(
  id: string,
  payload: { name: string; description: string; status: boolean }
) {
  const res = await api.request<ApiBase & { role?: Job; data?: unknown }>({
    url: `/api/roles/${id}`,
    method: "PUT",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function deleteJob(id: string) {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/roles/${id}`,
    method: "DELETE",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export const getClient = async (): Promise<Client[]> => {
  const res = await api.request<Client[]>({
    url: `/api/client/`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
};

export async function createClient(payload: {
  name: string;
  cuit: string;
  razonSocial: string;
  description: string;
  status: boolean;
}) {
  const res = await api.request<ApiBase & { client?: Client; data?: unknown }>({
    url: `/api/client/`,
    method: "POST",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}


export async function updateClient(
  id: string,
  payload: {
    name: string;
    cuit: string;
    razonSocial: string;
    description: string;
    status: boolean;
  }
) {
  const res = await api.request<ApiBase & { client?: Client; data?: unknown }>({
    url: `/api/client/${id}`,
    method: "PUT",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function deleteClient(id: string) {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/client/${id}`,
    method: "DELETE",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}



function toSnake(p: IARequestSnake | IARequestCamel): IARequestSnake {
  if ("request_details" in p) {

    return p;
  }
  const req = p.requestDetails;
  return {
    request_details: {
      request_date: req.requestDate,
      start_date: req.startDate,
      budget: req.budget,
      objective: req.objective,
    },
    positions_requested: p.positionsRequested.map((x: IARequestCamel["positionsRequested"][number]) => ({
      position_id: x.positionId,
      role: x.role,
      technologies: x.technologies,
      seniority: x.seniority,
      assigned_hours_needed: x.assignedHoursNeeded,
      quantity: x.quantity,
      ...(x.suggestedId ? { suggested_id: x.suggestedId } : {}),
    })),
  };
}

export async function recommendTeam(
  payload: IARequestSnake | IARequestCamel
): Promise<ApiBase & { data: SuggestionResponse }> {
  const dataSnake = toSnake(payload);

  const res = await api.request<ApiBase & { data: SuggestionResponse }>({
    url: `/api/ia/recommend-team`,
    method: "POST",
    headers: jsonHeaders,
    data: dataSnake,
  });

  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function metricsDashboard(): Promise<DashboardData> {
  return request<DashboardData>({
    url: `/api/dashboard/metrics`,
    method: "GET",
  });
}

export const getSkills = async () => {
  return request<Skill[]>({ url: `/api/skills/`, method: "GET" });
};

export const getActiveSkills = async () => {
  return request<Skill[]>({
    url: `/api/skills`,
    method: "GET",
    params: { active: true },
  });
};

export async function createSkill(payload: Skill) {
  const res = await api.request<ApiBase & { skill?: Skill; data?: unknown }>({
    url: `/api/skills/`,
    method: "POST",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function updateSkill(
  id: string,
  payload: { name: string; description: string; status: boolean }
) {
  const res = await api.request<ApiBase & { skill?: Skill; data?: unknown }>({
    url: `/api/skills/${id}`,
    method: "PUT",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function deleteSkill(id: string) {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/skills/${id}`,
    method: "DELETE",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function registerProjectWithRelationsService(payload: PayloadIA) {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/projects/register-relations`,
    method: "POST",
    headers: jsonHeaders,
    data: payload,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}

export async function fetchAuthorization(token: string, action: string) {
  return request<ApiBase & { data?: unknown }>({
    url: `/api/user/authorize/${token}/${action}`,
    method: "GET",
    headers: jsonHeaders,
  });
}

/* ============================================================================
 * Registro de usuario
 * ========================================================================== */
export async function registerUserService(registerData: {
  name: string;
  email: string;
  password: string;
  rol: string;
}) {
  const res = await api.request<
    ApiBase & { user?: User; token?: string; data?: unknown }
  >({
    url: `/api/user/register`,
    method: "POST",
    headers: jsonHeaders,
    data: registerData,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string"
        ? res.data
        : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}
/* ============================================================================
 * Importacion de datos Bizneo
 * ========================================================================== */
async function fetchJSON<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`
    );
  }
  return (await res.json()) as T;
}
export async function runFullSync(
  opts: {
    perPage?: number;
    startPage?: number;
    maxPages?: number | null;
    delayMs?: number;
    limit?: number;
  } = {}
): Promise<FullSyncResponse> {
  const {
    perPage = 25,
    startPage = 1,
    maxPages = null,
    delayMs = 10000,
    limit = 400,
  } = opts;

  const res = await api.request<FullSyncResponse>({
    url: `/api/sync/bizneo/collaborators`,
    method: "POST",
    params: { limit },
    headers: { "Content-Type": "application/json" },
    data: { perPage, startPage, maxPages, delayMs },
    withCredentials: true,
  });
  return res.data;
}

export async function fetchBizneoCollaboratorFull(
  bizneoId: string | number
): Promise<BizneoUser> {
  const res = await api.request<{ data: BizneoUser }>({
    url: `/api/sync/bizneo/collaborators/${bizneoId}`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return res.data.data;
}

export async function preserveBizneoCollaborator(collaboratorId: string | number) {
  try {
    const res = await api.request<ApiBase>({
      url: `/api/sync/bizneo/collaborators/activate/${collaboratorId}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    if (!is2xx(res.status)) {
      const txt = (typeof res.data === "string" ? res.data : (res.data as ApiBase).message) || '';
      throw new Error(`Error ${res.status}: ${txt}`);
    }
    return res.data;
  } catch (err) {
    console.error("Error preserving Bizneo collaborator:", err);
    throw err;
  }
}
/* ============================================================================
 * Jornadas(Modalidad)
 * ========================================================================== */
export async function getJourneyModes() {
  const res = await api.request<jornada[]>({
    url: `/api/jornadas/`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
}
export async function getJourneyById(id: string) {
  const res = await api.request<jornada | { data: jornada }>({
    url: `/api/jornada/${id}`,
    method: "GET",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  const payload = res.data;
  const jornada: jornada = 'data' in payload && payload.data?.name
    ? payload.data
    : payload as jornada;

  return jornada;
}

export async function createJourney(payload: { name: string; description: string, status: boolean, hours: number }) {
  const res = await api.request<ApiBase & { jornada?: jornada; data?: unknown }>(
    {
      url: `/api/jornadas/`,
      method: "POST",
      headers: jsonHeaders,
      data: payload,
    });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
}
export async function updateJourney(
  id: string,
  payload: { name: string; description: string, status: boolean, hours: number }
) {
  const res = await api.request<ApiBase & { jornada?: jornada; data?: unknown }>(
    {
      url: `/api/jornadas/${id}`,
      method: "PUT",
      headers: jsonHeaders,
      data: payload,
    });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
}

export async function deleteJourney(id: string) {
  const res = await api.request<ApiBase & { data?: unknown }>({
    url: `/api/jornadas/${id}`,
    method: "DELETE",
    headers: jsonHeaders,
  });
  if (!is2xx(res.status)) {
    const txt =
      (typeof res.data === "string" ? res.data : (res.data as unknown)) ?? "";
    throw new Error(`Error ${res.status}: ${String(txt)}`);
  }
  return res.data;
}

export async function getBrandConfig(): Promise<BrandConfig | null> {
  try {
    return await request<BrandConfig>({ url: `/api/brand-config`, method: "GET" });
  } catch {
    return null;
  }
}

export async function createBrandConfig(payload: Partial<BrandConfig>): Promise<BrandConfig> {
  const body: Partial<BrandConfig> & Record<string, unknown> = { ...payload };
  if (typeof body.slug === "string" && body.slug.trim() === "") {
    delete (body as { slug?: string }).slug;
  }

  const res = await api.request<BrandConfig>({
    url: `/api/brand-config`,
    method: "POST",
    headers: jsonHeaders,
    data: body,
  });
  if (!is2xx(res.status)) throw new Error(`Error ${res.status}`);
  return res.data;
}

export async function updateBrandConfig(payload: Partial<BrandConfig>): Promise<BrandConfig> {
  const body: Partial<BrandConfig> & Record<string, unknown> = { ...payload };
  delete (body as { id?: string }).id;
  if (typeof body.slug === "string" && body.slug.trim() === "") {
    delete (body as { slug?: string }).slug;
  }
  try {
    console.debug('[brand-config][update] body', body);
    const res = await api.request<BrandConfig>({
      url: `/api/brand-config`,
      method: "PUT",
      headers: jsonHeaders,
      data: body,
    });
    if (!is2xx(res.status)) {
      console.warn('[brand-config][update] non-2xx', res.status, res.data);
      throw new Error(`Error ${res.status}`);
    }
    console.debug('[brand-config][update] success', res.data);
    return res.data;
  } catch (err: unknown) {
    const e = err as { message?: string; response?: { status?: number; data?: unknown } };
    console.error('[brand-config][update] error', e?.message, e?.response?.status, e?.response?.data);
    throw err;
  }
}

export async function deleteBrandConfig(id: string): Promise<void> {
  const res = await api.request({ url: `/api/brand-config/${id}`, method: "DELETE" });
  if (!is2xx(res.status)) throw new Error(`Error ${res.status}`);
}
/* ============================================================================
 * History de colaborador
 * ========================================================================== */
export type Snap = { projectId: unknown; projectName?: string; role?: string | null; hoursAssigned?: number | null; };
export type RecordDailyBlockReq = { userId?: string; previous: Snap[]; next: Snap[]; dateKey?: string };
export type RecordDailyBlockRes = { status: "success"; changeId: string; dateKey: string };
export async function recordDailyHistory(
  collabId: string,
  payload: RecordDailyBlockReq
): Promise<RecordDailyBlockRes> {
  const res = await api.request<RecordDailyBlockRes>({
    url: `/api/history-colaborador/${collabId}/history/blocks`,
    method: "POST",
    data: payload,
    headers: jsonHeaders,
  });
  return res.data;
}

export async function getHistoryBlocks(collabId: string) {
  const res = await api.request({
    url: `/api/history-colaborador/${collabId}/history/blocks`,
    method: "GET",
    headers: jsonHeaders,
  });
  return res.data; // { status, history: HistoryBlock[] con removed/added/updated derivado }
}



/**
 * Analytics / IA query helper
 * Calls the single backend endpoint POST /api/ia/analytics/query with { query }
 */
type AnalyticsResponse = ApiBase & {
  response?: {
    totalResults?: number | string;
    total_results?: number | string;
    results?: unknown[];
    collection?: string;
  };
  items?: unknown[];
  results?: unknown[];
  data?: unknown[];
  count?: number;
  message?: string;
  interpretation?: string;
  collection?: string;
  collection_name?: string;
  collectionName?: string;
};

function getStringField(obj: unknown, ...keys: string[]): string {
  if (!obj || typeof obj !== "object") return "";
  for (const k of keys) {
    const val = (obj as Record<string, unknown>)[k];
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
  }
  return "";
}


export async function queryAnalytics(query: string): Promise<AnalyticsResponse> {
  const res = await api.request<AnalyticsResponse>({
    url: `/api/ia/analytics/query`,
    method: "POST",
    headers: jsonHeaders,
    data: { query },
  });
  if (!is2xx(res.status)) {
    const txt = (typeof res.data === "string" ? res.data : (res.data as ApiBase).message) || "";
    throw new Error(`Error ${res.status}: ${txt}`);
  }
  return res.data;
}


export async function analyticsFindProjects(
  query: string
): Promise<{ totalResults: number; results: Project[] }> {
  const payload = await queryAnalytics(query);
  const resp = payload?.response;
  if (!resp) return { totalResults: 0, results: [] };
  const total = Number(resp.totalResults ?? resp.total_results ?? 0) || 0;

  const collection = typeof resp.collection === "string" ? resp.collection.toLowerCase() : "";
  if (Array.isArray(resp.results) && collection === "projects") {
    const resultsArray = resp.results as unknown[];
    const mapped: Project[] = resultsArray.map((r) => {
      const obj = r as Record<string, unknown>;
      const assigned = obj.assignedPersons;
      return {
        id: getStringField(obj, "_id", "id"),
        name: getStringField(obj, "name"),
        client: getStringField(obj, "client"),
        status: getStringField(obj, "status"),
        managerName: getStringField(obj, "managerName", "manager_name"),
        image: typeof obj.image === "string" ? obj.image : undefined,
        assignedPersons: Array.isArray(assigned)
          ? (assigned as unknown as Project["assignedPersons"]) // best-effort cast from unknown
          : [],
      } as Project;
    });
    return { totalResults: total, results: mapped };
  }
  return { totalResults: total, results: [] };
}

export async function analyticsGetCount(query: string): Promise<number> {
  const payload = await queryAnalytics(query);
  const resp = payload?.response;
  if (!resp) return 0;
  return Number(resp.totalResults ?? resp.total_results ?? 0) || 0;
}


export async function exportAnalyticsReportClient(payload: unknown, filename?: string) {
  try {
    const res = await api.request({
      url: `/api/ia/analytics/export`,
      method: "POST",
      headers: { ...jsonHeaders },
      data: payload,
      responseType: "arraybuffer",
    });

    const arrayBuffer = res.data as ArrayBuffer;
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const downloadName = filename || `reporte_rubik_${new Date().toISOString().slice(0, 10)}.xlsx`;
    if (typeof window !== "undefined") {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }

    return { ok: true, filename: downloadName };
  } catch (err) {
    // Try to extract useful information from the server response so caller can debug the 400
    try {
      const e = err as {
        message?: string;
        response?: { status?: number; data?: unknown };
      };
      const status = e.response?.status;
      const data = e.response?.data;
      let serverMsg = "";
      if (data) {
        if (typeof data === "string") serverMsg = data;
        else if (typeof data === "object") {
          try {
            // best-effort: stringify
            serverMsg = JSON.stringify(data);
          } catch {
            serverMsg = String(data);
          }
        } else {
          serverMsg = String(data);
        }
      }
      console.error("Error exporting analytics report:", { status, serverMsg, err });
      throw new Error(`Export failed (status ${status ?? "unknown"}): ${serverMsg || e.message || "no details"}`);
    } catch (inner) {
      console.error("Error exporting analytics report - failed to parse error:", inner, err);
      throw err;
    }
  }
}
