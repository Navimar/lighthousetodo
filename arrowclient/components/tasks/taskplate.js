import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  const bulletSymbol = () => {
  let classes = "text-base";
  let content = "&nbsp;";
  let now = dayjs();

  if (task.pause) {
    content = "II"; // Пауза как приоритетный символ
  } else if (task.ready) {
    content = "✓";
    classes += " text-accent";
  } else {
    // Проверяем, находится ли задача в будущем
    if (taskDate.isAfter(now)) {
      content = "⧗"; // Песочные часы для задач в будущем
      classes += " text-yellow-500";
    }
  }
  
  return `<span class='${classes}'>${content}</span>`;
};


  return html`<div
    class="h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm gap-2 empty:hidden ${additionalClass}"
    >${bulletSymbol()}</div
  >`
}