let oldversions = () => {
    for (let a of data.tasks) {
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