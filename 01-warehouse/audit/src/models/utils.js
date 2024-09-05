// @ts-check

const where = (
  /** @type {{[key: string]: {condition: (idx: number) => string, value: (value: any) => any}}} */
  rules,
  /** @type {{[key: string]: any}|undefined} */
  filter,
) => {
  const selection = [];
  const args = [];

  if (!filter) {
    return {
      selection,
      args,
    };
  }

  Object.entries(rules).forEach(([field, { condition, value }]) => {
    if (!filter[field]) {
      return;
    }

    selection.push(condition(args.length + 1));
    args.push(value(filter[field]));
  });

  return {
    selection,
    args,
  };
};

module.exports = {
  where,
};
