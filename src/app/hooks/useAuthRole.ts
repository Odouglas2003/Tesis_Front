import { useEffect, useState } from "react";
import { getUsers } from "@/services/api";

import { Employee, ProjectNew, User } from "@/types/interface";

export function useAuthRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const raw = localStorage.getItem("authData");
        if (!raw) return;

        const { user } = JSON.parse(raw);
        const users = await getUsers();
        const me = users.find((u: User) => u.email === user.email);

        if (!me) {
          console.error("Usuario no encontrado en la base de datos.");
          return;
        }

        if (me.rol === "administrador") {
          setIsAdmin(true);
        } else if (me.rol === "manager") {
          setIsManager(true);
        }
        setCurrentUser(me.name ?? null);
        setCurrentUserName(me.name ?? null);
        setCurrentUserId(me._id ?? null); 

      } catch (error) {
        console.error("Error checking auth role:", error);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);
  return { isAdmin, isManager, currentUser, currentUserName, currentUserId, loading };
}

//verifica si un manager tiene un empleado
export function isEmployeeUnderManager(
  employee: Employee,
  managerName: string,
  projects: ProjectNew[]
): boolean {
  if (
    !employee.Proyectos ||
    !Array.isArray(employee.Proyectos) ||
    employee.Proyectos.length === 0
  ) {
    return false;
  }

  for (const projectCollaborator of employee.Proyectos) {
    if (!projectCollaborator || !projectCollaborator.projectId) {
      continue;
    }

    let projectId: string;

    if (typeof projectCollaborator.projectId === "string") {
      projectId = projectCollaborator.projectId;
    } else if (
      typeof projectCollaborator.projectId === "object" &&
      projectCollaborator.projectId.id
    ) {
      projectId = projectCollaborator.projectId.id;
    } else {
      continue;
    }
    const project = projects.find((p) => p.id === projectId);
    if (project && project.managerName === managerName) {
      return true;
    }
  }

  return false;
}

// filtrar campos según permisos
export function filterEmployeeData(
  employee: Employee,
  isAdmin: boolean,
  isManager: boolean,
  currentUserName: string | null,
  projects: ProjectNew[]
): Partial<Employee> {
  // admin puede ver todo
  if (isAdmin) {
    return employee;
  }

  // manager puede ver cierta info
  if (isManager && currentUserName) {
    const canSeeFullInfo = isEmployeeUnderManager(
      employee,
      currentUserName,
      projects
    );

    if (canSeeFullInfo) {
      // puede ver toda la información
      return employee;
    } else {
      // solo puede ver información básica
      return {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        PuestoDeTrabajo: employee.PuestoDeTrabajo,
        tecnologias: employee.tecnologias,
        roles: employee.roles,
        image: employee.image,
        HorasAsignadas: employee.HorasAsignadas,
        Proyectos: employee.Proyectos,
        estado: employee.estado,
      };
    }
  }

  // visitante nomas puede ver esto
  return {
    id: employee.id,
    first_name: employee.first_name,
    last_name: employee.last_name,
    PuestoDeTrabajo: employee.PuestoDeTrabajo,
  };
}

// verifica si se puede ver información completa de un empleado
export function canViewFullEmployeeInfo(
  employeeId: string,
  isAdmin: boolean,
  isManager: boolean,
  currentUserName: string | null,
  projects: ProjectNew[],
  employees: Employee[]
): boolean {
  if (isAdmin) return true;

  if (isManager && currentUserName) {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return false;

    return isEmployeeUnderManager(employee, currentUserName, projects);
  }

  return false;
}
