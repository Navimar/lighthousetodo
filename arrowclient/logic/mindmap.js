import { watch } from "~/arrow-js/index.js"
import cytoscape from "cytoscape"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import dayjs from "dayjs"

let cy = null
let pendingContainerObserver = null
let cleanupWheelHandler = null
let cleanupPointerHandler = null
let lastMindmapRows = []
let labelsOverlay = null
let labelsOverlayLines = []

const COLUMN_GAP = 240
const ROW_GAP = 120

function isFutureTask(task, now) {
  const datetime = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
  return datetime.isAfter(now)
}

function sortWithinRow(tasks, now) {
  tasks.sort((a, b) => {
    if (!a.ready && b.ready) return -1
    if (a.ready && !b.ready) return 1

    if (!a.blocked && b.blocked) return -1
    if (a.blocked && !b.blocked) return 1

    if (!a.pause && b.pause) return -1
    if (a.pause && !b.pause) return 1

    const futureDiff = Number(isFutureTask(a, now)) - Number(isFutureTask(b, now))
    if (futureDiff !== 0) return futureDiff

    return (b.timestamp || 0) - (a.timestamp || 0)
  })
}

function getTaskStatusKind(task, now) {
  const taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  if (task.pause) return { kind: "pause", color: "#111827" }
  if (task.ready) return { kind: "ready", color: "#22c55e" }
  if (taskDate.isAfter(now, "day")) return { kind: "futureDay", color: "#2563eb" }
  if (taskDate.isAfter(now)) return { kind: "futureToday", color: "#eab308" }
  if (task.blocked) return { kind: "blocked", color: "#6b7280" }
  if ((task.depth || 0) > 0) return { kind: "depth", color: "#3f5f4a" }
  if (taskDate.isBefore(now, "day")) return { kind: "past", color: "#c26a1b" }

  return { kind: "", color: "" }
}

function getTaskVisualFlags(task, now) {
  const { kind } = getTaskStatusKind(task, now)
  return {
    isBlocked: kind === "blocked" ? 1 : 0,
    isFuture: kind === "futureDay" || kind === "futureToday" ? 1 : 0,
  }
}

function encodeSvg(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function getTaskStatusIcon(task, now) {
  const { kind, color } = getTaskStatusKind(task, now)
  if (!kind) return ""

  if (kind === "pause") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="${color}"><rect x="1" y="0" width="5" height="16"/><rect x="10" y="0" width="5" height="16"/></svg>`,
    )
  }

  if (kind === "ready") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M2 8 L6 12 L14 2" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    )
  }

  if (kind === "futureDay") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="${color}"><path d="M0 0 L16 8 L0 16 Z"/></svg>`,
    )
  }

  if (kind === "futureToday") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="${color}"><path d="M0 0 L16 0 L8 9 Z"/><path d="M0 16 L16 16 L8 7 Z"/></svg>`,
    )
  }

  if (kind === "blocked") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="${color}"><rect x="1" y="1" width="14" height="14"/></svg>`,
    )
  }

  if (kind === "depth") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="${color}"><circle cx="8" cy="8" r="8"/></svg>`,
    )
  }

  if (kind === "past") {
    return encodeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="${color}"><path d="M16 0 L0 8 L16 16 Z"/></svg>`,
    )
  }

  return null
}

function isMapRoute() {
  return reData.route[0] === "map"
}

function stopPendingContainerObserver() {
  if (!pendingContainerObserver) return
  pendingContainerObserver.disconnect()
  pendingContainerObserver = null
}

