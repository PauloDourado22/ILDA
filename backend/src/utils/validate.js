export function isNonEmptyString(value, maxLength = 500) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}
