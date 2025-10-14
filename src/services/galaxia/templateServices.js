// Agregar estas funciones al servicio existente

export const templateService = {
  // ... funciones existentes ...

  // ===== TEMPLATES =====
  getActivityTemplates: async (activityId) => {
    const res = await http().get(`/galaxia/activities/${activityId}/templates`)
    return res.data
  },

  saveActivityTemplate: async (activityId, templateData) => {
    const res = await http().post(`/galaxia/activities/${activityId}/templates`, templateData)
    return res.data
  },

  getTemplateLibrary: async () => {
    const res = await http().get('/galaxia/templates/library')
    return res.data
  },

  saveTemplateToLibrary: async (templateData) => {
    const res = await http().post('/galaxia/templates/library', templateData)
    return res.data
  },

  // ===== VARIABLES =====
  getInstanceVariables: async (instanceId) => {
    const res = await http().get(`/galaxia/instances/${instanceId}/variables`)
    return res.data
  },

  setInstanceVariable: async (instanceId, variableData) => {
    const res = await http().post(`/galaxia/instances/${instanceId}/variables`, variableData)
    return res.data
  },

  updateInstanceVariable: async (instanceId, variableName, value) => {
    const res = await http().put(`/galaxia/instances/${instanceId}/variables/${variableName}`, { value })
    return res.data
  },

  deleteInstanceVariable: async (instanceId, variableName) => {
    const res = await http().delete(`/galaxia/instances/${instanceId}/variables/${variableName}`)
    return res.data
  }
}