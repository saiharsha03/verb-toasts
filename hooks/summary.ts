// What a turn did, as one toast line. Pure.

export type Tally = { read: Set<string>; edited: Set<string>; searches: number; tests: number; commands: number; agents: number; web: number }

export const empty = (): Tally => ({ read: new Set(), edited: new Set(), searches: 0, tests: 0, commands: 0, agents: 0, web: 0 })

const RUNNERS = /\b(py\.?test|manage\.py\s+test|(?:pnpm|npm|yarn|bun)\s+(?:run\s+)?test|vitest|jest|make\s+test[\w-]*|go\s+test|cargo\s+test|phpunit|rspec|mocha|tox|unittest)\b/
const NOT_A_RUN = /^\s*(grep|rg|cat|echo|ls|find|sed|head|tail|git|which|type)\b/
export const isTestRun = (command: string) => !NOT_A_RUN.test(command) && RUNNERS.test(command)

const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** Counts one tool call into the tally. */
export function count(t: Tally, tool: string, args: Record<string, unknown>) {
  const path = str(args.file_path) || str(args.notebook_path)
  if (tool === 'Read') t.read.add(path)
  else if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) t.edited.add(path)
  else if (/^(Grep|Glob)$/.test(tool)) t.searches += 1
  else if (/^(Bash|PowerShell)$/.test(tool)) isTestRun(str(args.command)) ? (t.tests += 1) : (t.commands += 1)
  else if (/^(Agent|Task)$/.test(tool)) t.agents += 1
  else if (/^(WebFetch|WebSearch)$/.test(tool)) t.web += 1
}

const n = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`

export function elapsed(ms: number): string {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`
}

/** "Clawd read 14 files, edited 3, ran 2 test runs in 1m40s", or null when the turn used no tools. */
export function line(t: Tally, ms: number, isAborted: boolean): string | null {
  const parts = [
    t.read.size && `read ${n(t.read.size, 'file')}`,
    t.edited.size && `edited ${t.edited.size}`,
    t.searches && `searched ${t.searches}×`,
    t.tests && `ran ${n(t.tests, 'test run')}`,
    t.commands && n(t.commands, 'command'),
    t.agents && `sent ${n(t.agents, 'subagent')}`,
    t.web && `${t.web} web`,
  ].filter(Boolean) as string[]
  if (!parts.length) return null
  return `${isAborted ? 'Stopped: ' : ''}Clawd ${parts.join(', ')} in ${elapsed(ms)}`
}
