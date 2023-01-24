let planeddays = new Map();

let g_time = 0;
let g_avgtime = 0;
let g_max = 0;
let g_timecn = 0;

let render = () => {
  let tasks = $('#tasks');
  let texthtml = "";
  planeddays = new Map();

  if (!user) {
    texthtml = '<div id="telegramlogin"><script async src="https://telegram.org/js/telegram-widget.js?18" data-telegram-login="' + botname + '" data-size="large" data-onauth="onTelegramAuth(user)"></script></div>';
    tasks.append(texthtml);
  } else {
    isSelection = false;
    let searchquerry = $('.t1').val();
    let linksfromNames = [];
    let linkstoNames = [];
    let tagtext = "";
    let opntext = "";
    let text = "";
    let note = "";
    let checkedready = false;
    let checkedvip = false;
    let searchresultisempty = true;
    let time = "00:00";
    let lasttime = false;
    let date = "1111-11-11";
    let today = moment();
    let blocked = false;
    let lastdip = -1;
    tasks.html("");
    let names = [];

    tasks.append("<div id=" + moment().format('YYYY-MM-DD') + " class='header date'> " + moment().format('dddd DD MMMM') + "</div>");
    tasks.append('<div class="calendarplace">' + moment().format() + '</div>');
    for (let a of data.tasks) {
      // if ((data.tasks.indexOf(a) <= parseInt(selected.i) + 5 && data.tasks.indexOf(a) >= parseInt(selected.i) - 5) || selected.i == -1) {
      // if (true) {
      // console.log(data.tasks.indexOf(a), selected.i);
      if (moment().isSameOrBefore(a.date, 'day')) {
        let value = planeddays.get(moment(a.date).format('YYYY-MM-DD'))
        if (value) {
          if (!value.includes(a.priority)) {
            value.push(a.priority)
            planeddays.set(moment(a.date).format('YYYY-MM-DD'), value)
          }
        } else
          planeddays.set(moment(a.date).format('YYYY-MM-DD'), [a.priority]);
      }

      let nondisplay = false;
      if (searchquerry.toLowerCase !== '') {
        nondisplay = true;
        if (a.name.toLowerCase().replace(/ё/g, "е").includes(searchquerry.toLowerCase().replace(/ё/g, "е"))) {
          nondisplay = false;
          searchresultisempty = false;
        }
        a.linksfromNames.forEach((val) => {
          if (val.toLowerCase().replace(/ё/g, "е").includes(searchquerry.toLowerCase().replace(/ё/g, "е"))) {
            nondisplay = false;
            searchresultisempty = false;
          }
        });
        if (a.selected)
          nondisplay = false;
      } else {
        searchresultisempty = false;
      }
      names.push(a.name);
      texthtml = "";
      if (nondisplay == false && moment(a.date).format() != today.format() && moment().diff(moment(a.date)) <= 0) {
        today = moment(a.date);
        texthtml += ("<div id=" + today.format('YYYY-MM-DD') + " class='header date'> ");
        if (moment().isSame(today, 'year'))
          texthtml += today.format('dddd DD MMMM') + "</div>";
        else
          texthtml += today.format('dddd DD MMMM YYYY') + "</div>";
        texthtml += '<div class="calendarplace">' + today.format() + '</div>'
        lastdip = a.dip - 1
        // Calendar3(today);
      }
      if (!a.vip && a.linksfrom.length > 0 && a.linksfrom.some(e => e.ready === false) && !blocked) {
        texthtml += ("<div class='header date'>ФИНИСФЕРА</div>");
        blocked = true;
      }

      let diphead = a.target ? a.target.dip : a.dip
      if (diphead > lastdip) {
        texthtml += ("<div class='header dipheader date '><span>" + (diphead) + "</span></div>");
        lastdip = diphead
      }

      texthtml += "<table class='"
      if (nondisplay)
        texthtml += " nondisplay"
      if (a.selected)
        texthtml += " selected";
      if (a.focused)
        texthtml += " focused";
      texthtml += " task'><tbody>"



      if (a.selected) {
        texthtml += "<tr><td colspan='3'>";

        texthtml += "<div class=\"editor\">";

        //ранг
        // texthtml += "<div class='textareacontainer'>";
        // texthtml += "<div class='timeinputs'>";


        // //важность
        // texthtml += "<div class='textareacontainer'>"
        // texthtml += "<div class='header'>Приоритет</div>"
        // texthtml += "<button class=\"bfirst priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rfirst\" value=\"first\"><label for=\"rfirst\">Хронос<\/label><\/button>";
        // texthtml += "<button class=\"bsecond priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rsecond\" value=\"second\"><label for=\"rsecond\">Диес<\/label><\/button>";
        // texthtml += "<button class=\"bthird priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rthird\" value=\"third\"><label for=\"rthird\">Нептун<\/label><\/button>";
        // texthtml += "<button class=\"bforth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rforth\" value=\"forth\"><label for=\"rforth\">Кайрос<\/label><\/button>";
        // texthtml += "<div class=\"bfifth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rfifth\" value=\"fifth\"><label for=\"rfifth\">Квартал<\/label><\/div>";
        // texthtml += "    </div><div class='timebuttons'> ";

        // texthtml += "<div class=\"bsixth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rsixth\" value=\"sixth\"><label for=\"rsixth\">Полгода<\/label><\/div>";
        // texthtml += "<div class=\"bseventh priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rseventh\" value=\"seventh\"><label for=\"rseventh\">Год<\/label><\/div>";
        // texthtml += "<div class=\"beighth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"reighth\" value=\"eighth\"><label for=\"reighth\">Век<\/label><\/div>";
        // texthtml += "<button class=\"bninth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rninth\" value=\"ninth\"><label for=\"rninth\">Набу<\/label><\/button>";
        // texthtml += "<div class=\"btenth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rtenth\" value=\"tenth\"><label for=\"rtenth\">Корзина<\/label><\/div>";
        // texthtml += "    </div>";

        //тексты
        texthtml += "<div class='textareacontainer'>"
        if (a.note)
          texthtml += "<div class='header'>Название" + " + 📝" + "</div>"
        else
          texthtml += "<div class='header'>Название" + "</div>"
        texthtml += "    <textarea placeholder=\"...\" id='inputtext' class=\"input \" type=\"text\" cols=\"35\" rows=\"1\"><\/textarea>";
        // texthtml += "</div>"
        // texthtml += "<div class='textareacontainer'>"
        // texthtml += "<div class='header'>Зависим</div>"
        texthtml += "<label class='header readylabel' >Зависим <input  class='checkboxvip onoff' type=\"checkbox\"></label>";

        texthtml += "    <div class='autocomplete'>";
        texthtml += "         <textarea placeholder=\"...\" id ='inputtags' class=\"input\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
        texthtml += "    </div >";
        // texthtml += "</div>"
        // texthtml += "<div class='textareacontainer'>"
        // texthtml += "<div class='header'>Блокирует</div>"
        texthtml += "<label class='header readylabel' >Блокирует <input  class='checkboxready onoff' type=\"checkbox\"></label>";

        texthtml += "    <div class='autocomplete'>";
        texthtml += "         <textarea placeholder=\"...\" id ='inputopns' class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
        texthtml += "    </div >";
        texthtml += "</div>"

        //дата и время
        texthtml += "<div class='textareacontainer'>"
        texthtml += "<div class='header'>Дата и время</div>"
        texthtml += "<div class='timeinputs'>";
        // texthtml += "<span class='header'>Дата</span>"
        // texthtml += "<div class='fiveblock'>"
        texthtml += "<input type=\"date\" class='dateinp' id=\"date\" name=\"trip-start\">";
        // texthtml += "</div>";
        // texthtml += "<br>"
        // texthtml += "<span class='header'>Время</span>"
        // texthtml += "<div  class='fiveblock'>"
        texthtml += "<input type=\"time\"  class='dateinp' id=\"time\" name=\"time\">"
        // texthtml += " </div>";
        texthtml += "</div>";

        texthtml += "<div class='header'>Быстрый перенос</div>"
        texthtml += "<button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"morning\">9:00<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"evening\">18:00<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"midnight\">00:00<\/button>";

        texthtml += "<button class=\"timebutton\" id=\"tomorrow\">Завтра<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"plus15\">+15 м<\/button>";
        texthtml += "<button class=\"timebutton\" id=\"plusweek\">+1 нед<\/button>";
        texthtml += "</div>";

        //управляющие кнопки

        // texthtml += "<div class='mainbuttonblock'>"
        // texthtml += "<label class='mainbutton readylabel' >Активно <input  class='checkbox onoff' type=\"checkbox\"></label>";
        // texthtml += "</div>"
        texthtml += "<div class='textareacontainer'>"

        texthtml += "<div class='header'>Приоритет</div>"

        texthtml += "<input type=\"number\" class='dateinp profitinp' id=\"dip\" name=\"profitinp\">";

        texthtml += "</div>";

        // texthtml += "<span class='header'>+</span>"
        // texthtml += "<input type=\"number\" class='dateinp profitinp' id=\"ppd\" name=\"ppdinp\">";
        // texthtml += "<span class='header'>/в день</span>"
        // texthtml += "</div>"
        texthtml += "<div class='textareacontainer'>";

        texthtml += "<div class='mainbuttonblock'>"

        texthtml += "<button value='" + a.name + "' class='mainbutton task squeezeout' >" +
          "Вытеснить" +
          "</button>";
        texthtml += "</div>";

        texthtml += "<div class='mainbuttonblock'>"

        texthtml += "<button value='" + a.name + "' class='mainbutton task stomp' >" +
          "Притоптать" +
          "</button>";
        texthtml += "</div>";

        texthtml += "<div class='mainbuttonblock'>"
        texthtml += "<button value='" + a.name + "' class='mainbutton task savetask' >" +
          "Сохранить" +
          "</button>";
        texthtml += "</div>"

        texthtml += "<div class='mainbuttonblock'>"
        texthtml += "<label value='" + a.name + "' class='mainbutton divetask' >Нырок <input  class='checkdive' type=\"checkbox\"></label>";
        texthtml += "</div>"

        texthtml += "<div class='mainbuttonblock'>"
        texthtml += "<label class='mainbutton  delcheck'>Удалить <input  class=\"checkdelete \" type=\"checkbox\"></label>";
        texthtml += "</div>"



        texthtml += "</div>"
        texthtml += "</div>";
        texthtml += "</td></tr>";
      }

      texthtml += "<tr class='task'>";
      texthtml += "<td class='plate'>"

      if (a.ready)
        //&& a.opns.length > 0)
        texthtml += ("<div class='tag text time ready'>ГОТОВ</div>&nbsp;&nbsp;");
      if (a.vip)
        //&& a.opns.length > 0)
        texthtml += ("<div class='tag text time vip'>СУПЕР</div>&nbsp;&nbsp;");
      else {
        if (!a.ready)
          if (moment(a.date + "T" + a.time).diff(moment(), 'day') == -1)
            texthtml += ("<div class='tag time past'>ВЧЕРА</div>&nbsp;&nbsp;");
          else if (moment(a.date + "T" + a.time).isBefore(moment(), 'day'))
            texthtml += ("<div class='tag time past'>ДАВНО</div>&nbsp;&nbsp;");
        if (a.linksfrom.length > 0 && a.linksfrom.some(e => e.ready === false))
          if (a.linkstoNames.length > 0)
            texthtml += ("<div class='tag time'>ВЕТВЬ</div>&nbsp;&nbsp;");
          else
            texthtml += ("<div class='tag time'>МЕЧТА</div>&nbsp;&nbsp;");
      }
      if (moment() <= moment(a.date + "T" + a.time)) {
        if (a.time != lasttime) {
          texthtml += "<div class='tag time'>";
          texthtml += a.time;
          texthtml += "</div>&nbsp;&nbsp;";
          lasttime = a.time
        }
        else
          texthtml += ("<div class='tag  time'>--:--</div>&nbsp;&nbsp;");
      }

      texthtml += "</td>"


      texthtml += "<td class='tdtask'>"
      texthtml += "<div class='task";
      if (a.selected) {
        texthtml += " position";
        isSelection = true;
        linksfromNames = a.linksfromNames;
        linkstoNames = a.linkstoNames;
        text = a.name;
        note = a.note;
        checkedready = a.ready;
        checkedvip = a.vip ? a.vip : false
        time = a.time;
        date = a.date;
        profit = a.profit;
        dip = a.dip;
      }
      texthtml += "'>";
      texthtml += rendertags(a);




      texthtml += "<div class='text";
      texthtml += "'>";
      texthtml += a.name;
      texthtml += "</div>";
      if (a.note)
        // texthtml += "&hellip;"
        texthtml += "+ 📝"


      // texthtml += ' ['
      // if (a.priorarr)
      //   a.priorarr.forEach((e, index) => {
      //     texthtml += e + ',';

      //   });
      // texthtml += '] '
      if (a.linkstoNames.length > 0) {
        texthtml += "<span class=' tag '> ⇨ "
        texthtml += "</span>";
      }
      //►⇨
      if (selected.scribe != a && a.target && a.name != a.target.name) {
        texthtml += '<div class="tag text">' + a.target.name + '</div>'
      }

      if (a.selected) {
        texthtml += "<div id='opnslistcont'>"
        texthtml += renderopns(a);
        texthtml += "</div>"
      }

      texthtml += "</div>";
      texthtml += "</td>";


      texthtml += " <td class=' taskmarker"
      if (a.focused)
        texthtml += " focushead";
      texthtml += "'>"
      if (!a.focused) {
        if (a.target && a.target.dip < a.dip) {
          texthtml += "<div class=' dip '>" + a.dip
          // texthtml += ' ► ' + a.target.dip
        }
        texthtml += "</div>"
      }
      else
        texthtml += "<div class='focustimer'><div id='timer' class='center'>" + moment.utc(foucusstimer * 1000).format('HH:mm:ss') + "</div></div>";
      texthtml += " </td>"


      texthtml += "</tr></tbody></table>"
      tasks.append(texthtml);
      if (a.selected) {
        $('input[name="radioprior"][value=' + a.priority + ']').prop('checked', true);
      }
      // }
    }
    const calendars = document.getElementsByClassName("calendarplace");
    // console.log(calendars)
    for (let cal of calendars) {
      // console.log(cal.textContent)
      cal.innerHTML = Calendar3(moment(cal.textContent))
    }
    if (searchresultisempty)
      tasks.append('<div id="searchresultisempty">Ничего не найдено, измените поисковый запрос</div><br><button class="clearsearch">Очистить строку поиска</button>');

    for (let t of linksfromNames) {
      tagtext += t + "\n";
    }
    if (linkstoNames) {
      for (let t of linkstoNames) {
        opntext += t + "\n";
      }
    }

    if ($('.divetask').attr('value') == $('.t1').val())
      $('.checkdive').prop("checked", true);

    $(".checkboxready").prop({
      checked: checkedready
    });
    $(".checkboxvip").prop({
      checked: checkedvip
    });

    $('textarea').keyup(function () {
      $(this).height(0); // min-height
      $(this).height(this.scrollHeight);
    });
    $('textarea').focus(function () {
      $(this).height(0); // min-height
      $(this).height(this.scrollHeight);
      $('.checkdelete ').prop('checked', false);
    });

    // console.log(rank);
    // // $('#profit').val(rank);
    // console.log($('#profit').val());
    // console.log($('#inputtags').val());


    if (isSelection) {
      $('#inputtags').val(tagtext);
      $('#inputopns').val(opntext);
      $('#inputtext').val(text + '\n' + note);
      $('#time').val(time);
      $('#date').val(date);
      $('#dip').val(dip);
      $('.delete').val(text);
      scrollPosition = $('.position').offset().top + $('.position').height() / 2;
      scrollPosition -= mouse.y;
      $(window).scrollTop(scrollPosition);
      // }
      // if (selected.i != -1) {
      names.sort(function (a, b) {
        return a.length > b.length;
      });
      autocomplete(document.getElementById("inputtags"), names);
      autocomplete(document.getElementById("inputopns"), names);
    }
  }
  if (debug) {
    const d = new Date();
    r_time = d.getTime();
    if (g_time == 0)
      g_time = r_time
    if (r_time - g_time > g_max)
      g_max = r_time - g_time;
    g_avgtime = parseInt((g_avgtime * g_timecn + (r_time - g_time)) / ++g_timecn)
    document.getElementById("speed").style.visibility = 'visible';
    document.getElementById("speed").innerHTML = 'last: ' + (r_time - g_time) + '<br>avg: ' + g_avgtime + '<br>max: ' + g_max;
  }
};

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a, b, i, val = this.value.substr(0, this.selectionStart).split("\n").pop();
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    let cn = 0;
    i = 0;
    while (i < arr.length && cn < 30) {
      let index
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i])
        index = arr[i].toLowerCase().replace(/ё/g, "е").indexOf(val.toLowerCase().replace(/ё/g, "е"));
      if (index >= 0) {
        cn++;
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold and print :*/
        b.innerHTML = "";
        for (ii = 0; ii < index; ii++)
          b.innerHTML += arr[i][ii];
        for (ii = index; ii < index + val.length; ii++)
          b.innerHTML += "<strong>" + arr[i][ii] + "</strong>";
        for (ii = index + val.length; ii < arr[i].length; ii++)
          b.innerHTML += arr[i][ii];
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          let rows = inp.value.split("\n");
          // let rows = inp.value;
          let cur = (inp.value.substr(0, inp.selectionStart).split("\n").length);
          rows.splice(cur - 1, 1, this.getElementsByTagName("input")[0].value);
          inp.value = rows.join('\n');
          // inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
      i++;
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      if (x)
        e.preventDefault();

      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      if (x)
        e.preventDefault();
      /*and and make the current item more visible:*/
      addActive(x);
    }
    else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      // if (x)
      //   e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}


