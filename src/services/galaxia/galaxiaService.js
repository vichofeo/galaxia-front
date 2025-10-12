import { http, httpFile } from "../api";

//********* metodos galaxi ver001 */

export const galaxiaService = {

    // ===== PROCESOS =====
    getProcesses: async () => {
        const res = await http().get('/galaxia/processes')
        return res.data
    },

    createProcess: async (processData) => {
        const res = await http().post('/galaxia/processes', processData)
        return res.data
    },

    getProcessById: async (processId) => {
        const res = await http().get(`/galaxia/processes/${processId}`)
        return res.data
    },

    updateProcess: async (processId, data) => {
        const res = await http().put(`/galaxia/processes/${processId}`, data)
        return res.data
    },

    // ===== ACTIVIDADES =====
    getProcessActivities: async (processId) => {
        const res = await http().get(`/galaxia/processes/${processId}`)
        return res.data
    },

    addActivity: async (processId, activityData) => {
        const res = await http().post(`/galaxia/processes/${processId}/activities`, activityData)
        return res.data
    },

    updateActivity: async (activityId, data) => {
        const res = await http().put(`/galaxia/activities/${activityId}`, data)
        return res.data
    },

    // ===== ROLES =====
    getProcessRoles: async (processId) => {
        const res = await http().get(`/galaxia/processes/${processId}/roles`)
        return res.data
    },

    addRole: async (processId, roleData) => {
        const res = await http().post(`/galaxia/processes/${processId}/roles`, roleData)
        return res.data
    },

    // ===== TRANSICIONES =====
    getProcessTransitions: async (processId) => {
        const res = await http().get(`/galaxia/processes/${processId}/transitions`)
        return res.data
    },

    addTransition: async (processId, transitionData) => {
        const res = await http().post(`/galaxia/processes/${processId}/transitions`, transitionData)
        return res.data
    },


    // ===== ASIGNACIONES DE ROLES ===== 
    getRoleAssignments: async (processId, roleId) => {
        const res = await http().get(`/galaxia/processes/${processId}/roles/${roleId}/assignments`)
        return res.data
    },

    assignRole: async (processId, roleId, users, groups) => {
        const res = await http().post(`/galaxia/processes/${processId}/roles/${roleId}/assignments`, {
            users: users || [],
            groups: groups || []
        })
        return res.data
    },

    removeRoleAssignment: async (processId, roleId, assignmentId) => {
        const res = await http().delete(`/galaxia/processes/${processId}/roles/${roleId}/assignments/${assignmentId}`)
        return res.data
    },

    // RENOMBRAR addRole → createRole para coincidir con store
    createRole: async (processId, roleData) => {
        const res = await http().post(`/galaxia/processes/${processId}/roles`, roleData)
        return res.data
    },

    // ===== ROLES EN ACTIVIDADES =====

    // GET: Obtener roles asignados a una actividad
    getActivityRoles: async (activityId) => {
        const res = await http().get(`/galaxia/activities/${activityId}/roles`)
        return res.data
    },

    // POST: Asignar/actualizar roles a una actividad
    assignRolesToActivity: async (activityId, roleIds) => {
        const res = await http().post(`/galaxia/activities/${activityId}/roles`, {
            roleIds: roleIds
        })
        return res.data
    },

    // ===== TRANSICIONES =====
    getProcessTransitions: async (processId) => {
        const res = await http().get(`/galaxia/processes/${processId}/transitions`)
        return res.data
    },

    addTransition: async (processId, fromActivityId, toActivityId) => {
        const res = await http().post(`/galaxia/processes/${processId}/transitions`, {
            fromActivityId,
            toActivityId
        })
        return res.data
    },

    deleteTransition: async (processId, fromActivityId, toActivityId) => {
        const res = await http().delete(`/galaxia/processes/${processId}/transitions/${fromActivityId}/${toActivityId}`)
        return res.data
    },

    // ===== VALIDACIÓN Y ACTIVACIÓN =====
    validateProcess: async (processId) => {
        const res = await http().post(`/galaxia/processes/${processId}/validate`)
        return res.data
    },

    activateProcess: async (processId) => {
        const res = await http().post(`/galaxia/processes/${processId}/activate`)
        return res.data
    },
    deactivateProcess: async (processId) => {
        const res = await http().post(`/galaxia/processes/${processId}/deactivate`)
        return res.data
    },

    // ===== INSTANCIAS =====
    getInstances: async () => {
        const res = await http().get('/galaxia/instances')
        return res.data
    },

    startInstance: async (processId, name) => {
        const res = await http().post('/galaxia/instances', { processId, name })
        return res.data
    },

    abortInstance: async (instanceId) => {
        const res = await http().post(`/galaxia/instances/${instanceId}/abort`)
        return res.data
    },

    // ===== USER DASHBOARD =====
    getUserWorkitems: async (userId) => {
        const res = await http().get(`/galaxia/users/${userId}/workitems`)
        return res.data
    },

    getUserInstances: async (userId) => {
        const res = await http().get(`/galaxia/users/${userId}/instances`)
        return res.data
    },

    getUserStats: async (userId) => {
        const res = await http().get(`/galaxia/users/${userId}/stats`)
        return res.data
    },

    executeWorkitem: async (workitemId, userId, inputData) => {
        const res = await http().post(`/galaxia/workitems/${workitemId}/execute`, {
            userId,
            inputData
        })
        return res.data
    }

}