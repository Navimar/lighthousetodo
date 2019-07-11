$(document).ready(function () {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
});

// $(function () {
//   var $body = $(document);
//   $body.bind('scroll', function () {
//     // "Disable" the horizontal scroll.
//     if ($body.scrollLeft() !== 0) {
//       $body.scrollLeft(0);
//     }
//   });
// });
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
$(document).on('click', '.delete', function () {
  onDel($(this).attr('value'));
});
$(document).on('click', '#plustoday', function () {
  onToday();
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

  let lastheight = $('#taskheader').height();
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
  let today = new Date().getDate();
  let blocked = true;;
  let texthtml = "";
  tasks.html("");
  for (let a of data.tasks) {
    texthtml = "";
    if (today <= new Date(a.date).getDate() && new Date() < new Date(a.date)) {
      tasks.append("<div class='date'>Сегодня " + new Date(a.date).getDate() + "</div>");
      today = new Date(a.date).getDate() + 1;
    }
    if (a.blocked && blocked) {
      tasks.append("<div class='date'>Блокированные</div>");
      blocked = false;
    }
    if (a.selected) {
      texthtml += "<div class=\"editor\">";
      texthtml += "    <button class='timebutton delete' value='del'>Удалить<\/button>";
      texthtml += "    <span>Активно<\/span>";
      texthtml += "    <input class=\"checkbox\" type=\"checkbox\">";
      texthtml += "    <textarea placeholder=\"Название...\" class=\"input inputtext\" type=\"text\" cols=\"35\" rows=\"5\"><\/textarea>";
      texthtml += "    <textarea placeholder=\"Зависим...\" class=\"input inputtags\" name=\"tags\" cols=\"35\" rows=\"5\"><\/textarea>";
      texthtml += "    <textarea placeholder=\"Блокирует...\" class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"5\"><\/textarea>";
      texthtml += "    <select id=\"priority\" size=\"10\" name=\"hero\">";
      texthtml += "      <option"+" value=\"first\">Идеи<\/option>";
      texthtml += "      <option value=\"second\">Условия<\/option>";
      texthtml += "      <option value=\"third\">ТО<\/option>";
      texthtml += "      <option value=\"forth\">Бери и делай<\/option>";
      texthtml += "      <option value=\"fifth\">Обязательство<\/option>";
      texthtml += "      <option value=\"sixth\">Доход\/Расход<\/option>";
      texthtml += "      <option value=\"seventh\">Новые горизонты<\/option>";
      texthtml += "      <option value=\"eighth\">Порядок<\/option>";
      texthtml += "      <option value=\"ninth\">Хочу!<\/option>";
      texthtml += "      <option value=\"tenth\">Заметки<\/option>";
      texthtml += "    <\/select>";
      texthtml += "    <input type=\"date\" id=\"date\" name=\"trip-start\">";
      texthtml += "    <input type=\"time\" id=\"time\" name=\"time\"><br>";
      texthtml += "    <button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plus15\">+15 минут<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusweek\">+1 неделя<\/button>";
      texthtml += "  <\/div>";
      tasks.append(texthtml);
      texthtml="";
    }
    texthtml += "<div class='task";
    if (a.selected) {
      texthtml += " selected";
      tags = a.tags;
      opns = a.opns;
      text = a.name;
      note = a.note;
      checked = a.ready;
      // fear = a.fear;
        $("#priority").val(a.priority);
      time = a.time;
      date = a.date;
    }
    if (a.ready) {
      texthtml += " ready";
    }
    if (a.fear) {
      texthtml += " old";
    }
    texthtml += " " + a.priority;
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
      for (let t of a.tags) {
        texthtml += "<span class='tag";
        texthtml += "'>";
        texthtml += t;
        texthtml += "</span>&nbsp;";
      }
    }
    if (a.tags.length > 0 || a.opns.length > 0) {
      texthtml += "<span class='arr'>=&#62; </span>"
    }
    if (a.opns) {
      if (a.opns.length > 0) {
        // texthtml += "<div class='opns'>";
        for (let t of a.opns) {
          texthtml += "<span class='opn";
          texthtml += "'>";
          texthtml += t;
          texthtml += "</span>&nbsp;";
        }
        // texthtml += "</div>";
      }
    } else {
      a.opns = [];
    }

    texthtml += "</div>";
    tasks.append(texthtml);
    // if (a.selected) {
    //   texthtml = "<div id='taskheader' class='list'>" + texthtml + "<br></div>";
    //   tasks.prepend(texthtml);
    // }
  }
  if (button) {
    $('.editor').prepend("<button class='timebutton task newtask'>\n" +
      "Новая запись\n" +
      "</button>\n");
  }
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
  if (data) {
    send(data);
  }
  // $('#status').prepend(clock().text);
};


// $(this).bind('touchend', function(e) {
//   e.preventDefault();
//   // Add your code here. 
//   $(this).click();
//   // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
// })

