// stores/galaxiaStore.js
import { galaxiaService } from '@/services/galaxia/galaxiaService'

const state = {
  processes: [],
  currentProcess: null,
  activities: [],
  roles: [],
  transitions: [],
  loading: false
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PROCESSES(state, processes) {
    state.processes = processes
  },
  SET_CURRENT_PROCESS(state, process) {
    state.currentProcess = process
  },
  SET_ACTIVITIES(state, activities) {
    state.activities = activities || []
  },
  SET_ROLES(state, roles) {
    state.roles = roles
  },
  SET_TRANSITIONS(state, transitions) {
    state.transitions = transitions || []
  },
  ADD_PROCESS(state, process) {
    state.processes.push(process)
  },
  ADD_ACTIVITY(state, activity) {
    if (!state.activities) {
      state.activities = []  // 
    }
    state.activities.push(activity)
  },
  ADD_ROLE(state, role) {
    state.roles.push(role)
  },
  ADD_TRANSITION(state, transition) {
    if (!state.transitions) {
      state.transitions = []
    }
    state.transitions.push(transition)
  },
  REMOVE_TRANSITION(state, { fromActivityId, toActivityId }) {
    if (state.transitions) {
      state.transitions = state.transitions.filter(
        t => !(t.actFromId === fromActivityId && t.actToId === toActivityId)
      )
    }
  },
  UPDATE_PROCESS(state, updatedProcess) {
    const index = state.processes.findIndex(p => p.pId === updatedProcess.pId)
    if (index !== -1) {
      state.processes[index] = { ...state.processes[index], ...updatedProcess }
    }
  },

  //instances
  SET_INSTANCES(state, instances) {
    state.instances = instances || []
  },

  ADD_INSTANCE(state, instance) {
    if (!state.instances) {
      state.instances = []
    }
    state.instances.push(instance)
  },

  UPDATE_INSTANCE(state, updatedInstance) {
    const index = state.instances.findIndex(i => i.instanceId === updatedInstance.instanceId)
    if (index !== -1) {
      state.instances[index] = { ...state.instances[index], ...updatedInstance }
    }
  },

  //Dashboard
  SET_USER_WORKITEMS(state, workitems) {
    state.userWorkitems = workitems || []
  },

  SET_USER_INSTANCES(state, instances) {
    state.userInstances = instances || []
  },

  SET_USER_STATS(state, stats) {
    state.userStats = stats || {}
  },

  REMOVE_WORKITEM(state, workitemId) {
    state.userWorkitems = state.userWorkitems.filter(w => w.itemId !== workitemId)
  }

}

