const socket = io();
let data;

function inputSocket() {
  socket.on('connect', function () {
    console.log('connected');
    $('#status').removeClass("red").html('online');
  });
  socket.on('disconnect', function () {
    // alert('DISCONNECT!!!');
    $('#status').addClass("red").html('offline');
  });
  socket.on('update', function (msg) {
    data = msg;
    console.log("loaded");
    // console.log(data);
    render();
    $('#status').removeClass("red").html('online');
  });
  // socket.on('err', (val) => {
  //     alert(val);
  // });
  // socket.on('login', (val) => {
  //     onLogin(val);
  // });
}


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
    texthtml += "<div class='task";
    if (a.selected) {
      texthtml += " selected";
      tags = a.tags;
      opns = a.opns;
      text = a.name;
      note = a.note;
      checked = a.ready;
      fear = a.fear;
      $("#priority").val("white");
      if (a.priority == "steel") {
        $("#priority").val("steel");
      }
      if (a.priority == "red") {
        $("#priority").val("red");
      }
      if (a.priority == "purple") {
        $("#priority").val("purple");
      }
      if (a.priority == "yellow") {
        $("#priority").val("yellow");
      }
      if (a.priority == "grey") {
        $("#priority").val("grey");
      }
      if (a.priority == "blue") {
        $("#priority").val("blue");
      }
      if (a.priority == "cyan") {
        $("#priority").val("cyan");
      }
      if (a.priority == "green") {
        $("#priority").val("green");
      }
      if (a.priority == "white") {
        $("#priority").val("white");
      }
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
    if (a.name == 'new item') {
      button = false;
    }
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
    if (a.selected) {
      texthtml = "<div id='taskheader' class='list'>" + texthtml + "<br></div>";
      tasks.prepend(texthtml);
    }
  }
  if (button) {
    $('#taskheader').prepend("<div class='task newtask'>\n" +
      "<div class='text'>...new item</div>\n" +
      "</div>\n");
  }
  tasks.css('padding-top', $('#taskheader').height() + 10);
  let ysc = $(window).scrollTop();  //your current y position on the page
  let th = $('#taskheader').height();
  if (!th) th = 0;
  $(window).scrollTop(ysc + th - lastheight);
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
    socket.emit('save', data);
  }
  $('.clock').html(clock().text);
};


window.onload = function () {

  // data = JSON.parse(localStorage.getItem('data'));
  inputSocket();
  socket.emit('load', 'hi');
  if (!data) {
    console.log('NO DATA!!!');
    $('#status').addClass("red").html('NO DATA!!!');
  } else {
    render();
  }
};


