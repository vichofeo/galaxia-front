<template>
  <v-card class="template-editor">
    <v-card-title class="primary white--text">
      <v-icon left>mdi-text-box-edit</v-icon>
      Editor de Templates
      <v-spacer></v-spacer>
      <v-btn icon dark @click="togglePreview">
        <v-icon>{{ showPreview ? 'mdi-code-tags' : 'mdi-eye' }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Alertas de validación -->
      <v-alert v-if="validationErrors.length > 0" type="error" dense class="mb-4">
        <div v-for="error in validationErrors" :key="error" class="caption">
          • {{ error }}
        </div>
      </v-alert>

      <v-alert v-else-if="template" type="success" dense class="mb-4">
        <v-icon small left>mdi-check</v-icon>
        Template válido - {{ extractedVariables.length }} variables detectadas
      </v-alert>

      <v-row>
        <!-- Editor de Código -->
        <v-col cols="12" md="6">
          <v-card outlined class="code-editor-container">
            <v-card-title class="subtitle-2 grey lighten-4">
              Código Template
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon small @click="validateTemplate" v-on="on">
                    <v-icon small>mdi-check-circle</v-icon>
                  </v-btn>
                </template>
                <span>Validar Template</span>
              </v-tooltip>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-textarea v-model="template"
                :placeholder="'Escribe tu template aquí...&#10;Usa {{ variable }} para variables&#10;Ej: {{ nombre }}, {{ email }}, {{ comentario }}'"
                outlined auto-grow rows="12" hide-details class="code-textarea" @input="onTemplateChange"></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Vista Previa / Variables -->
        <v-col cols="12" md="6">
          <v-card v-if="showPreview" outlined class="preview-container">
            <v-card-title class="subtitle-2 grey lighten-4">
              Vista Previa
            </v-card-title>
            <v-card-text class="preview-content">
              <div v-html="renderedPreview" class="preview-html"></div>
            </v-card-text>
          </v-card>

          <v-card v-else outlined class="variables-container">
            <v-card-title class="subtitle-2 grey lighten-4">
              Variables Detectadas ({{ extractedVariables.length }})
            </v-card-title>
            <v-card-text>
              <v-chip v-for="variable in extractedVariables" :key="variable" small class="ma-1" color="primary">
                <v-icon small left>mdi-variable</v-icon>
                {{ variable }}
              </v-chip>

              <div v-if="extractedVariables.length === 0" class="text-center py-4">
                <v-icon color="grey lighten-1" size="48">mdi-code-braces</v-icon>
                <div class="caption grey--text mt-2">No se detectaron variables</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Configuración de Campos -->
      <v-expansion-panels v-if="extractedVariables.length > 0" class="mt-4">
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon left>mdi-cog</v-icon>
            Configuración de Campos
            <template v-slot:actions>
              <v-badge :content="extractedVariables.length" color="primary"></v-badge>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <dynamic-form :form-config="formConfig" :initial-data="sampleData" submit-text="Aplicar Configuración"
              show-preview hide-actions @config-generated="onConfigGenerated"></dynamic-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('cancel')">
        Cancelar
      </v-btn>
      <v-btn color="primary" @click="saveTemplate" :loading="saving" :disabled="validationErrors.length > 0">
        <v-icon left>mdi-content-save</v-icon>
        Guardar Template
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { templateEngine } from '@/services/galaxia/templateEngine'
import DynamicForm from './DynamicForm.vue'

export default {
  name: 'TemplateEditor',
  components: {
    DynamicForm
  },
  props: {
    initialTemplate: {
      type: String,
      default: ''
    },
    activityId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      template: '',
      showPreview: false,
      validationErrors: [],
      extractedVariables: [],
      formConfig: [],
      sampleData: {},
      saving: false,
      renderKey: 0
    }
  },
  computed: {
    renderedPreview() {
      if (!this.template) return '<div class="grey--text">Escribe un template para ver la vista previa</div>';

      let preview = this.template;

      // Reemplazar variables con datos de muestra
      this.extractedVariables.forEach(variable => {
        const value = this.sampleData[variable] || `[${variable}]`;
        preview = preview.replace(
          new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, 'g'),
          `<span class="variable-value">${value}</span>`
        );
      });

      return preview.replace(/\n/g, '<br>');
    }
  },
  watch: {
    initialTemplate: {
      immediate: true,
      handler(newTemplate) {
        this.template = newTemplate || '';
        this.analyzeTemplate();
      }
    }
  },
  methods: {
    onTemplateChange() {
      this.analyzeTemplate();
      this.$emit('change', this.template);
    },
    analyzeTemplate() {
      // Extraer variables
      this.extractedVariables = templateEngine.extractVariables(this.template);

      // Validar template
      const validation = templateEngine.validateTemplate(this.template);
      this.validationErrors = validation.errors;

      // Generar configuración de formulario si hay variables
      if (this.extractedVariables.length > 0) {
        this.formConfig = templateEngine.generateFormConfig(this.template);
        this.initializeSampleData();
      } else {
        this.formConfig = [];
        this.sampleData = {};
      }

      this.renderKey++;
    },
    initializeSampleData() {
      const sampleData = {};
      this.extractedVariables.forEach(variable => {
        sampleData[variable] = this.getSampleValue(variable);
      });
      this.sampleData = sampleData;
    },
    getSampleValue(variable) {
      const name = variable.toLowerCase();

      if (name.includes('nombre') || name.includes('name')) return 'Juan Pérez';
      if (name.includes('email')) return 'juan@ejemplo.com';
      if (name.includes('fecha') || name.includes('date')) return '2024-01-15';
      if (name.includes('cantidad') || name.includes('amount')) return '100';
      if (name.includes('estado') || name.includes('status')) return 'pending';

      return `Valor de ${variable}`;
    },
    validateTemplate() {
      this.analyzeTemplate();

      if (this.validationErrors.length === 0) {
        this.$store.dispatch('showSnackbar', {
          message: 'Template válido',
          color: 'success'
        });
      } else {
        this.$store.dispatch('showSnackbar', {
          message: 'Template tiene errores',
          color: 'error'
        });
      }
    },
    togglePreview() {
      this.showPreview = !this.showPreview;
    },
    onConfigGenerated(config) {
      this.formConfig = config;
    },
    async saveTemplate() {
      if (this.validationErrors.length > 0) {
        this.$store.dispatch('showSnackbar', {
          message: 'Corrige los errores antes de guardar',
          color: 'error'
        });
        return;
      }

      this.saving = true;
      try {
        await this.$emit('save', {
          template: this.template,
          formConfig: this.formConfig,
          activityId: this.activityId
        });

        this.$store.dispatch('showSnackbar', {
          message: 'Template guardado exitosamente',
          color: 'success'
        });
      } catch (error) {
        console.error('Error saving template:', error);
        this.$store.dispatch('showSnackbar', {
          message: 'Error al guardar template',
          color: 'error'
        });
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>

<style scoped>
.template-editor {
  max-width: 1200px;
  margin: 0 auto;
}

.code-editor-container,
.preview-container,
.variables-container {
  height: 400px;
}

.code-textarea {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.preview-content {
  height: 340px;
  overflow-y: auto;
}

.preview-html {
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

.variable-value {
  background-color: #e3f2fd;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #90caf9;
  font-weight: bold;
}
</style>