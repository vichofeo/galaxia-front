<template>
  <v-form ref="form" v-model="valid" class="dynamic-form">
    <!-- Campos dinámicos -->
    <div v-for="field in formConfig" :key="field.name" class="field-container">

      <!-- Campo de texto -->
      <v-text-field v-if="field.type === 'text'" v-model="formData[field.name]" :label="field.label"
        :rules="getRules(field)" :required="field.required" outlined dense class="mb-3"></v-text-field>

      <!-- Campo de email -->
      <v-text-field v-else-if="field.type === 'email'" v-model="formData[field.name]" :label="field.label"
        :rules="getRules(field, true)" type="email" :required="field.required" outlined dense
        class="mb-3"></v-text-field>

      <!-- Campo numérico -->
      <v-text-field v-else-if="field.type === 'number'" v-model="formData[field.name]" :label="field.label"
        :rules="getRules(field)" type="number" :required="field.required" outlined dense class="mb-3"></v-text-field>

      <!-- Campo de fecha -->
      <v-date-picker v-else-if="field.type === 'date'" v-model="formData[field.name]" :label="field.label"
        :rules="getRules(field)" :required="field.required" outlined dense class="mb-3"></v-date-picker>

      <!-- Select -->
      <v-select v-else-if="field.type === 'select'" v-model="formData[field.name]" :label="field.label"
        :items="field.options" item-text="text" item-value="value" :rules="getRules(field)" :required="field.required"
        outlined dense class="mb-3"></v-select>

      <!-- Textarea -->
      <v-textarea v-else-if="field.type === 'textarea'" v-model="formData[field.name]" :label="field.label"
        :rules="getRules(field)" :required="field.required" rows="3" outlined dense class="mb-3"></v-textarea>

      <!-- Campo desconocido - fallback a text -->
      <v-text-field v-else v-model="formData[field.name]" :label="field.label" :rules="getRules(field)"
        :required="field.required" outlined dense class="mb-3"></v-text-field>

    </div>

    <!-- Vista previa de datos -->
    <v-expansion-panels v-if="showPreview" class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-icon left>mdi-eye</v-icon>
          Vista Previa de Datos
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <pre class="preview-data">{{ JSON.stringify(formData, null, 2) }}</pre>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Acciones -->
    <v-card-actions v-if="!hideActions" class="px-0">
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('cancel')" :disabled="submitting">
        Cancelar
      </v-btn>
      <v-btn color="primary" @click="submitForm" :loading="submitting" :disabled="!valid">
        {{ submitText }}
      </v-btn>
    </v-card-actions>
  </v-form>
</template>

<script>
import { templateEngine } from '@/services/galaxia/templateEngine'

export default {
  name: 'DynamicForm',
  props: {
    template: {
      type: String,
      default: ''
    },
    formConfig: {
      type: Array,
      default: () => []
    },
    initialData: {
      type: Object,
      default: () => ({})
    },
    submitText: {
      type: String,
      default: 'Guardar'
    },
    showPreview: {
      type: Boolean,
      default: false
    },
    hideActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      submitting: false,
      formData: {}
    }
  },
  watch: {
    template: {
      immediate: true,
      handler(newTemplate) {
        if (newTemplate && this.formConfig.length === 0) {
          this.generateFormFromTemplate(newTemplate)
        }
      }
    },
    initialData: {
      immediate: true,
      deep: true,
      handler(newData) {
        this.initializeFormData(newData)
      }
    }
  },
  methods: {
    generateFormFromTemplate(template) {
      const config = templateEngine.generateFormConfig(template)
      this.$emit('config-generated', config)
    },
    initializeFormData(initialData) {
      // Inicializar formData con valores por defecto o datos iniciales
      this.formData = { ...initialData }

      // Asegurar que todos los campos del config existan en formData
      if (this.formConfig && this.formConfig.length > 0) {
        this.formConfig.forEach(field => {
          if (!(field.name in this.formData)) {
            this.formData[field.name] = ''
          }
        })
      }
    },
    getRules(field, isEmail = false) {
      const rules = []

      if (field.required) {
        rules.push(v => !!v || `${field.label} es requerido`)
      }

      if (isEmail) {
        rules.push(v => !v || /.+@.+\..+/.test(v) || 'Email debe ser válido')
      }

      if (field.type === 'number') {
        rules.push(v => !v || !isNaN(v) || 'Debe ser un número válido')
      }

      return rules
    },
    async submitForm() {
      if (!this.$refs.form.validate()) {
        return
      }

      this.submitting = true
      try {
        await this.$emit('submit', this.formData)
      } catch (error) {
        console.error('Error in form submission:', error)
      } finally {
        this.submitting = false
      }
    },
    validate() {
      return this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
      this.initializeFormData(this.initialData)
    },
    getFormData() {
      return { ...this.formData }
    }
  }
}
</script>

<style scoped>
.dynamic-form {
  max-width: 800px;
}

.field-container {
  margin-bottom: 8px;
}

.preview-data {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>