function Calendar3(date) {
  let calendar = '';
  calendar += '<table class="calendar3" id="calendar-' + date.format('YYYY-MM-DD') + '">'
  calendar += '<tr class="days_of_week">'
  calendar += '<td>Пн'
  calendar += '<td>Вт'
  calendar += '<td>Ср'
  calendar += '<td>Чт'
  calendar += '<td>Пт'
  calendar += '<td>Сб'
  calendar += '<td>Вс'
  let Dlast = moment(date).endOf('month').date();
  let DNfirst = moment(date).startOf('month').day();
  calendar += '<tr>';
  if (DNfirst != 0) {
    for (var i = 1; i < DNfirst; i++) calendar += '<td>';
  } else {
    for (var i = 0; i < 6; i++) calendar += '<td>';
  }
  for (var i = 1; i <= Dlast; i++) {
    calendar += '<td class="">'
    let a = i;
    calendar += '<a class="calbut" id=' + 'calendar-' + date.format('YYYY-MM-DD') + '-' + moment(date).set('date', i).format('YYYY-MM-DD') + ' href="#' + 'calendar-' + moment(date).set('date', a).format('YYYY-MM-DD') + '-' + moment(date).set('date', a).format('YYYY-MM-DD') + '">'
    calendar += '<button class="calendarblock'
    if (i == moment().format('D') && moment().format('MM-YYYY') == date.format('MM-YYYY'))
      calendar += ' today';
    // if (planeddays.has(moment(date).set('date', i).format('YYYY-MM-DD'))) {
    //   let prarr = planeddays.get(moment(date).set('date', i).format('YYYY-MM-DD'))
    //   prarr.forEach((e) => calendar += ' ' + e);
    //   calendar += ' planed'
    // }
    if (i == date.format('D')) {
      calendar += ' highlightedday'
    }
    calendar += '">'
    // calendar += '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>'
    // if (Math.floor(i / 10) > 0)
    calendar += + i
    // else
    // calendar += '&nbsp;' + i +'&nbsp;'

    if (planeddays.has(moment(date).set('date', i).format('YYYY-MM-DD'))) {
      let prarr = planeddays.get(moment(date).set('date', i).format('YYYY-MM-DD'))
      let cn = '';
      prarr.forEach((e) => {
        calendar += '<span class="calendardot ' + e + '-color">' + cn + '•</span>'
        cn += '&nbsp;'
      });

    }
    // calendar += '<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>'


    // + ' <span class="calendarmark marksecond">•</span><span class="calendarmark markforth ">•</span>'
    + '</button>'
    // calendar += '</a>';
    if (moment(date).set('date', i).day() == 0) {
      calendar += '<tr>';
    }
  }
  for (var i = date.day(); i < 7; i++)
    calendar += '<td></td>';
  calendar += '</table>'
  return (calendar);
  // document.querySelector('#' + id + ' tbody').innerHTML = calendar;
  // g.value = D.getFullYear();
  // m.selected = true;
  // if (document.querySelectorAll('#' + id + ' tbody tr').length < 6) {
  //   document.querySelector('#' + id + ' tbody').innerHTML += '<tr><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;';
  // }
  // document.querySelector('#' + id + ' option[value="' + new Date().getMonth() + '"]').style.color = 'rgb(220, 0, 0)'; // в выпадающем списке выделен текущий месяц
}

