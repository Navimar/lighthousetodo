const socket = io();
let data = {};
let user;
let foucusstimer = 0;
let selected = { i: - 1, day: moment().format('YYYY-MM-DD') };
let searchlock = false;
data.timestamp = 0;
let g_start = 0
let cn = 0


function onTelegramAuth(data) {
  user = data;
  console.log('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
  $('.search').css("display", "block");
  $('#newtaskbutton').css("display", "block");
  $('#scrollTopButton').css("display", "block");
  // $('.bottom').text("")
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
    // $('.bottom').text("")
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
      oldversions();
      focusfisrt();
      makelinks();
      render();
      $('#status').removeClass("red").html('online');
    } else
      console.log('local data is younger');
  });
  socket.on('event', function (msg) {
    console.log(msg.event, msg.data)
  });

  socket.on('err', (val) => {
    console.log(val);
  });
}

let update = () => {
  socket.emit('load', user);
}

let uniqueName = (name) => {
  name = name ? name : 'Новая запись'
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
  return name
}

let newwish = (name, dip, linksfromNames, linkstoNames, date, note,) => {
  name = uniqueName(name)
  data.tasks.unshift({
    name,
    note: note || '',
    linksfromNames: linksfromNames || [],
    linkstoNames: linkstoNames || [],
    dip: dip || 1,
    ready: false,
    time: clock().h + ":" + clock().m,
    date: date || selected.day,
    // clock().year + "-" + clock().month + "-" + clock().d,
    target: {
      dip: dip || 1,
      name
    },
  });
  makelinks(data.tasks[0]);
}

let makelinks = (task) => {
  if (!task)
    for (let task of data.tasks) {
      task.linksto = [];
      for (let t = 0; t < task.linkstoNames.length; t++) {
        let scribe = note_by_name(task.linkstoNames[t])
        if (scribe) task.linksto.push(scribe)
      }
      task.linksfrom = [];
      for (let t = 0; t < task.linksfromNames.length; t++) {
        let scribe = note_by_name(task.linksfromNames[t])
        if (scribe) task.linksfrom.push(scribe)
      }
    }
  else {
    task.linksto = [];
    for (let t = 0; t < task.linkstoNames.length; t++) {
      let scribe = note_by_name(task.linkstoNames[t])
      if (scribe) task.linksto.push(scribe)
    }
    task.linksfrom = [];
    for (let t = 0; t < task.linksfromNames.length; t++) {
      let scribe = note_by_name(task.linksfromNames[t])
      if (scribe) task.linksfrom.push(scribe)
    }
  }
}

let findtarget = (a, level) => {
  let target = a
  level = level ? level : 0;
  for (let linkto of a.linksto) {
    if (level < 12) {
      let child = findtarget(linkto, level + 1);
      if (parseInt(child.dip) <= parseInt(target.dip)
        && moment().isSameOrAfter(moment(child.date + "T" + child.time), 'day')
        && !child.situational
      ) {
        target = child
      }
    }
  }
  a.target = {
    name: target.name,
    dip: target.dip,
  }
  return target
}


let findancestors = (a) => {
  findancestors.ancestors.push(a);
  for (let t = 0; t < a.linksfromNames.length; t++) {
    findancestors(note_by_name(a.linksfromNames[t]))
  }
}

