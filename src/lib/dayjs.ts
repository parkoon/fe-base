import 'dayjs/locale/ko'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.locale('ko')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.tz.setDefault('Asia/Seoul')

export { dayjs as $dayjs }
