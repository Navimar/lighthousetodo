export default {
  threshold: 1000,
  times: {},
  activeTimers: new Set(),

  getLabel(funcOrString) {
    if (typeof funcOrString === "function") {
      return funcOrString.name || "Anonymous Function"
    }
    return funcOrString
  },

  start(funcOrString) {
    const label = this.getLabel(funcOrString)
    if (this.activeTimers.has(label)) {
      console.warn(`[Warning] Timer "${label}" already exists`)
      return
    }
    this.activeTimers.add(label)
    if (!this.times[label]) {
      this.times[label] = []
    }
    console.time(label)
  },

  end(funcOrString) {
    const label = this.getLabel(funcOrString)
    if (!this.activeTimers.has(label)) {
      console.warn(`[Warning] Timer "${label}" does not exist`)
      return
    }
    console.timeEnd(label)
    this.activeTimers.delete(label)

    const timeEntry = performance.now()
    const startTime = this.times[label].slice(-1)[0] || timeEntry
    const duration = timeEntry - startTime

    this.times[label].push(duration)

    if (this.times[label].length > 1) {
      const initialDuration = this.times[label][0]
      if (duration - initialDuration > this.threshold) {
        console.warn(
          `[Performance Warning] Timer "${label}": Time increased by ${
            duration - initialDuration
          }ms compared to the initial measurement`,
        )
      }
    }
  },
}
