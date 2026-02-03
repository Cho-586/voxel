import type { BaseSchema, Constraint, ConstraintObj } from "./types";

export const formatKey = (str: string): string =>
  str.replace(/[A-Z]/g, (l: string) => `_${l.toLowerCase()}`);

const deriveOpType = (key: string): string =>
  ["minLength", "maxLength"].includes(key)
    ? "length"
    : ["min", "max"].includes(key)
      ? "range"
      : "pattern";

export function generateConstraints(
  options: Record<string, Constraint>,
): ConstraintObj<any>[] {
  return Object.entries(options).map(([key, value]) => {
    return {
      kind: "constraint",
      type: deriveOpType(key),
      name: formatKey(key),
      value: Array.isArray(value) ? value[0] : value,
      ...(Array.isArray(value) ? { message: value[1] } : {}),
    };
  });
}
