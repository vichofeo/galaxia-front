<template>
  <v-container>
    <v-card>
      <v-card-title>Instancia #{{ instanceId }}</v-card-title>
      <v-card-text>
        <h3>Proceso: {{ instance?.process?.name }}</h3>
        <p>Estado: {{ instance?.status === 'r' ? 'En ejecución' : 'Completada' }}</p>
        <h4>Workitems Activos</h4>
        <v-data-table :headers="workitemHeaders" :items="instance?.workitems || []" :loading="loading">
          <template v-slot:item.actions="{ item }">
            <v-btn v-if="item.activity.is_interactive === 'y'" small color="primary"
              @click="showForm(item.activity_id)">Ver Formulario</v-btn>
            <v-btn v-else small color="primary" @click="completeActivity(item.activity_id)">Completar</v-btn>
          </template>
        </v-data-table>
        <v-expand-transition>
          <div v-if="selectedActivityId">
            <h4>Formulario: {{ selectedActivity?.name }}</h4>
            <InteractiveForm :instanceId="instanceId" :activityId="selectedActivityId"
              :formFields="selectedActivity?.form_fields || []" @success="onFormSuccess" @error="onFormError" />
          </div>
        </v-expand-transition>
        <h4>Propiedades</h4>
        <v-form ref="propertiesForm">
          <v-row v-for="(prop, index) in properties" :key="index">
            <v-col cols="6">
              <v-text-field v-model="prop.name" label="Nombre" :disabled="true"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="prop.value" label="Valor"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="newProperty.name" label="Nueva Propiedad"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="newProperty.value" label="Valor"></v-text-field>
            </v-col>
          </v-row>
          <v-btn color="primary" @click="saveProperties" :disabled="loading">Guardar Propiedades</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import galaxiaService from '@/services/galaxia/galaxiaService';
import InteractiveForm from '@/components/galaxia/InteractiveForm.vue';

export default {
  name: 'InstanceWorkflow',
  components: { InteractiveForm },
  props: {
    instanceId: [String, Number]
  },
  data() {
    return {
      loading: false,
      instance: null,
      properties: [],
      newProperty: { name: '', value: '' },
      selectedActivityId: null,
      workitemHeaders: [
        { text: 'Actividad', value: 'activity.name' },
        { text: 'Estado', value: 'status' },
        { text: 'Acciones', value: 'actions' }
      ]
    };
  },
  computed: {
    selectedActivity() {
      return this.instance?.workitems?.find(w => w.activity_id === this.selectedActivityId)?.activity || null;
    }
  },
  methods: {
    async fetchInstance() {
      this.loading = true;
      try {
        const response = await galaxiaService.getInstance(this.instanceId);
        this.instance = response.data;
        this.properties = response.data.properties || [];
      } catch (error) {
        this.$emit('error', 'Error al cargar instancia');
      } finally {
        this.loading = false;
      }
    },
    showForm(activityId) {
      this.selectedActivityId = activityId;
    },
    async completeActivity(activityId) {
      this.loading = true;
      try {
        await galaxiaService.completeActivity(this.instanceId, activityId);
        this.$emit('success', 'Actividad completada');
        await this.fetchInstance();
      } catch (error) {
        this.$emit('error', 'Error al completar actividad');
      } finally {
        this.loading = false;
      }
    },
    async saveProperties() {
      if (!this.$refs.propertiesForm.validate()) return;
      this.loading = true;
      try {
        const properties = {};
        this.properties.forEach(prop => {
          properties[prop.name] = prop.value;
        });
        if (this.newProperty.name && this.newProperty.value) {
          properties[this.newProperty.name] = this.newProperty.value;
        }
        await galaxiaService.setProperties(this.instanceId, properties);
        this.$emit('success', 'Propiedades guardadas');
        this.newProperty = { name: '', value: '' };
        await this.fetchInstance();
      } catch (error) {
        this.$emit('error', 'Error al guardar propiedades');
      } finally {
        this.loading = false;
      }
    },
    onFormSuccess(message) {
      this.$emit('success', message);
      this.selectedActivityId = null;
      this.fetchInstance();
    },
    onFormError(message) {
      this.$emit('error', message);
    }
  },
  mounted() {
    this.fetchInstance();
  }
};
</script>

<style scoped>
.v-container {
  padding: 16px;
}
</style>