// router/index.js - Modulo Galaxia

export default [
    {
        path: "/galaxia",
        //name: "pGalaxiaManager",
        component: () =>
            import(/* webpackChunkName: "about" */ "@/layouts/LayoutSsepi.vue"),
        //beforeEnter: authGuard,
        meta: { requiereAuth: true },
        children: [
            {
                // Ruta PRINCIPAL de Galaxia - cambiamos path a ""
                path: "",
                name: "GalaxiaManager",
                component: () =>
                    import( /* webpackChunkName: "galaxia" */ "@/views/galaxia/GalaxiaManager.vue"),
                //beforeEnter: authGuard,
                meta: {
                    requiereAuth: true,
                    title: "Galaxia Workflow Manager"
                },
                props: false,
            },
            {
                // Detalle de proceso - 
                path: "process/:id",
                name: "processDetail",
                component: () =>
                    import(/* webpackChunkName: "galaxia" */ "@/views/galaxia/processes/ProcessDetail.vue"),
                //beforeEnter: authGuard,
                meta: {
                    requiereAuth: true,
                    title: "Detalle de Proceso"
                },
                props: true,
            },
            {
                path: "instances",
                name: "InstanceManager",
                component: () => import( /* webpackChunkName: "galaxia" */ "@/views/galaxia/InstanceManagerView.vue"),
                //beforeEnter: authGuard,
                meta: {
                    requiereAuth: true,
                    title: "Gestor de Instancias"
                },
                props: false,
            },
            {
                path: 'instance/:id',
                name: 'InstanceDetail',
                component: () => import('@/views/galaxia/InstanceDetail.vue'),
                meta: {
                    requiereAuth: true,
                    title: 'Detalle de Instancia'
                }, props: true,
            },
            {
                path: 'dashboard',
                name: 'UserDashboard',
                component: () => import('@/views/galaxia/UserDashboard.vue'),
                meta: {
                    requiereAuth: true,
                    title: 'Mi Panel de Trabajo'
                }, props: false,
            }
        ],

    },
    {
        path: "/ginstances",
        //name: "galaxia-ginstances-manager",
        component: () =>
            import(/* webpackChunkName: "about" */ "@/layouts/LayoutSsepi.vue"),
        //beforeEnter: authGuard,
        meta: { requiereAuth: true },
        children: [
            {
                // Ruta PRINCIPAL de Galaxia - cambiamos path a ""
                path: "",
                name: "Mis-GInstances",
                component: () =>
                    import( /* webpackChunkName: "galaxia" */ "@/views/galaxia/InstanceDashboard.vue"),
                //beforeEnter: authGuard,
                meta: {
                    requiereAuth: true,
                    title: "Galaxia Workflow Manager Instances"
                },
                props: false,
            },
            {
                //path: 'ginstances/:id',
                path: 'iusr/:id',
                name: 'GInstanceDetail',
                component: () => import(/* webpackChunkName: "galaxia" */'@/views/galaxia/GInstanceDetail.vue'),
                //beforeEnter: authGuard,
                meta: {
                    requiresAuth: true,
                    title: 'Detalle de Instancia',
                    breadcrumb: 'Detalle'
                },
                props: true,
            },
            //ver006
            {
                path: 'udashboard',
                name: 'UserDashboardView',
                component: () => import(/* webpackChunkName: "galaxiaDashboard" */'@/views/galaxia/UserDashboardView.vue'),
                //beforeEnter: authGuard,
                meta: {
                    requiresAuth: true,
                    title: 'Dashboard Usuario',
                    breadcrumb: 'Dashboard'
                },
                props: false,
            },
            {
                path: 'execute/:instanceId/:workitemId',
                name: 'ActivityExecutor',
                component: () => import('@/components/galaxia/userInterface/ActivityExecutor.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Ejecutar Actividad',
                    breadcrumb: 'Ejecutar'
                }
            }

        ]
    },

    // /galaxia-front/src/router/index.js - AGREGAR:

    {
        path: "/templates",
        component: () =>
            import(/* webpackChunkName: "about" */ "@/layouts/LayoutSsepi.vue"),
        //beforeEnter: authGuard,
        meta: { requiereAuth: true },
        children: [{
            path: '',
            name: 'TemplateManager',
            component: () => import('@/views/galaxia/TemplateManager.vue'),
            meta: {
                requiresAuth: true,
                title: 'Gestor de Templates',
                breadcrumb: 'Templates'
            }
        },
        {
            path: 'library',
            name: 'TemplateLibrary',
            component: () => import('@/components/galaxia/forms/TemplateLibrary.vue'),
            meta: {
                requiresAuth: true,
                title: 'Biblioteca de Templates',
                breadcrumb: 'Biblioteca'
            }
        },
        {
            path: 'activities/:activityId/template',
            name: 'ActivityTemplateEditor',
            component: () => import('@/components/galaxia/forms/TemplateEditor.vue'),
            meta: {
                requiresAuth: true,
                title: 'Editor de Template',
                breadcrumb: 'Template'
            }
        }
        ],
    },

]