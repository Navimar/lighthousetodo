let sortdata = () => {
  data.tasks.sort((a, b) => {

    if (!a.ready && b.ready)
      return -1;
    if (a.ready && !b.ready)
      return 1;

    if ((a.linksfrom.length == 0 || a.linksfrom.every(e => e.ready === true) || b.vip) && (b.linksfrom.some(b => b.ready === false) && !b.vip))
      return -1
    if ((b.linksfrom.length == 0 || b.linksfrom.every(e => e.ready === true) || b.vip) && (a.linksfrom.some(a => a.ready === false) && !b.vip))
      return 1


    let ad = moment(a.date);
    let bd = moment(b.date);
    if (ad.diff(moment()) < 0) {
      ad = moment();
    }
    if (bd.diff(moment()) < 0) {
      bd = moment();
    }
    if (ad.isBefore(b.date, 'year')) {
      return -1
    }
    else if (bd.isBefore(a.date, 'year')) {
      return 1
    }
    if (ad.isBefore(b.date, 'month')) {
      return -1
    }
    else if (bd.isBefore(a.date, 'month')) {
      return 1
    }
    else if (ad.isBefore(b.date, 'day')) {
      return -1
    }
    else if (bd.isBefore(a.date, 'day')) {
      return 1
    }


    let adip = a.target ? a.target.dip : a.dip
    let bdip = b.target ? b.target.dip : b.dip

    if (parseInt(adip) > parseInt(bdip))
      return 1
    if (parseInt(bdip) > parseInt(adip))
      return -1

    if (moment() <= moment(a.date + "T" + a.time) && moment() > moment(b.date + "T" + b.time))
      return 1;
    if (moment() > moment(a.date + "T" + a.time) && moment() <= moment(b.date + "T" + b.time))
      return -1;
    if (moment() < moment(a.date + "T" + a.time) && moment() < moment(b.date + "T" + b.time)) {
      if (moment(a.date + "T" + a.time) > moment(b.date + "T" + b.time)) {
        return 1;
      }
      else if (moment(a.date + "T" + a.time) < moment(b.date + "T" + b.time)) {
        return -1;
      }
    }


    if (a.linksfromNames.length > b.linksfromNames.length) {
      return -1
    }
    else if (a.linksfromNames.length < b.linksfromNames.length) {
      return 1
    }
    if (moment(a.date + "T" + a.time) > moment(b.date + "T" + b.time)) {
      return 1;
    }
    else if (moment(a.date + "T" + a.time) < moment(b.date + "T" + b.time)) {
      return -1;
    }
    if ((a.linkstoNames.length > b.linkstoNames.length)) {
      return -1
    }
    else if (a.linkstoNames.length < b.linkstoNames.length) {
      return 1
    }
    if (a.linksfromNames[0] && b.linksfromNames[0] && (a.linksfromNames[0].localeCompare(b.linksfromNames[0]) < 0)) {
      return -1
    }
    else if (a.linksfromNames[0] && b.linksfromNames[0] && (a.linksfromNames[0].localeCompare(b.linksfromNames[0]) > 0)) {
      return 1
    }
    if (a.name.length > b.name.length) {
      return 1;
    }
    else if (a.name.length < b.name.length) {
      return -1;
    }
    if (a.name >= b.name) {
      return 1;
    }
    else if (a.name < b.name) {
      return -1;
    }
  })
};

let trans = (x) => {
  if (x == 'first')
    return 1;
  if (x == 'second')
    return 2;
  if (x == 'third')
    return 3;
  if (x == 'forth')
    return 4;
  if (x == 'fifth')
    return 5;
  if (x == 'sixth')
    return 6;
  if (x == 'seventh')
    return 7;
  if (x == 'eighth')
    return 8;
  if (x == 'ninth')
    return 9;
  if (x == 'tenth')
    return 10;
  if (x == 'eleventh')
    return 11;
}

let retrans = (x) => {
  if (x == 1)
    return 'first';
  if (x == 2)
    return 'second';
  if (x == 3)
    return 'third';
  if (x == 4)
    return 'forth';
  if (x == 5)
    return 'fifth';
  if (x == 6)
    return 'sixth';
  if (x == 7)
    return 'seventh';
  if (x == 8)
    return 'eighth';
  if (x == 9)
    return 'ninth';
  if (x == 10)
    return 'tenth';
  if (x == 11)
    return 'eleventh';
}
let prioritycompare = (a, b) => {

  return trans(a) - trans(b);
}

let elder = (a, b) => {
  if (!a.priorarr || a.priorarr.length == 0)
    a.priorarr = [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,];
  if (!b.priorarr || b.priorarr.length == 0)
    b.priorarr = [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,];
  a = [...a.priorarr]
  b = [...b.priorarr]
  let amin = 99
  let bmin = 99
  let ai = 0
  let bi = 0

  while (amin == bmin && ai == bi && a.length > 0 && b.length > 0) {
    amin = 99
    bmin = 99
    ai = 0
    bi = 0
    for (let i = 0; i < a.length; i++) {
      if (a[i] < amin) {
        amin = a[i]
        ai = i;
      }
      if (b[i] < bmin) {
        bmin = b[i]
        bi = i;
      }
    }
    a.splice(ai, 1)
    b.splice(bi, 1)
  }
  if (amin == bmin)
    return (ai - bi)
  return amin - bmin
}