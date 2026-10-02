# verb-toasts

A Claude Code mod. One toast when a turn ends: files read, files edited, test runs, elapsed. No model calls.

**It won't use any of your usage.** Everything is drawn locally from code: no model calls, no tokens.

## Install

```
/plugin marketplace add saiharsha03/verb-toasts
/plugin install verb-toasts@verb-toasts
```

Or from a clone: `claude --plugin-dir ./verb-toasts`.

## Where it shows

In a toast when a turn ends. Terminal only.

## What the hooks do

`hooks/register.ts` hooks: turn.start, tool.call, turn.complete. It never blocks or rewrites a tool call or a prompt; it only watches them, draws, and answers its own commands.

## Privacy: what data it sends

None. It makes no network or model calls; anything it remembers stays in Claude Code's local plugin storage on your machine.

## Licence

MIT. Clawd is Anthropic's Claude Code mascot; this is an unofficial fan mod.
