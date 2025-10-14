<template>
  <v-card class="variable-manager">
    <v-card-title class="primary white--text">
      <v-icon left>mdi-variable</v-icon>
      Gestor de Variables de Instancia
      <v-spacer></v-spacer>
      <v-btn icon dark @click="refreshVariables">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Variables Actuales -->
      <v-card outlined class="mb-4">
        <v-card-title class="subtitle-2 grey lighten-4">
          Variables de la Instancia
          <v-spacer></v-spacer>
          <v-chip small color="primary">
            {{ Object.keys(instanceVariables).length }} variables
          </v-chip>
        </v-card-title>
        
        <v-card-text>
          <v-simple-table v-if="Object.keys(instanceVariables).length > 0">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Valor</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in instanceVariables" :key="key">
                  <td>
                    <v-chip x-small color="primary">
                      {{ key }}
                    </v-chip>
                  </td>
                  <td>
                    <span class="variable-value">{{ formatValue(value) }}</span>
                  </td>
                  <td>
                    <v-chip x-small :color="getTypeColor(typeof value)">
                      {{ typeof value }}
                    </v-chip>
                  </td>
                  <td>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon small @click="editVariable(key, value)" v-on="on">
                          <v-icon small>mdi-pencil</v-icon>
                        </v-btn>
                      </template>
                      <span>Editar Variable</span>
                    </v-tooltip>
                    
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon small @click="deleteVariable(key)" v-on="on" color="error">
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <span>Eliminar Variable</span>
                    </v-tooltip>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          
          <div v-else class="text-center py-4">
            <v-icon color="grey lighten-2" size="48">mdi-information-outline</v-icon>
            <div class="subtitle-1 grey--text mt-2">No hay variables definidas</div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Agregar/Editar Variable -->
      <v-card outlined>
        <v-card-title class="subtitle-2 grey lighten-4">
          {{ editingVariable ? 'Editar Variable' : 'Agregar Nueva Variable' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="variableForm" v-model="valid">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newVariable.name"
                  label="Nombre de Variable"
                  :rules="[v => !!v || 'Nombre requerido', v => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v) || 'Nombre inválido']"
                  :disabled="editingVariable"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="newVariable.type"
                  :items="variableTypes"
                  label="Tipo de Dato"
                  :rules="[v => !!v || 'Tipo requerido']"
                  outlined
                  dense
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-text-field
                  v-if="newVariable.type === 'string' || newVariable.type === 'number'"
                  v-model="newVariable.value"
                  :label="getValueLabel(newVariable.type)"
                  :type="newVariable.type === 'number' ? 'number' : 'text'"
                  :rules="getValueRules(newVariable.type)"
                  outlined
                  dense
                ></v-text-field>
                
                <v-select
                  v-else-if="newVariable.type === 'boolean'"
                  v-model="newVariable.value"
                  :items="booleanOptions"
                  label="Valor"
                  outlined
                  dense
                ></v-select>
                
                <v-textarea
                  v-else-if="newVariable.type === 'object'"
                  v-model="newVariable.value"
                  label="Valor (JSON)"
                  :rules="[validateJSON]"
                  rows="3"
                  outlined
                  dense
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            text 
            @click="cancelEdit"
            v-if="editingVariable"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveVariable"
            :disabled="!valid"
          >
            {{ editingVariable ? 'Actualizar' : 'Agregar' }} Variable
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'VariableManager',
  props: {
    instanceId: {
      type: [String, Number],
      required: true
    },
    instanceVariables: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valid: false,
      editingVariable: null,
      newVariable: {
        name: '',
        type: 'string',
        value: ''
      },
      variableTypes: [
        { text: 'Texto', value: 'string' },
        { text: 'Número', value: 'number' },
        { text: 'Booleano', value: 'boolean' },
        { text: 'Objeto JSON', value: 'object' }
      ],
      booleanOptions: [
        { text: 'Verdadero', value: 'true' },
        { text: 'Falso', value: 'false' }
      ]
    }
  },
  methods: {
    getValueLabel(type) {
      const labels = {
        string: 'Valor (Texto)',
        number: 'Valor (Número)',
        boolean: 'Valor',
        object: 'Valor (JSON)'
      };
      return labels[type] || 'Valor';
    },
    getValueRules(type) {
      const rules = [];
      
      if (type === 'number') {
        rules.push(v => !isNaN(Number(v)) || 'Debe ser un número válido');
      }
      
      return rules;
    },
    validateJSON(value) {
      if (!value) return true;
      
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return 'JSON inválido';
      }
    },
    formatValue(value) {
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    },
    getTypeColor(type) {
      const colors = {
        string: 'blue',
        number: 'green',
        boolean: 'orange',
        object: 'purple'
      };
      return colors[type] || 'grey';
    },
    editVariable(name, value) {
      this.editingVariable = name;
      this.newVariable = {
        name: name,
        type: typeof value,
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
      };
    },
    deleteVariable(name) {
      this.$emit('variable-deleted', name);
      this.$store.dispatch('showSnackbar', {
        message: `Variable "${name}" eliminada`,
        color: 'success'
      });
    },
    async saveVariable() {
      if (!this.$refs.variableForm.validate()) {
        return;
      }

      try {
        let processedValue = this.newVariable.value;
        
        // Procesar el valor según el tipo
        switch (this.newVariable.type) {
          case 'number':
            processedValue = Number(processedValue);
            break;
          case 'boolean':
            processedValue = processedValue === 'true';
            break;
          case 'object':
            processedValue = processedValue ? JSON.parse(processedValue) : {};
            break;
          default:
            // string - mantener como está
            break;
        }

        const variableData = {
          name: this.newVariable.name,
          value: processedValue,
          type: this.newVariable.type
        };

        if (this.editingVariable) {
          this.$emit('variable-updated', variableData);
        } else {
          this.$emit('variable-added', variableData);
        }

        this.resetForm();
        
        this.$store.dispatch('showSnackbar', {
          message: `Variable ${this.editingVariable ? 'actualizada' : 'agregada'} exitosamente`,
          color: 'success'
        });

      } catch (error) {
        console.error('Error saving variable:', error);
        this.$store.dispatch('showSnackbar', {
          message: 'Error al guardar variable',
          color: 'error'
        });
      }
    },
    cancelEdit() {
      this.editingVariable = null;
      this.resetForm();
    },
    resetForm() {
      this.newVariable = {
        name: '',
        type: 'string',
        value: ''
      };
      this.$refs.variableForm?.reset();
      this.editingVariable = null;
    },
    refreshVariables() {
      this.$emit('refresh');
    }
  }
}
</script>

<style scoped>
.variable-manager {
  max-width: 1000px;
  margin: 0 auto;
}

.variable-value {
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
</style>