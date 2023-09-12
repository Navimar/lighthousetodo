let list = {};

let setNext = (scribe, nextscribe) => {
	if (scribe !== null) {
		scribe.next = nextscribe;
		scribe.nextName = nextscribe === null ? null : nextscribe.name;
	}
};

let setPrev = (scribe, prevscribe) => {
	if (scribe !== null) {
		scribe.prev = prevscribe;
		scribe.prevName = prevscribe === null ? null : prevscribe.name;
	}
};

list.kick = (scribe) => {
	setNext(scribe.prev, scribe.next);
	setPrev(scribe.next, scribe.prev);
	return scribe;
};

list.toHead = (scribe) => {
	list.kick(scribe);

	setPrev(scribe, null);
	setNext(scribe, data.listHead);

	setPrev(data.listHead, scribe);
	data.listHead = scribe;
};

list.insertBefore = (scribe, target) => {
	list.kick(scribe);
	setPrev(scribe, target.prev);
	setNext(scribe, target);
	setNext(target.prev, scribe);
	setPrev(target, scribe);
};

list.toDate = (scribe) => {
	let cursor = data.listHead;
	console.log("head cursor", cursor.name, cursor.next.name);

	while (cursor) {
		if (
			moment().isSameOrAfter(scribe.data, "day") ||
			moment(scribe.data).isSameOrAfter(cursor.data, "day")
		) {
			list.insertBefore(scribe, cursor);
			console.log("cursor", cursor.name, cursor.next.name);
			break;
		}
		cursor = cursor.next;
	}
};
