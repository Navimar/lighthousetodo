export default {
  threshold: 10,
  minLogTime: 5, // Минимальное время для логирования в мс
  times: {},
  activeTimers: new Set(),
  debugEnabled: true, // Поле для включения/выключения дебага

  getLabel(funcOrString) {
    if (typeof funcOrString === "function") {
      return funcOrString.name || "Anonymous Function"
    }
    return funcOrString
  },

  start(funcOrString) {
    if (!this.debugEnabled) return // Если дебаг выключен, ничего не делаем

    const label = this.getLabel(funcOrString)
    if (this.activeTimers.has(label)) {
      console.warn(`[Warning] Timer "${label}" already exists`)
      return
    }
    this.activeTimers.add(label)
    if (!this.times[label]) {
      this.times[label] = []
    }
    this.times[label].push(performance.now()) // Сохраняем время начала
  },

  end(funcOrString) {
    if (!this.debugEnabled) return // Если дебаг выключен, ничего не делаем

    const label = this.getLabel(funcOrString)
    if (!this.activeTimers.has(label)) {
      console.warn(`[Warning] Timer "${label}" does not exist`)
      return
    }

    const endTime = performance.now()
    const startTime = this.times[label].pop()
    const duration = endTime - startTime

    this.activeTimers.delete(label)

    // Проверка на минимальное время для логирования
    if (duration >= this.minLogTime) {
      console.debug(`[Debug] ${label}: ${duration.toFixed(3)}ms`)
    }

    if (this.times[label].length > 0) {
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