function waitForContainer(onReady) {
  stopPendingContainerObserver()
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return

  pendingContainerObserver = new MutationObserver(() => {
    const container = document.getElementById("mindmap-canvas")
    if (!container || !isMapRoute()) return
    stopPendingContainerObserver()
    onReady(container)
  })

  pendingContainerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

function buildElements() {
  data.tasks.updateDepths()
  data.tasks.updateBlockedStatuses()
  data.tasks.resumePausedTasks()
  data.tasks.updateConstrainedDepths()

  const tasks = Array.from(data.tasks.nodes.entries())
    .map(([id, task]) => {
      if (!task?.name) return null
      if (task.id !== id) task.id = id
      return task
    })
    .filter(Boolean)

  const now = dayjs()
  const positions = buildTreePositions(tasks)

  const elements = []

  tasks.forEach((task) => {
    const position = positions.get(task.id) || { x: 0, y: 0 }
    const statusIcon = getTaskStatusIcon(task, now)
    const visualFlags = getTaskVisualFlags(task, now)
    elements.push({
      group: "nodes",
      data: {
        id: task.id,
        label: task.name,
        note: task.note || "",
        ready: task.ready ? 1 : 0,
        paused: task.pause ? 1 : 0,
        depth: task.depth || 0,
        hasStatusIcon: statusIcon ? 1 : 0,
        statusIcon: statusIcon || undefined,
        isBlocked: visualFlags.isBlocked,
        isFuture: visualFlags.isFuture,
      },
      position,
    })
  })

  data.tasks.outgoingEdges.forEach(({ leads, blocks }, fromId) => {
    leads.forEach((ts, toId) => {
      if (!data.tasks.nodes.has(fromId) || !data.tasks.nodes.has(toId)) return
      const fromTask = data.tasks.nodes.get(fromId)
      elements.push({
        group: "edges",
        data: {
          id: `lead:${fromId}:${toId}`,
          source: fromId,
          target: toId,
          kind: "leads",
          ts,
          sourceReady: fromTask?.ready ? 1 : 0,
        },
      })
    })

    blocks.forEach((ts, toId) => {
      if (!data.tasks.nodes.has(fromId) || !data.tasks.nodes.has(toId)) return
      const fromTask = data.tasks.nodes.get(fromId)
      elements.push({
        group: "edges",
        data: {
          id: `block:${fromId}:${toId}`,
          source: fromId,
          target: toId,
          kind: "blocks",
          ts,
          sourceReady: fromTask?.ready ? 1 : 0,
        },
      })
    })
  })

  return elements
}

function buildTreePositions(tasks) {
  const positions = new Map()
  const tasksByDepth = new Map()

  tasks.forEach((task) => {
    const depth = Math.max(0, task.depth || 0)
    if (!tasksByDepth.has(depth)) {
      tasksByDepth.set(depth, [])
    }
    tasksByDepth.get(depth).push(task)
  })

  const sortedDepths = [...tasksByDepth.keys()].sort((a, b) => a - b)
  let currentY = 0
  const rows = []
  const now = dayjs()

  sortedDepths.forEach((depth) => {
    const depthTasks = tasksByDepth.get(depth) || []
    const tasksByConstrainedDepth = new Map()

    depthTasks.forEach((task) => {
      const constrainedDepth = Math.max(0, task.constrainedDepth || 0)
      if (!tasksByConstrainedDepth.has(constrainedDepth)) {
        tasksByConstrainedDepth.set(constrainedDepth, [])
      }
      tasksByConstrainedDepth.get(constrainedDepth).push(task)
    })

    const sortedConstrainedDepths = [...tasksByConstrainedDepth.keys()].sort((a, b) => a - b)

    sortedConstrainedDepths.forEach((constrainedDepth, rowIndex) => {
      const rowTasks = tasksByConstrainedDepth.get(constrainedDepth) || []
      sortWithinRow(rowTasks, now)
      rows.push({
        depth,
        constrainedDepth,
        y: currentY + rowIndex * ROW_GAP,
        tasks: rowTasks,
      })
    })

    currentY += Math.max(1, sortedConstrainedDepths.length) * ROW_GAP
  })

  const maxColumns = rows.reduce((max, row) => Math.max(max, row.tasks.length), 0)

  rows.forEach((row) => {
    const rowWidth = row.tasks.length
    const offset = ((maxColumns - rowWidth) * COLUMN_GAP) / 2
    row.tasks.forEach((task, columnIndex) => {
      positions.set(task.id, {
        x: offset + columnIndex * COLUMN_GAP,
        y: row.y,
      })
    })
  })

  lastMindmapRows = rows.map((row) => ({
    depth: row.depth,
    constrainedDepth: row.constrainedDepth,
    y: row.y,
    count: row.tasks.length,
  }))

  return positions
}

export function getMindmapRows() {
  return lastMindmapRows
}

function destroyLabelsOverlay() {
  if (!labelsOverlay) return
  labelsOverlay.remove()
  labelsOverlay = null
  labelsOverlayLines = []
}

function renderLabelsOverlay(container) {
  if (!container || typeof document === "undefined" || !cy) return

  const parent = container.parentElement
  if (!parent) return

  if (!labelsOverlay) {
    const overlay = document.createElement("div")
    overlay.className = "pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
    parent.appendChild(overlay)
    labelsOverlay = overlay
  }

  labelsOverlay.replaceChildren()
  labelsOverlayLines = lastMindmapRows.map((row) => {
    const line = document.createElement("div")
    line.className = "absolute inset-x-0 border-t border-dashed border-neutral-300/70 text-[11px] text-neutral-500"

    const label = document.createElement("span")
    label.className = "ml-3 inline-block rounded bg-white/90 px-2 py-0.5 dark:bg-black/90"
    label.textContent = `depth ${row.depth} / constrainedDepth ${row.constrainedDepth}`

    line.appendChild(label)
    labelsOverlay.appendChild(line)
    return { row, line, label }
  })

  updateLabelsOverlay()
}

function updateLabelsOverlay() {
  if (!cy || !labelsOverlay) return

  const zoom = cy.zoom()
  const pan = cy.pan()

  labelsOverlayLines.forEach(({ row, line, label }) => {
    const renderedY = row.y * zoom + pan.y + 30 * zoom
    line.style.top = `${renderedY}px`
    label.style.transform = "translateY(-50%)"
  })
}

function applyFocusState() {
  if (!cy) return

  cy.elements().removeClass("dimmed focused focus-edge")

  const selectedId = reData.mapSelectedNodeId
  if (!selectedId) return

  const selected = cy.getElementById(selectedId)
  if (!selected.length) return

  cy.elements().addClass("dimmed")

  const ancestors =
    reData.mapAncestorFocusMode === "single" ? selected.incomers() : selected.predecessors()
  const immediateDescendants = selected.outgoers()
  const focusSet = selected.union(ancestors).union(immediateDescendants)

  focusSet.removeClass("dimmed")
  focusSet.nodes().addClass("focused")
  focusSet.edges().addClass("focus-edge")
}

function detachWheelHandler() {
  if (!cleanupWheelHandler) return
  cleanupWheelHandler()
  cleanupWheelHandler = null
}

function detachPointerHandler() {
  if (!cleanupPointerHandler) return
  cleanupPointerHandler()
  cleanupPointerHandler = null
}

function attachWheelPan(container) {
  detachWheelHandler()
  if (!container || !cy) return

  const onWheel = (event) => {
    if (!cy) return

    event.preventDefault()
    cy.panBy({
      x: -event.deltaX,
      y: -event.deltaY,
    })
  }

  container.addEventListener("wheel", onWheel, { passive: false })
  cleanupWheelHandler = () => {
    container.removeEventListener("wheel", onWheel)
  }
}

function attachPointerZoom(container) {
  detachPointerHandler()
  if (!container || !cy) return

  let rightMouseZoom = null

  const onContextMenu = (event) => {
    event.preventDefault()
  }

  const onMouseDown = (event) => {
    if (event.button !== 2 || !cy) return

    event.preventDefault()
    rightMouseZoom = {
      startY: event.clientY,
      startZoom: cy.zoom(),
    }
  }

  const onMouseMove = (event) => {
    if (!cy || !rightMouseZoom) return

    event.preventDefault()
    const deltaY = rightMouseZoom.startY - event.clientY
    const nextZoom = Math.max(
      cy.minZoom(),
      Math.min(cy.maxZoom(), rightMouseZoom.startZoom * Math.exp(deltaY * 0.01)),
    )

    cy.zoom({
      level: nextZoom,
      renderedPosition: {
        x: cy.width() / 2,
        y: cy.height() / 2,
      },
    })
  }

  const onMouseUp = (event) => {
    if (event.button !== 2) return
    rightMouseZoom = null
  }

  const onMouseLeave = () => {
    rightMouseZoom = null
  }

  container.addEventListener("contextmenu", onContextMenu)
  container.addEventListener("mousedown", onMouseDown)
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
  container.addEventListener("mouseleave", onMouseLeave)

  cleanupPointerHandler = () => {
    container.removeEventListener("contextmenu", onContextMenu)
    container.removeEventListener("mousedown", onMouseDown)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", onMouseUp)
    container.removeEventListener("mouseleave", onMouseLeave)
  }
}

function createMindmap(container) {
  destroyMindmap()

  cy = cytoscape({
    container,
    elements: buildElements(),
    minZoom: 0.1,
    maxZoom: 3,
    userZoomingEnabled: false,
    boxSelectionEnabled: false,
    autoungrabify: true,
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-wrap": "wrap",
          "text-max-width": 138,
          "font-size": 12,
          color: "#111827",
          "text-valign": "center",
          "text-halign": "center",
          "background-color": "#ede5d6",
          "border-width": 2,
          "border-color": "#cfbea0",
          shape: "round-rectangle",
          width: 152,
          height: 60,
          padding: 8,
        },
      },
      {
        selector: "node[hasStatusIcon = 0]",
        style: {
          "background-color": "#fff",
        },
      },
      {
        selector: "node[hasStatusIcon = 1]",
        style: {
          "background-image": "data(statusIcon)",
          "background-image-containment": "over",
          "background-width": 16,
          "background-height": 16,
          "background-position-x": "100%",
          "background-position-y": "0%",
          "background-offset-x": -10,
          "background-offset-y": 10,
          "background-repeat": "no-repeat",
        },
      },
      {
        selector: "node[ready = 1]",
        style: {
          "background-color": "#d9f4df",
          "border-color": "#5b9a67",
        },
      },
      {
        selector: "node[paused = 1]",
        style: {
          "background-color": "#efe7fb",
          "border-color": "#8b72b7",
        },
      },
      {
        selector: "node[isBlocked = 1]",
        style: {
          "background-color": "#d8dbe0",
          "border-color": "#9da4ae",
          color: "#4c5561",
        },
      },
      {
        selector: "node[isFuture = 1]",
        style: {
          "background-color": "#e6f0f8",
          "border-color": "#b5cadb",
          color: "#40515f",
        },
      },
      {
        selector: "node:selected",
        style: {
          "border-color": "#c26a1b",
          "border-width": 4,
        },
      },
      {
        selector: "node.dimmed",
        style: {
          opacity: 0.24,
        },
      },
      {
        selector: "edge.dimmed",
        style: {
          opacity: 0.14,
        },
      },
      {
        selector: "node.focused",
        style: {
          "z-index-compare": "manual",
          "z-index": 20,
        },
      },
      {
        selector: "edge.focus-edge",
        style: {
          "z-index-compare": "manual",
          "z-index": 10,
          opacity: 1,
          width: 4,
        },
      },
      {
        selector: 'edge[kind = "leads"]',
        style: {
          width: 3,
          "line-color": "#4c78a8",
          "source-endpoint": "outside-to-node",
          "target-endpoint": "outside-to-node",
          "target-arrow-color": "#4c78a8",
          "target-arrow-shape": "triangle",
          "arrow-scale": 1.3,
          "curve-style": "straight",
        },
      },
      {
        selector: 'edge[kind = "blocks"]',
        style: {
          width: 3,
          "line-color": "#b74d4d",
          "source-endpoint": "outside-to-node",
          "target-endpoint": "outside-to-node",
          "target-arrow-color": "#b74d4d",
          "target-arrow-shape": "triangle",
          "arrow-scale": 1.3,
          "curve-style": "straight",
        },
      },
      {
        selector: "edge[sourceReady = 1]",
        style: {
          "line-style": "dashed",
        },
      },
    ],
    layout: {
      name: "preset",
      fit: true,
      padding: 100,
    },
  })

  cy.on("tap", "node", (event) => {
    const nodeId = event.target.id()
    reData.mapSelectedNodeId = nodeId
    reData.selectedScribe = nodeId
    applyFocusState()
  })

  cy.on("tap", (event) => {
    if (event.target === cy) {
      reData.mapSelectedNodeId = ""
      reData.selectedScribe = false
      cy.elements().unselect()
      applyFocusState()
    }
  })

  const selectedId = reData.selectedScribe || reData.mapSelectedNodeId
  if (selectedId) {
    const selected = cy.getElementById(selectedId)
    if (selected.length) selected.select()
  }
  applyFocusState()
  cy.on("pan zoom resize", updateLabelsOverlay)
  attachWheelPan(container)
  attachPointerZoom(container)
  renderLabelsOverlay(container)
}

