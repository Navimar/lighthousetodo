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

window.onload = function () {

  // data = JSON.parse(localStorage.getItem('data'));
  inputSocket();
  socket.emit('load', findGetParameter("id"));
  if (!data) {
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
    priority = 'first';
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
      else if (a.priority == 'first') {
        return -1
      }
      else if (b.priority == 'first') {
        return 1
      }
      else if (a.priority == 'second') {
        return -1
      }
      else if (b.priority == 'second') {
        return 1
      }
      else if (a.priority == 'third') {
        return -1
      }
      else if (b.priority == 'third') {
        return 1
      }
      else if (a.priority == 'forth') {
        return -1
      }
      else if (b.priority == 'forth') {
        return 1
      }
      else if (a.priority == 'fifth') {
        return -1
      }
      else if (b.priority == 'fifth') {
        return 1
      }
      else if (a.priority == 'sixth') {
        return -1
      }
      else if (b.priority == 'sixth') {
        return 1
      }
      else if (a.priority == 'seventh') {
        return -1
      }
      else if (b.priority == 'seventh') {
        return 1
      }
      else if (a.priority == 'eighth') {
        return -1
      }
      else if (b.priority == 'eighth') {
        return 1
      }
      else if (a.priority == 'ninth') {
        return -1
      }
      else if (b.priority == 'ninth') {
        return 1
      }
      else if (a.priority == 'tenth') {
        return -1
      }
      else if (b.priority == 'tenth') {
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