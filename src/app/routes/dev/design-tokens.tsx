const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

const PALETTES = [
  {
    name: 'Primary',
    prefix: 'primary',
    values: [
      '#fff7f2',
      '#fff1e8',
      '#ffdfcb',
      '#ffb485',
      '#ff7f32',
      '#ff6200',
      '#f45c00',
      '#d55000',
      '#b74500',
      '#802c0b',
    ],
  },
  {
    name: 'Gray',
    prefix: 'gray',
    values: [
      '#f9f9f7',
      '#f2f2ef',
      '#eaeae6',
      '#d9d9d5',
      '#999991',
      '#73736d',
      '#5c5c55',
      '#383834',
      '#242422',
      '#000000',
    ],
  },
  {
    name: 'Yellow',
    prefix: 'yellow',
    values: [
      '#fffdf4',
      '#fff9e2',
      '#fff1b8',
      '#ffde8d',
      '#ffc56e',
      '#ffa044',
      '#e6882e',
      '#cc7319',
      '#975a00',
      '#704209',
    ],
  },
  {
    name: 'Purple',
    prefix: 'purple',
    values: [
      '#f9f5ff',
      '#eee5fb',
      '#dfcaf8',
      '#c7a5f1',
      '#a073e6',
      '#7d55c7',
      '#6e42c1',
      '#633aaf',
      '#542ea3',
      '#492b87',
    ],
  },
  {
    name: 'Blue',
    prefix: 'blue',
    values: [
      '#f2f8ff',
      '#ddebf8',
      '#c3dcf5',
      '#8fbdec',
      '#5b9ee3',
      '#418fde',
      '#2780d9',
      '#2170c0',
      '#18528c',
      '#153b7c',
    ],
  },
  {
    name: 'Lemon',
    prefix: 'lemon',
    values: [
      '#fffbf0',
      '#faf2d2',
      '#f8e59a',
      '#ffdd50',
      '#ffd008',
      '#ffb400',
      '#e8a400',
      '#ba8400',
      '#9e7000',
      '#735100',
    ],
  },
  {
    name: 'Pink',
    prefix: 'pink',
    values: [
      '#fcf4f7',
      '#f9d1df',
      '#f5b6cd',
      '#f19bbb',
      '#f06c88',
      '#f03c63',
      '#de1f48',
      '#c91239',
      '#b00b2e',
      '#802c0b',
    ],
  },
  {
    name: 'Sky',
    prefix: 'sky',
    values: [
      '#f2fafc',
      '#d4eef6',
      '#b7e2f0',
      '#99d6ea',
      '#5ebede',
      '#2aa3ca',
      '#248bad',
      '#1e738f',
      '#175b72',
      '#114454',
    ],
  },
] as const

const SEMANTIC_GROUPS = [
  {
    name: 'Action',
    tokens: [
      { label: 'primary', var: '--color-action-primary', hex: '#ff6200 (Primary 500)' },
      {
        label: 'primary-pressed',
        var: '--color-action-primary-pressed',
        hex: '#d55000 (Primary 700)',
      },
      { label: 'secondary', var: '--color-action-secondary', hex: '#73736d (Gray 500)' },
      {
        label: 'secondary-pressed',
        var: '--color-action-secondary-pressed',
        hex: '#5c5c55 (Gray 600)',
      },
      { label: 'link', var: '--color-action-link', hex: '#418fde (Blue 500)' },
      { label: 'hover', var: '--color-action-hover', hex: '#ffb485 (Primary 300)' },
    ],
  },
  {
    name: 'Status',
    tokens: [
      { label: 'error', var: '--color-semantic-error', hex: '#f03c63 (Pink 500)' },
      { label: 'success', var: '--color-semantic-success', hex: '#42ba61' },
      { label: 'info', var: '--color-semantic-info', hex: '#418fde (Blue 500)' },
    ],
  },
  {
    name: 'Background',
    tokens: [
      { label: 'background', var: '--color-bg-background', hex: '#ffffff' },
      { label: 'surface', var: '--color-bg-surface', hex: '#f9f9f7 (Gray 50)' },
      { label: 'divider', var: '--color-bg-divider', hex: '#eaeae6 (Gray 200)' },
      { label: 'scrim', var: '--color-bg-scrim', hex: '#999991 (Gray 400)' },
    ],
  },
  {
    name: 'Text',
    tokens: [
      { label: 'title', var: '--color-text-title', hex: '#000000 (Gray 900)' },
      { label: 'subtitle', var: '--color-text-subtitle', hex: '#242422 (Gray 800)' },
      { label: 'tertiary', var: '--color-text-tertiary', hex: '#5c5c55 (Gray 600)' },
      { label: 'tab', var: '--color-text-tab', hex: '#999991 (Gray 400)' },
      { label: 'disabled', var: '--color-text-disabled', hex: '#eaeae6 (Gray 200)' },
    ],
  },
  {
    name: 'Stroke',
    tokens: [
      { label: 'button', var: '--color-stroke-button', hex: '#999991 (Gray 400)' },
      { label: 'tab', var: '--color-stroke-tab', hex: '#999991 (Gray 400)' },
      { label: 'disabled', var: '--color-stroke-disabled', hex: '#d9d9d5 (Gray 300)' },
    ],
  },
] as const

