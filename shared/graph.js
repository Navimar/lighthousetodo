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
      if (!this.nodes.has(id)) this.addNode(id)
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

    // increment per edge type according to the agreed table
    // leads: +0 if (ready || pause || isFuture), else +1
    // blocks: +0 if (ready), else +1
    const incFor = (parent, edgeKind) => {
      if (parent?.ready) return 0
      if (edgeKind === "leads") {
        if (parent?.pause) return 0
        if (isFuture(parent)) return 0
        return 1
      }
      // edgeKind === 'blocks'
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

    // Initialize depths to 0
    this.nodes.forEach((nodeData) => {
      nodeData.depth = 0
    })

    // Topological BFS
    const relax = (parentId, childId, kind) => {
      const parent = this.nodes.get(parentId)
      const child = this.nodes.get(childId)
      if (!child) return

      const inc = incFor(parent, kind)
      const newDepth = (parent?.depth ?? 0) + inc
      child.depth = Math.max(child.depth ?? 0, newDepth)

      inDegree.set(childId, (inDegree.get(childId) || 0) - 1)
      if (inDegree.get(childId) === 0) queue.push(childId)
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()
      const { leads, blocks } = this._edge(this.outgoingEdges, nodeId)

      leads.forEach((_, childId) => relax(nodeId, childId, "leads"))
      blocks.forEach((_, childId) => relax(nodeId, childId, "blocks"))
    }

    // Cycle detection (non-zero in-degree after processing)
    const hasCycle = Array.from(inDegree.values()).some((degree) => degree > 0)
    if (hasCycle) {
      throw new Error("Cycle detected in graph during depth calculation")
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

  _addSafeRelation(fromId, toId, type, ts = this._nowTs()) {
    this._ensureNodesExist(fromId, toId)

    // Remove existing direct relations
    this._removeExistingRelation(fromId, toId)

    // Temporarily add the new relation
    this._addRelation(fromId, toId, type, ts)

    // Check if a cycle is created
    if (this._createsCycle(fromId, toId)) {
      console.warn(`Cycle detected when adding ${fromId} → ${toId}, removing cycle-causing relations from ${toId}`)
      const { leads, blocks } = this.getRelations(toId)
      const toRemove = []
      leads.forEach((next) => {
        if (this._createsCycle(fromId, next)) toRemove.push({ target: next, type: "leads" })
      })
      blocks.forEach((next) => {
        if (this._createsCycle(fromId, next)) toRemove.push({ target: next, type: "blocks" })
      })
      toRemove.forEach(({ target }) => this.removeRelation(toId, target))
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
    console.log("merge", a, b)
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
          if (current == null || ts > current) out._addRelation(fromId, toId, "leads", ts)
        })
        blocks.forEach((ts, toId) => {
          const current = out._edge(out.outgoingEdges, fromId).blocks.get(toId)
          if (current == null || ts > current) out._addRelation(fromId, toId, "blocks", ts)
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
