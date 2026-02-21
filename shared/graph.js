import dayjs from "dayjs"
class Graph {
  constructor({ onChange } = {}) {
    this.nodes = new Map() // id -> Node data
    this.outgoingEdges = new Map() // id -> {leads: Map(toId -> ts), blocks: Map(toId -> ts)}
    this.incomingEdges = new Map() // id -> {leads: Map(fromId -> ts), blocks: Map(fromId -> ts)}
    this._onChange = typeof onChange === "function" ? onChange : null
  }

  // Returns edge record for id, creating an empty one if missing and normalizing to Map-of-Map
  _edge(map, id) {
    let rec = map.get(id)
    if (!rec) {
      rec = { leads: new Map(), blocks: new Map() }
      map.set(id, rec)
      return rec
    }
    // normalize in case it came from raw JSON or old format
    const toMap = (v) => {
      if (v instanceof Map) return v
      if (Array.isArray(v)) {
        const m = new Map()
        v.forEach((toId) => m.set(toId, 0)) // legacy: unknown ts → 0
        return m
      }
      if (v && typeof v === "object") {
        const m = new Map()
        Object.entries(v).forEach(([k, ts]) => m.set(k, Number(ts) || 0))
        return m
      }
      return new Map()
    }
    rec.leads = toMap(rec.leads)
    rec.blocks = toMap(rec.blocks)
    return rec
  }

  _nowTs() {
    return Date.now()
  }