const BG_CLASS_MAP: Record<string, Record<number, string>> = {
  primary: {
    50: 'bg-primary-50',
    100: 'bg-primary-100',
    200: 'bg-primary-200',
    300: 'bg-primary-300',
    400: 'bg-primary-400',
    500: 'bg-primary-500',
    600: 'bg-primary-600',
    700: 'bg-primary-700',
    800: 'bg-primary-800',
    900: 'bg-primary-900',
  },
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  },
  yellow: {
    50: 'bg-yellow-50',
    100: 'bg-yellow-100',
    200: 'bg-yellow-200',
    300: 'bg-yellow-300',
    400: 'bg-yellow-400',
    500: 'bg-yellow-500',
    600: 'bg-yellow-600',
    700: 'bg-yellow-700',
    800: 'bg-yellow-800',
    900: 'bg-yellow-900',
  },
  purple: {
    50: 'bg-purple-50',
    100: 'bg-purple-100',
    200: 'bg-purple-200',
    300: 'bg-purple-300',
    400: 'bg-purple-400',
    500: 'bg-purple-500',
    600: 'bg-purple-600',
    700: 'bg-purple-700',
    800: 'bg-purple-800',
    900: 'bg-purple-900',
  },
  blue: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    200: 'bg-blue-200',
    300: 'bg-blue-300',
    400: 'bg-blue-400',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    800: 'bg-blue-800',
    900: 'bg-blue-900',
  },
  lemon: {
    50: 'bg-lemon-50',
    100: 'bg-lemon-100',
    200: 'bg-lemon-200',
    300: 'bg-lemon-300',
    400: 'bg-lemon-400',
    500: 'bg-lemon-500',
    600: 'bg-lemon-600',
    700: 'bg-lemon-700',
    800: 'bg-lemon-800',
    900: 'bg-lemon-900',
  },
  pink: {
    50: 'bg-pink-50',
    100: 'bg-pink-100',
    200: 'bg-pink-200',
    300: 'bg-pink-300',
    400: 'bg-pink-400',
    500: 'bg-pink-500',
    600: 'bg-pink-600',
    700: 'bg-pink-700',
    800: 'bg-pink-800',
    900: 'bg-pink-900',
  },
  sky: {
    50: 'bg-sky-50',
    100: 'bg-sky-100',
    200: 'bg-sky-200',
    300: 'bg-sky-300',
    400: 'bg-sky-400',
    500: 'bg-sky-500',
    600: 'bg-sky-600',
    700: 'bg-sky-700',
    800: 'bg-sky-800',
    900: 'bg-sky-900',
  },
}

function isDark(hex: string) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 < 140
}

export default function DesignTokensPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Design Tokens</h1>
        <p className="mt-2 text-sm text-gray-600">Primitive & Semantic 토큰 검증 페이지</p>

        {/* Font Weight */}
        <section className="mt-12">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Font Weight</h2>
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-light text-gray-900">Pretendard Light</p>
              <p className="mt-1 text-xs text-gray-400">font-weight: 300</p>
            </div>
            <div>
              <p className="text-2xl font-normal text-gray-900">Pretendard Regular</p>
              <p className="mt-1 text-xs text-gray-400">font-weight: 400</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Pretendard Bold</p>
              <p className="mt-1 text-xs text-gray-400">font-weight: 700</p>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="font-light text-gray-900">가나다라마바사 아자차카타파하 0123456789</p>
            <p className="font-normal text-gray-900">가나다라마바사 아자차카타파하 0123456789</p>
            <p className="font-bold text-gray-900">가나다라마바사 아자차카타파하 0123456789</p>
          </div>
        </section>

        {/* Primitive Palettes */}
        <section className="mt-16">
          <h2 className="mb-8 text-lg font-bold text-gray-900">Primitive Tokens</h2>
          <div className="space-y-10">
            {PALETTES.map((palette) => (
              <div key={palette.prefix}>
                <h3 className="mb-3 text-sm font-bold text-gray-900">{palette.name}</h3>
                <div className="grid grid-cols-10 overflow-hidden rounded-lg">
                  {STEPS.map((step, i) => {
                    const hex = palette.values[i]
                    const dark = isDark(hex)
                    return (
                      <div
                        key={step}
                        className={`${BG_CLASS_MAP[palette.prefix][step]} flex aspect-square flex-col items-center justify-center p-1`}
                      >
                        <span
                          className={`text-xs font-bold ${dark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {step}
                        </span>
                        <span
                          className={`mt-0.5 text-[10px] ${dark ? 'text-white/70' : 'text-gray-900/50'}`}
                        >
                          {hex}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Semantic Tokens */}
        <section className="mt-16 pb-16">
          <h2 className="mb-8 text-lg font-bold text-gray-900">Semantic Tokens</h2>
          <div className="space-y-10">
            {SEMANTIC_GROUPS.map((group) => (
              <div key={group.name}>
                <h3 className="mb-3 text-sm font-bold text-gray-900">{group.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {group.tokens.map((token) => {
                    const isText = group.name === 'Text'
                    return (
                      <div
                        key={token.var}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3"
                      >
                        {isText ? (
                          <span
                            className="text-lg font-bold"
                            style={{ color: `var(${token.var})` }}
                          >
                            Aa
                          </span>
                        ) : (
                          <div
                            className="h-10 w-10 shrink-0 rounded-md border border-gray-200"
                            style={{
                              backgroundColor: `var(${token.var})`,
                            }}
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-gray-900">{token.label}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-gray-400">{token.var}</p>
                          <p className="font-mono text-[10px] text-gray-400">{token.hex}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
