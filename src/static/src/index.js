const socket = io();
let data = {};
let user;
data.timestamp = 0;


function onTelegramAuth(data) {
  user = data;
  console.log('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
  $('.search').css("display", "block");
  $('#newtaskbutton').css("display", "block");
  $('#scrollTopButton').css("display", "block");
  $('.bottom').text("")
  update();
}

window.onload = function () {
  inputSocket();
  render();
  setInterval(function () {
    let sec = moment($('#timer').text(), 'HH:mm:ss');
    $('#timer').text(sec.add(1, 's').format('HH:mm:ss'));
  }, 1000);

  if (findGetParameter('sandbox') == 'sandbox') {
    user = {
      first_name: "sandbox",
      last_name: "sandbox",
      id: 'sandbox',
      username: 'sandbox',
      hash: 'sandbox',
      timestamp: 'sandbox'
    }
    $('.search').css("display", "block");
    $('#newtaskbutton').css("display", "block");
    $('#scrollTopButton').css("display", "block");
    $('.bottom').text("")
    update();
  }
};

function inputSocket() {
  socket.on('connect', function () {
    console.log('connected');
    $('#status').removeClass("red").html('online');
    $('#status').css("display", "none");
    update();
  });
  socket.on('disconnect', function () {
    console.log('DISCONNECT!!!');
    $('#status').addClass("red").html('offline');
    $('#status').css("display", "block");
  });
  socket.on('update', function (msg) {
    console.log("update", msg);
    if (data.timestamp) console.log('timestamp', moment(data.timestamp).format(), moment(msg.timestamp).format());
    if (!data.timestamp || moment(data.timestamp) < moment(msg.timestamp)) {
      data = msg;
      console.log("loaded");
      render();
      $('#status').removeClass("red").html('online');
    } else
      console.log('local data is younger');
  });
  socket.on('err', (val) => {
    console.log(val);
  });
}

let update = () => {
  socket.emit('load', user);
}

let newwish = (name, selected, tags, opns, priority, profit, note) => {
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
    profit,
    rank: profit,
    ready: false,
    time: clock().h + ":" + clock().m,
    date: clock().year + "-" + clock().month + "-" + clock().d,
  });
};
let save = () => {
  let inptval = $('#inputtext').val()
  if (inptval)
    inptval.trim();
  let name;
  let note = '';
  if (inptval) {
    $.each(inptval.split(/\n/), function (i, text) {
      text = text.trim();
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
    let inptags = $("#inputtags").val();
    let inpopns = $("#inputopns").val();

    let ready = $(".checkbox").prop('checked');
    let profit = $('#profit').val();
    let ppd = $('#ppd').val();

    // let priority = $("#priority option:selected").val();
    let priority = $('input[name="radioprior"]:checked').val();
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
        tgname = tgname.trim();
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
          newwish(tgname, false, [], [name], priority, 0);
        }
      }
    });
    $.each(inpopns.split(/\n/), function (i, opname) {
      // empty string check
      if (opname != "") {
        opname = opname.trim();
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
          newwish(opname, false, [name], [], priority, 0);
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
        a.profit = profit ? profit : 0;
        a.ppd = ppd ? ppd : 0;
        a.priority = priority;
        // a.timediff = moment(date + "T" + time).format('x') - moment(a.date + "T" + a.time).format('x') || a.timediff;
        // console.log(a.timediff);
        a.time = time;
        a.date = date;
      }
      a.blocked = false;
      for (let n of data.tasks) {
        for (let t of a.tags) {
          if (t.toLowerCase() == n.name.toLowerCase() && !n.ready && prioritycompare(a.priority, n.priority) >= 0) {
            a.blocked = true;
          }
        }
      }
      // if (moment().dayOfYear() > moment(a.date + "T" + a.time).dayOfYear())
      //   if (a.priority == 'second')
      //     a.priority = 'first'
    }
    sortdata();
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

let focuss = (text) => {
  for (let a of data.tasks) {
    a.focused = (a.name.toLowerCase() == text.toLowerCase())
  }
}

let focusnext = () => {
  for (let a in data.tasks) {
    if (data.tasks[a].focused) {
      data.tasks[a].focused = false;
      a = parseInt(a);
      let b = a + 1;
      // console.log(b, data.tasks[b], data.tasks[1]);
      if (data.tasks[b]) {
        data.tasks[b].focused = true;
      } else {
        data.tasks[0].focused = true;
      }
      break;
    }
  }
};
let del = (text) => {
  for (let a in data.tasks) {
    // console.log(a);
    if (data.tasks[a].name == text) {
      if (data.tasks[a].focused)
        focusnext();
      data.tasks.splice(a, 1);
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
  data.user = user;
  data.timestamp = moment();
  socket.emit('save', data);
}