  addNode(id, data = {}) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data)
      this.outgoingEdges.set(id, { leads: new Map(), blocks: new Map() })
      this.incomingEdges.set(id, { leads: new Map(), blocks: new Map() })
      this._notifyChange()
    }
  }

  addLead(fromId, toId, ts = this._nowTs()) {
    this._addSafeRelation(fromId, toId, "leads", ts)
    this._notifyChange()
  }

  addBlock(fromId, toId, ts = this._nowTs()) {
    this._addSafeRelation(fromId, toId, "blocks", ts)
    this._notifyChange()
  }

  removeRelation(fromId, toId) {
    this._removeRelation(fromId, toId, "leads")
    this._removeRelation(fromId, toId, "blocks")
    this._notifyChange()
  }

  getRelations(nodeId) {
    this._ensureNodesExist(nodeId)
    const { leads, blocks } = this._edge(this.outgoingEdges, nodeId)
    return {
      leads: Array.from(leads.keys()),
      blocks: Array.from(blocks.keys()),
    }
  }

  /**
   * Возвращает id всех узлов, которые ссылаются на данный nodeId по blocks или leads (входящие связи)
   * @param {string} nodeId
   * @returns {{leads: string[], blocks: string[]}}
   */
  getIncomingRelations(nodeId) {
    this._ensureNodesExist(nodeId)
    const { leads, blocks } = this._edge(this.incomingEdges, nodeId)
    return {
      leads: Array.from(leads.keys()),
      blocks: Array.from(blocks.keys()),
    }
  }

  // -- Persistence helpers (no actual I/O here) --
  _notifyChange() {
    if (this._onChange) {
      try {
        this._onChange(this.toJSON())
      } catch (e) {
        console.warn("onChange handler threw", e)
      }
    }
  }

  toJSON() {
    // produce a plain-JSON snapshot suitable for saving
    const nodes = {}
    this.nodes.forEach((v, k) => {
      // shallow clone to avoid external mutation of internals
      nodes[k] = { ...v }
    })

    const outgoingEdges = {}
    this.outgoingEdges.forEach((v, k) => {
      const leadsObj = {}
      v.leads.forEach((ts, toId) => (leadsObj[toId] = ts))
      const blocksObj = {}
      v.blocks.forEach((ts, toId) => (blocksObj[toId] = ts))
      outgoingEdges[k] = { leads: leadsObj, blocks: blocksObj }
    })

    const incomingEdges = {}
    this.incomingEdges.forEach((v, k) => {
      const leadsObj = {}
      v.leads.forEach((ts, fromId) => (leadsObj[fromId] = ts))
      const blocksObj = {}
      v.blocks.forEach((ts, fromId) => (blocksObj[fromId] = ts))
      incomingEdges[k] = { leads: leadsObj, blocks: blocksObj }
    })

    return { nodes, outgoingEdges, incomingEdges }
  }

  static from(json, { onChange } = {}) {
    const g = new Graph({ onChange })
    if (!json) return g

    // restore nodes
    if (json.nodes) {
      Object.entries(json.nodes).forEach(([id, data]) => {
        g.nodes.set(id, { ...data })
      })
    }

    // helper to restore edge maps
    const restoreEdgeMap = (targetMap, src) => {
      if (!src) return
      Object.entries(src).forEach(([id, { leads = {}, blocks = {} }]) => {
        const leadsMap = new Map(Object.entries(leads).map(([k, ts]) => [k, Number(ts) || 0]))
        const blocksMap = new Map(Object.entries(blocks).map(([k, ts]) => [k, Number(ts) || 0]))
        targetMap.set(id, { leads: leadsMap, blocks: blocksMap })
      })
    }

    restoreEdgeMap(g.outgoingEdges, json.outgoingEdges)
    restoreEdgeMap(g.incomingEdges, json.incomingEdges)

    return g
  }

  _removeExistingRelation(fromId, toId) {
    // Remove any existing relation from fromId -> toId
    this._removeRelation(fromId, toId, "leads")
    this._removeRelation(fromId, toId, "blocks")
  }

  _ensureNodesExist(...ids) {
    ids.forEach((id) => {
      if (!this.nodes.has(id)) {
        throw new Error(`Node ${id} must exist before linking`)
      }
    })
  }

  _addRelation(fromId, toId, type, ts = this._nowTs()) {
    this._ensureNodesExist(fromId, toId)
    this._edge(this.outgoingEdges, fromId)[type].set(toId, ts)
    this._edge(this.incomingEdges, toId)[type].set(fromId, ts)
  }

  _removeRelation(fromId, toId, type) {
    this._ensureNodesExist(fromId, toId)
    this._edge(this.outgoingEdges, fromId)[type].delete(toId)
    this._edge(this.incomingEdges, toId)[type].delete(fromId)
  }

  deleteNode(id) {
    if (!this.nodes.has(id)) return

    // Remove the node itself
    this.nodes.delete(id)
    this.outgoingEdges.delete(id)
    this.incomingEdges.delete(id)

    // Remove all references to this node in other nodes' edges
    for (const [, edge] of this.outgoingEdges) {
      edge.leads.forEach((_, toId) => edge.leads.delete(id))
      edge.blocks.forEach((_, toId) => edge.blocks.delete(id))
    }
    for (const [, edge] of this.incomingEdges) {
      edge.leads.forEach((_, fromId) => edge.leads.delete(id))
      edge.blocks.forEach((_, fromId) => edge.blocks.delete(id))
    }
    this._notifyChange()
  }
  updateDepths() {
    // helper to determine if a parent node is in the future
    const isFuture = (node) => {
      if (!node?.date || !node?.time) return false
      const ts = Date.parse(`${node.date}T${node.time}`)
      return Number.isFinite(ts) && ts > Date.now()
    }

    const isBlockedByNotReady = (nodeId) => {
      const incoming = this.getIncomingRelations(nodeId)
      return incoming.blocks.some((fromId) => {
        const fromNode = this.nodes.get(fromId)
        return fromNode && !fromNode.ready
      })
    }

    // Increment rule (same for both edge types):
    // +0 if (ready || pause || isFuture || blocked by not ready), else +1
    const incFor = (parentId, edgeKind) => {
      const parent = this.nodes.get(parentId)
      // same behavior for 'leads' and 'blocks'
      if (parent?.ready) return 0
      if (parent?.pause) return 0
      if (isFuture(parent)) return 0
      if (isBlockedByNotReady(parentId)) return 0
      return 1
    }

    // Build in-degree for all nodes over both edge kinds
    const inDegree = new Map()
    this.nodes.forEach((_, nodeId) => inDegree.set(nodeId, 0))

    this.outgoingEdges.forEach(({ leads, blocks }) => {
      leads?.forEach((_, nodeId) => inDegree.set(nodeId, (inDegree.get(nodeId) || 0) + 1))
      blocks?.forEach((_, nodeId) => inDegree.set(nodeId, (inDegree.get(nodeId) || 0) + 1))
    })

    // Collect roots (nodes with zero in-degree)
    const queue = []
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId)
    })

    // Initialize depths to Infinity so Math.min picks the shortest path
    this.nodes.forEach((nodeData) => {
      nodeData.depth = Infinity
      nodeData.pureDepth = Infinity
    })

    // Root nodes (in-degree 0) start at depth 0
    queue.forEach((nodeId) => {
      const nodeData = this.nodes.get(nodeId)
      if (nodeData) {
        nodeData.depth = 0
        nodeData.pureDepth = 0
      }
    })

    // Topological BFS
    const relax = (parentId, childId, kind) => {
      const parent = this.nodes.get(parentId)
      const child = this.nodes.get(childId)
      if (!child) return

      const inc = incFor(parentId, kind)
      const parentDepth = this.nodes.get(parentId)?.depth ?? 0
      const parentPureDepth = this.nodes.get(parentId)?.pureDepth ?? 0
      child.depth = Math.min(child.depth, parentDepth + inc)
      child.pureDepth = Math.min(child.pureDepth, parentPureDepth + 1)

      inDegree.set(childId, (inDegree.get(childId) || 0) - 1)
      if (inDegree.get(childId) === 0) queue.push(childId)
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()
      // Skip orphan ids that are not actual nodes to avoid mutating the structure
      if (!this.nodes.has(nodeId)) continue
      const rec = this.outgoingEdges.get(nodeId) || { leads: new Map(), blocks: new Map() }
      const { leads, blocks } = rec

      leads.forEach((_, childId) => relax(nodeId, childId, "leads"))
      blocks.forEach((_, childId) => relax(nodeId, childId, "blocks"))
    }

    // Cycle detection (non-zero in-degree after processing)
    const hasCycle = Array.from(this.nodes.keys()).some((id) => (inDegree.get(id) || 0) > 0)
    if (hasCycle) {
      const cycle = this._findAnyCycle()
      console.warn("Cycle detected in graph during depth calculation" + (cycle ? `: ${cycle.join(" → ")}` : ""))
      if (cycle) {
        const removed = this._autoBreakCycle(cycle, "oldest")
        if (removed) {
          // После разрыва одного ребра пересчитаем глубины повторно
          return this.updateDepths()
        }
      }
    }
    this._notifyChange()
  }

  _createsCycle(fromId, toId) {
    const stack = [toId]
    const visited = new Set()

    while (stack.length) {
      const current = stack.pop()
      if (current === fromId) {
        return true // Found a path back to fromId, cycle detected
      }
      if (!visited.has(current)) {
        visited.add(current)
        const { leads, blocks } = this.outgoingEdges.get(current)
        leads.forEach((_, next) => stack.push(next))
        blocks.forEach((_, next) => stack.push(next))
      }
    }

    return false
  }

  _findCycle(fromId, toId) {
    const visited = new Set()
    const stack = []
    const dfs = (nodeId) => {
      if (nodeId === fromId) {
        stack.push(nodeId)
        return true
      }
      if (visited.has(nodeId)) return false
      visited.add(nodeId)
      stack.push(nodeId)
      const { leads, blocks } = this.outgoingEdges.get(nodeId) || { leads: new Map(), blocks: new Map() }
      for (const next of [...leads.keys(), ...blocks.keys()]) {
        if (dfs(next)) return true
      }
      stack.pop()
      return false
    }
    if (dfs(toId)) {
      return [...stack, fromId]
    }
    return null
  }

  _findAnyCycle() {
    const visited = new Set()
    const inStack = new Set()
    const parent = new Map()
    const nodes = Array.from(this.nodes.keys())

    const neighbors = (id) => {
      const rec = this.outgoingEdges.get(id) || { leads: new Map(), blocks: new Map() }
      return [...rec.leads.keys(), ...rec.blocks.keys()]
    }

    let backEdgeFrom = null
    let backEdgeTo = null

    const dfs = (u) => {
      visited.add(u)
      inStack.add(u)
      for (const v of neighbors(u)) {
        if (!visited.has(v)) {
          parent.set(v, u)
          if (dfs(v)) return true
        } else if (inStack.has(v)) {
          backEdgeFrom = u
          backEdgeTo = v
          return true
        }
      }
      inStack.delete(u)
      return false
    }

    for (const n of nodes) {
      if (!visited.has(n) && dfs(n)) break
    }

    if (backEdgeFrom != null && backEdgeTo != null) {
      // Reconstruct cycle path from backEdgeTo -> ... -> backEdgeFrom -> backEdgeTo
      const forward = []
      let cur = backEdgeFrom
      while (cur !== backEdgeTo && cur != null) {
        forward.push(cur)
        cur = parent.get(cur)
      }
      forward.reverse()
      return [backEdgeTo, ...forward, backEdgeTo]
    }
    return null
  }

  /**
   * Возвращает timestamp ребра (leads или blocks) между fromId -> toId.
   * Если рёбра нет, возвращает +Infinity, чтобы такой кандидат не выбирался
   * при стратегии выбора «самого старого».
   */
  _getEdgeTimestamp(fromId, toId) {
    const rec = this.outgoingEdges.get(fromId) || { leads: new Map(), blocks: new Map() }
    const ts = rec.leads.get(toId)
    if (ts != null) return Number(ts) || 0
    const ts2 = rec.blocks.get(toId)
    if (ts2 != null) return Number(ts2) || 0
    return Infinity
  }

  /**
   * Автоматически разрывает цикл, удаляя одно ребро по стратегии.
   * @param {string[]} cycle - узлы цикла в виде [A, B, C, A]
   * @param {('oldest'|'newest')} strategy - какое ребро убирать (по времени)
   * @returns {{from:string,to:string,ts:number}|null}
   */
  _autoBreakCycle(cycle, strategy = "oldest") {
    if (!Array.isArray(cycle) || cycle.length < 2) return null
    let pick = null
    for (let i = 0; i < cycle.length - 1; i++) {
      const a = cycle[i]
      const b = cycle[i + 1]
      const ts = this._getEdgeTimestamp(a, b)
      if (!Number.isFinite(ts)) continue
      if (!pick) {
        pick = { from: a, to: b, ts }
      } else if (strategy === "oldest" ? ts < pick.ts : ts > pick.ts) {
        pick = { from: a, to: b, ts }
      }
    }
    if (pick) {
      // removeRelation снимает и leads, и blocks
      this.removeRelation(pick.from, pick.to)
      return pick
    }
    return null
  }

  _addSafeRelation(fromId, toId, type, ts = this._nowTs()) {
    this._ensureNodesExist(fromId, toId)

    // Remove existing direct relations
    this._removeExistingRelation(fromId, toId)

    // Temporarily add the new relation
    this._addRelation(fromId, toId, type, ts)

    // Check if a cycle is created
    if (this._createsCycle(fromId, toId)) {
      console.warn(`Cycle detected when adding ${fromId} → ${toId}`)
      const cycle = this._findCycle(fromId, toId)
      if (cycle) {
        // цикл вида [A, B, C, A]
        // выбираем старое ребро (например, с минимальным timestamp)
        let edgeToRemove = null
        let minTs = Infinity
        for (let i = 0; i < cycle.length - 1; i++) {
          const a = cycle[i],
            b = cycle[i + 1]
          if (a === fromId && b === toId) continue
          const outEdge = this._edge(this.outgoingEdges, a)
          const ts = outEdge.leads.get(b) ?? outEdge.blocks.get(b)
          if (ts < minTs) {
            minTs = ts
            edgeToRemove = { from: a, to: b }
          }
        }
        if (edgeToRemove) {
          this.removeRelation(edgeToRemove.from, edgeToRemove.to)
        }
      }
    }
  }

  /**
   * Обновляет статус blocked для всех узлов: если у узла есть хотя бы одна входящая блокирующая связь (blocks)
   * от задачи, которая не готова (ready === false), то node.blocked = true, иначе false.
   */
  updateBlockedStatuses() {
    this.nodes.forEach((node, nodeId) => {
      const incoming = this.getIncomingRelations(nodeId)
      const hasBlocking = incoming.blocks.some((fromId) => {
        const fromNode = this.nodes.get(fromId)
        return fromNode && !fromNode.ready
      })
      node.blocked = hasBlocking
      // Приоритет для сортировки: количество всех входящих BLOCKS (без учета ready).
      node.blockScore = incoming.blocks.length
    })
    this._notifyChange()
  }

  /**
   * Снимает паузы с задач, у которых пауза истекла по формуле:
   * diffNowMinutes > (5 + task.pauseTimes * 5) * task.pauseTimes
   * Возвращает массив id изменённых задач. Вызывает _notifyChange(), если были изменения.
   */
  resumePausedTasks() {
    this.nodes.forEach((task) => {
      if (!task) return
      if (task.pause) {
        const pauseTimes = Number(task.pauseTimes) || 0
        // Если pause невалидна как дата — пропускаем
        const pausedAt = dayjs(task.pause)
        if (!pausedAt.isValid()) return
        if (dayjs().diff(pausedAt, "minute") > (5 + pauseTimes * 5) * pauseTimes) {
          task.pause = false
        }
      }
    })
  }

  static merge(a, b, { onChange } = {}) {
    const toGraph = (x) => (x instanceof Graph ? x : Graph.from(x))
    const g1 = toGraph(a)
    const g2 = toGraph(b)
    const out = new Graph({ onChange })

    const toTs = (v) => {
      if (v == null) return -Infinity
      if (typeof v === "number" && Number.isFinite(v)) return v
      if (typeof v === "string") {
        const n = Number(v)
        if (Number.isFinite(n)) return n
        const t = Date.parse(v)
        return Number.isFinite(t) ? t : -Infinity
      }
      return -Infinity
    }

    const isSecondNewer = (d1, d2) => {
      const t1 = toTs(d1 && d1.timestamp)
      const t2 = toTs(d2 && d2.timestamp)
      if (t1 === t2) return true
      return t2 > t1
    }

    const pickNewerNode = (d1, d2) => {
      if (!d1) return d2 || {}
      if (!d2) return d1 || {}
      return isSecondNewer(d1, d2) ? { ...d1, ...d2 } : { ...d2, ...d1 }
    }

    // 1) Nodes: prefer newer node payload per id
    const ids = new Set([...g1.nodes.keys(), ...g2.nodes.keys()])
    ids.forEach((id) => {
      const d1 = g1.nodes.get(id)
      const d2 = g2.nodes.get(id)
      out.addNode(id, pickNewerNode(d1, d2))
    })

    // 2) Edges: resolve per (fromId → toId, type) by edge timestamp
    const takeEdges = (g) => {
      g.outgoingEdges.forEach(({ leads, blocks }, fromId) => {
        leads.forEach((ts, toId) => {
          const current = out._edge(out.outgoingEdges, fromId).leads.get(toId)
          if (current == null || ts > current) out._addSafeRelation(fromId, toId, "leads", ts)
        })
        blocks.forEach((ts, toId) => {
          const current = out._edge(out.outgoingEdges, fromId).blocks.get(toId)
          if (current == null || ts > current) out._addSafeRelation(fromId, toId, "blocks", ts)
        })
      })
    }
    takeEdges(g1)
    takeEdges(g2)

    console.log("merge result", out)
    return out
  }
}

export default Graph
