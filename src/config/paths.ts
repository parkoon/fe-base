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
      request: {
        path: 'permissions/request',
        getHref: () => '/app/permissions/request',
      },
      my: {
        path: 'permissions/my',
        getHref: () => '/app/permissions/my',
      },
      detail: {
        path: 'permissions/my/:id',
        getHref: (id: string) => `/app/permissions/my/${id}`,
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
    query: {
      editor: {
        path: 'query',
        getHref: () => '/app/query',
      },
      history: {
        path: 'query/history',
        getHref: () => '/app/query/history',
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
