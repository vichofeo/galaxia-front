<!-- components/galaxia/RoleManager.vue -->
<template>
  <v-card-text>
    <!-- BARRA DE HERRAMIENTAS -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <v-btn color="primary" @click="showRoleCreator = true">
          <v-icon left>mdi-account-plus</v-icon>
          Nuevo Rol
        </v-btn>

        <div class="d-flex align-center">
          <v-chip :color="rolesCount > 0 ? 'green' : 'orange'" dark class="mr-2">
            {{ rolesCount }} Roles
          </v-chip>
          <v-btn icon @click="loadRoles" :loading="loading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- LISTA DE ROLES -->
    <v-data-table :headers="roleHeaders" :items="roles" :loading="loading" :items-per-page="10" class="elevation-1"
      loading-text="Cargando roles..." no-data-text="No hay roles definidos en este proceso">
      <!-- COLUMNA: NOMBRE DEL ROL -->
      <template v-slot:item.name="{ item }">
        <v-chip color="primary" dark small>
          {{ item.name }}
        </v-chip>
      </template>

      <!-- COLUMNA: ASIGNACIONES -->
      <template v-slot:item.assignments="{ item }">
        <v-chip :color="getAssignmentCount(item) > 0 ? 'green' : 'orange'" dark small>
          {{ getAssignmentCount(item) }} asignaciones
        </v-chip>
      </template>

      <!-- COLUMNA: ACCIONES -->
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn small icon @click="manageAssignments(item)" color="primary" v-on="on">
              <v-icon small>mdi-account-multiple</v-icon>
            </v-btn>
          </template>
          <span>Gestionar asignaciones</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn small icon @click="editRole(item)" color="warning" v-on="on">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar rol</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn small icon @click="deleteRole(item)" color="error" v-on="on">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar rol</span>
        </v-tooltip>
      </template>

      <!-- LOADING -->
      <template v-slot:loading>
        <v-row justify="center" align="center" class="py-4">
          <v-col cols="auto">
            <v-progress-circular indeterminate color="primary" />
          </v-col>
          <v-col cols="auto">
            <span class="ml-2">Cargando roles...</span>
          </v-col>
        </v-row>
      </template>
    </v-data-table>

    <!-- DIALOG CREAR ROL -->
    <RoleCreator v-model="showRoleCreator" :processId="processId" @role-created="onRoleCreated" />

    <!-- DIALOG GESTIONAR ASIGNACIONES -->
    <AssignmentManager v-model="showAssignmentManager" :role="selectedRole" :processId="processId"
      @assignments-updated="onAssignmentsUpdated" />
  </v-card-text>
</template>

<script>
import RoleCreator from './RoleCreator.vue'
import AssignmentManager from './AssignmentManager.vue'

export default {
  name: 'RoleManager',
  components: {
    RoleCreator,
    AssignmentManager
  },
  props: {
    processId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      showRoleCreator: false,
      showAssignmentManager: false,
      selectedRole: null,
      roleHeaders: [
        { text: 'ID', value: 'roleId', width: '80px' },
        { text: 'Nombre', value: 'name', width: '150px' },
        { text: 'Descripción', value: 'description' },
        { text: 'Asignaciones', value: 'assignments', width: '140px' },
        { text: 'Última Modificación', value: 'lastModif', width: '150px' },
        { text: 'Acciones', value: 'actions', sortable: false, width: '180px' }
      ]
    }
  },
  computed: {
    roles() {
      return this.$store.state.galaxia.roles.filter(
        role => role.pId == this.processId
      ).map(role => ({
        ...role,
        lastModif: this.formatDate(role.lastModif)
      }))
    },
    rolesCount() {
      return this.roles.length
    },
    loading() {
      return this.$store.state.galaxia.loading
    }
  },
  methods: {
    getAssignmentCount(role) {
      // Por ahora retornamos 0 - luego conectaremos con las asignaciones reales
      return 0
    },
    manageAssignments(role) {
      this.selectedRole = role
      this.showAssignmentManager = true
    },
    editRole(role) {
      this.$notify(`Editando rol: ${role.name}`, 'info')
      // TODO: Implementar edición
    },
    deleteRole(role) {
      this.$notify(`Eliminando rol: ${role.name}`, 'warning')
      // TODO: Implementar eliminación
    },
    onRoleCreated() {
      this.showRoleCreator = false
      this.loadRoles()
      this.$notify('Rol creado exitosamente', 'success')
    },
    onAssignmentsUpdated() {
      this.showAssignmentManager = false
      this.loadRoles()
      this.$notify('Asignaciones actualizadas', 'success')
    },
    loadRoles() {
      this.$store.dispatch('galaxia/loadProcessRoles', this.processId)
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp * 1000).toLocaleDateString('es-ES')
    }
  },
  created() {
    this.loadRoles()
  },
  watch: {
    processId: {
      immediate: true,
      handler() {
        this.loadRoles()
      }
    }
  }
}
</script>