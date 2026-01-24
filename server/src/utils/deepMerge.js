/**
 * Deep merge utility for merging profile update data with existing profile data.
 * Updates only the fields that are provided in the update object,
 * preserving existing data that isn't being modified.
 */

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects. The update object values take precedence.
 * Arrays are replaced entirely (not merged).
 * Null values in update will clear the target value.
 *
 * @param {Object} target - The original object (existing profile data)
 * @param {Object} update - The object with updates to apply
 * @returns {Object} - A new merged object
 */
function deepMerge(target, update) {
  const output = { ...target };

  if (isObject(target) && isObject(update)) {
    Object.keys(update).forEach((key) => {
      const updateValue = update[key];
      const targetValue = target[key];

      // If update value is null, set it explicitly (allows clearing values)
      if (updateValue === null) {
        output[key] = null;
      }
      // If both are objects, recurse
      else if (isObject(updateValue) && isObject(targetValue)) {
        output[key] = deepMerge(targetValue, updateValue);
      }
      // Arrays are replaced entirely
      else if (Array.isArray(updateValue)) {
        output[key] = [...updateValue];
      }
      // Otherwise, use the update value
      else {
        output[key] = updateValue;
      }
    });
  }

  return output;
}

/**
 * Extracts the differences between two objects (what changed).
 * Useful for audit logging and showing users what was updated.
 *
 * @param {Object} original - The original object
 * @param {Object} updated - The updated object
 * @returns {Object} - Object containing only the changed fields with before/after values
 */
function extractChanges(original, updated) {
  const changes = {};

  function compareObjects(orig, upd, path = '') {
    const allKeys = new Set([...Object.keys(orig || {}), ...Object.keys(upd || {})]);

    allKeys.forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;
      const origValue = orig?.[key];
      const updValue = upd?.[key];

      // Skip if values are identical
      if (JSON.stringify(origValue) === JSON.stringify(updValue)) {
        return;
      }

      // If both are objects (not arrays), recurse
      if (isObject(origValue) && isObject(updValue)) {
        compareObjects(origValue, updValue, fullPath);
      } else {
        // Value changed - record it
        changes[fullPath] = {
          before: origValue,
          after: updValue
        };
      }
    });
  }

  compareObjects(original, updated);
  return changes;
}

module.exports = { deepMerge, extractChanges };