export function destroyMindmap() {
  stopPendingContainerObserver()
  detachWheelHandler()
  detachPointerHandler()
  destroyLabelsOverlay()
  if (!cy) return
  cy.destroy()
  cy = null
}

export function refreshMindmap({ relayout = true } = {}) {
  if (!cy) return

  const selectedId = reData.mapSelectedNodeId
  cy.elements().remove()
  cy.add(buildElements())

  if (selectedId) {
    const selected = cy.getElementById(selectedId)
    if (selected.length) {
      selected.select()
    } else {
      reData.mapSelectedNodeId = ""
    }
  }

  applyFocusState()
  renderLabelsOverlay(cy.container())

  if (relayout) {
    relayoutMindmap()
  }
}

export function relayoutMindmap() {
  if (!cy) return
  const elements = buildElements()
  const positions = new Map(elements.filter((el) => el.group === "nodes").map((el) => [el.data.id, el.position]))
  cy.layout({
    name: "preset",
    fit: true,
    padding: 100,
    positions: (node) => positions.get(node.id()) || node.position(),
  }).run()
  renderLabelsOverlay(cy.container())
}

export function fitMindmap() {
  if (!cy) return
  cy.fit(undefined, 50)
}

export function zoomMindmap(multiplier) {
  if (!cy) return
  const currentZoom = cy.zoom()
  const nextZoom = Math.max(cy.minZoom(), Math.min(cy.maxZoom(), currentZoom * multiplier))
  cy.zoom({
    level: nextZoom,
    renderedPosition: {
      x: cy.width() / 2,
      y: cy.height() / 2,
    },
  })
}

export default function initMindmap() {
  watch(() => {
    reData.route[0]

    if (!isMapRoute()) {
      destroyMindmap()
      return
    }

    const container = document.getElementById("mindmap-canvas")
    if (container) {
      createMindmap(container)
      return
    }

    waitForContainer((readyContainer) => {
      if (!isMapRoute()) return
      createMindmap(readyContainer)
    })
  })

  watch(() => {
    if (!isMapRoute() || !cy) return

    const selectedId = reData.selectedScribe || ""
    reData.mapSelectedNodeId = selectedId

    cy.elements().unselect()
    if (selectedId) {
      const selected = cy.getElementById(selectedId)
      if (selected.length) {
        selected.select()
      }
    }
    applyFocusState()
  })

  watch(() => {
    if (!isMapRoute() || !cy) return
    reData.mapAncestorFocusMode
    applyFocusState()
  })
}
