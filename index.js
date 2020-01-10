module.exports = {
  getKey: target => target._id,
  getCondition: target => target._id,
  getStream: (source, condition) => source.find(condition).lean().cursor(),
  getDataHandler: ({ targets, extractKey, isMultiple, targetField, sourceField, assignData }) => (foreign) => {
    const target = targets[extractKey(foreign)];

    if (assignData) return assignData(target, foreign);
    if (!isMultiple) target[targetField] = foreign[sourceField];
    else (target[targetField] = target[targetField] || []).push(foreign[sourceField]);
  },
  getAddingMethod: ({
    targets, getKey, getCondition, defaultValue, targetField, condition, foreignField, inner,
  }) => {
    let isConditionSetup;

    return (target) => {
      Object.assign(targets, { [getKey(target)]: target });
      const itemCondition = getCondition(target);

      if (typeof defaultValue !== 'undefined') if (typeof defaultValue !== 'object') target[targetField] = defaultValue;
      else Object.assign(target, defaultValue);
      if (!isConditionSetup) {
        if (typeof itemCondition === 'object') condition.$or = condition.$or || inner;
        else condition[foreignField] = condition[foreignField] || { $in: inner };

        isConditionSetup = true;
      }

      inner.push(itemCondition);
    };
  },
};
