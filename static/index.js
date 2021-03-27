const socket = io();
let data;

function inputSocket() {
  socket.on('connect', function () {
    console.log('connected');
    update();
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

  update();
  // data = JSON.parse(localStorage.getItem('data'));
  inputSocket();

  if (!data) {
    $('#status').addClass("red").html('NO DATA!!!');
  } else {
    render();
  }
};

let update = () => {
  socket.emit('load', findGetParameter("id"));
}
let newwish = (name, selected, tags, opns, priority, note) => {
  let ok = true;
  while (ok) {
    ok = false;
    for (let a of data.tasks) {
      if (a.name.toLowerCase() == name.toLowerCase()) {
        name += '!';
        ok = true;
        break;
      }
    }
  }
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
  });
};
let save = () => {
  if (true) {
    // if (isSelection) {
    let inptval = $('.inputtext').val()
    if (inptval)
      inptval.trim();
    let name;
    let note = '';
    if (inptval) {
      $.each(inptval.split(/\n/), function (i, text) {
        if (i == 0) {
          name = text;
          if (text == '') {
            name = 'новая запись';
          }
        } else if (i == 1) {
          note += text;
        }
        else {
          note += '\n' + text;
        }
      });
      if ($(".checkdelete").prop('checked')) {
        return del(name);
      }
      let inptags = $(".inputtags").val().trim();
      // console.log(inptags);
      let inpopns = $(".inputopns").val().trim();
      // inptags = $(".inputtags").val();
      // console.log(inptags);
      // let inpopns = $(".inputopns").val();

      let ready = $(".checkbox").prop('checked');

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
      // let d = 0
      let ok = true;
      while (ok) {
        ok = false;
        for (let a of data.tasks) {
          if (!a.selected && a.name.toLowerCase() == name.toLowerCase()) {
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
              if (n.tags[t].toLowerCase() == a.name.toLowerCase()) {
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
              if (n.opns[t].toLowerCase() == a.name.toLowerCase()) {
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
            if (a.name.toLowerCase() == tgname.toLowerCase()) {
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
            if (a.name.toLowerCase() == opname.toLowerCase()) {
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
              if (n.tags[t].toLowerCase() == a.name.toLowerCase()) {
                n.tags[t] = name;
              }
            }
            for (let t in n.opns) {
              if (n.opns[t].toLowerCase() == a.name.toLowerCase()) {
                n.opns[t] = name;
              }
            }
          }
          a.name = name;
          a.note = note;
          a.tags = tags;
          a.opns = opns;
          a.ready = ready;
          a.priority = priority;
          a.timediff = moment(date + "T" + time).format('x') - moment(a.date + "T" + a.time).format('x') || a.timediff;
          console.log(a.timediff);
          a.time = time;
          a.date = date;
        }
        a.blocked = false;
        for (let n of data.tasks) {
          for (let t of a.tags) {
            if (t.toLowerCase() == n.name.toLowerCase() && !n.ready) {
              a.blocked = true;
            }
          }
        }
        if (moment().dayOfYear() > moment(a.date + "T" + a.time).dayOfYear())
          if (a.priority == 'first')
            a.priority = 'third'
      }
      sortdata();
    }
  }
};

let note_by_name = (name) => {
  for (let a of data.tasks)
    if (a.name.toLowerCase() == name.toLowerCase())
      return a;
}

let select = (text) => {
  let f = false;
  for (let a of data.tasks) {
    if (a.selected && a.name.toLowerCase() == text.toLowerCase())
      a.selected = false
    else {
      a.selected = (a.name.toLowerCase() == text.toLowerCase())
      if (a.selected) {
        f = text;
      }
    }
  }
  return f;
};
let selectnext = () => {
  for (let a in data.tasks) {
    if (data.tasks[a].selected) {
      data.tasks[a].selected = false;
      a = parseInt(a);
      let b = a + 1;
      console.log(b, data.tasks[b], data.tasks[1]);

      if (data.tasks[b]) {
        data.tasks[b].selected = true;
      } else {
        data.tasks[0].selected = true;
      }
      break;
    }
  }
  // for (let a in data.tasks) {
  //   data.tasks[a].selected = false;
  // }
  // for (let a in data.tasks) {
  //   if (isReady(data.tasks[a].date, data.tasks[a].time)) {
  //     data.tasks[a].selected = true;
  //     break;
  //   }
  // }
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
};

let send = () => {
  // login.pass = findGetParameter("key");
  let id = findGetParameter("id");
  data.id = id;
  socket.emit('save', data);
}