const socket = io();
let data = {};
let user;
let foucusstimer = 0;
let selected = { i: - 1 };
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
    foucusstimer++;
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
      focusfisrt();
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
  let run = false;
  let ok = true;
  while (ok) {
    ok = false;
    for (let a of data.tasks) {
      if (a.name.toLowerCase() == name.toLowerCase()) {
        name += '!';
        ok = true;
        run = true
        break;
      }
    }
  }
  if (run)
    return;
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
  if (selected.i == -1)
    return

  let countweight = (a, level) => {
    a.future = moment(a.date + ' ' + a.time).diff(moment(), 'minutes') <= 5 ? 0 : 1;
    let profit = parseInt(a.profit) + moment().diff(moment(a.date), 'days') * a.ppd
    let weight = profit;
    if (a.priority == 'tenth' || a.ready)
      weight = 0;
    if (!level) level = 0;
    if (a.tags && a.tags.length > 0) {
      for (let t = 0; t < a.tags.length; t++) {
        let tag = note_by_name(a.tags[t])
        if (level < 12) {
          let re = countweight(tag, level + 1)
          weight += re.weight;
          if (re.future)
            a.future = true;
        }
      }
    }
    if (a.priority == 'tenth' || a.ready)
      return {
        weight: weight, future: false
      }
    return {
      weight: Math.min(weight, profit), future: a.future
    }
  }

  let countrank = (a, level) => {
    let rank = parseInt(a.weight);
    let target = a.name;
    let future = a.future;
    if (!level) level = 0;
    if (a.opns && a.opns.length > 0) {
      for (let t = 0; t < a.opns.length; t++) {
        let opn = note_by_name(a.opns[t])
        if (level < 12) {
          let r = countrank(opn, level + 1);
          if (r.rank > rank && r.rank > 0 && (r.future == false)) {
            target = r.target;
            rank = r.rank;
          }
        }
      }
    }
    return { rank, target, future };
  }

  let inptval = $('#inputtext').val()
  let name;
  let note = '';
  if (inptval) {
    inptval.trim();
    $.each(inptval.split(/\n/), function (i, text) {
      text = text.trim();
      if (i == 0) {
        name = text;
        if (text == '') {
          name = 'новая запись';
        }
      }
      else if (i == 1) {
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
    $.each(inptags.split(/\n/), function (i, tgname) {
      if (tgname != "") {
        tgname = tgname.trim();
        tags.push(tgname);
      }
    });
    let opns = [];
    $.each(inpopns.split(/\n/), function (i, opname) {
      if (opname != "") {
        opname = opname.trim();
        opns.push(opname);
      }
    });
    let newscribestags = tags.slice();
    let newscribesopns = opns.slice();


    let time = $("#time").val();
    if (!time) {
      time = clock().h + ":" + clock().m;
    }
    let date = $("#date").val();
    if (!date)
      date = clock().year + "-" + clock().month + "-" + clock().d;
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
      if (a.selected && inptval) {
        a.name = name;
        a.note = note;
        a.tags = tags;
        a.opns = opns;
        a.ready = ready;
        a.profit = profit ? profit : 0;
        a.ppd = ppd ? ppd : 0;
        a.priority = priority;
        a.time = time;
        a.date = date;
      }
      for (let t in a.tags) {
        if (a.tags[t].toLowerCase() == selected.text.toLowerCase()) {
          a.tags.splice(t, 1);
        }
      }

      for (let t in a.opns) {
        if (a.opns[t].toLowerCase() == selected.text.toLowerCase()) {
          a.opns.splice(t, 1);
        }
      }

      tags.forEach((tag) => {
        if (a.name.toLowerCase() == tag.toLowerCase()) {
          newscribestags.splice(newscribestags.indexOf(tag), 1);
          if (a.opns && a.opns.indexOf(name) === -1) {
            a.opns.push(name);
          }
        }
      });

      opns.forEach((opn) => {
        if (a.name.toLowerCase() == opn.toLowerCase()) {
          newscribesopns.splice(newscribesopns.indexOf(opn), 1);
          if (a.tags && a.tags.indexOf(name) === -1) {
            a.tags.push(name);
          }
        }
      });

    }
    newscribestags.forEach((txt) => {
      newwish(txt, false, [], [name], priority, 0);
    });
    newscribesopns.forEach((txt) => {
      newwish(txt, false, [name], [], priority, 0);
    });

    for (let a of data.tasks) {
      a.blocked = false;
      for (let n of data.tasks) {
        for (let t of a.tags) {
          if (t.toLowerCase() == n.name.toLowerCase() && !n.ready
            && prioritycompare(a.priority, n.priority) >= -1
          ) {
            a.blocked = true;
          }
        }
      }
      // a.weight = countweight(a).weight;
      // let r = countrank(a);
      // a.rank = r.rank;
      // a.target = r.target;
    }
    sortdata();
    focusfisrt();
  }
};

let note_by_name = (name) => {
  for (let a of data.tasks)
    if (a.name.toLowerCase() == name.toLowerCase())
      return a;
}

let select = (text) => {
  selected.text = false;
  selected.i = -1;
  for (let i in data.tasks) {
    if (data.tasks[i].selected && data.tasks[i].name.toLowerCase() == text.toLowerCase())
      data.tasks[i].selected = false
    else {
      data.tasks[i].selected = (data.tasks[i].name.toLowerCase() == text.toLowerCase())
      if (data.tasks[i].selected) {
        selected.text = text;
        selected.i = i;
      }
    }
  }
};

// let focuss = (text) => {
//   foucusstimer = 0;
//   for (let a of data.tasks) {
//     a.focused = (a.name.toLowerCase() == text.toLowerCase())
//   }
// }

let focusfisrt = () => {
  let ok = true;
  let z = false
  for (let a in data.tasks) {
    if (data.tasks[a].focused) {
      z = a;
      data.tasks[a].focused = false;
    }
    if (!isFuture(data.tasks[a].date, data.tasks[a].time) && ok) {
      ok = false;
      data.tasks[a].focused = true
      if (z != a)
        foucusstimer = 0;
    }
  }
}

let del = (text) => {
  for (let a in data.tasks) {
    // console.log(a);
    if (data.tasks[a].name == text) {
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
  for (let a of data.tasks) {
    a.blocked = false;
    for (let n of data.tasks) {
      for (let t of a.tags) {
        if (t.toLowerCase() == n.name.toLowerCase() && !n.ready
          && prioritycompare(a.priority, n.priority) >= -1
        ) {
          a.blocked = true;
        }
      }
    }
  }
  sortdata();
  focusfisrt();
};

let send = () => {
  data.user = user;
  data.timestamp = moment();
  socket.emit('save', data);
}