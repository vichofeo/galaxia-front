// router/index.js - Modulo Galaxia

export default [
    {
        path: "/galaxia",
        name: "galaxia-manager",
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
        name: "galaxia-ginstances-manager",
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
                path: '/ginstances/:id',
                name: 'GInstanceDetail',
                component: () => import(/* webpackChunkName: "galaxia" */'@/views/galaxia/InstanceDetail.vue'),
                //beforeEnter: authGuard,
                meta: {
                    requiresAuth: true,
                    title: 'Detalle de Instancia',
                    breadcrumb: 'Detalle'
                }
            }
        ]
    }
]