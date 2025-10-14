<template>
  <v-card class="template-library">
    <v-card-title class="primary white--text">
      <v-icon left>mdi-library</v-icon>
      Biblioteca de Templates
      <v-spacer></v-spacer>
      <v-btn icon dark @click="loadTemplates">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Filtros y Búsqueda -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar templates..."
            clearable
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="categoryFilter"
            :items="categories"
            label="Filtrar por categoría"
            clearable
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-btn color="primary" @click="showCreateDialog = true" block>
            <v-icon left>mdi-plus</v-icon>
            Nuevo Template
          </v-btn>
        </v-col>
      </v-row>

      <!-- Grid de Templates -->
      <v-row v-if="filteredTemplates.length > 0">
        <v-col
          v-for="template in filteredTemplates"
          :key="template.id"
          cols="12" sm="6" md="4"
        >
          <v-card class="template-card" hover @click="selectTemplate(template)">
            <v-card-title class="subtitle-1">
              {{ template.name }}
            </v-card-title>
            
            <v-card-subtitle>
              <v-chip x-small :color="getCategoryColor(template.category)" class="mr-2">
                {{ template.category }}
              </v-chip>
              <v-chip x-small color="grey lighten-2">
                {{ template.variables.length }} variables
              </v-chip>
            </v-card-subtitle>

            <v-card-text class="template-preview">
              <div class="preview-text">
                {{ truncateTemplate(template.content) }}
              </div>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon small @click.stop="editTemplate(template)" v-on="on">
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Editar</span>
              </v-tooltip>
              
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn icon small @click.stop="useTemplate(template)" v-on="on" color="primary">
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn>
                </template>
                <span>Usar Template</span>
              </v-tooltip>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Estado vacío -->
      <div v-else class="text-center py-8">
        <v-icon size="64" color="grey lighten-2" class="mb-4">mdi-library-outline</v-icon>
        <div class="subtitle-1 grey--text">No hay templates disponibles</div>
        <v-btn class="mt-2" color="primary" @click="showCreateDialog = true">
          Crear Primer Template
        </v-btn>
      </div>
    </v-card-text>

    <!-- Dialog Crear/Editar Template -->
    <v-dialog v-model="showCreateDialog" max-width="800px" persistent>
      <template-editor
        :initial-template="editingTemplate ? editingTemplate.content : ''"
        @save="saveTemplate"
        @cancel="closeDialog"
      ></template-editor>
    </v-dialog>
  </v-card>
</template>

<script>
import TemplateEditor from './TemplateEditor.vue'

