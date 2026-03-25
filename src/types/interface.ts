//interfaces para la busqueda
export interface CardProps {
  searchTerm: string;
}
////////////////////////////
//interfaz para obtener las columnas
export interface ColumnConfig {
  displayName: string;
  field: keyof Vacancie;
  order: number;
  isAction?: boolean;
}
export interface ColumnConfigColaborador {
  displayName: string;
  field: string;
  order: number;
  isAction: boolean;
}
////////////////////////////////7
//Interfaces para la notificacion//
export interface Reader {
  email: string;
  readAt: Date | null;
  _id: string;
}
export interface Notification {
  _id: string;
  message: string;
  type: "contract" | "project";
  alertLevel: "warning" | "expired";
  referenceId: string;
  readers: Reader[];
  sentAt: Date;
}
//interfaces para los componentes de vacante

export interface Vacancie {
  id: string;
  manager_id: string | null;
  manager_name: string;
  projectId: {
    id: string;
    name: string;
    client?: string | null;
  };
  status: "Abierta" | "En Proceso" | "Finalizada";
  description: string;
  vacancieName: string;
  time: string | number;
  orderDate: string;
  startDate: string;
  seniority: string;
  manager_visible_in_org_chart: boolean;
  last_edited_by: string;
  last_edited_on: string;
  created_at: string;
  delete_at: string;
  skills: Skill[];
}

export interface VacanciePayload {
  hours?: string;
  vacancieName: string;
  time: string | number; // "0" | "20" | "40" | "60"
  orderDate: string; // "YYYY-MM-DD"
  startDate: string; // "YYYY-MM-DD"
  seniority: string; // p.ej. "Senior"
  manager_id: string | null;
  manager_name: string;
  skills: Skill[] | { name: string }[];
  projectId?: { id: string; name: string; client?: string | null };
}

export interface VacanteConPorcentaje {
  Vacante: string;
  delete_at: string;
  cantidad: number;
  porcentaje: number;
}
/////////////////////////////////////////////////
//interfaces para los componentes de colaboradores
export interface projectCollaborator {
  rol: string;
  projectId: {
    id: string;
    name: string;
  };
  tecnologias: string;
  horasAsignadas: number;
  seniority: string;
}
export interface RolSeniorityInfo {
  rol: string;
  seniority: string;
}
export interface Employee {
  contractStatus?: {
    daysRemaining: number | null;
    alertLevel: "warning" | "expired" | "on_time" | null;
    message?: string | null;
  };
  bizneoId?: number | string;
  id: string;
  dni: number;
  first_name: string;
  last_name: string;
  email: string;
  Proyectos: projectCollaborator[];
  PuestoDeTrabajo: string;
  tecnologias: string[];
  // honorarios: number;
  estado:string;
  HorasAsignadas: string;
  delete_at: Date | null;
  created_at: Date | null;
  observacion: number;
  roles: RolSeniorityInfo[];
  horasAsignadas: number;
  fin_contrato: Date | null;
  start_contrato: Date | null;
  last_edited_by: string;
  last_edited_on: string;
  first_nameS: string;
  last_nameS: string;
  alertLevel: "warning" | "expired" | null;
  contractMessage: string | null;
  daysRemaining: number | null;
  image: string | null;
  orderDate: string;
  startDate: string;
  jornadaId: jornada | string;
}
export interface ResponseGetColabById {
  collaborator: Employee;
  status: string;
}

//////////////////////////////
//interfaces para los componentes de proyectos
export interface AssignedPersons {
  horasAsignadas: number;
  id: string;
  name: string;
  rol: string;
  seniority: string;
  tecnologias: string[];
}

export interface ProjectNew {
  assignedPersons: AssignedPersons[];
  client: string | null;
  contractStatus?: {
    daysRemaining: number | null;
    alertLevel: "warning" | "expired" | "on_time" | null;
    message?: string | null;
  };
  created_at?: string;
  delete_at?: string | null;
  description: string | null;
  endDate: Date | null;
  image: string | null;
  id: string;
  last_edited_on: string;
  last_edited_by: string;
  managerId: string | null;
  managerName: string | null;
  managerVisibleInOrgChart?: boolean;
  name: string;
  phase: string | null;
  projectType: string | null;
  startDate: Date | null;
  status: string | null;
  taxonId?: number;
  category: "Gobierno" | "Privado" | "Inversion" | null;
  budget: number | null;
}

//
export interface Project {
  id: string;
  taxonId: number;
  name: string;
  client: string;
  managerId: string;
  managerName: string;
  image: string;
  status: string;
  phase: string;
  projectType: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  assignedPersons: AssignedPersons[];
  delete_at?: string;
  last_edited_by: string;
  last_edited_on: string;
  alertLevel: "warning" | "expired" | null;
  contractMessage: string | null;
  daysRemaining: number | null;
  category: "Gobierno" | "Privado" | "Inversion";
  budget: number | null;
}

