const snapshotOptions = {
	serializers: [
		(value) => {
			if (typeof value === "string") return value;
		}
	]
};

export { snapshotOptions };
