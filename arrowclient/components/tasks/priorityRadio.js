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
let checkedEnthusiasm = (task, type) => {
  if (task.enthusiasm == type) return "checked"
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
        name="importance"
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
        name="importance"
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
        name="importance"
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
        name="importance"
        value="yearsDuration"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "yearsDuration")} />
      <label for="yearsDuration" class="${css.radio}"> Критично </label>
    </div>

    <!-- Радиокнопки для выбора энтузиазма -->
    <div>
      <input
        type="radio"
        id="boring"
        name="enthusiasm"
        value="boring"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedEnthusiasm(task, "boring")} />
      <label for="boring" class="${css.radio}"> Скука </label>
    </div>

    <div>
      <input
        type="radio"
        id="adequate"
        name="enthusiasm"
        value="adequate"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedEnthusiasm(task, "adequate")} />
      <label for="adequate" class="${css.radio}"> Пойдет </label>
    </div>

    <div>
      <input
        type="radio"
        id="interesting"
        name="enthusiasm"
        value="interesting"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedEnthusiasm(task, "interesting")} />
      <label for="interesting" class="${css.radio}"> Интересно </label>
    </div>

    <div>
      <input
        type="radio"
        id="delight"
        name="enthusiasm"
        value="delight"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedEnthusiasm(task, "delight")} />
      <label for="delight" class="${css.radio}"> Восторг </label>
    </div>
  </div>
`

let handleRadioChange = () => {
  showSaveButtonHidePause()
  document.getElementById("kairosCheckbox").checked = false
}