export interface ManagerPerson {
  manager_name: string;
  manager_id: string;
}
////////////////////////////////////////

//interfaces para los componentes de tecnologias//
export interface TechnologyCount {
  tecnologias: string;
  cantidad: number;
  personas: { first_name: string; last_name: string }[];
}
////////////////////////////////////////////////////////7
//interfaces para usuario//////////////////
//////////////////////////////////////////
export interface User {
  name: string;
  email: string;
  status: string;
  rol: string;
  delete_at: string;
  _id: string;
}
////////////////////////////////////77

//interface para cambiar la vista
export interface SearchCardToggleProps {
  viewMode: "cards" | "table";
  setViewMode: (mode: "cards" | "table") => void;
  setSearchTerm: (term: string) => void;
  currentSection: "proyecto" | "colaboradores" | "vacante";
  onAddClick?: () => void;
  onAddSuccess?: () => void;
}

/*export type ActuColaborador = {
  id: string;
  first_name: string;
  last_name: string;
  rol: string[];
  Proyectos: any;
  email: string;
  estado: string;
  horasAsignadas: string | number;
  tecnologias: string[];
  last_edited_on: string;
  delete_at: string;
};*/

export type RegisterProjectBody = {
  managerId: string | null;
  managerName: string | null;
  image: string | null;
  name: string;
  client: string | null;
  status: string | null;
  projectType: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  managerVisibleInOrgChart?: boolean;
  category: "Gobierno" | "Privado" | "Inversion";
  budget: number | null;
  assignedPersons: AssignedPersons[];
  ia_generated: boolean;
};

export type Tecnologia = {
  id: string;
  name: string;
};

export type Manager = {
  manager_id: string;
  manager_name: string;
  // manager_role: string;
};

export type Job = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  status: boolean;
};

export type Client = {
  id: string;
  name: string;
  cuit: string;
  razonSocial: string;
  description: string;
  status: boolean;
};
export type GetClientResponse = {
  status: string;
  clients: Client[];
};

export interface SuggestionResponse {
  request_id: string;
  response_date: string; // ISO 8601
  budget_details: {
    total_requested: number;
    total_assigned: number;
    remaining: number;
  };
  positions: SuggestionPosition[];
}

export interface SuggestionPosition {
  position_id: string;
  role_requested: string;
  seniority_requested: string; // p.ej. "Senior"
  technologies_requested: string[];
  candidates: SuggestionCandidate[];
  vacancy_needed: boolean;
  vacancy_message: string;
}

export interface SuggestionCandidate {
  id: string;
  name: string;
  score: number;
  score_details: ScoreDetails;
  is_user_suggestion: boolean;
  suggestion_analysis: string | null;
  suggested_by_ia: boolean;
  availability_message: string; // p.ej. "Disponible (140h libres)"
  known_technologies: string[];
  missing_data_warnings: string[]; // p.ej. ["evaluacion_de_desempeno","sueldo"]
}

export interface ScoreDetails {
  "Puntos por Habilidad Técnica": number;
  "Bonus por Seniority": number;
  "Puntos por Desempeño": number;
  "Puntos por Disponibilidad": number;
  "Bonus por Sugerencia del Usuario": number;
}

export interface ProjectPayload {
  name: string;
  client: string;
  status: string; // p.ej. "Preproyecto"
  projectType: string; // p.ej. "Horas"
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  manager_id: string;
  image: string;
  managerName: string;
  description: string;
  category: "Gobierno" | "Privado" | "Inversion";
  budget: string; // viene como string en tu JSON
  vacancies: ProjectVacancy[];
  manager_name?: string; // también lo mandás duplicado; lo dejo opcional
}

export interface ProjectVacancy {
  role: string; // p.ej. "Dev. FullStack"
  collaboratorId: string; // en tu JSON puede venir "null" (string)
  technology: string[];
  time: number; // viene como string en tu JSON
  requestDate: string; // "YYYY-MM-DD"
  startDate: string; // "YYYY-MM-DD"
  seniority: string; // p.ej. "Senior"
}

// YYYY-MM (mes con 2 dígitos)
type YYYY = `${number}${number}${number}${number}`;
type MM =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12";
export type YearMonth = `${YYYY}-${MM}`;

export interface DashboardData {
  metricasClave: MetricasClave;
  contratacionesMensuales: ContratacionesMensuales;
  estadoDeProyectos: EstadoResumen; // { total, porEstado: Record<string, number> }
  estadoDeAsignacion: EstadoResumen; // { total, porEstado: Record<string, number> }
  tecnologiasTop: TecnologiaTop[];
  personasPorProyecto: PersonasPorProyecto[];
}

