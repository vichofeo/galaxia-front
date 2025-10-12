<!-- components/galaxia/ProcessList.vue -->
<template>
  <v-card-text>
    <v-alert v-if="processes.length === 0 && !loading" type="info" class="mb-4">
      No hay procesos creados. Crea tu primer proceso para comenzar.
    </v-alert>

    <v-data-table :headers="headers" :items="processes" :loading="loading" :items-per-page="10" class="elevation-1"
      loading-text="Cargando procesos..." no-data-text="No hay procesos disponibles">
      <!-- Columna: Acciones -->
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn small icon @click="viewActivities(item)" color="primary" v-on="on">
              <v-icon small>mdi-eye</v-icon>
            </v-btn>
          </template>
          <span>ver Actividades</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn small icon @click="editProcess(item)" color="warning" v-on="on">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar proceso</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn small icon @click="deleteProcess(item)" color="error" v-on="on">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar proceso</span>
        </v-tooltip>
      </template>
      <!-- Columna: Estado Activo -->
      <template v-slot:item.isActive="{ item }">
        <v-chip small :color="item.isActive === 'y' ? 'green' : 'red'" dark>
          <v-icon small left>
            {{ item.isActive === 'y' ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
          {{ item.isActive === 'y' ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <!-- Columna: Validez -->
      <template v-slot:item.isValid="{ item }">
        <v-chip small :color="item.isValid === 'y' ? 'green' : 'orange'" dark>
          <v-icon small left>
            {{ item.isValid === 'y' ? 'mdi-check' : 'mdi-alert' }}
          </v-icon>
          {{ item.isValid === 'y' ? 'Válido' : 'Inválido' }}
        </v-chip>
      </template>
      <!-- Loading -->
      <template v-slot:loading>
        <v-row justify="center" align="center">
          <v-col cols="auto">
            <v-progress-circular indeterminate color="primary" />
          </v-col>
          <v-col cols="auto">
            <span class="ml-2">Cargando procesos...</span>
          </v-col>
        </v-row>
      </template>
    </v-data-table>
  </v-card-text>
</template>

<script>
export default {
  name: 'ProcessList',
  data() {
    return {      
      headers: [
        { text: 'ID', value: 'pId', width: '80px' },
        { text: 'Nombre', value: 'name' },
        { text: 'Versión', value: 'version', width: '100px' },
        { text: 'Estado', value: 'isActive', width: '120px' },
        { text: 'Validez', value: 'isValid', width: '120px' },
        { text: 'Descripción', value: 'description' },
        { text: 'Última Modificación', value: 'lastModif', width: '150px' },
        { text: 'Acciones', value: 'actions', sortable: false, width: '180px' }
      ]
    }
  },
  computed: {
    processes() {
      return this.$store.state.galaxia.processes.map(process => ({
        ...process,
        lastModif: this.formatDate(process.lastModif)
      }))
    },
    loading() {
      return this.$store.state.galaxia.loading
    }
  },
  methods: {
    viewActivities(process) {
      //this.$router.push(`/galaxia/process/${process.pId}`)
      this.$router.push({
        name: 'processDetail',  
        params: { id: process.pId }
      })
    },
    editProcess(process) {
      // TODO: Implementar edición
      console.log('Editar proceso:', process)
      this.$notify(`Editando proceso: ${process.name}`, 'info')
    },
    deleteProcess(process) {
      // TODO: Implementar eliminación
      console.log('Eliminar proceso:', process)
      this.$notify(`Eliminar proceso: ${process.name}`, 'warning')
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp * 1000).toLocaleDateString('es-ES')
    }
  }
}
</script>