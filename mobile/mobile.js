// $(document).ready(function () {
//search
//   var TRange = null;

//   function findString(str) {
//     // if (parseInt(navigator.appVersion) < 4) return;
//     var strFound;
//     if (window.find) {
//       // CODE FOR BROWSERS THAT SUPPORT window.find
//       strFound = self.find(str);
//       if (strFound && self.getSelection && !self.getSelection().anchorNode) {
//         strFound = self.find(str)
//       }
//       if (!strFound) {
//         strFound = self.find(str, 0, 1)
//         while (self.find(str, 0, 1)) continue
//       }
//     } else {
//       alert("browser not supported")
//       return;
//     }
//     if (!strFound) {
//       $('.t1').addClass('red')
//       return;
//     } else {
//       $('.t1').removeClass('red')
//     }
//   };
// });
let isSelection = false;

window.onfocus = function () {
  onFocus();
};

$(document).on('swiperight', '.text', function (event) {
  $(event.target).addClass("red");
});
$(document).on('click', '#searchbutton', function () {
  render();
});
$('.t1').bind('input propertychange', function () {
  select('');
  render();
  $(window).scrollTop(0);
});
$(document).on('click', '.text', function () {
  onSelect($(this).val());
});
$(document).on('click', '.tag', function () {
  onTag($(this).text());
});
$(document).on('click', '.opn', function () {
  onOpn($(this).text());
});
$(document).on('click', '.newtask', function () {
  onNew();
  $('.inputtext:first').val('').select();
});
$(document).on('click', '#clearsearch', function () {
  $('.t1').val('');
  render();
});
$(document).on('click', '.delete', function () {
  onDel($(this).attr('value'));
});
$(document).on('click', '#plustoday', function () {
  onToday();
});
$(document).on('click', '#tomorrow', function () {
  onTomorrow();
});
$(document).on('click', '#plusday', function () {
  onPlusday();
});
$(document).on('click', '#plushour', function () {
  onPlusHour();
});
$(document).on('click', '#plusnow', function () {
  onNow();
});
$(document).on('click', '#plus15', function () {
  onPlus15();
});
$(document).on('click', '#plusweek', function () {
  onPlusWeek();
});

