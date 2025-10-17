<template>
  <v-container>
    <v-card>
      <v-card-title>Procesos Activos</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="processes"
          :loading="loading"
          @click:row="viewProcess"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-btn color="primary" :to="{ name: 'ProcessForm' }">Crear Proceso</v-btn>
            </v-toolbar>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import galaxiaService from '@/services/galaxia/galaxiaService';

export default {
  name: 'ProcessList',
  data() {
    return {
      loading: false,
      processes: [],
      headers: [
        { text: 'Nombre', value: 'name' },
        { text: 'Versión', value: 'version' },
        { text: 'Descripción', value: 'description' },
        { text: 'Creado', value: 'created' }
      ]
    };
  },
  methods: {
    async fetchProcesses() {
      this.loading = true;
      try {
        const response = await galaxiaService.getProcesses();
        this.processes = response.data;
      } catch (error) {
        this.$emit('error', 'Error al cargar procesos');
      } finally {
        this.loading = false;
      }
    },
    viewProcess(process) {
      this.$router.push(`/galaxia/processes/${process.p_id}`);
    }
  },
  mounted() {
    this.fetchProcesses();
  }
};
</script>

<style scoped>
.v-container {
  padding: 16px;
}
</style>