export interface MetricasClave {
  totalColaboradores: number;
  proyectosActivos: number;
  vacantesActivas: number;
  totalTecnologias: number;
}

export interface ContratacionesMensuales {
  titulo: string;
  datos: Array<{
    mes: YearMonth; // p.ej. "2025-08"
    nuevasContrataciones: number;
  }>;
}

export interface EstadoResumen {
  total: number;
  porEstado: Record<string, number>; 
}

export interface TecnologiaTop {
  nombre: string;
  cantidad: number;
}

export interface PersonasPorProyecto {
  _id: string;
  nombre: string;
  cantidad: number;
}

export interface ProjectStatus {
  _id: string;
  id: string;
  status: string;
}

export interface Candidate {
  id: string;
  name: string;
  score: number; // 0-100
  is_user_suggestion: boolean; // true ⇒ candidato sugerido por el usuario
  suggestion_analysis: string | null; // null ⇒ no sugerido por IA
  suggested_by_ia: boolean; // true ⇒ candidato sugerido por IA
  availability_message: string; // "Disponible (160h libres)" o "No disponible"
  missing_data_warnings: string[]; // ["evaluacion_de_desempeno", "sueldo"]
  known_technologies: string[]; // ["React", "NodeJs", "Angular"]
  selected?: boolean; // true ⇒ candidato elegido por el usuario (max 1 por rol)
}

export interface Role {
  id: string;
  name: string;
  candidates: Candidate[];
}

export interface Vacancy {
  id: string;
  role: string;
  technology: string;
  weeklyHours: number;
}

export interface ProjectInfo {
  name: string;
  description: string;
  startDate: string; // ISO
  endDate: string; // ISO
  roles: Role[];
  vacancies: Vacancy[];
}

export interface Position {
  position_id: string;
  role_requested: string;
  seniority_requested: string;
  candidates: Candidate[];
  vacancy_needed?: boolean;
  vacancy_message?: string;
  technologies_requested: string[];
}

export interface PayloadIA {
  project: {
    managerId: string | null;
    managerName: string | null;
    name: string;
    image: string | null;
    client: string | null;
    status: string | null;
    projectType: string;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    category: string | null;
    budget: number | null;
    managerVisibleInOrgChart: boolean;
    assignedPersons: AssignedPerson[];
  };
  collaborators: Collaborator[];
  vacancies: VacanciePayload[];
}

interface AssignedPerson {
  id: string;
  name: string;
  rol: string;
  seniority: string;
  horasAsignadas: string;
  tecnologias: string[];
  orderDate?: string;
  startDate?: string;
}

interface Collaborator {
  id: string;
  name: string;
  rol: string;
  seniority: string;
  projectHours: number;
}

export interface CollaboratorFormData {
  id: string;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  estado: string; // "Tiempo Completo" | "Medio Tiempo" | "Pasante" (si querés, lo cerramos)
  puesto_trabajo: string;
  // honorarios: number;
  seniority: string;
  tecnologias: string[];
  fin_contrato: string; // YMD | "" si permitís vacío
  start_contrato: string; // YMD | "" si permitís vacío
  proyectos: string[];
  imageKey: string;
  image: string;
  jornadaId: string;
}

export type Asignacion = { rol: string; horas: number; tech?: string };

export type FormDataState = {
  name: string;
  client: string;
  status: string;
  projectType: string;
  startDate: string;
  endDate: string;
  manager_id: string;
  image: string;
  managerName: string;
  description: string;
  category: "Gobierno" | "Privado" | "Inversion";
  budget: string;
  vacancies: ProjectVacancy[];
};

// ==== Colaborador "lite" que devuelve el back en created/updated ====
export type BackendCollabLite = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  changes?: string[]; // en updated/created viene; en in_db no
};

// ==== Ítems "skipped" que el back usa para armar inactivos desde Bizneo ====
export type SkippedItem = {
  reason: string;
  hint?: {
    id?: string | number;
    email?: string | null;
  };
};

// ==== Secciones de inactivos del reporte ====
export type InactiveFromBizneo = {
  total: number;
  items: SkippedItem[];
};

export type InactiveInDb = {
  total: number;
  items: Pick<
    BackendCollabLite,
    "_id" | "first_name" | "last_name" | "email"
  >[]; // sin changes
};

// ==== Reporte que necesita el front, según tu back ====
export type ReporteColaboradores = {
  created: BackendCollabLite[]; // [{_id, first_name, last_name, email, changes}]
  updated: BackendCollabLite[]; // idem
  skipped: SkippedItem[]; // [{reason, hint}]
  inactive: {
    from_bizneo: InactiveFromBizneo;
    in_db: InactiveInDb;
  };
};

