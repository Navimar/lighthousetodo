import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  const bulletSymbol = () => {
    let classes = ""
    // Значок по умолчанию — пустой SVG 16x16 (можно заменить, если нужно)
    let content = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"></svg>`
    let now = dayjs()

    if (task.pause) {
      // Пауза: два прямоугольника, заполняющие 16x16
      content = `<svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <rect x="1" y="0" width="5" height="16"/>
  <rect x="10" y="0" width="5" height="16"/>
</svg>`
    } else if (task.ready) {
      // Галочка: чек-марк, вписывается в 16x16
      content = `<svg class="w-2.5" "width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path d="M2 8 L6 12 L14 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
      classes += " text-green-500"
    } else if (task.cycle) {
      // Цикл: круговая стрелка, построенная в пределах 16x16
      content = `<svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
      <path d="M0,0 L4,2 L0,4 Z" fill="currentColor"/>
    </marker>
  </defs>
  <path d="M13.196 11 A6 6 0 1 1 14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrowhead)"/>
</svg>`
      classes += " text-blue-500"
    } else if (taskDate.isAfter(now)) {
      // Песочные часы (задачи в будущем): два треугольника, объединённые в центре
      content = `<svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <path d="M0 0 L16 0 L8 9 Z"/>
  <path d="M0 16 L16 16 L8 7 Z"/>
</svg>`
      classes += " text-yellow-500"
    } else if (task.blocked) {
      // Заблокировано: сплошной квадрат 16x16
      content = `<svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <rect x="1" y="1" width="14" height="14"/>
</svg>`
      classes += " text-gray-500"
    } else if (taskDate.isBefore(now, "day")) {
      // Задачи в прошлом: левый треугольник, вписывающийся в 16x16
      content = `<svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <path d="M16 0 L0 8 L16 16 Z"/>
</svg>`
      classes += " text-accent"
    }

    return `<span class='${classes}'>${content}</span>`
  }

  return html`<div
    class="h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm gap-2 empty:hidden ${additionalClass}"
    >${bulletSymbol()}</div
  >`
}
