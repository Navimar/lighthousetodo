import { html } from "@arrow-js/core"
import css from "~/css.js"
import { showSaveButtonHidePause } from "~/logic/manipulate.js"

let checkedType = (task, type) => {
  if (task.type == type) return "checked"
  else return ""
}
let checkedConsequence = (task, type) => {
  if (task.consequence == type) return "checked"
  else return ""
}

export default (task) => html`
  <div class="grid grid-cols-4 gap-3 w-full">
    <!-- Радиокнопки для выбора срока -->
    <div>
      <input
        type="radio"
        id="longTerm"
        name="timePeriod"
        value="longTerm"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedType(task, "longTerm")} />
      <label for="longTerm" class="${css.radio}"> Окно </label>
    </div>

    <div>
      <input
        type="radio"
        id="shortTerm"
        name="timePeriod"
        value="shortTerm"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedType(task, "shortTerm")} />
      <label for="shortTerm" class="${css.radio}"> На днях </label>
    </div>

    <div>
      <input
        type="radio"
        id="onDay"
        name="timePeriod"
        value="onDay"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedType(task, "onDay")} />
      <label for="onDay" class="${css.radio}"> Срочно </label>
    </div>

    <div>
      <input
        type="radio"
        id="onTime"
        name="timePeriod"
        value="onTime"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedType(task, "onTime")} />
      <label for="onTime" class="${css.radio}"> Ко времени </label>
    </div>

    <!-- Радиокнопки для выбора длительности последствий -->
    <div>
      <input
        type="radio"
        id="daysDuration"
        name="consequenceDuration"
        value="daysDuration"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "daysDuration")} />
      <label for="daysDuration" class="${css.radio}"> Обычно </label>
    </div>

    <div>
      <input
        type="radio"
        id="weeksDuration"
        name="consequenceDuration"
        value="weeksDuration"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "weeksDuration")} />
      <label for="weeksDuration" class="${css.radio}"> Заметно </label>
    </div>

    <div>
      <input
        type="radio"
        id="monthsDuration"
        name="consequenceDuration"
        value="monthsDuration"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "monthsDuration")} />
      <label for="monthsDuration" class="${css.radio}"> Важно </label>
    </div>

    <div>
      <input
        type="radio"
        id="yearsDuration"
        name="consequenceDuration"
        value="yearsDuration"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "yearsDuration")} />
      <label for="yearsDuration" class="${css.radio}"> Критично </label>
    </div>
  </div>
`

let handleRadioChange = () => {
  showSaveButtonHidePause()
}