export default {
  name: 'TemplateLibrary',
  components: {
    TemplateEditor
  },
  data() {
    return {
      templates: [],
      search: '',
      categoryFilter: null,
      showCreateDialog: false,
      editingTemplate: null,
      categories: [
        'Formulario',
        'Notificación',
        'Reporte',
        'Aprobación',
        'Solicitud',
        'Personalizado'
      ],
      defaultTemplates: [
        {
          id: 1,
          name: 'Formulario de Solicitud Básica',
          category: 'Solicitud',
          content: `Solicitud de {{ tipo_solicitud }}

Datos del Solicitante:
Nombre: {{ nombre_completo }}
Email: {{ email }}
Departamento: {{ departamento }}

Descripción de la Solicitud:
{{ descripcion_solicitud }}

Prioridad: {{ prioridad }}
Fecha Requerida: {{ fecha_requerida }}`,
          variables: ['tipo_solicitud', 'nombre_completo', 'email', 'departamento', 'descripcion_solicitud', 'prioridad', 'fecha_requerida']
        },
        {
          id: 2,
          name: 'Formulario de Aprobación',
          category: 'Aprobación',
          content: `Solicitud de Aprobación

Proyecto: {{ nombre_proyecto }}
Solicitante: {{ solicitante }}
Monto: {{ monto_solicitado }}

Justificación:
{{ justificacion }}

Recomendación: {{ recomendacion }}
Comentarios: {{ comentarios_aprobador }}`,
          variables: ['nombre_proyecto', 'solicitante', 'monto_solicitado', 'justificacion', 'recomendacion', 'comentarios_aprobador']
        },
        {
          id: 3,
          name: 'Formulario de Reporte de Incidente',
          category: 'Reporte',
          content: `Reporte de Incidente

Tipo de Incidente: {{ tipo_incidente }}
Gravedad: {{ nivel_gravedad }}
Fecha del Incidente: {{ fecha_incidente }}

Descripción:
{{ descripcion_incidente }}

Acciones Tomadas:
{{ acciones_tomadas }}

Reportado por: {{ reportado_por }}`,
          variables: ['tipo_incidente', 'nivel_gravedad', 'fecha_incidente', 'descripcion_incidente', 'acciones_tomadas', 'reportado_por']
        }
      ]
    }
  },
  computed: {
    filteredTemplates() {
      let filtered = this.templates;

      // Filtro de búsqueda
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.content.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
        );
      }

      // Filtro de categoría
      if (this.categoryFilter) {
        filtered = filtered.filter(t => t.category === this.categoryFilter);
      }

      return filtered;
    }
  },
  mounted() {
    this.loadTemplates();
  },
  methods: {
    loadTemplates() {
      // Por ahora cargamos templates por defecto
      // En producción, haríamos una llamada API
      this.templates = [...this.defaultTemplates];
      
      // Cargar templates guardados del localStorage
      const savedTemplates = localStorage.getItem('galaxia_templates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        this.templates = [...this.templates, ...parsed];
      }
    },
    getCategoryColor(category) {
      const colors = {
        'Formulario': 'blue',
        'Notificación': 'green',
        'Reporte': 'orange',
        'Aprobación': 'purple',
        'Solicitud': 'teal',
        'Personalizado': 'grey'
      };
      return colors[category] || 'grey';
    },
    truncateTemplate(content, length = 100) {
      return content.length > length 
        ? content.substring(0, length) + '...' 
        : content;
    },
    selectTemplate(template) {
      this.$emit('template-selected', template);
    },
    editTemplate(template) {
      this.editingTemplate = template;
      this.showCreateDialog = true;
    },
    useTemplate(template) {
      this.$emit('template-used', template);
      this.$store.dispatch('showSnackbar', {
        message: `Template "${template.name}" copiado al portapapeles`,
        color: 'success'
      });
    },
    async saveTemplate(templateData) {
      try {
        const newTemplate = {
          id: this.editingTemplate ? this.editingTemplate.id : Date.now(),
          name: `Template Personalizado ${new Date().toLocaleDateString()}`,
          category: 'Personalizado',
          content: templateData.template,
          variables: templateData.formConfig.map(field => field.name)
        };

        if (this.editingTemplate) {
          // Actualizar template existente
          const index = this.templates.findIndex(t => t.id === this.editingTemplate.id);
          if (index !== -1) {
            this.templates[index] = { ...this.templates[index], ...newTemplate };
          }
        } else {
          // Agregar nuevo template
          this.templates.unshift(newTemplate);
        }

        // Guardar en localStorage
        const customTemplates = this.templates.filter(t => t.category === 'Personalizado');
        localStorage.setItem('galaxia_templates', JSON.stringify(customTemplates));

        this.closeDialog();
        
        this.$store.dispatch('showSnackbar', {
          message: `Template ${this.editingTemplate ? 'actualizado' : 'guardado'} exitosamente`,
          color: 'success'
        });

      } catch (error) {
        console.error('Error saving template:', error);
        this.$store.dispatch('showSnackbar', {
          message: 'Error al guardar template',
          color: 'error'
        });
      }
    },
    closeDialog() {
      this.showCreateDialog = false;
      this.editingTemplate = null;
    }
  }
}
</script>

<style scoped>
.template-library {
  max-width: 1200px;
  margin: 0 auto;
}

.template-card {
  height: 100%;
  transition: transform 0.2s;
}

.template-card:hover {
  transform: translateY(-4px);
}

.template-preview {
  height: 120px;
  overflow: hidden;
}

.preview-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #666;
  white-space: pre-wrap;
}
</style>