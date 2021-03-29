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
  let blocked = true;;
  let texthtml = "";
  tasks.html("");
  for (let a of data.tasks) {
    texthtml = "";
    if (moment(a.date).format() == today.format()
      || moment().diff(moment(a.date)) >= 0
    ) {
    } else {
      tasks.append("<div class='date'> " + moment(a.date).format('dddd DD MMMM') + "</div>");
      today = moment(a.date);
    }
    if (a.blocked && blocked) {
      tasks.append("<div class='date headdate'>Блокированные</div>");
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
    if (a.blocked) {
      texthtml += " cantdo";
    } else if (!isReady(a.date, a.time)) {
      texthtml += " cantdo"
    }
    if (a.ready) {
      texthtml += " ready";
    }
    texthtml += " " + a.priority;
    if (searchquerry.toLowerCase !== '' && !a.name.toLowerCase().includes(searchquerry.toLowerCase())) {
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
      texthtml += ("<button class='tag first text time'> " + a.time + "&nbsp;</button>");
      lasttime = a.time
    }

    texthtml += rendertags(a);

    texthtml += "<button class='text";
    texthtml += "' ";
    texthtml += "value='" + a.name + "'>";
    texthtml += a.name.split('\n')[0];
    // if (a.name == 'new item') {
    //   button = false;
    // }
    texthtml += "</button>";
    if (a.selected)
      texthtml += renderopns(a, 0);
    else if (a.opns && a.opns.length > 0)
      texthtml += "<span class='bul'>⇒<span>";


    texthtml += "</div>";
    tasks.append(texthtml);


    if (a.selected) {
      texthtml = "<div class=\"editor\">";
      texthtml += "    <input type=\"date\" id=\"date\" name=\"trip-start\">";
      texthtml += "    <input type=\"time\" id=\"time\" name=\"time\">";
      texthtml += "<br>";
      texthtml += "    <button class=\"timebutton\" id=\"plustoday\">Сегодня<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusnow\">Сейчас<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"morning\">9:00<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"evening\">18:00<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"midnight\">00:00<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusday\">+1 день<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"tomorrow\">Завтра<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plushour\">+1 час<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plus15\">+15 минут<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"plusweek\">+1 неделя<\/button>";
      texthtml += "    <button class=\"timebutton\" id=\"pluslast\" value='" + a.timediff + "'>" + msToTime(a.timediff) + "<\/button>";
      texthtml += "    <label class='mainbutton timebutton '>вкл/выкл <input  class='checkbox onoff' type=\"checkbox\"></label>";
      texthtml += "    <textarea placeholder=\"Название...\" class=\"input inputtext\" type=\"text\" cols=\"35\" rows=\"4\"><\/textarea>";
      texthtml += "    <textarea placeholder=\"Зависим...\" class=\"input inputtags\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    <textarea placeholder=\"Блокирует...\" class=\"input inputopns\" name=\"tags\" cols=\"35\" rows=\"1\"><\/textarea>";
      texthtml += "    <select id=\"priority\" size=\"7\" name=\"hero\">";
      texthtml += "      <option class=\"first\" value=\"first\">Запланировано<\/option>";
      texthtml += "      <option class=\"second\" value=\"second\">Предсказуемые<\/option>";
      texthtml += "      <option class=\"third\" value=\"third\">Идеи<\/option>";
      texthtml += "      <option class=\"forth\" value=\"forth\">Квест<\/option>";
      texthtml += "      <option class=\"fifth\" value=\"fifth\">Затык<\/option>";
      texthtml += "      <option class=\"sixth\" value=\"sixth\">Технические<\/option>";
      texthtml += "      <option class=\"seventh\" value=\"seventh\">Корзина<\/option>";
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
      // texthtml = "";
      // $('textarea').keyup(function () {
      //   $(this).height(0); // min-height
      //   $(this).height(this.scrollHeight);
      // });
      // $('textarea').focus(function () {
      //   $(this).height(0); // min-height
      //   $(this).height(this.scrollHeight);
      //   $('.checkdelete ').prop('checked', false);
      // });
      $("#priority").val(a.priority);
      // $('.inputtext').focus();
    }

  }
  tasks.prepend(
    "<div class='date'> " + moment().format('dddd DD MMMM HH:mm') + "</div>"
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

  $('.inputtags').val(tagtext);
  $('.inputopns').val(opntext);
  $('.inputtext').val(text + '\n' + note);
  $('#time').val(time);
  // console.log(date);
  $('#date').val(date);
  $('.delete').val(text);
  if (isSelection) {
    scrollPosition = $('.selected').position().top;
    scrollPosition -= mouse.y - 20;
    $(window).scrollTop(scrollPosition);
  }

};