<!-- components/galaxia/RoleCreator.vue -->
<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline primary white--text">
        <v-icon left dark>mdi-account-plus</v-icon>
        Crear Nuevo Rol
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- NOMBRE DEL ROL -->
          <v-text-field v-model="role.name" label="Nombre del Rol *" :rules="nameRules" required outlined
            placeholder="Ej: aprobador, solicitante, administrador" class="mb-3"></v-text-field>

          <!-- DESCRIPCIÓN -->
          <v-textarea v-model="role.description" label="Descripción" outlined rows="2"
            placeholder="Describe las responsabilidades de este rol..." class="mb-4"></v-textarea>

          <v-alert type="info" dense class="mt-3">
            <small>
              Los roles definen <strong>quiénes pueden ejecutar actividades</strong> en el proceso.
              Luego podrás asignar usuarios y grupos específicos a cada rol.
            </small>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="close" :disabled="saving">
          Cancelar
        </v-btn>
        <v-btn color="primary" :disabled="!valid || saving" :loading="saving" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          {{ saving ? 'Creando...' : 'Crear Rol' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RoleCreator',
  props: {
    value: Boolean,
    processId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      valid: false,
      saving: false,
      role: {
        name: '',
        description: ''
      },
      nameRules: [
        v => !!v || 'El nombre es requerido',
        v => (v && v.length >= 3) || 'El nombre debe tener al menos 3 caracteres',
        v => (v && v.length <= 80) || 'El nombre no puede tener más de 80 caracteres'
      ]
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
    async save() {
      if (this.$refs.form.validate()) {
        this.saving = true
        try {
          const result = await this.$store.dispatch('galaxia/createRole', {
            processId: this.processId,
            name: this.role.name,
            description: this.role.description
          })

          if (result.ok) {
            this.$emit('role-created', result.data)
            this.close()
          } else {
            this.$notify('Error al crear el rol', 'error')
          }
        } catch (error) {
          console.error('Error creating role:', error)
          this.$notify('Error de conexión al crear rol', 'error')
        } finally {
          this.saving = false
        }
      }
    },
    close() {
      this.dialog = false
      this.resetForm()
    },
    resetForm() {
      this.role = {
        name: '',
        description: ''
      }
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    }
  },
  watch: {
    dialog(val) {
      if (!val) {
        this.resetForm()
      }
    }
  }
}
</script>