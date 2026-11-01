import React from "react"
import { createRoot } from "react-dom/client"
import "./fixture.css"
import * as Before from "./before-settings"
import * as After from "@/lib/settings"
import { buildProviderWidgetGroups, WidgetGroupedList } from "@/components/modern/widget-grouped-list"
import { metricId } from "@/lib/metric-id"
import { resolveWidgetData } from "@/lib/widget-data"
import type { PluginMeta } from "@/lib/plugin-types"
import type { MetricLine } from "@/lib/plugin-types"

const params = new URLSearchParams(window.location.search)
const mode = params.get("mode") === "before" ? "before" : "after"
const source = mode === "before" ? Before : After
const savedOrder = ["claude", "codex", "antigravity-cli"]
const sessionLabel = "Session"
const resetAt = "2026-11-01T18:00:00.000Z"
const colors: Record<string, string> = {
  "antigravity-cli": "#4285F4",
  claude: "#DE7356",
  codex: "#74AA9C",
}

const plugins: PluginMeta[] = [
  {
    id: "antigravity-cli", name: "Antigravity CLI", iconUrl: "", iconFilePath: "",
    brandColor: colors["antigravity-cli"],
    lines: [{ type: "progress", label: sessionLabel, scope: "overview" }], primaryCandidates: [],
  },
  {
    id: "claude", name: "Claude", iconUrl: "", iconFilePath: "",
    brandColor: colors.claude,
    lines: [{ type: "progress", label: sessionLabel, scope: "overview" }], primaryCandidates: [],
  },
  {
    id: "codex", name: "Codex", iconUrl: "", iconFilePath: "",
    brandColor: colors.codex,
    lines: [{ type: "progress", label: sessionLabel, scope: "overview" }], primaryCandidates: [],
  },
]

const normalized = source.normalizePluginSettings({ order: savedOrder, disabled: [] }, plugins)
const fixtureUsage: Record<string, number> = {
  claude: 42,
  codex: 28,
  "antigravity-cli": 61,
}
const placedMetricIds = normalized.order.map((id) => metricId(id, sessionLabel))
const widgetDataById = new Map(
  normalized.order.map((id) => {
    const line: MetricLine = {
      type: "progress",
      label: sessionLabel,
      used: fixtureUsage[id],
      limit: 100,
      format: { kind: "percent" },
      resetsAt: resetAt,
      color: colors[id],
    }
    const metric = resolveWidgetData({
      metricId: metricId(id, sessionLabel),
      displayName: plugins.find((plugin) => plugin.id === id)?.name ?? id,
      line,
      displayMode: "used",
      resetTimerDisplayMode: "relative",
      nowMs: Date.parse("2026-11-01T12:00:00.000Z"),
    })
    return [metricId(id, sessionLabel), metric!]
  }),
)
const groups = buildProviderWidgetGroups({
  placedMetricIds,
  providerOrder: normalized.order,
  metricOrderByProvider: Object.fromEntries(normalized.order.map((id) => [id, [metricId(id, sessionLabel)]])),
  widgetDataById,
  getMeta: (id) => plugins.find((plugin) => plugin.id === id),
})

const evidence = {
  fixture: "Synthetic Session quota values; no account data or native settings are read",
  mode,
  savedOrder,
  normalizedOrder: normalized.order,
  renderedHeadings: groups.map((group) => group.name),
}
;(window as Window & { __FIXTURE__?: typeof evidence }).__FIXTURE__ = evidence

function App() {
  const label = mode === "before" ? "BEFORE · v1.6.1 normalizer" : "AFTER · patched normalizer"
  return (
    <main className="min-h-screen bg-background text-foreground p-6" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[440px]">
        <header className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Controlled fixture · browser render</span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{label}</span>
          </div>
          <h1 className="text-lg font-semibold">Saved provider order</h1>
          <p className="mt-1 text-sm text-muted-foreground">Synthetic Session quotas for Claude, Codex, and Antigravity CLI.</p>
          <p className="mt-2 text-xs text-muted-foreground">No native restart or user settings are involved.</p>
        </header>
        <WidgetGroupedList groups={groups} />
      </div>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
