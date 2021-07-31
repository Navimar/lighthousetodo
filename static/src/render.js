let rendertags = (a) => {
  let texthtml = "";
  if (a.tags.length > 0) {
    a.tags.sort((a, b) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    });
    for (let t of a.tags) {
      texthtml += "<button class='tag text";
      texthtml += "'>";
      texthtml += t;
      texthtml += "</button>&nbsp;";
    }
    texthtml += "<span class='bul'>⇒</span>";
  }
  return texthtml;
}
let renderopns = (a, level) => {
  let texthtml = "";
  if (a.opns && a.opns.length > 0) {
    a.opns.sort((a, b) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    });
    for (let t = 0; t < a.opns.length; t++) {
      texthtml += "<br>";
      texthtml += "<span class='bul'>";
      for (let i = 0; i < level; i++)
        texthtml += "&nbsp;"
      let openka = note_by_name(a.opns[t])
      if (openka.tags && openka.tags.length > 1)
        texthtml += "⇒";
      else
        texthtml += "•";
      texthtml += "</span>";
      texthtml += "<button class='opn";
      texthtml += "'>";
      texthtml += openka.name;
      texthtml += "</button>";
      if (level == 5)
        texthtml += "<span class='arr'>⇒...</span>";
      if (level < 5) {
        texthtml += renderopns(openka, level + 1);;
      }
    }
  }
  return texthtml;
}
let names = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua & Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central Arfrican Republic", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauro", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre & Miquelon", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St Kitts & Nevis", "St Lucia", "St Vincent", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks & Caicos", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];

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
  tasks.html("");
  names = [];
  for (let a of data.tasks) {
    names.push(a.name);
    texthtml = "";
    if (moment(a.date).format() == today.format()
      || moment().diff(moment(a.date)) >= 0
    ) {
    } else {
      tasks.append("<div class='date'> " + moment(a.date).format('dddd DD MMMM') + "</div>");
      today = moment(a.date);
    }

    texthtml += "<table class='"
    if (a.selected)
      texthtml += "selected";
    texthtml += "'><tbody><tr><td class=' taskmarker"
    // texthtml += "<span class=' bul"
    texthtml += " " + a.priority;
    if (moment().dayOfYear() > moment(a.date + "T" + a.time).dayOfYear() && a.priority == 'first')
      texthtml += " past";
    // texthtml += "'>•</span > ";
    texthtml += " '></td><td>"
    texthtml += "<div class='task";
    if (a.selected) {
      isSelection = true;
      // texthtml += " selected";
      tags = a.tags;
      opns = a.opns;
      text = a.name;
      note = a.note;
      checked = a.ready;
      // fear = a.fear;

      time = a.time;
      date = a.date;
    }
    if (a.blocked) {
      texthtml += " cantdo";
    } else if (!isReady(a.date, a.time)) {
      texthtml += " cantdo"
    }
    if (searchquerry.toLowerCase !== '') {
      let f = true;
      if (a.name.toLowerCase().includes(searchquerry.toLowerCase()))
        f = false;
      a.tags.forEach((val) => {
        if (val.toLowerCase().includes(searchquerry.toLowerCase()))
          f = false;
      });
      if (f)
        texthtml += " nondisplay"
    }
    texthtml += "'>";

    if (
      a.time != lasttime &&
      a.priority == 'first'
    ) {
      // if (
      //   moment().diff(moment(a.date + "T" + a.time)) <= 0
      //   &&
      //   (moment().diff(moment(a.date + "T" + lasttime)) >= 0 || !lasttime)
      // )
      //   tasks.append("<div class='date headdate first time'> " + moment().format('HH:mm') + "</div>");
      if (moment().dayOfYear() <= moment(a.date + "T" + a.time).dayOfYear())
        texthtml += ("<button class='tag first text time'> " + a.time + "&nbsp;</button>");
      lasttime = a.time
    }

    texthtml += rendertags(a);

    texthtml += "<button class='text";
    texthtml += "' ";
    texthtml += "value='" + a.name + "'>";
    texthtml += a.name;
    if (a.note)
      texthtml += "&hellip;"
    texthtml += "</button>";

    if (a.opns && a.opns.length > 0)
      if (a.ready)
        texthtml += "<span class='ready bul'>⇒</span>";
      else
        texthtml += "<span class=' bul'>⇒</span>";
    else
      if (a.ready)
        texthtml += "<span class='ready bul'>•</span>";
    if (a.selected)
      texthtml += renderopns(a, 0);

    texthtml += "</div>";
    texthtml += "</td></tr></tbody></table>"
    tasks.append(texthtml);


    if (a.selected) {
      texthtml = "<div class=\"editor\">";

      texthtml += "    <input type=\"date\" class='dateinp' id=\"date\" name=\"trip-start\">";
      texthtml += "    <input type=\"time\"  class='dateinp' id=\"time\" name=\"time\">";
      texthtml += "    <div class='timebuttons'>";
      texthtml += "      <button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"morning\">9:00<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"evening\">18:00<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"tomorrow\">Завтра<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"plus15\">+15 минут<\/button>";
      texthtml += "      <button class=\"timebutton\" id=\"plusweek\">+1 неделя<\/button>";
      texthtml += "     <label class='timebutton '>вкл/выкл <input  class='checkbox onoff' type=\"checkbox\"></label>";
      texthtml += "    </div>";

      texthtml += "    <textarea placeholder=\"Название...\" id='inputtext' class=\"input \" type=\"text\" cols=\"35\" rows=\"4\"><\/textarea>";
      texthtml += "    <div class='autocomplete'>";
      texthtml += "         <textarea placeholder=\"Зависим...\" id ='inputtags' class=\"input\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    </div >";
      texthtml += "    <div class='autocomplete'>";
      texthtml += "         <textarea placeholder=\"Блокирует...\" id ='inputopns' class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    </div >";
      texthtml += "    <select id=\"priority\" size=\"4\" name=\"hero\">";
      texthtml += "      <option class=\"first\" value=\"first\">План<\/option>";
      texthtml += "      <option class=\"second\" value=\"second\">Окно<\/option>";
      texthtml += "      <option class=\"third\" value=\"third\">Заметки<\/option>";
      texthtml += "      <option class=\"forth\" value=\"forth\">Корзина<\/option>";
      // texthtml += "      <option class=\"fifth\" value=\"fifth\">Пять<\/option>";
      // texthtml += "      <option class=\"sixth\" value=\"sixth\">Шесть<\/option>";
      // texthtml += "      <option class=\"seventh\" value=\"seventh\">Семь<\/option>";
      // texthtml += "      <option class=\"eighth\" value=\"eighth\">Заточка<\/option>";
      // texthtml += "      <option class=\"ninth\" value=\"ninth\">Результат<\/option>";
      // texthtml += "      <option class=\"tenth\" value=\"tenth\">Новые горизонты<\/option>";
      // texthtml += "      <option class=\"eleventh\" value=\"eleventh\">Заметки<\/option>";
      // texthtml += "      <option class=\"twelfth\" value=\"twelfth\">???<\/option>";
      texthtml += "    <\/select><br>";
      texthtml += ("<button class='mainbutton timebutton task newtask'>" +
        "Новая запись" +
        "</button>");
      texthtml += "    <label class='mainbutton timebutton delcheck'>Удалить <input  class=\"checkdelete \" type=\"checkbox\"></label>";
      texthtml += "  <\/div>";
      tasks.append(texthtml);
      autocomplete(document.getElementById("inputtags"), names);
      autocomplete(document.getElementById("inputopns"), names);
      $("#priority").val(a.priority);
    }

  }
  tasks.prepend(
    "<div class='date'> " + moment().format('dddd DD MMMM HH:mm') + "</div>"
  );

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
  // console.log(date);
  $('#date').val(date);
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
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
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
