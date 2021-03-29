let sortdata = () => {
  data.tasks.sort((a, b) => {
    if ((!a.blocked && b.blocked)) {
      return -1
    }
    else if (a.blocked && !b.blocked) {
      return 1
    }
    // if ((!a.ready && b.ready)) {
    //   return -1
    // }
    // else if (a.ready && !b.ready) {
    //   return 1
    // }

    let ad = moment(a.date);
    let bd = moment(b.date);
    if (ad.diff(moment()) < 0) {
      ad = moment();
    }
    if (bd.diff(moment()) < 0) {
      bd = moment();
      // if (b.priority == 'first')
      //   b.priority = 'third'
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
      if (a.priority == 'first') {
        if (moment(a.date + "T" + a.time) > moment(b.date + "T" + b.time)) {
          return 1;
        }
        else if (moment(a.date + "T" + a.time) < moment(b.date + "T" + b.time)) {
          return -1;
        }
      }
      if (a.tags.length > b.tags.length) {
        return -1
      }
      else if (a.tags.length < b.tags.length) {
        return 1
      }
      if (a.tags[0] && b.tags[0] && (a.tags[0].localeCompare(b.tags[0]) > 0)) {
        return -1
      }
      else if (a.tags[0] && b.tags[0] && (a.tags[0].localeCompare(b.tags[0]) < 0)) {
        return 1
      }
      if ((a.opns.length > b.opns.length)) {
        return -1
      }
      else if (a.opns.length < b.opns.length) {
        return 1
      }
      if (a.name.length >= b.name.length) {
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
    else if (a.priority == 'eleventh') {
      return -1
    }
    else if (b.priority == 'eleventh') {
      return 1
    }

  })
};