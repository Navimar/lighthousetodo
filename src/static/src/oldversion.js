let oldversions = () => {
    for (let i = 0; i < data.tasks.length; i++) {
        data.listHead = data.listHead ? data.listHead : data.tasks[0]
        data.listTail = data.listTail ? data.listTail : data.tasks[data.tasks.length - 1]

        let a = data.tasks[i];
        a.next = a.next ? a.next : (data.tasks[i + 1] ? data.tasks[i + 1] : null)
        a.nextName = a.next !== null ? a.next.name : null;
        a.prev = a.prev ? a.prev : (data.tasks[i - 1] ? data.tasks[i - 1] : null);
        a.prevName = a.prev !== null ? a.prev.name : null;

        a.dip = a.dip ? a.dip : (a.rank ? a.rank : 0)
        delete a.rank
        a.linkstoNames = a.linkstoNames ? a.linkstoNames : (a.opns ? a.opns : [])
        delete a.opns
        a.linksfromNames = a.linksfromNames ? a.linksfromNames : (a.tags ? a.tags : [])
        delete a.tags
        delete a.blocks
        delete a.selected
        delete a.priorarr
        delete a.profit
        delete a.priority
        if (typeof a.target === 'string' || a.target instanceof String)
            a.target = {
                name: a.target,
                dip: a.dip
            }
    }
}
