let sortdata = () => {
  data.tasks.sort((a, b) => {

    if (!a.ready && b.ready && b.opns.length > 0)
      return -1;
    if (a.ready && a.opns.length > 0 && !b.ready)
      return 1;
    if (!a.blocked && b.blocked && !b.ready) {
      return -1
    }
    else if (a.blocked && !a.ready && !b.blocked) {
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
    if (ad.year() > bd.year()) {
      return 1
    }
    else if (ad.year() < bd.year()) {
      return -1
    }
    else if (ad.dayOfYear() > bd.dayOfYear()) {
      return 1
    }
    else if (ad.dayOfYear() < bd.dayOfYear()) {
      return -1
    }
    else if (a.priority == b.priority) {
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
      if (a.rank > 0 && b.rank <= 0)
        return 1;
      if (a.rank <= 0 && b.rank > 0)
        return -1;
      if (a.rank > b.rank)
        return -1
      else if (a.rank < b.rank)
        return 1;
      if (a.profit > b.profit)
        return -1
      else if (a.profit < b.profit)
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
      if (isReady(a.date, a.time) < isReady(b.date, b.time))
        return 1
      else if (isReady(a.date, a.time) > isReady(b.date, b.time))
        return -1
      if (moment(a.date + "T" + a.time) > moment(b.date + "T" + b.time)) {
        return 1;
      }
      else if (moment(a.date + "T" + a.time) < moment(b.date + "T" + b.time)) {
        return -1;
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

let prioritycompare = (a, b) => {
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
  return trans(a) - trans(b);
}