let newwish = (name, selected, tags, opns, priority, note) => {
  if (!note) {
    note = '';
  }
  if (!tags) {
    tags = [];
  }
  if (!opns) {
    opns = [];
  }
  if (!priority) {
    priority = 'yellow';
  }
  data.tasks.unshift({
    name,
    note,
    tags,
    opns,
    selected,
    priority,
    ready: false,
    time: clock().h + ":" + clock().m,
    date: clock().year + "-" + clock().month + "-" + clock().d,
  })
};
let save = () => {
  //edit
  let inptval = $('.inputtext').val();
  let name;
  let note = '';
  $.each(inptval.split(/\n/), function (i, text) {
    if (i == 0) {
      name = text;
      if (text == '') {
        name = 'new item';
      }
    } else if (i == 1) {
      note += text;
    }
    else {
      note += '\n' + text;
    }
  });
  let inptags = $(".inputtags").val();
  let inpopns = $(".inputopns").val();
  let ready = $(".checkbox").prop('checked');
  // let fear = $("#fear").prop('checked');
  let priority = $("#priority option:selected").val();
  let tags = [];
  let opns = [];

  let time = $("#time").val();
  if (!time) {
    time = clock().h + ":" + clock().m;
  }
  let date = $("#date").val();
  // console.log("date val "+date);
  if (!date) {
    date = clock().year + "-" + clock().month + "-" + clock().d;
    // console.log("set date "+date);
  }
  let d = 0
  let ok = true;
  while (ok) {
    ok = false;
    for (let a of data.tasks) {
      if (!a.selected && a.name == name) {
        name += '!';
        ok = true;
        break;
      }
    }
  }

  for (let a of data.tasks) {
    if (a.selected && name) {
      for (let n of data.tasks) {
        for (let t in n.tags) {
          if (n.tags[t] == a.name) {
            n.tags.splice(t, 1);
          }
        }
      }
    }
  }
  for (let a of data.tasks) {
    if (a.selected && name) {
      for (let n of data.tasks) {
        for (let t in n.opns) {
          if (n.opns[t] == a.name) {
            n.opns.splice(t, 1);
          }
        }
      }
    }
  }
  $.each(inptags.split(/\n/), function (i, tgname) {
    // empty string check
    if (tgname != "") {
      tags.push(tgname);
      let ok = true;
      for (let a of data.tasks) {
        if (a.name == tgname) {
          ok = false;
          if (a.opns) {
            if (a.opns.indexOf(name) === -1) {
              a.opns.push(name);
            }
          }
        }
      }
      if (ok) {
        newwish(tgname, false, [], [name], priority);
      }
    }
  });
  $.each(inpopns.split(/\n/), function (i, opname) {
    // empty string check
    if (opname != "") {
      opns.push(opname);
      let ok = true;
      for (let a of data.tasks) {
        if (a.name == opname) {
          ok = false;
          if (a.tags.indexOf(name) === -1) {
            a.tags.push(name);
          }
        }
      }
      if (ok) {
        newwish(opname, false, [name], [], priority);
      }
    }
  });
  for (let a of data.tasks) {
    if (a.selected && inptval) {
      for (let n of data.tasks) {
        for (let t in n.tags) {
          if (n.tags[t] == a.name) {
            n.tags[t] = name;
          }
        }
        for (let t in n.opns) {
          if (n.opns[t] == a.name) {
            n.opns[t] = name;
          }
        }
      }
      // a.name = inpt.val();
      a.name = name;
      a.note = note;
      a.tags = tags;
      a.opns = opns;
      a.ready = ready;
      a.priority = priority;
      a.time = time;
      a.date = date;
    }
    a.blocked = false;
    for (let n of data.tasks) {
      for (let t of a.tags) {
        if (t == n.name && !n.ready) {
          a.blocked = true;
        }
      }
    }
  }
  sortdata();
};
let sortdata = () => {
  data.tasks.sort((a, b) => {
    if ((a.blocked && b.blocked) || (!a.blocked && !b.blocked)) {
      if (isReady(a.date, "00:00") && !isReady(b.date, "00:00")) {
        return -1
      }
      else if (!isReady(a.date, "00:00") && isReady(b.date, "00:00")) {
        return 1
      }
      else if (a.priority == b.priority) {
        if (Date.parse(a.date + " " + a.time) > Date.parse(b.date + " " + b.time)) {
          return 1;
        }
        else if (Date.parse(a.date + " " + a.time) < Date.parse(b.date + " " + b.time)) {
          return -1;
        }
        else if (a.name.length >= b.name.length) {
          return 1;
        }
        else if (a.name.length < b.name.length) {
          return -1;
        }
      }
      else if (a.priority == 'steel') {
        return -1
      }
      else if (b.priority == 'steel') {
        return 1
      }
      else if (a.priority == 'red') {
        return -1
      }
      else if (b.priority == 'red') {
        return 1
      }
      else if (a.priority == 'yellow') {
        return -1
      }
      else if (b.priority == 'yellow') {
        return 1
      }
      else if (a.priority == 'green') {
        return -1
      }
      else if (b.priority == 'green') {
        return 1
      }
      else if (a.priority == 'blue') {
        return -1
      }
      else if (b.priority == 'blue') {
        return 1
      }
      else if (a.priority == 'purple') {
        return -1
      }
      else if (b.priority == 'purple') {
        return 1
      }
      else if (a.priority == 'cyan') {
        return -1
      }
      else if (b.priority == 'cyan') {
        return 1
      }
      else if (a.priority == 'grey') {
        return -1
      }
      else if (b.priority == 'grey') {
        return 1
      }
    }
    else if (a.blocked && !b.blocked) {
      return 1
    }
    else if (!a.blocked && b.blocked) {
      return -1
    }
    return 1;
  })
};
let select = (text) => {
  for (let a of data.tasks) {
    a.selected = (a.name == text)
  }
};
let selectnext = () => {
  for (let a in data.tasks) {
    data.tasks[a].selected = false;
  }
  for (let a in data.tasks) {
    if (isReady(data.tasks[a].date, data.tasks[a].time)) {
      data.tasks[a].selected = true;
      break;
    }
  }
};

$(document).on('click', '.text', function () {
  save();
  // console.log($(this).val());
  select($(this).val());
  render();
});
$(document).on('click', '.tag', function () {
  save();
  // console.log($(this).text());
  select($(this).text());
  render();
});
$(document).on('click', '.opn', function () {
  save();
  // console.log($(this).text());
  select($(this).text());
  render();
});

$(document).on('click', '.newtask', function () {
  newwish('new item');
  select('new item');
  render();
  $('.inputtext:first').focus().select();
});

let del = (text) => {
  for (let a in data.tasks) {
    // console.log(a);
    if (data.tasks[a].name == text) {
      data.tasks.splice(a, 1);
      // console.log(a, '!!!');
    }
    for (let t in data.tasks[a].tags) {
      if (data.tasks[a].tags[t] == text) {
        data.tasks[a].tags.splice(t, 1);
      }
    }
    for (let t in data.tasks[a].opns) {
      if (data.tasks[a].opns[t] == text) {
        data.tasks[a].opns.splice(t, 1);
      }
    }
  }
  sortdata();
  selectnext();

};
$(document).on('click', '.delete', function () {
  del($(this).attr('value'));
  render();
});
$(document).on('click', '#plustoday', function () {
  $('#date').val(clock().year + "-" + clock().month + "-" + clock().d);
});
$(document).on('click', '#plusday', function () {
  let d = new Date(Date.parse(new Date($('#date').val())) + 86400000);
  $('#date').val(clock(d).year + "-" + clock(d).month + "-" + clock(d).d);
});
$(document).on('click', '#plushour', function () {
  let d = new Date(Date.parse(new Date($('#date').val() + ' ' + $('#time').val())) + 3600000);
  $('#date').val(clock(d).year + "-" + clock(d).month + "-" + clock(d).d);
  $('#time').val(clock(d).h + ":" + clock(d).m);
});
$(document).on('click', '#plusnow', function () {
  $('#date').val(clock().year + "-" + clock().month + "-" + clock().d);
  $('#time').val(clock().h + ":" + clock().m);
});
$(document).on('click', '#plus15', function () {
  let d = new Date(Date.parse(new Date($('#date').val() + ' ' + $('#time').val())) + 3600000 / 4);
  $('#time').val(clock(d).h + ":" + clock(d).m);
});
$(document).on('click', '#plusweek', function () {
  let d = new Date(Date.parse(new Date($('#date').val())) + 86400000 * 7);
  $('#date').val(clock(d).year + "-" + clock(d).month + "-" + clock(d).d);
});