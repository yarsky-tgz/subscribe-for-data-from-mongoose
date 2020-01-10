module.exports = {
  getKey: target => target._id,
  getCondition: target => target._id,
  getStream: (source, condition) => source.find(condition).lean().cursor(),
  getDataHandler: ({ targets, extractKey, isMultiple, targetField, sourceField, assignData, additions }) => (foreign) => {
    const target = additions.useTargetId && additions.target_id ?
      targets[additions.target_id] :
      targets[extractKey(foreign)];
    if (assignData) return assignData(target, foreign);
    if (!isMultiple) target[targetField] = foreign[sourceField];
    else (target[targetField] = target[targetField] || []).push(foreign[sourceField]);
  },
  getAddingMethod: ({
                      targets, getKey, getCondition, defaultValue, targetField, condition, foreignField, inner, additions
                    }) => {
    let isConditionSetup;

    return (target) => {
      if (additions.useTargetId) Object.assign(additions, {target_id: getKey(target)});
      Object.assign(targets, { [getKey(target)]: target });
      const itemCondition = getCondition(target);

      if (defaultValue) if (typeof defaultValue !== 'object') target[targetField] = defaultValue;
      else Object.assign(target, defaultValue);
      if (!isConditionSetup) {
        if (typeof itemCondition === 'object') condition.$or = condition.$or || inner;
        else condition[foreignField] = condition[foreignField] || { $in: inner };

        isConditionSetup = true;
      }

      inner.push(itemCondition);
    };
  },
  useTargetId: false,
};
