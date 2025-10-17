<template>
  <v-container>
    <v-card>
      <v-card-title>Monitor de Procesos</v-card-title>
      <v-card-subtitle>Instancias Activas</v-card-subtitle>
      <v-form ref="filterForm" class="mb-4">
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.processId"
              :items="processes"
              item-text="name"
              item-value="p_id"
              label="Proceso"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Estado"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.activityName"
              label="Actividad Actual"
              clearable
              @input="applyFilters"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <v-data-table
        :headers="headers"
        :items="instances"
        :loading="loading"
        @click:row="viewInstance"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="refresh">Actualizar</v-btn>
          </v-toolbar>
        </template>
        <template v-slot:item.workitems="{ item }">
          {{ getCurrentActivities(item.workitems) }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import * as galaxiaService from '@/services/galaxia/galaxiaService';

export default {
  name: 'InstanceList',
  data() {
    return {
      loading: false,
      instances: [],
      processes: [],
      filters: {
        processId: null,
        status: null,
        activityName: ''
      },
      statusOptions: [
        { text: 'En ejecución', value: 'r' },
        { text: 'Completada', value: 'c' }
      ],
      headers: [
        { text: 'ID', value: 'instance_id' },
        { text: 'Proceso', value: 'process.name' },
        { text: 'Estado', value: 'status' },
        { text: 'Iniciado', value: 'started' },
        { text: 'Actividades Actuales', value: 'workitems' }
      ]
    };
  },
  methods: {
    async fetchProcesses() {
      try {
        const response = await galaxiaService.getProcesses();
        this.processes = response.data;
      } catch (error) {
        this.$emit('error', 'Error al cargar procesos');
      }
    },
    async fetchInstances() {
      this.loading = true;
      try {
        const response = await galaxiaService.getInstances(this.filters);
        this.instances = response.data;
      } catch (error) {
        this.$emit('error', 'Error al cargar instancias');
      } finally {
        this.loading = false;
      }
    },
    getCurrentActivities(workitems) {
      return workitems.map(w => w.activity.name).join(', ') || 'Ninguna';
    },
    viewInstance(instance) {
      this.$router.push(`/galaxia/instances/${instance.instance_id}`);
    },
    applyFilters() {
      this.fetchInstances();
    },
    refresh() {
      this.filters = { processId: null, status: null, activityName: '' };
      this.fetchInstances();
    }
  },
  mounted() {
    this.fetchProcesses();
    this.fetchInstances();
  }
};
</script>

<style scoped>
.v-container {
  padding: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>