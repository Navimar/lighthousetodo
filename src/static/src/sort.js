let sortdata = () => {
  data.tasks.sort((a, b) => {

    if (!a.ready && b.ready && b.opns.length > 0)
      return -1;
    if (a.ready && a.opns.length > 0 && !b.ready)
      return 1;

    if (!a.blocked && b.blocked) {
      return -1
    }
    else if (a.blocked && !b.blocked) {
      return 1
    }
    if (a.blocked && b.blocked) {
      if ((a.opns.length == 0 && b.opns.length > 0))
        return -1
      if ((b.opns.length == 0 && a.opns.length > 0))
        return 1
    }

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
    if (a.priority == b.priority) {
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
      //       // if (a.rank > 0 && b.rank <= 0)
      //       //   return 1;
      //       // if (a.rank <= 0 && b.rank > 0)
      //       //   return -1;
      //       // if (a.rank > b.rank)
      //       //   return -1
      //       // else if (a.rank < b.rank)
      //       //   return 1;
      //       // if (a.profit > b.profit)
      //       //   return -1
      //       // else if (a.profit < b.profit)
      //       //   return 1
      if (elder(a.opns) < elder(b.opns))
        return -1
      else if (elder(a.opns) > elder(b.opns))
        return 1
      if ((a.opns.length > b.opns.length)) {
        return -1
      }
      else if (a.opns.length < b.opns.length) {
        return 1
      }
      if (a.tags.length > b.tags.length) {
        return -1
      }
      else if (a.tags.length < b.tags.length) {
        return 1
      }
      if (a.tags[0] && b.tags[0] && (a.tags[0].localeCompare(b.tags[0]) < 0)) {
        return -1
      }
      else if (a.tags[0] && b.tags[0] && (a.tags[0].localeCompare(b.tags[0]) > 0)) {
        return 1
      }
      if (a.name.length >= b.name.length) {
        return 1;
      }
      else if (a.name.length < b.name.length) {
        return -1;
      }
    }
    else
      return prioritycompare(a.priority, b.priority);
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

elder = parr => {
  let champion = 11;
  parr.forEach(e => {
    for (let a of data.tasks) {
      if (a.name == e)
        e = a.priority;
    }
    e = trans(e)
    if (e < champion)
      champion = e;
  });
  return champion;
}