<template>
  <v-container>
    <v-card>
      <v-card-title>Crear Transición</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>
        <v-form ref="transitionForm">
          <v-select
            v-model="form.fromActivityId"
            :items="activities"
            item-text="name"
            item-value="activity_id"
            label="Desde Actividad"
            required
            :rules="[v => !!v || 'Actividad origen es requerida', v => v !== form.toActivityId || 'Origen y destino no pueden ser iguales']"
          ></v-select>
          <v-select
            v-model="form.toActivityId"
            :items="activities"
            item-text="name"
            item-value="activity_id"
            label="Hacia Actividad"
            required
            :rules="[v => !!v || 'Actividad destino es requerida', v => v !== form.fromActivityId || 'Destino y origen no pueden ser iguales']"
          ></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="saveTransition" :disabled="loading">Guardar</v-btn>
        <v-btn @click="$router.back()">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import galaxiaService from '@/services/galaxia/galaxiaService';

export default {
  name: 'TransitionForm',
  props: {
    processId: [String, Number]
  },
  data() {
    return {
      loading: false,
      error: null,
      activities: [],
      form: {
        fromActivityId: null,
        toActivityId: null
      }
    };
  },
  methods: {
    async fetchActivities() {
      this.loading = true;
      try {
        const response = await galaxiaService.getProcess(this.processId);
        this.activities = response.data.activities || [];
      } catch (error) {
        this.error = 'Error al cargar actividades';
        this.$emit('error', this.error);
      } finally {
        this.loading = false;
      }
    },
    async saveTransition() {
      if (!this.$refs.transitionForm.validate()) return;
      this.loading = true;
      this.error = null;
      try {
        await galaxiaService.createTransition(this.processId, {
          act_from_id: this.form.fromActivityId,
          act_to_id: this.form.toActivityId
        });
        this.$emit('success', 'Transición creada');
        this.$router.push(`/galaxia/processes/${this.processId}`);
      } catch (error) {
        this.error = error.response?.data?.errors?.join(', ') || 'Error al guardar transición';
        this.$emit('error', this.error);
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
</style>