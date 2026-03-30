export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      path: '/auth/register',
      getHref: () => '/auth/register',
    },
  },

  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: '',
      getHref: () => '/app',
    },

    // 권한 관리
    permissions: {
      table: {
        path: 'permissions/table',
        getHref: () => '/app/permissions/table',
      },
      tables: {
        path: 'permissions/tables',
        getHref: () => '/app/permissions/tables',
      },
      detail: {
        path: 'permissions/tables/:id',
        getHref: (id: string) => `/app/permissions/tables/${id}`,
      },
    },

    // 결재
    approvals: {
      root: {
        path: 'approvals',
        getHref: () => '/app/approvals',
      },
      detail: {
        path: 'approvals/:id',
        getHref: (id: string) => `/app/approvals/${id}`,
      },
    },

    // 웹쿼리
    sql: {
      editor: {
        path: 'sql',
        getHref: () => '/app/sql',
      },
      history: {
        path: 'sql/history',
        getHref: () => '/app/sql/history',
      },
    },

    // 관리자
    admin: {
      datasources: {
        path: 'admin/datasources',
        getHref: () => '/app/admin/datasources',
      },
      users: {
        path: 'admin/users',
        getHref: () => '/app/admin/users',
      },
      permissions: {
        path: 'admin/permissions',
        getHref: () => '/app/admin/permissions',
      },
      audit: {
        path: 'admin/audit',
        getHref: () => '/app/admin/audit',
      },
    },
  },
} as const
