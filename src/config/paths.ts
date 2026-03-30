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
        root: {
          path: 'permissions/table',
          getHref: () => '/app/permissions/table',
        },
        request: {
          path: 'permissions/table/request',
          getHref: () => '/app/permissions/table/request',
        },
        detail: {
          path: 'permissions/table/:id',
          getHref: (id: string) => `/app/permissions/table/${id}`,
        },
      },
      masking: {
        root: {
          path: 'permissions/masking',
          getHref: () => '/app/permissions/masking',
        },
        request: {
          path: 'permissions/masking/request',
          getHref: (params?: { schema?: string; table?: string; columns?: string[] }) => {
            const search = new URLSearchParams()
            if (params?.schema) search.set('schema', params.schema)
            if (params?.table) search.set('table', params.table)
            if (params?.columns?.length) search.set('columns', params.columns.join(','))
            const qs = search.toString()
            return `/app/permissions/masking/request${qs ? `?${qs}` : ''}`
          },
        },
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