const actions = {
  async loadProcesses({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await galaxiaService.getProcesses()
      if (response.ok) {
        commit('SET_PROCESSES', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading processes:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createProcess({ commit }, processData) {
    try {
      const response = await galaxiaService.createProcess(processData)
      if (response.ok) {
        commit('ADD_PROCESS', response.data)
      }
      return response
    } catch (error) {
      console.error('Error creating process:', error)
      throw error
    }
  },

  async loadProcessActivities({ commit }, processId) {
    commit('SET_LOADING', true)
    try {
      const response = await galaxiaService.getProcessActivities(processId)

      if (response.ok) {
        commit('SET_ACTIVITIES', response.data.gp_ga_activities)
        commit('SET_CURRENT_PROCESS', { pId: processId })
      }
      return response
    } catch (error) {
      console.error('Error loading activities:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addActivity({ commit }, { processId, activityData }) {
    try {
      const response = await galaxiaService.addActivity(processId, activityData)
      if (response.ok) {
        commit('ADD_ACTIVITY', response.data)
      }
      return response
    } catch (error) {
      console.error('Error adding activity:', error)
      throw error
    }
  },
  // NUEVAS ACTIONS PARA ROLES:
  // ========== ROLES ==========
  async loadProcessRoles({ commit }, processId) {
    commit('SET_LOADING', true)
    try {
      const response = await galaxiaService.getProcessRoles(processId)
      if (response.ok) {
        commit('SET_ROLES', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading process roles:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createRole({ commit }, { processId, name, description }) {
    try {
      const response = await galaxiaService.createRole(processId, {
        name,
        description
      })
      if (response.ok) {
        commit('ADD_ROLE', response.data)
      }
      return response
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  },

  async getRoleAssignments({ commit }, { processId, roleId }) {
    try {
      const response = await galaxiaService.getRoleAssignments(processId, roleId)
      return response
    } catch (error) {
      console.error('Error getting role assignments:', error)
      throw error
    }
  },

  async assignRole({ commit }, { processId, roleId, users, groups }) {
    try {
      const response = await galaxiaService.assignRole(processId, roleId, users, groups)
      return response
    } catch (error) {
      console.error('Error assigning role:', error)
      throw error
    }
  },

  async removeRoleAssignment({ commit }, { processId, roleId, assignmentId }) {
    try {
      const response = await galaxiaService.removeRoleAssignment(processId, roleId, assignmentId)
      return response
    } catch (error) {
      console.error('Error removing role assignment:', error)
      throw error
    }
  },

  // ===== ROLES EN ACTIVIDADES =====
  async getActivityRoles({ commit }, activityId) {
    try {
      const response = await galaxiaService.getActivityRoles(activityId)
      return response
    } catch (error) {
      console.error('Error getting activity roles:', error)
      throw error
    }
  },

  async assignRolesToActivity({ commit }, { activityId, roleIds }) {
    try {
      const response = await galaxiaService.assignRolesToActivity(activityId, roleIds)
      return response
    } catch (error) {
      console.error('Error assigning roles to activity:', error)
      throw error
    }
  },

  // ========== TRANSICIONES ==========
  async getProcessTransitions({ commit }, processId) {
    try {
      const response = await galaxiaService.getProcessTransitions(processId)
      return response
    } catch (error) {
      console.error('Error getting process transitions:', error)
      throw error
    }
  },

  async addTransition({ commit }, { processId, fromActivityId, toActivityId }) {
    try {
      const response = await galaxiaService.addTransition(processId, fromActivityId, toActivityId)
      return response
    } catch (error) {
      console.error('Error adding transition:', error)
      throw error
    }
  },

  async deleteTransition({ commit }, { processId, fromActivityId, toActivityId }) {
    try {
      const response = await galaxiaService.deleteTransition(processId, fromActivityId, toActivityId)
      return response
    } catch (error) {
      console.error('Error deleting transition:', error)
      throw error
    }
  },
  // ========== INSTANCIAS ==========
  async loadInstances({ commit }) {
    try {
      const response = await galaxiaService.getInstances()
      if (response.ok) {
        commit('SET_INSTANCES', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading instances:', error)
      throw error
    }
  },

  async startInstance({ commit }, { processId, name }) {
    try {
      const response = await galaxiaService.startInstance(processId, name)
      if (response.ok) {
        commit('ADD_INSTANCE', response.data)
      }
      return response
    } catch (error) {
      console.error('Error starting instance:', error)
      throw error
    }
  },

  async abortInstance({ commit }, instanceId) {
    try {
      const response = await galaxiaService.abortInstance(instanceId)
      if (response.ok) {
        commit('UPDATE_INSTANCE', response.data)
      }
      return response
    } catch (error) {
      console.error('Error aborting instance:', error)
      throw error
    }
  },

  // ========== VALIDACIÓN Y ACTIVACIÓN ==========
  async validateProcess({ commit }, processId) {
    try {
      const response = await galaxiaService.validateProcess(processId)
      if (response.ok) {
        // Actualizar el proceso en la lista
        commit('UPDATE_PROCESS', {
          pId: processId,
          isValid: response.data.isValid ? 'y' : 'n'
        })
      }
      return response
    } catch (error) {
      console.error('Error validating process:', error)
      throw error
    }
  },

  async activateProcess({ commit }, processId) {
    try {
      const response = await galaxiaService.activateProcess(processId)
      if (response.ok) {
        // Actualizar el proceso en la lista
        commit('UPDATE_PROCESS', {
          pId: processId,
          isActive: 'y'
        })
      }
      return response
    } catch (error) {
      console.error('Error activating process:', error)
      throw error
    }
  },
  //deactivateProcess
  async deactivateProcess({ commit }, processId) {
    try {
      const response = await galaxiaService.deactivateProcess(processId)
      if (response.ok) {
        // Actualizar el proceso en la lista
        commit('UPDATE_PROCESS', {
          pId: processId,
          isActive: 'n'
        })
      }
      return response
    } catch (error) {
      console.error('Error deactivating process:', error)
      throw error
    }
  },

  // ========== INSTANCIAS ==========
  async loadInstances({ commit }) {
    try {
      const response = await galaxiaService.getInstances()
      if (response.ok) {
        commit('SET_INSTANCES', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading instances:', error)
      throw error
    }
  },

  async startInstance({ commit }, { processId, name }) {
    try {
      const response = await galaxiaService.startInstance(processId, name)
      if (response.ok) {
        commit('ADD_INSTANCE', response.data)
      }
      return response
    } catch (error) {
      console.error('Error starting instance:', error)
      throw error
    }
  },

  async abortInstance({ commit }, instanceId) {
    try {
      const response = await galaxiaService.abortInstance(instanceId)
      if (response.ok) {
        commit('UPDATE_INSTANCE', {
          instanceId,
          status: 'aborted',
          ended: Math.floor(Date.now() / 1000)
        })
      }
      return response
    } catch (error) {
      console.error('Error aborting instance:', error)
      throw error
    }
  },

  // ========== USER DASHBOARD ==========
  async loadUserWorkitems({ commit, rootState }) {
    try {
      // En producción, obtener userId del token/auth
      const userId = 'current-user' // Temporal - reemplazar con usuario real

      const response = await galaxiaService.getUserWorkitems(userId)
      if (response.ok) {
        commit('SET_USER_WORKITEMS', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading user workitems:', error)
      throw error
    }
  },

  async loadUserInstances({ commit, rootState }) {
    try {
      const userId = 'current-user' // Temporal

      const response = await galaxiaService.getUserInstances(userId)
      if (response.ok) {
        commit('SET_USER_INSTANCES', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading user instances:', error)
      throw error
    }
  },

  async loadUserStats({ commit, rootState }) {
    try {
      const userId = 'current-user' // Temporal

      const response = await galaxiaService.getUserStats(userId)
      if (response.ok) {
        commit('SET_USER_STATS', response.data)
      }
      return response
    } catch (error) {
      console.error('Error loading user stats:', error)
      throw error
    }
  },

  async executeWorkitem({ commit }, { workitemId, inputData }) {
    try {
      const userId = 'current-user' // Temporal

      const response = await galaxiaService.executeWorkitem(workitemId, userId, inputData)
      if (response.ok) {
        commit('REMOVE_WORKITEM', workitemId)
      }
      return response
    } catch (error) {
      console.error('Error executing workitem:', error)
      throw error
    }
  }

}

const getters = {
  isLoading: state => state.loading,
  getProcessById: (state) => (id) => {
    return state.processes.find(process => process.pId == id)
  },
  getActivitiesByProcess: (state) => (processId) => {
    if (!state.activities || !Array.isArray(state.activities)) {
      return []  // 👈 Retornar array vacío si no es array
    }
    return state.activities.filter(activity => activity.pId == processId)
  },
  getRolesByProcess: (state) => (processId) => {
    return state.roles.filter(role => role.pId == processId)
  },
  getTransitionsByProcess: (state) => (processId) => {
    if (!state.transitions || !Array.isArray(state.transitions)) {
      return []
    }
    return state.transitions.filter(transition => transition.pId == processId)
  },
  getUserWorkitems: (state) => {
    return state.userWorkitems || []
  },

  getUserInstances: (state) => {
    return state.userInstances || []
  },

  getUserStats: (state) => {
    return state.userStats || {}
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}