let render = () => {
  isSelection = false;
  // let lastheight = $('#taskheader').height();
  // $('.t1').val('1');
  let searchquerry = $('.t1').val();
  let tasks = $('#tasks');
  let tags = [];
  let opns = [];
  let tagtext = "";
  let opntext = "";
  let text = "";
  let note = "";
  let checked = false;
  // let fear = false;
  let button = true;
  let time = "00:00";
  let date = "1111-11-11";
  let today = moment();
  let blocked = true;;
  let texthtml = "";
  tasks.html("");
  for (let a of data.tasks) {
    texthtml = "";
    if (moment(a.date).format() == today.format() || moment().diff(moment(a.date)) >= 0) {
    } else {
      tasks.append("<div class='date'> " + moment(a.date).format('dddd DD MMMM') + "</div>");
      today = moment(a.date);
    }
    if (a.blocked && blocked) {
      tasks.append("<div class='date'>Блокированные</div>");
      blocked = false;
    }
    texthtml += "<div class='task";
    if (a.selected) {
      isSelection = true;
      texthtml += " selected";
      tags = a.tags;
      opns = a.opns;
      text = a.name;
      note = a.note;
      checked = a.ready;
      // fear = a.fear;

      time = a.time;
      date = a.date;
    }
    if (a.ready) {
      texthtml += " ready";
    }
    // if (a.fear) {
    //   texthtml += " old";
    // }
    texthtml += " " + a.priority;
    if (searchquerry.toLowerCase !== '' && !a.name.toLowerCase().includes(searchquerry.toLowerCase())) {
      texthtml += " nondisplay"
    }
    texthtml += "'>";
    // texthtml += "<button class='delete' value='" + a.name + "'>del</button>";
    texthtml += "<button class='text";
    if (a.blocked) {
      texthtml += " cantdo";
    } else if (!isReady(a.date, a.time)) {
      texthtml += " cantdo"
    }
    texthtml += "' ";
    texthtml += "value='" + a.name + "'>";
    texthtml += a.name.split('\n')[0];
    // if (a.name == 'new item') {
    //   button = false;
    // }
    texthtml += "</button>";
    if (a.tags.length > 0 || a.opns.length > 0) {
      texthtml += "<br>";
    }
    if (a.tags.length > 0) {
      a.tags.sort((a, b) => {
        if (a < b) { return -1; }
        if (a > b) { return 1; }
        return 0;
      });
      for (let t of a.tags) {
        texthtml += "<button class='tag";
        texthtml += "'>";
        texthtml += t;
        texthtml += "</button>&nbsp;";
      }
    }
    if (a.tags.length > 0 || a.opns.length > 0) {
      texthtml += "<span class='arr'>=&#62; </span>"
    }
    if (a.opns) {
      if (a.opns.length > 0) {
        a.opns.sort((a, b) => {
          if (a < b) { return -1; }
          if (a > b) { return 1; }
          return 0;
        });
        for (let t of a.opns) {
          texthtml += "<button class='opn";
          texthtml += "'>";
          texthtml += t;
          texthtml += "</button>&nbsp;";
        }
        // texthtml += "</div>";
      }
    } else {
      a.opns = [];
    }

    texthtml += "</div>";
    tasks.append(texthtml);


    if (a.selected) {
      texthtml = "<div class=\"editor\">";
      texthtml += "    <label class='timebutton'>вкл/выкл <input  class=\"checkbox \" type=\"checkbox\"></label>&nbsp;&nbsp;&nbsp;";
      texthtml += ("<button class='timebutton task newtask'>" +
        "Новая запись" +
        "</button>&nbsp;&nbsp;&nbsp;");
      texthtml += "    <button class='timebutton delete' value='del'>Удалить<\/button>";
      texthtml += "<br>";
      texthtml += "    <textarea placeholder=\"Название...\" class=\"input inputtext\" type=\"text\" cols=\"35\" rows=\"4\"><\/textarea>";
      texthtml += "    <textarea placeholder=\"Зависим...\" class=\"input inputtags\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    <textarea placeholder=\"Блокирует...\" class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    <select id=\"priority\" size=\"11\" name=\"hero\">";
      texthtml += "      <option class=\"first\" value=\"first\">Идеи<\/option>";
      texthtml += "      <option class=\"second\" value=\"second\">Условия<\/option>";
      texthtml += "      <option class=\"third\" value=\"third\">Бери и делай<\/option>";
      texthtml += "      <option class=\"forth\" value=\"forth\">ТО<\/option>";
      texthtml += "      <option class=\"fifth\" value=\"fifth\">Обязательство<\/option>";
      texthtml += "      <option class=\"sixth\" value=\"sixth\">Доход\/Расход<\/option>";
      texthtml += "      <option class=\"seventh\" value=\"seventh\">Заточка<\/option>";
      texthtml += "      <option class=\"eighth\" value=\"eighth\">Новые горизонты<\/option>";
      texthtml += "      <option class=\"ninth\" value=\"ninth\">Порядок<\/option>";
      texthtml += "      <option class=\"tenth\" value=\"tenth\">Хочу!<\/option>";
      texthtml += "      <option class=\"eleventh\" value=\"eleventh\">Заметки<\/option>";
      // texthtml += "      <option class=\"twelfth\" value=\"twelfth\">Корзина<\/option>";
      texthtml += "    <\/select><br>";
      texthtml += "    <input type=\"date\" id=\"date\" name=\"trip-start\">";
      texthtml += "    <input type=\"time\" id=\"time\" name=\"time\">";
      texthtml += "    <br>";
      texthtml += "    <button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"tomorrow\">Завтра<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plus15\">+15 минут<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusweek\">+1 неделя<\/button>";
      texthtml += "  <\/div>";

      // texthtml += "<div class=\"editor\">";
      // texthtml += "    <button class='timebutton delete' value='del'>Удалить<\/button>";
      // texthtml += "    <span>Активно<\/span>";
      // texthtml += "    <input class=\"checkbox\" type=\"checkbox\">";
      // texthtml += "    <textarea placeholder=\"Название...\" class=\"input inputtext\" type=\"text\" cols=\"35\" rows=\"5\"><\/textarea>";
      // texthtml += "    <textarea placeholder=\"Зависим...\" class=\"input inputtags\" name=\"tags\" cols=\"35\" rows=\"5\"><\/textarea>";
      // texthtml += "    <textarea placeholder=\"Блокирует...\" class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"5\"><\/textarea>";
      // texthtml += "    <select id=\"priority\" size=\"10\" name=\"hero\">";
      // texthtml += "      <option" + " value=\"first\">Идеи<\/option>";
      // texthtml += "      <option value=\"second\">Условия<\/option>";
      // texthtml += "      <option value=\"third\">ТО<\/option>";
      // texthtml += "      <option value=\"forth\">Бери и делай<\/option>";
      // texthtml += "      <option value=\"fifth\">Обязательство<\/option>";
      // texthtml += "      <option value=\"sixth\">Доход\/Расход<\/option>";
      // texthtml += "      <option value=\"seventh\">Новые горизонты<\/option>";
      // texthtml += "      <option value=\"eighth\">Порядок<\/option>";
      // texthtml += "      <option value=\"ninth\">Хочу!<\/option>";
      // texthtml += "      <option value=\"tenth\">Заметки<\/option>";
      // texthtml += "    <\/select>";
      // texthtml += "    <input type=\"date\" id=\"date\" name=\"trip-start\">";
      // texthtml += "    <input type=\"time\" id=\"time\" name=\"time\"><br>";
      // texthtml += "    <button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
      // texthtml += "    <button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
      // texthtml += "    <button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
      // texthtml += "    <button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
      // texthtml += "    <button class=\"timebutton\" id=\"plus15\">+15 минут<\/button>";
      // texthtml += "    <button class=\"timebutton\" id=\"plusweek\">+1 неделя<\/button>";
      // texthtml += "  <\/div>";
      tasks.append(texthtml);
      texthtml = "";
      $('textarea').keyup(function () {
        $(this).height(0); // min-height
        $(this).height(this.scrollHeight);
      });
      $('textarea').focus(function () {
        $(this).height(0); // min-height
        $(this).height(this.scrollHeight);
      });
      $("#priority").val(a.priority);
      $('.inputtext').focus();
      // function(){
      //   $(this).height(0); // min-height
      //   $(this).height(this.scrollHeight);
      // });
    }

  }
  tasks.prepend(
    "<br><div class='date'> " + moment().format('dddd DD MMMM HH:mm') + "</div>"
  );

  // tasks.css('padding-top', $('#taskheader').height() + 10);
  // let ysc = $(window).scrollTop();  //your current y position on the page
  // let th = $('#taskheader').height();
  // if (!th) th = 0;
  // $(window).scrollTop(ysc + th - lastheight);
  // console.log('scroll',ysc,th,lastheight);
  for (let t of tags) {
    tagtext += t + "\n";
  }
  if (opns) {
    for (let t of opns) {
      opntext += t + "\n";
    }
  }

  $("input[type='checkbox']").prop({
    checked: checked
  });
  // $("#fear").prop({
  //   checked: fear
  // });
  $('.inputtags').val(tagtext);
  $('.inputopns').val(opntext);
  $('.inputtext').val(text + '\n' + note);
  $('#time').val(time);
  // console.log(date);
  $('#date').val(date);
  $('.delete').val(text);
  // localStorage.setItem('data', JSON.stringify(data));
  // if (data) {
  //   send(data);
  // }
  // $('#status').prepend(clock().text);
};


// $(this).bind('touchend', function(e) {
//   e.preventDefault();
//   // Add your code here. 
//   $(this).click();
//   // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
// })

