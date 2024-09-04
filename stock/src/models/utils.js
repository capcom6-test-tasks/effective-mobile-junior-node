// @ts-check

const where = (
    /** @type {{[key: string]: {condition: (idx: number) => string, value: (value: any) => any}}} */
    rules,
    /** @type {{[key: string]: any}|undefined} */
    filter
) => {
    const selection = [];
    const args = [];

    if (!filter) {
        return {
            selection,
            args,
        };
    }

    for (const [field, { condition, value }] of Object.entries(rules)) {
        if (!filter[field]) {
            continue;
        }

        selection.push(condition(args.length + 1));
        args.push(value(filter[field]));
    }

    return {
        selection,
        args,
    };
};

module.exports = {
    where,
};
