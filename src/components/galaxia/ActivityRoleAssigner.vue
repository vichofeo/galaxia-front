<!-- components/galaxia/ActivityRoleAssigner.vue -->
<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="headline primary white--text">
        <v-icon left dark>mdi-account-key</v-icon>
        Roles: {{ activity.name }}
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-alert v-if="!activity.isInteractive" type="warning" class="mb-4">
          Esta actividad es automática y no requiere roles asignados.
        </v-alert>

        <v-alert v-else type="info" dense class="mb-4">
          Selecciona qué roles pueden ejecutar esta actividad:
        </v-alert>

        <v-select
          v-model="selectedRoles"
          :items="availableRoles"
          label="Roles asignados"
          multiple
          chips
          deletable-chips
          :disabled="!activity.isInteractive || saving"
          :loading="loadingRoles"
          item-text="name"
          item-value="roleId"
        >
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
            </v-list-item-content>
          </template>

          <template v-slot:selection="{ item }">
            <v-chip close @click:close="removeRole(item.roleId)" :disabled="saving">
              {{ item.name }}
            </v-chip>
          </template>
        </v-select>

        <!-- RESUMEN -->
        <v-alert v-if="selectedRoles.length > 0" type="info" dense class="mt-3">
          <strong>Resumen:</strong> {{ selectedRoles.length }} rol(es) seleccionado(s)
        </v-alert>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="close" :disabled="saving">
          Cancelar
        </v-btn>
        <v-btn 
          color="primary" 
          @click="save" 
          :loading="saving" 
          :disabled="!activity.isInteractive || saving"
        >
          <v-icon left>mdi-content-save</v-icon>
          {{ saving ? 'Guardando...' : 'Guardar Roles' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ActivityRoleAssigner',
  props: {
    value: Boolean,
    activity: {
      type: Object,
      required: true
    },
    processId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      saving: false,
      loadingRoles: false,
      selectedRoles: [],
      availableRoles: [],
      currentActivityRoles: []
    }
  },
  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    async loadAvailableRoles() {
      this.loadingRoles = true
      try {
        const result = await this.$store.dispatch('galaxia/loadProcessRoles', this.processId)
        if (result.ok) {
          this.availableRoles = result.data
        }
      } catch (error) {
        console.error('Error loading roles:', error)
        this.$notify('Error cargando roles disponibles', 'error')
      } finally {
        this.loadingRoles = false
      }
    },

    async loadCurrentActivityRoles() {
      try {
        const result = await this.$store.dispatch('galaxia/getActivityRoles', this.activity.activityId)
        if (result.ok) {
          this.currentActivityRoles = result.data
          // Convertir a array de roleIds para el v-model
          this.selectedRoles = this.currentActivityRoles.map(role => role.roleId)
        }
      } catch (error) {
        console.error('Error loading current activity roles:', error)
      }
    },

    removeRole(roleId) {
      this.selectedRoles = this.selectedRoles.filter(id => id !== roleId)
    },

    async save() {
      if (!this.activity.isInteractive) {
        this.$notify('Las actividades automáticas no requieren roles', 'warning')
        return
      }

      this.saving = true
      try {
        const result = await this.$store.dispatch('galaxia/assignRolesToActivity', {
          activityId: this.activity.activityId,
          roleIds: this.selectedRoles
        })
        
        if (result.ok) {
          this.$notify('Roles asignados exitosamente a la actividad', 'success')
          this.$emit('roles-updated')
          this.close()
        } else {
          this.$notify('Error al asignar roles a la actividad', 'error')
        }
      } catch (error) {
        console.error('Error saving activity roles:', error)
        this.$notify('Error de conexión al guardar roles', 'error')
      } finally {
        this.saving = false
      }
    },

    close() {
      this.dialog = false
      this.resetForm()
    },

    resetForm() {
      this.selectedRoles = []
      this.currentActivityRoles = []
    }
  },
  watch: {
    dialog: {
      immediate: true,
      async handler(val) {
        if (val) {
          await this.loadAvailableRoles()
          await this.loadCurrentActivityRoles()
        } else {
          this.resetForm()
        }
      }
    }
  }
}
</script>