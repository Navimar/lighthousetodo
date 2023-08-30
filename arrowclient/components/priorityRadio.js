import { html } from "@arrow-js/core";
import css from '../css.js';

let checked = (task, type) => {
    if (task.type == type)
        return 'checked'
    else
        return ''
}

export default (task) => html`
<div class="grid grid-cols-4 gap-3 w-full">
  <div>
    <input type="radio" id="window" name="typeradio" value="window" class="hidden peer" ${checked(task, 'window')}/>
    <label
      for="window"
      class="${css.radio}"
    >
      Окно
    </label>
  </div>

  <div>
    <input type="radio" id="frame" name="typeradio" value="frame" class="hidden peer" ${checked(task, 'frame')}/>
    <label
      for="frame"
      class="${css.radio}"
    >
      Распорядок
    </label>
  </div>

  <div>
    <input type="radio" id="deadline" name="typeradio" value="deadline" class="hidden peer" ${checked(task, 'deadline')}/>
    <label
      for="deadline"
      class="${css.radio}"
    >
      Срок
    </label>
  </div>

  <div>
    <input type="radio" id="meeting" name="typeradio" value="meeting" class="hidden peer" ${checked(task, 'meeting')} />
    <label
      for="meeting"
      class="${css.radio}"
    >
      Встреча
    </label>
  </div>
</div>
`
