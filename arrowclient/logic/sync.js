import Graph from "../../shared/graph.js"

export function getLocalStorageItem(key) {
  if (key === "tasks") {
    return loadGraphFromLocalStorage()
  }

  if (import.meta.env.VITE_LOCAL_STORAGE === "false") {
    return undefined
  }

  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  } catch (e) {
    console.warn(`Ошибка при чтении ключа "${key}" из localStorage:`, e)
    return undefined
  }
}

export function safeSetLocalStorageItem(key, value) {
  //   if (key === "tasks") {
  //     return saveGraphToLocalStorage(value)
  //   }

  if (import.meta.env.VITE_LOCAL_STORAGE === "false") {
    return false
  }

  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
    return true
  } catch (e) {
    console.warn(`Ошибка при записи ключа "${key}" в localStorage:`, e)
    return false
  }
}

let i = 0
export function saveGraphToLocalStorage(graphOrSnapshot) {
  console.log("saveGraphToLocalStorage", i++)
  if (import.meta.env.VITE_LOCAL_STORAGE === "false") {
    return false
  }
  try {
    const snapshot = graphOrSnapshot instanceof Graph ? graphOrSnapshot.toJSON() : graphOrSnapshot
    localStorage.setItem("tasks", JSON.stringify(snapshot))
    return true
  } catch (e) {
    console.warn("Ошибка при сохранении Graph в localStorage:", e)
    return false
  }
}

export function loadGraphFromLocalStorage() {
  // Всегда возвращаем Graph с подключённым onChange, даже если локальное хранилище отключено
  //   const attachOnChange = { onChange: saveGraphToLocalStorage }
  const attachOnChange = { onChange: () => {} }
  // return new Graph(attachOnChange)

  if (import.meta.env.VITE_LOCAL_STORAGE === "false") {
    return new Graph(attachOnChange)
  }

  try {
    const raw = localStorage.getItem("tasks")
    if (!raw) return new Graph(attachOnChange)

    const parsed = JSON.parse(raw)
    // Базовая проверка формы (не строгая, чтобы быть устойчивыми к старым форматам)
    const looksValid = parsed && typeof parsed === "object" && parsed.nodes && parsed.outgoingEdges
    if (!looksValid) {
      console.warn('В localStorage по ключу "tasks" нет корректных данных для Graph. Возвращаем пустой Graph.')
      return new Graph(attachOnChange)
    }

    return Graph.from(parsed, attachOnChange)
  } catch (e) {
    console.warn("Ошибка при восстановлении Graph из localStorage:", e)
    return new Graph(attachOnChange)
  }
}
