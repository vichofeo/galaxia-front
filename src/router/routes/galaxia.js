// Rutas de Galaxia para el frontend
import ProcessManager from '@/views/galaxia/ProcessManager.vue';
import ProcessList from '@/components/galaxia/ProcessList.vue';
import ProcessDetail from '@/components/galaxia/ProcessDetail.vue';
import ProcessForm from '@/components/galaxia/processManager/ProcessForm.vue';
import ActivityForm from '@/components/galaxia/processManager/ActivityForm.vue';
import TransitionForm from '@/components/galaxia/processManager/TransitionForm.vue';
import RoleForm from '@/components/galaxia/processManager/RoleForm.vue';
import Workflow from '@/views/galaxia/Workflow.vue';
import ProcessMonitor from '@/views/galaxia/ProcessMonitor.vue';

export default [
  {
    path: '/galaxia/processes',
    component: ProcessManager,
    children: [
      {
        path: '',
        name: 'ProcessList',
        component: ProcessList
      },
      {
        path: 'new',
        name: 'ProcessForm',
        component: ProcessForm
      },
      {
        path: ':id',
        name: 'ProcessDetail',
        component: ProcessDetail,
        props: true
      },
      {
        path: ':processId/activities/new',
        name: 'ActivityForm',
        component: ActivityForm,
        props: true
      },
      {
        path: ':processId/transitions/new',
        name: 'TransitionForm',
        component: TransitionForm,
        props: route => ({ processId: route.params.processId, activities: [] })
      },
      {
        path: ':processId/roles/new',
        name: 'RoleForm',
        component: RoleForm,
        props: true
      }
    ]
  },
  {
    path: '/galaxia/instances/:instanceId',
    name: 'Workflow',
    component: Workflow,
    props: true
  },
  {
    path: '/galaxia/monitor',
    name: 'ProcessMonitor',
    component: ProcessMonitor
  }
];