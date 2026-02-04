import * as z from 'zod'

const createEnv = () => {
  const EnvSchema = z.object({
    API_URL: z.string(),
    ENABLE_API_MOCKING: z
      .string()
      .refine((s) => s === 'true' || s === 'false')
      .transform((s) => s === 'true')
      .optional(),
  })

  const envVars = Object.entries(import.meta.env as Record<string, string>).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    if (key.startsWith('VITE_APP_')) {
      acc[key.replace('VITE_APP_', '')] = value
    }
    return acc
  }, {})

  const parsedEnv = EnvSchema.safeParse(envVars)

  if (!parsedEnv.success) {
    throw new Error(
      `환경변수 설정이 올바르지 않습니다.
다음 환경변수를 확인해주세요:
${Object.entries(z.flattenError(parsedEnv.error).fieldErrors)
  .filter(([, v]) => v !== undefined)
  .map(([k, v]) => `- ${k}: ${v.join(', ')}`)
  .join('\n')}
`
    )
  }

  return parsedEnv.data
}

export const env = createEnv()