// ==== Summary que devuelve el servicio (syncFromUsersList / runFullSync) ====
export type CollaboratorsSummary = {
  processed: number;
  ok: number;
  fail: number;
  skippedByContract: number;
  skippedByEmail: number;
};

// ==== Respuesta del endpoint de full sync que consumís en el front ====
export type FullSyncResponse = {
  message?: string;
  limit?: number;
  summary?:
    | {
        collaborators: CollaboratorsSummary;
      }
    | CollaboratorsSummary; // (el controller de /collaborators puede devolver summary simple)
  report?: {
    collaborators: {
      created: BackendCollabLite[];
      updated: BackendCollabLite[];
      skipped: SkippedItem[];
      inactive: {
        from_bizneo: InactiveFromBizneo;
        in_db: InactiveInDb;
      };
    };
  };
};

// ==== Tipo de UI interno que ya usabas en el componente ====
export type CambioCollab = {
  id: string;
  name: string;
  email: string | null;
  changes?: string[];
};
export type BizneoUser = {
  bizneoId: number | string | null;
  dni?: string | number | null;

  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  birthday?: string | null;
  marital_status?: string | null;
  alias?: string | null;

  role?: string | null;
  seniority?: string | null;
  access?: string | null;
  company_phone?: string | null;
  last_login_at?: string | null;

  email?: string | null;
  alt_email?: string | null;
  phone?: string | null;

  country?: string | null;
  province?: string | null;
  city?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  zip?: string | null;
  piso?: string | null;
  dpto?: string | null;

  nivel?: string | null;
  nivel_2?: string | null;
  carrera?: string | null;
  carrera_2?: string | null;
  estado_carrera?: string | null;

  contract?: {
    id: number | string | null;
    start_at: string | null;
    end_at: string | null;
    fte: number | null;
    status: "active" | "inactive";
  } | null;

  image?: string | null;
  projects?: Array<{ id: number; name: string }>;
};
export type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error?: string | null;
  data?: BizneoUser | null;
  editId?: string;
};
export type jornada = {
  id: string;              
  name: string;            
  hours: number;  
  status: boolean;         
  description?: string;    
  createdAt: Date;         
  updatedAt: Date; 
};
export type FetchCollaboratorsParams = {
  estadoAsignacion?: string | null; // "Sobreasignado" | "Asignado" | "Subasignado" | "Sin asignar"
  search?: string | null;           // opcional, por si querés delegar la búsqueda al backend
};

export interface BrandConfig {
  id: string;
  empresaId: string;
  companyName: string;
  slug: string;
  status: 'active' | 'inactive';
  name: 'claro' | 'oscuro'; 
  logo?: string;     
  favicon?: string;  
  theme: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    modal?: string;
    button?: string;
    text?: string;
    navbar?: string;
    card: string;
    miniCard?: string;
  };
}

export type BrandConfigUpsert = Partial<Omit<BrandConfig, 'id' | 'logo' | 'favicon'>> & {
  logoFile?: File;
  faviconFile?: File;
};

export type IARequestSnake = {
  request_details: {
    request_date: string;
    start_date: string;
    budget: number;
    objective: string;
  };
  positions_requested: Array<{
    position_id: string;
    role: string;
    technologies: string[];
    seniority: string; 
    assigned_hours_needed: number;
    quantity: number;
    suggested_id?: string; 
  }>;
};

export type IARequestCamel = {
  requestDetails: {
    requestDate: string;
    startDate: string;
    budget: number;
    objective: string;
  };
  positionsRequested: Array<{
    positionId: string;
    role: string;
    technologies: string[];
    seniority: string; 
    assignedHoursNeeded: number;
    quantity: number;
    suggestedId?: string;
  }>;
};

// types/history.ts
export type ObjectIdString = string;

export interface ProjectRef {
  id: ObjectIdString;
  name: string;
}

export interface AssignmentUI {
  projectId: ProjectRef;
  rol: string;
  seniority: string;
  horasAsignadas: number;
}

export interface ChangeSnapshot {
  projectId: ObjectIdString | null;
  role: string | null;
  hoursAssigned: number;
}

export interface AssignmentChange {
  previous: ChangeSnapshot | null;
  next: ChangeSnapshot | null;
}

export interface  RecordAssignmentChangesRequest {
  userId?: string;
  changes: AssignmentChange[];
}

export interface RecordAssignmentChangesResponse {
  status: "success";
  historyId: ObjectIdString;
  inserted: number;
  lastChange: {
    previous: ChangeSnapshot | null;
    next: ChangeSnapshot | null;
    changedBy: ObjectIdString;
    timestamp: string;
  };
}