let rendertags = (task) => {
  let texthtml = "";
  let blocksarr = []
  let readyarr = []

  blocksarr = task.linksfrom.filter(a => a.ready === false);
  readyarr = task.linksfrom.filter(a => a.ready === true);

  for (let t in blocksarr) {
    texthtml += '<span class="tag">&nbsp;•&nbsp;</span>'
    texthtml += "<button class='tag text";
    texthtml += "'>";
    texthtml += blocksarr[t].name;
    texthtml += "</button>";
    // if (t != a.blocks.length - 1)
    //   texthtml += '<span class="tag">&nbsp;•&nbsp;</span>'
    // else {
    // texthtml += '<span class="tag">&nbsp;⇒&nbsp;</span>'
    // }
  }

  // let readyarr = a.tags.filter(x => !a.blocks.includes(x))

  if (blocksarr.length > 0)
    texthtml += "<br>";

  for (let t in readyarr) {
    // if (t == 0)
    texthtml += '<span class="tag">&nbsp;✓&nbsp;</span>'
    // else
    // texthtml += '<span class="tag">&nbsp;•&nbsp;</span>'
    texthtml += "<button class='tag text";
    texthtml += "'>";
    texthtml += readyarr[t].name;
    texthtml += "</button>";
    // if (t != a.tags.length - 1)
    // texthtml += '<span class="tag">&nbsp;•&nbsp;</span>'
  }
  if (readyarr.length > 0)
    texthtml += "<br>";
  return texthtml;
}
let renderopns = (a, level) => {
  if (!level)
    level = 0;
  let texthtml = "<div class='opnslist'>";

  a.linksto.sort((aa, bb) => {
    if (aa.dip < bb.dip) { return -1; }
    if (aa.dip > bb.dip) { return 1; }
    return 0;
  });

  for (let t = 0; t < a.linksto.length; t++) {
    texthtml += "<span class='bul tag'>" + a.linksto[t].dip + "</span><span class='bul tag ";
    texthtml += "'>";
    for (let i = 0; i < level; i++)
      texthtml += "&nbsp;&nbsp;"
    if (a.linksto[t].linkstoNames && a.linksto[t].linkstoNames.length > 1)
      texthtml += "⇒";
    else
      texthtml += "•";
    texthtml += "</span>";
    texthtml += "<button class='opn";
    texthtml += "'>";
    texthtml += a.linksto[t].name;
    texthtml += "</button>";
    if (level == 5)
      texthtml += "<span class='arr'>⇒...</span>";
    if (level < 5)
      texthtml += renderopns(a.linksto[t], level + 1);
  }

  return texthtml + "</div>";
}


