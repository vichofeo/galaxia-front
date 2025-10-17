<template>
  <v-container>
    <v-card>
      <v-card-title>{{ isEdit ? 'Editar Actividad' : 'Crear Actividad' }}</v-card-title>
      <v-card-text>
        <v-form ref="activityForm">
          <v-text-field v-model="form.name" label="Nombre" required
            :rules="[v => !!v || 'Nombre es requerido']"></v-text-field>
          <v-select v-model="form.activity_type" :items="activityTypes" label="Tipo" required
            :rules="[v => !!v || 'Tipo es requerido']" @change="onTypeChange"></v-select>
          <v-checkbox v-model="form.is_interactive" label="Interactiva" :true-value="'y'" :false-value="'n'"
            @change="onInteractiveChange"></v-checkbox>
          <v-checkbox v-model="form.is_auto_routed" label="Auto-ruteada" :true-value="'y'"
            :false-value="'n'"></v-checkbox>
          <!-- Condiciones para switch -->
          <v-expand-transition>
            <div v-if="form.activity_type === 'switch'">
              <h4>Condiciones Switch</h4>
              <v-data-table :headers="conditionHeaders" :items="switchConditions" hide-default-footer
                class="elevation-1">
                <template v-slot:item.condition="{ item }">
                  <v-text-field v-model="item.condition" placeholder="E.g., amount > 1000"></v-text-field>
                </template>
                <template v-slot:item.act_to_id="{ item }">
                  <v-select v-model="item.act_to_id" :items="activities" item-text="name" item-value="activity_id"
                    dense></v-select>
                </template>
                <template v-slot:item.actions="{ index }">
                  <v-btn icon @click="removeCondition(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
              <v-btn color="primary" @click="addCondition" class="mt-2">+ Agregar Condición</v-btn>
            </div>
          </v-expand-transition>
          <!-- Código para activity/standalone -->
          <v-expand-transition>
            <div v-if="['activity', 'standalone'].includes(form.activity_type)">
              <h4>Código JavaScript</h4>
              <v-textarea v-model="form.code" label="Código (devuelve objeto de propiedades)" rows="5"
                placeholder="Ejemplo: properties.total = properties.amount + properties.interest; return properties;"
                hint="Usa 'properties' como contexto. Ejemplo: properties.newProp = properties.amount * 2;"></v-textarea>
            </div>
          </v-expand-transition>
          <!-- Campos de formulario para interactivas -->
          <v-expand-transition>
            <div v-if="form.is_interactive === 'y'">
              <h4>Campos de Formulario</h4>
              <v-data-table :headers="formFieldHeaders" :items="formFields" hide-default-footer class="elevation-1">
                <template v-slot:item.name="{ item }">
                  <v-text-field v-model="item.name" placeholder="E.g., amount"></v-text-field>
                </template>
                <template v-slot:item.label="{ item }">
                  <v-text-field v-model="item.label" placeholder="E.g., Monto"></v-text-field>
                </template>
                <template v-slot:item.type="{ item }">
                  <v-select v-model="item.type" :items="fieldTypes" dense></v-select>
                </template>
                <template v-slot:item.required="{ item }">
                  <v-checkbox v-model="item.required"></v-checkbox>
                </template>
                <template v-slot:item.actions="{ index }">
                  <v-btn icon @click="removeFormField(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
              <v-btn color="primary" @click="addFormField" class="mt-2">+ Agregar Campo</v-btn>
            </div>
          </v-expand-transition>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="saveActivity" :disabled="loading">Guardar</v-btn>
        <v-btn @click="$router.back()">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import galaxiaService from '@/services/galaxia/galaxiaService';

export default {
  name: 'ActivityForm',
  props: {
    processId: [String, Number],
    activity: Object
  },
  data() {
    return {
      loading: false,
      isEdit: !!this.activity,
      form: {
        name: this.activity?.name || '',
        activity_type: this.activity?.activity_type || 'activity',
        is_interactive: this.activity?.is_interactive || 'n',
        is_auto_routed: this.activity?.is_auto_routed || 'n',
        switch_conditions: this.activity?.switch_conditions || [],
        code: this.activity?.code || '',
        form_fields: this.activity?.form_fields || []
      },
      activities: [],
      switchConditions: this.activity?.switch_conditions || [],
      formFields: this.activity?.form_fields || [],
      activityTypes: ['start', 'end', 'split', 'switch', 'join', 'activity', 'standalone'],
      fieldTypes: ['string', 'number', 'boolean'],
      conditionHeaders: [
        { text: 'Condición', value: 'condition' },
        { text: 'Transición a', value: 'act_to_id' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ],
      formFieldHeaders: [
        { text: 'Nombre', value: 'name' },
        { text: 'Etiqueta', value: 'label' },
        { text: 'Tipo', value: 'type' },
        { text: 'Requerido', value: 'required' },
        { text: 'Acciones', value: 'actions', sortable: false }
      ]
    };
  },
  methods: {
    async fetchActivities() {
      try {
        const response = await galaxiaService.getProcess(this.processId);
        this.activities = response.data.activities || [];
      } catch (error) {
        this.$emit('error', 'Error al cargar actividades');
      }
    },
    onTypeChange() {
      if (this.form.activity_type !== 'switch') {
        this.switchConditions = [];
        this.form.switch_conditions = [];
      }
      if (!['activity', 'standalone'].includes(this.form.activity_type)) {
        this.form.code = '';
      }
    },
    onInteractiveChange() {
      if (this.form.is_interactive !== 'y') {
        this.formFields = [];
        this.form.form_fields = [];
      }
    },
    addCondition() {
      this.switchConditions.push({ condition: '', act_to_id: null });
    },
    removeCondition(index) {
      this.switchConditions.splice(index, 1);
    },
    addFormField() {
      this.formFields.push({ name: '', label: '', type: 'string', required: false });
    },
    removeFormField(index) {
      this.formFields.splice(index, 1);
    },
    async saveActivity() {
      if (!this.$refs.activityForm.validate()) return;
      this.loading = true;
      try {
        this.form.switch_conditions = this.switchConditions;
        this.form.form_fields = this.formFields;
        if (this.isEdit) {
          await galaxiaService.updateActivity(this.processId, this.activity.activity_id, this.form);
          this.$emit('success', 'Actividad actualizada');
        } else {
          await galaxiaService.createActivity(this.processId, this.form);
          this.$emit('success', 'Actividad creada');
        }
        this.$router.push(`/galaxia/processes/${this.processId}`);
      } catch (error) {
        this.$emit('error', 'Error al guardar actividad');
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchActivities();
  }
};
</script>

<style scoped>
.v-container {
  padding: 16px;
}

.mt-2 {
  margin-top: 8px;
}
</style>