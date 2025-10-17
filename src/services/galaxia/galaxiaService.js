// Servicio para manejar llamadas al backend de Galaxia
import axios from 'axios';

const API_URL = '/api/galaxia';

const getInstances = async (filters = {}) => {
  return await axios.get(`${API_URL}/instances`, { params: filters });
};

const getProcesses = async () => {
  return await axios.get(`${API_URL}/processes`);
};

const getProcess = async (id) => {
  return await axios.get(`${API_URL}/processes/${id}`);
};

const validateProcess = async (id) => {
  return await axios.get(`${API_URL}/processes/${id}/validate`);
};

const createProcess = async (data) => {
  return await axios.post(`${API_URL}/processes`, data);
};

const updateProcess = async (id, data) => {
  return await axios.put(`${API_URL}/processes/${id}`, data);
};

const createActivity = async (processId, data) => {
  return await axios.post(`${API_URL}/processes/${processId}/activities`, data);
};

const updateActivity = async (processId, id, data) => {
  return await axios.put(`${API_URL}/processes/${processId}/activities/${id}`, data);
};

const createTransition = async (processId, data) => {
  return await axios.post(`${API_URL}/processes/${processId}/transitions`, data);
};

const createRole = async (processId, data) => {
  return await axios.post(`${API_URL}/processes/${processId}/roles`, data);
};

const createMapping = async (processId, roleId, data) => {
  return await axios.post(`${API_URL}/processes/${processId}/roles/${roleId}/mappings`, data);
};

const getInstance = async (instanceId) => {
  return await axios.get(`${API_URL}/instances/${instanceId}`);
};

const getTransitions = async (activityId) => {
  return await axios.get(`${API_URL}/transitions`, { params: { activityId } });
};

const routeInstance = async (instanceId) => {
  return await axios.post(`${API_URL}/instances/${instanceId}/route`);
};

const completeActivity = async (instanceId, activityId) => {
  return await axios.post(`${API_URL}/instances/${instanceId}/activities/${activityId}/complete`);
};

const setNextActivity = async (instanceId, nextActivityId) => {
  return await axios.post(`${API_URL}/instances/${instanceId}/activities/set-next`, { nextActivityId });
};

const setNextUser = async (instanceId, activityId, nextUser) => {
  return await axios.post(`${API_URL}/instances/${instanceId}/activities/${activityId}/set-user`, { nextUser });
};

const setProperties = async (instanceId, properties) => {
  return await axios.post(`${API_URL}/instances/${instanceId}/properties`, properties);
};

const submitForm = async (instanceId, activityId, formData) => {
  return await axios.post(`${API_URL}/instances/${instanceId}/activities/${activityId}/submit-form`, formData);
};

export default {
  getInstances,
  getProcesses,
  getProcess,
  validateProcess,
  createProcess,
  updateProcess,
  createActivity,
  updateActivity,
  createTransition,
  createRole,
  createMapping,
  getInstance,
  getTransitions,
  routeInstance,
  completeActivity,
  setNextActivity,
  setNextUser,
  setProperties,
  submitForm
};