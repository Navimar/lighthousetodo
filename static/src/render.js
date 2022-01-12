let planeddays = new Set();

let render = () => {
  isSelection = false;
  let searchquerry = $('.t1').val();
  let tasks = $('#tasks');
  let tags = [];
  let opns = [];
  let tagtext = "";
  let opntext = "";
  let text = "";
  let note = "";
  let checked = false;
  let time = "00:00";
  let lasttime = false;
  let date = "1111-11-11";
  let today = moment();
  let texthtml = "";
  let blocked = false;
  let profit = 0;
  tasks.html("");
  let names = [];

  for (let a of data.tasks) {
    a.weight = countweight(a);
  }
  for (let a of data.tasks) {
    a.rank = countrank(a);
  }
  for (let a of data.tasks) {
    planeddays.add(moment(a.date).format('DD-MM-YYYY'));
  }
  tasks.append(Calendar3(moment()));

  for (let a of data.tasks) {
    let nondisplay = false;
    if (searchquerry.toLowerCase !== '') {
      nondisplay = true;
      if (a.name.toLowerCase().includes(searchquerry.toLowerCase()))
        nondisplay = false;
      a.tags.forEach((val) => {
        if (val.toLowerCase().includes(searchquerry.toLowerCase()))
          nondisplay = false;
      });
    }
    names.push(a.name);
    texthtml = "";
    if (nondisplay == false && moment(a.date).format() != today.format() && moment().diff(moment(a.date)) <= 0) {
      today = moment(a.date);
      texthtml += Calendar3(today);
    }
    if (a.blocked && !blocked) {
      texthtml += ("<div class='date'> Блокированные </div>");
      blocked = true;
    }
    if (a.selected) {
      texthtml += "<div class=\"editor\">";

      texthtml += "<input type=\"number\" class='dateinp' id=\"profit\" name=\"profitinp\">";
      texthtml += "<input type=\"date\" class='dateinp' id=\"date\" name=\"trip-start\">";
      texthtml += "<input type=\"time\"  class='dateinp' id=\"time\" name=\"time\">";
      texthtml += "<div class='timebuttons'>";
      texthtml += "<button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"morning\">9:00<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"evening\">18:00<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"tomorrow\">Завтра<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"plus15\">+15 мин<\/button>";
      texthtml += "<button class=\"timebutton\" id=\"plusweek\">+1 нед<\/button>";
      texthtml += "<label class=' timebutton readylabel' >вкл/выкл <input  class='checkbox onoff' type=\"checkbox\"></label>";
      texthtml += "</div>";

      texthtml += "    <textarea placeholder=\"Название...\" id='inputtext' class=\"input \" type=\"text\" cols=\"35\" rows=\"4\"><\/textarea>";
      texthtml += "    <div class='autocomplete'>";
      texthtml += "         <textarea placeholder=\"Зависим...\" id ='inputtags' class=\"input\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    </div >";
      texthtml += "    <div class='autocomplete'>";
      texthtml += "         <textarea placeholder=\"Блокирует...\" id ='inputopns' class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    </div >";
      texthtml += "    <div class='timebuttons'> ";
      texthtml += "<div class=\"bfirst priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rfirst\" value=\"first\"><label for=\"rfirst\">Вовремя<\/label><\/div>";
      texthtml += "<div class=\"bsecond priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rsecond\" value=\"second\"><label for=\"rsecond\">День<\/label><\/div>";
      texthtml += "<div class=\"bthird priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rthird\" value=\"third\"><label for=\"rthird\">Неделя<\/label><\/div>";
      texthtml += "<div class=\"bforth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rforth\" value=\"forth\"><label for=\"rforth\">Месяц<\/label><\/div>";
      texthtml += "<div class=\"bfifth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rfifth\" value=\"fifth\"><label for=\"rfifth\">Квартал<\/label><\/div>";
      texthtml += "    </div><div class='timebuttons'> ";

      texthtml += "<div class=\"bsixth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rsixth\" value=\"sixth\"><label for=\"rsixth\">Полгода<\/label><\/div>";
      texthtml += "<div class=\"bseventh priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rseventh\" value=\"seventh\"><label for=\"rseventh\">Год<\/label><\/div>";
      texthtml += "<div class=\"beighth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"reighth\" value=\"eighth\"><label for=\"reighth\">Век<\/label><\/div>";
      texthtml += "<div class=\"bninth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rninth\" value=\"ninth\"><label for=\"rninth\">Заметки<\/label><\/div>";
      texthtml += "<div class=\"btenth priorbutton radiopriority\"><input name=\"radioprior\" type=\"radio\" id=\"rtenth\" value=\"tenth\"><label for=\"rtenth\">Корзина<\/label><\/div>";
      texthtml += "    </div>";
      texthtml += "<button class='mainbutton timebutton task newtask'>" +
        "Новая запись" +
        "</button>";
      texthtml += "<label class='mainbutton timebutton delcheck'>Удалить <input  class=\"checkdelete \" type=\"checkbox\"></label>";
      texthtml += "<button class='mainbutton timebutton task savetask'>" +
        "Сохранить" +
        "</button>";
      texthtml += "<\/div>";

    }
    texthtml += "<table class='"
    if (nondisplay)
      texthtml += " nondisplay"
    if (a.selected)
      texthtml += "selected";
    texthtml += "'><tbody><tr><td class=' taskmarker"
    // if (a.blocked) {
    //   texthtml += " cantdo";
    // } else 
    if (!isReady(a.date, a.time)) {
      texthtml += " cantdo"
    }
    texthtml += " " + a.priority;
    if (moment().dayOfYear() > moment(a.date + "T" + a.time).dayOfYear() && a.priority == 'first')
      texthtml += " past";
    texthtml += " '></td><td>"
    texthtml += "<div class='task";
    if (a.selected) {
      isSelection = true;
      tags = a.tags;
      opns = a.opns;
      text = a.name;
      note = a.note;
      checked = a.ready;
      time = a.time;
      date = a.date;
      profit = a.profit;
    }
    texthtml += "'>";

    // if (a.priority == 'first')
    if (moment() <= moment(a.date + "T" + a.time)) {
      if (a.time != lasttime) {
        texthtml += "<button class='tag first text time'>";
        texthtml += a.time;
        texthtml += "&nbsp;</button>";
        lasttime = a.time
      }
      else
        texthtml += ("<button class='tag first text time'>--:--&nbsp;</button>");
    }

    texthtml += rendertags(a);

    texthtml += "<button class='text";
    texthtml += "' ";
    texthtml += "value='" + a.name + "'>";
    texthtml += "r ";
    texthtml += a.rank;
    texthtml += " . ";
    texthtml += "w ";
    texthtml += a.weight;
    texthtml += " ";
    texthtml += a.name;
    if (a.note)
      texthtml += "&hellip;"
    texthtml += "</button>";

    if (a.opns && a.opns.length > 0)
      if (a.ready)
        texthtml += "<span class='ready bul tag'>⇒</span>";
      else
        texthtml += "<span class=' bul tag'>⇒</span>";
    else
      if (a.ready)
        texthtml += "<span class='ready bul'>•</span>";
    if (a.selected) {
      texthtml += renderopns(a);
    }

    texthtml += "</div>";
    texthtml += "</td></tr></tbody></table>"
    tasks.append(texthtml);
    if (a.selected) {
      autocomplete(document.getElementById("inputtags"), names);
      autocomplete(document.getElementById("inputopns"), names);
      $('input[name="radioprior"][value=' + a.priority + ']').prop('checked', true);
    }
  }

  for (let t of tags) {
    tagtext += t + "\n";
  }
  if (opns) {
    for (let t of opns) {
      opntext += t + "\n";
    }
  }
  $(".onoff").prop({
    checked: checked
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

  $('#inputtags').val(tagtext);
  $('#inputopns').val(opntext);
  $('#inputtext').val(text + '\n' + note);
  $('#time').val(time);
  $('#date').val(date);
  $('#profit').val(profit);
  $('.delete').val(text);
  if (isSelection) {
    scrollPosition = $('.selected').position().top;
    scrollPosition -= mouse.y - 12;
    $(window).scrollTop(scrollPosition);
    $('#inputtext').focus();
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
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      let index = arr[i].toLowerCase().indexOf(val.toLowerCase());
      if (index >= 0) {
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
  calendar += ("<div id=" + date.format('DD-MM-YYYY') + " class='date'> " + date.format('dddd DD MMMM') + "</div>");
  calendar += '<table class="calendar3" id="calendar-' + date.format('DD-MM-YYYY') + '">'
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
    if (moment().date() > a)
      a = moment().date();
    calendar += '<a class="calbut" id=' + 'calendar-' + date.format('DD-MM-YYYY') + '-' + moment(date).set('date', i).format('DD-MM-YYYY') + ' href="#' + 'calendar-' + moment(date).set('date', a).format('DD-MM-YYYY') + '-' + moment(date).set('date', a).format('DD-MM-YYYY') + '"><button class="calendarblock'
    if (i == moment().format('D') && moment().format('MM-YYYY') == date.format('MM-YYYY'))
      calendar += ' today';
    if (planeddays.has(moment(date).set('date', i).format('DD-MM-YYYY'))) {
      calendar += ' planed'
    }
    if (i == date.format('D')) {
      calendar += ' highlightedday'
    }
    calendar += '">' + i + '</button></a>';
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

let rendertags = (a) => {
  let texthtml = "";
  if (a.tags.length > 0) {
    a.tags.sort((a, b) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    });
    for (let t in a.tags) {
      texthtml += "<button class='tag text";
      texthtml += "'>";
      texthtml += a.tags[t];
      texthtml += "</button>";
      if (t != a.tags.length - 1)
        texthtml += '<span class="tag">&nbsp;•&nbsp;</span>'
      else
        texthtml += '<span class="tag">&nbsp;⇒&nbsp;</span>'
    }
  }

  return texthtml;
}
let renderopns = (a, level) => {
  if (!level)
    level = 0;
  let texthtml = "";
  if (a.opns && a.opns.length > 0) {
    a.opns.sort((a, b) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    });
    for (let t = 0; t < a.opns.length; t++) {
      let openka = note_by_name(a.opns[t])
      texthtml += "<br>";
      texthtml += "<span class='bul tag'>";
      for (let i = 0; i < level; i++)
        texthtml += "&nbsp;&nbsp;"
      if (t == 5) {
        texthtml += "•";
        texthtml += "</span>";
        texthtml += "<span>...</span>";
        break;
      }
      if (openka.tags && openka.tags.length > 1)
        texthtml += "⇒";
      else
        texthtml += "•";
      texthtml += "</span>";
      texthtml += "r ";
      texthtml += openka.rank;
      texthtml += " ";
      texthtml += "w ";
      texthtml += openka.weight;
      texthtml += " ";
      texthtml += "<button class='opn";
      texthtml += "'>";
      texthtml += openka.name;
      texthtml += "</button>";
      if (level == 5)
        texthtml += "<span class='arr'>⇒...</span>";
      if (level < 5)
        texthtml += renderopns(openka, level + 1);
    }
  }
  return texthtml;
}

let countweight = (a, level) => {
  let weight = parseInt(a.profit);
  if (a.priority == 'tenth')
    weight = 0;
  if (!level) level = 0;
  if (a.tags && a.tags.length > 0) {
    for (let t = 0; t < a.tags.length; t++) {
      let tag = note_by_name(a.tags[t])
      if (level < 7)
        weight += parseInt(countweight(tag, level + 1));
    }
  }
  return weight;
}

let countrank = (a, level) => {
  let rank = parseInt(a.weight);
  if (!level) level = 0;
  if (a.opns && a.opns.length > 0) {
    for (let t = 0; t < a.opns.length; t++) {
      let opn = note_by_name(a.opns[t])
      if (level < 7) {
        let r = Math.max(rank, parseInt(countrank(opn, level + 1)));
        if (r > 0)
          rank = r;
      }
    }
  }
  return rank;
}
