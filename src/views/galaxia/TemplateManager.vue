<!-- /galaxia-front/src/views/galaxia/TemplateManager.vue -->
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="primary white--text">
            <v-icon left>mdi-text-box-multiple</v-icon>
            Gestor de Templates - Galaxia
          </v-card-title>
          <v-card-text class="pa-4">
            <v-tabs v-model="tab" grow>
              <v-tab>
                <v-icon left>mdi-library</v-icon>
                Biblioteca
              </v-tab>
              <v-tab>
                <v-icon left>mdi-pencil</v-icon>
                Editor
              </v-tab>
              <v-tab>
                <v-icon left>mdi-variable</v-icon>
                Variables
              </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab" class="mt-4">
              <v-tab-item>
                <template-library @template-used="onTemplateUsed"></template-library>
              </v-tab-item>
              
              <v-tab-item>
                <template-editor
                  :initial-template="currentTemplate"
                  :activity-id="selectedActivityId"
                  @save="saveTemplate"
                  @change="onTemplateChange"
                ></template-editor>
              </v-tab-item>
              
              <v-tab-item>
                <variable-manager
                  :instance-id="currentInstanceId"
                  :instance-variables="currentVariables"
                  @variable-added="onVariableAdded"
                  @variable-updated="onVariableUpdated"
                  @variable-deleted="onVariableDeleted"
                  @refresh="loadVariables"
                ></variable-manager>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TemplateLibrary from '@/components/galaxia/forms/TemplateLibrary.vue'
import TemplateEditor from '@/components/galaxia/forms/TemplateEditor.vue'
import VariableManager from '@/components/galaxia/forms/VariableManager.vue'

export default {
  name: 'TemplateManager',
  components: {
    TemplateLibrary,
    TemplateEditor,
    VariableManager
  },
  data() {
    return {
      tab: 0,
      currentTemplate: '',
      selectedActivityId: null,
      currentInstanceId: null,
      currentVariables: {}
    }
  },
  methods: {
    onTemplateUsed(template) {
      this.currentTemplate = template.content
      this.tab = 1 // Cambiar a pestaña editor
    },
    async saveTemplate(templateData) {
      // Guardar template en actividad
      console.log('Guardando template:', templateData)
    },
    onTemplateChange(template) {
      this.currentTemplate = template
    },
    onVariableAdded(variableData) {
      console.log('Variable agregada:', variableData)
    },
    onVariableUpdated(variableData) {
      console.log('Variable actualizada:', variableData)
    },
    onVariableDeleted(variableName) {
      console.log('Variable eliminada:', variableName)
    },
    loadVariables() {
      // Cargar variables de instancia
      console.log('Cargando variables...')
    }
  }
}
</script>