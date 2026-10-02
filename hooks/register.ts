import type { Register } from 'claude-code'

import { count, empty, line } from './summary'

/** This turn's tally. Module state: a reload mid-turn starts the count over, which is fine for a toast. */
let tally = empty()

export const register: Register = on => {
  // The main loop's turn: a subagent's run raises no turn.start.
  on('turn.start', ($, e, next) => {
    tally = empty()
    return next(e)
  })

  // Every loop's calls count toward the turn, a subagent's included.
  on('tool.call', ($, e, next) => {
    count(tally, e.tool, e as unknown as Record<string, unknown>)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId !== undefined) return done
    const text = line(tally, e.durationMs, e.isAborted)
    if (text) $.ui.toast(text)
    tally = empty()
    return done
  })
}
