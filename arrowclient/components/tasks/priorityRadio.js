import { html } from "@arrow-js/core"
import css from "~/css.js"
import { showSaveButtonHidePause } from "~/logic/manipulate.js"

let checkedUrgency = (task, type) => {
  if (task.urgency == type) return "checked"
  else return ""
}
let checkedConsequence = (task, type) => {
  if (task.importance == type) return "checked"
  else return ""
}

let checkedDifficulty = (task, type) => {
  if (task.difficulty == type) return "checked"
  else return ""
}
export default (task) => html`
  <div class="grid grid-cols-4 gap-3 w-full">
    <!-- Радиокнопки для выбора срока -->
    <div>
      <input
        type="radio"
        id="longTerm"
        name="urgency"
        value="longTerm"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedUrgency(task, "longTerm")} />
      <label for="longTerm" class="${css.radio}"> Окно </label>
    </div>

    <div>
      <input
        type="radio"
        id="shortTerm"
        name="urgency"
        value="shortTerm"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedUrgency(task, "shortTerm")} />
      <label for="shortTerm" class="${css.radio}"> На днях </label>
    </div>

    <div>
      <input
        type="radio"
        id="onDay"
        name="urgency"
        value="onDay"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedUrgency(task, "onDay")} />
      <label for="onDay" class="${css.radio}"> Срочно </label>
    </div>

    <div>
      <input
        type="radio"
        id="onTime"
        name="urgency"
        value="onTime"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedUrgency(task, "onTime")} />
      <label for="onTime" class="${css.radio}"> Ко времени </label>
    </div>

    <!-- Радиокнопки для выбора важности -->
    <div>
      <input
        type="radio"
        id="trivial"
        name="importance"
        value="trivial"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "trivial")} />
      <label for="trivial" class="${css.radio}"> Обычно </label>
    </div>

    <div>
      <input
        type="radio"
        id="noticeable"
        name="importance"
        value="noticeable"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "noticeable")} />
      <label for="noticeable" class="${css.radio}"> Заметно </label>
    </div>

    <div>
      <input
        type="radio"
        id="important"
        name="importance"
        value="important"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "important")} />
      <label for="important" class="${css.radio}"> Важно </label>
    </div>

    <div>
      <input
        type="radio"
        id="critical"
        name="importance"
        value="critical"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedConsequence(task, "critical")} />
      <label for="critical" class="${css.radio}"> Критично </label>
    </div>

    <!-- Радиокнопки для выбора сложности задачи -->
    <div>
      <input
        type="radio"
        id="long"
        name="difficulty"
        value="long"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedDifficulty(task, "long")} />
      <label for="long" class="${css.radioСompliment}"> Долго </label>
    </div>

    <div>
      <input
        type="radio"
        id="day"
        name="difficulty"
        value="day"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedDifficulty(task, "day")} />
      <label for="day" class="${css.radioСompliment}"> Денёк </label>
    </div>

    <div>
      <input
        type="radio"
        id="hour"
        name="difficulty"
        value="hour"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedDifficulty(task, "hour")} />
      <label for="hour" class="${css.radioСompliment}"> Часок </label>
    </div>

    <div>
      <input
        type="radio"
        id="quick"
        name="difficulty"
        value="quick"
        class="hidden peer"
        @change="${handleRadioChange}"
        ${checkedDifficulty(task, "quick")} />
      <label for="quick" class="${css.radioСompliment}"> Быстро </label>
    </div>
  </div>
`

let handleRadioChange = () => {
  showSaveButtonHidePause()
  document.getElementById("kairosCheckbox").checked = false
}
