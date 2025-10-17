<template>
  <v-container>
    <v-card>
      <v-card-title>{{ process.name }}</v-card-title>
      <v-card-subtitle>Versión: {{ process.version }}</v-card-subtitle>
      <v-card-text>
        <p>{{ process.description }}</p>
        <v-tabs v-model="activeTab">
          <v-tab>Actividades</v-tab>
          <v-tab>Transiciones</v-tab>
          <v-tab>Roles</v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab">
          <v-tab-item>
            <v-data-table :headers="activityHeaders" :items="process.activities" />
          </v-tab-item>
          <v-tab-item>
            <v-data-table :headers="transitionHeaders" :items="process.transitions" />
          </v-tab-item>
          <v-tab-item>
            <v-data-table :headers="roleHeaders" :items="process.roles" />
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="validateProcess">Validar Proceso</v-btn>
        <v-btn @click="$router.back()">Volver</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import * as galaxiaService from '@/services/galaxia/galaxiaService';

export default {
  name: 'ProcessDetail',
  data() {
    return {
      loading: false,
      process: { activities: [], transitions: [], roles: [] },
      activeTab: 0,
      activityHeaders: [
        { text: 'Nombre', value: 'name' },
        { text: 'Tipo', value: 'activity_type' },
        { text: 'Interactiva', value: 'is_interactive' }
      ],
      transitionHeaders: [
        { text: 'Desde', value: 'fromActivity.name' },
        { text: 'Hacia', value: 'toActivity.name' }
      ],
      roleHeaders: [
        { text: 'Nombre', value: 'name' },
        { text: 'Descripción', value: 'description' }
      ]
    };
  },
  methods: {
    async fetchProcess() {
      this.loading = true;
      try {
        const response = await galaxiaService.getProcess(this.$route.params.id);
        this.process = response.data;
      } catch (error) {
        this.$emit('error', 'Error al cargar proceso');
      } finally {
        this.loading = false;
      }
    },
    async validateProcess() {
      try {
        const response = await galaxiaService.validateProcess(this.$route.params.id);
        this.$emit('success', response.data.valid ? 'Proceso válido' : 'Proceso no válido');
      } catch (error) {
        this.$emit('error', 'Error al validar proceso');
      }
    }
  },
  mounted() {
    this.fetchProcess();
  }
};
</script>

<style scoped>
.v-container {
  padding: 16px;
}
</style>