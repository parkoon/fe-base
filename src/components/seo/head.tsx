import { Helmet, HelmetData } from 'react-helmet-async'

type HeadProps = {
  title?: string
  description?: string
}

const helmetData = new HelmetData({})

const APP_NAME = 'FE Base'

/**
 * 페이지 타이틀과 메타 정보를 관리하는 컴포넌트
 *
 * @example
 * <Head title="대시보드" description="대시보드 페이지입니다" />
 * // → <title>대시보드 | FE Base</title>
 */
export function Head({ title = '', description = '' }: HeadProps = {}) {
  return (
    <Helmet
      helmetData={helmetData}
      title={title ? `${title} | ${APP_NAME}` : undefined}
      defaultTitle={APP_NAME}
    >
      <meta
        name="description"
        content={description}
      />
    </Helmet>
  )
}
