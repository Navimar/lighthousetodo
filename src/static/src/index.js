const socket = io();
let data = {};
let user;
let foucusstimer = 0;
let selected = { i: - 1 };
data.timestamp = 0;
let cn = 0


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

let newwish = (name, selected, tags, blocks, opns, priority, profit, note) => {
  let run = false;
  let ok = true;
  while (ok) {
    ok = false;
    for (let a of data.tasks) {
      cn++
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
  if (!blocks)
    blocks = [];
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
    blocks,
    opns,
    selected,
    priority,
    profit,
    priorarr: [],
    rank: profit,
    ready: false,
    time: clock().h + ":" + clock().m,
    date: clock().year + "-" + clock().month + "-" + clock().d,
  });
};
let countpriorarr = (a, level) => {
  if (!level) level = 0;
  if (a.opns && a.opns.length > 0) {
    for (let t = 0; t < a.opns.length; t++) {
      let opn = note_by_name(a.opns[t])
      if (level < 12) {
        countpriorarr(opn, level + 1);
      }
    }
  }
  if (!moment().isBefore(moment(a.date + "T" + a.time), 'day') || a.blocks.length == 0)
    if (!a.ready && trans(a.priority) < countpriorarr.priorarr[level])
      countpriorarr.priorarr[level] = trans(a.priority);
}

let findancestors = (a) => {
  findancestors.ancestors.push(a);
  for (let t = 0; t < a.tags.length; t++) {
    findancestors(note_by_name(a.tags[t]))
  }
}
let save = () => {
  if (selected.i == -1)
    return
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
        // cn++
        if (!a.selected && a.name.toLowerCase() == name.toLowerCase()) {
          name += '!';
          ok = true;
          break;
        }
      }
    }

    let hero = {};
    let blocks = [];
    for (let a of data.tasks) {
      // cn++ 
      if (!a.blocks)
        a.blocks = []
      if (a.selected && inptval) {
        hero = a;
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

      for (let b in a.blocks) {
        if (a.blocks[b].toLowerCase() == selected.text.toLowerCase()) {
          a.blocks.splice(b, 1);
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
          if (!a.ready)
            blocks.push(a.name);
        }
      });

      opns.forEach((opn) => {
        if (a.name.toLowerCase() == opn.toLowerCase()) {
          newscribesopns.splice(newscribesopns.indexOf(opn), 1);
          if (a.tags && a.tags.indexOf(name) === -1) {
            a.tags.push(name);
            if (!ready)
              a.blocks.push(name);
          }
        }
      });
    }
    hero.blocks = blocks;
    newscribestags.forEach((txt) => {
      hero.blocks.push(txt);
      newwish(txt, false, [], [], [name], priority, 0);
    });
    newscribesopns.forEach((txt) => {
      if (ready)
        newwish(txt, false, [name], [], [], priority, 0);
      if (!ready) {
        newwish(txt, false, [name], [name], [], priority, 0);
      }
    });

    findancestors.ancestors = [];
    findancestors(hero);
    let ancestors = [... new Set(findancestors.ancestors)]
    for (let a of ancestors) {
      countpriorarr.priorarr = [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,];
      countpriorarr(a);
      a.priorarr = countpriorarr.priorarr;
    }
    sortdata();
    focusfisrt();
  }
  console.log(cn);
  cn = 0;
};

let note_by_name = (name) => {
  for (let a of data.tasks) {
    // cn++
    if (a.name.toLowerCase() == name.toLowerCase())
      return a;
  }
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
    for (let t in data.tasks[a].blocks) {
      if (data.tasks[a].blocks[t] == text) {
        data.tasks[a].blocks.splice(t, 1);
      }
    }
    for (let t in data.tasks[a].opns) {
      if (data.tasks[a].opns[t] == text) {
        data.tasks[a].opns.splice(t, 1);
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