let squeezeout = () => {
  for (let a of data.tasks) {
    if (!a.selected && a.dip >= selected.scribe.dip) {
      a.dip++;
    }
  }
  for (let a of data.tasks) {
    findtarget(a)
  }
}
let save = () => {
  if (selected.i == -1)
    return
  let inptval = $('#inputtext').val()
  let dip = parseInt($('#dip').val())
  if (dip <= 0)
    dip = 1
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
      return deletescribe(name);
    }
    let inptags = $("#inputtags").val();
    let inpopns = $("#inputopns").val();

    let ready = $(".checkboxready").prop('checked');
    if (!inpopns || inpopns.length == 0) {
      ready = false;
    }
    let vip = $(".checkboxvip").prop('checked');
    let situational = $(".checkboxdip").prop('checked');

    let tags = [];
    $.each(inptags.split(/\n/), function (i, tgname) {
      tgname = tgname.trim();
      if (tgname != "" && tgname != name) {
        tags.push(tgname);
      }
    });
    let opns = [];
    $.each(inpopns.split(/\n/), function (i, opname) {
      opname = opname.trim();
      if (opname != "" && opname != name) {
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
        if (selected.scribe != a && a.name.toLowerCase() == name.toLowerCase()) {
          name += '!';
          ok = true;
          break;
        }
      }
    }

    let hero = {};
    let blocks = [];

    for (let a of data.tasks) {
      if (!a.blocks)
        a.blocks = []
      if (a.readytill && moment(a.date + "T" + a.time).isSameOrBefore(moment())) {
        a.ready = false
        a.readytill = false
      }
      if (selected.scribe == a && inptval) {
        hero = a;
        a.name = name;
        a.note = note;
        a.linksfromNames = tags;
        a.linkstoNames = opns;
        a.ready = ready;
        if (ready && moment(a.date + "T" + a.time).isAfter(moment())) {
          a.readytill = true
        }
        a.vip = vip;
        a.situational = situational;
        a.time = time;
        a.date = date;
        a.dip = dip;
      }
      for (let t in a.linksfromNames) {
        if (a.linksfromNames[t].toLowerCase() == selected.text.toLowerCase()) {
          a.linksfromNames.splice(t, 1);
        }
      }

      for (let t in a.linkstoNames) {
        if (a.linkstoNames[t].toLowerCase() == selected.text.toLowerCase()) {
          a.linkstoNames.splice(t, 1);
        }
      }

      tags.forEach((tag) => {
        if (a.name.toLowerCase() == tag.toLowerCase()) {
          newscribestags.splice(newscribestags.indexOf(tag), 1);
          if (a.linkstoNames && a.linkstoNames.indexOf(name) === -1) {
            a.linkstoNames.push(name);
          }
          if (!a.ready)
            blocks.push(a.name);
        }
      });
      if (a.linkstoNames.length == 0)
        a.ready = false;
      opns.forEach((opn) => {
        if (a.name.toLowerCase() == opn.toLowerCase()) {
          newscribesopns.splice(newscribesopns.indexOf(opn), 1);
          if (a.linksfromNames && a.linksfromNames.indexOf(name) === -1) {
            a.linksfromNames.push(name);
          }
        }
      });
    }

    newscribestags.forEach((txt) => {
      newwish(txt, dip, [], [name],);
    });
    newscribesopns.forEach((txt) => {
      newwish(txt, dip, [name], [],);
    });
    makelinks(hero);

    findancestors.ancestors = [];
    findancestors(hero);
    let ancestors = [... new Set(findancestors.ancestors)]
    for (let a of ancestors) {
      findtarget(a)
    }
    sortdata();
  }
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
  let success = false
  let same = false
  if (text == selected.text) {
    same = true
    success = true
  }
  selected.text = false;
  selected.i = -1;
  selected.scribe = false;

  if (!same)
    for (let i in data.tasks) {
      if (data.tasks[i].name.toLowerCase() == text.toLowerCase()) {
        let element = data.tasks.splice(i, 1)[0]; // выбираем элемент с индексом 3

        // Удалить задачу с текущей позиции
        data.tasks.splice(i, 1);

        // Вставить задачу на новую позицию
        data.tasks.splice(g_start, 0, element);
        let newindex = data.tasks.indexOf(element)
        selected.scribe = data.tasks[newindex];
        let date = data.tasks[newindex].date;
        if (moment().isAfter(date, 'day'))
          date = moment().format('YYYY-MM-DD')
        selected.day = date
        selected.text = text;
        selected.i = 0;
        success = true
      }
    }
  sortdata();
  focusfisrt();
  return success
}

let focusfisrt = () => {
  let ok = true;
  let z = false
  let hero = false;
  for (let a in data.tasks) {
    if (data.tasks[a].focused) {
      z = a;
      data.tasks[a].focused = false;
    }
    if (!isFuture(data.tasks[a].date, data.tasks[a].time) && ok) {
      ok = false;
      data.tasks[a].focused = true
      // console.log(data.tasks[a])
      hero = data.tasks[a].name;
      if (z != a)
        foucusstimer = 0;
    }
  }
  return hero;
}

let deletescribe = (text) => {
  let ancestors = [];
  for (let a in data.tasks) {
    if (data.tasks[a].name == text) {
      let hero = data.tasks[a];
      findancestors.ancestors = [];
      findancestors(hero);
      ancestors = [... new Set(findancestors.ancestors)]
      data.tasks.splice(a, 1);
    }
    for (let t in data.tasks[a].linksfromNames) {
      if (data.tasks[a].linksfromNames[t] == text) {
        data.tasks[a].linksfromNames.splice(t, 1);
      }
    }
    for (let t in data.tasks[a].linksfrom) {
      if (data.tasks[a].linksfrom[t].name == text) {
        data.tasks[a].linksfrom.splice(t, 1);
      }
    }
    for (let t in data.tasks[a].linkstoNames) {
      if (data.tasks[a].linkstoNames[t] == text) {
        data.tasks[a].linkstoNames.splice(t, 1);
      }
    }
    for (let t in data.tasks[a].linksto) {
      if (data.tasks[a].linksto[t].name == text) {
        data.tasks[a].linksto.splice(t, 1);
      }
    }
    if (data.tasks[a].linkstoNames.length == 0)
      data.tasks[a].ready = false;
  }

  for (let a of ancestors) {
    findtarget(a)
  }
  sortdata();
  focusfisrt();
};

let send = () => {
  let sentdata = {
    user: user,
    timestamp: moment(),
    tasks: data.tasks.map(({ linksto, linksfrom, ...rest }) => rest),
  }
  socket.emit('save', sentdata);
}

// let sendevents = () => {
//   eventarr
//   socket.emit('save', data);
// }