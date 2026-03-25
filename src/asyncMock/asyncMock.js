// src/asyncMock/asyncMock.js

const employees = [
    {
        id: 1,
        name: "Octavio Douglas",
        email: "octavio@example.com",
        password: "1234",
        role: "Full Stack",
        projects: [
            { name: "Aparta.Me", percentage: 40 },
            { name: "Coniferal", percentage: 30 },
            { name: "Plantilla Rubik", percentage: 20 },
        ],
        timeToAssign: 10,
        imageUrl: "/images/octavio.jpg"
    },
    {
        id: 2,
        name: "Maria González",
        email: "maria@example.com",
        password: "maria456",
        role: "Frontend Developer",
        projects: [
            { name: "Proyecto A", percentage: 50 },
            { name: "Proyecto B", percentage: 50 },
        ],
        timeToAssign: 0,
        imageUrl: "/images/maria.jpg"
    }
];

export const getEmployees = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return employees;
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        throw error;
    }
};

export const getEmployeeById = async (id) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return employees.find(emp => emp.id === id);
    } catch (error) {
        console.error(`Error al obtener empleado con id ${id}:`, error);
        throw error;
    }
};

export const getEmployeeByEmail = async (email) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return employees.find(emp => emp.email === email);
    } catch (error) {
        console.error(`Error al obtener empleado con email ${email}:`, error);
        throw error;
    }
};

export const getEmployeeByRole = async (role) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        return employees.filter(emp => emp.role === role);
    } catch (error) {
        console.error(`Error al obtener empleados con rol ${role}:`, error);
        throw error;
    }
};

export const searchEmployeesByName = async (query) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 600));
        return employees.filter(emp => 
            emp.name.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        console.error(`Error al buscar empleados con nombre ${query}:`, error);
        throw error;
    }
};