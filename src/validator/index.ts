import type { ConstraintObj, InferInput } from "../primitives/types";
import type { VoxelIssue, VoxelSchema, VoxelValidationResult } from "./types";

export function validate<const C extends VoxelSchema>(
  schema: C,
  input: InferInput<C> | (unknown & {}),
): VoxelValidationResult<C> {
  return _validate(schema as any, input, []);
}

function _validate(
  schema: VoxelSchema & { constraints: ConstraintObj[] },
  input: unknown,
  path: (string | number)[],
) {
  let issues: VoxelIssue[] = [];

  /* --- Type errors --- */
  const getInputType = () => (Array.isArray(input) ? "array" : typeof input);
  // if (schema === undefined) return;
  if (
    !(
      schema.type === "array" ||
      schema.type === "object" ||
      schema.type === "enum" ||
      schema.type === "phantom"
    )
  ) {
    if (typeof input !== schema.type) {
      issues.push({
        path: [...path],
        code: "invalid_type",
        message: schema.message
          ? schema.message
          : `Expected ${schema.type} but received ${getInputType()}`,
        expected: schema.type,
        recieved: input,
      });
    }
  } else {
    if (schema.type === "enum" && !schema.values.includes(input)) {
      issues.push({
        path: [...path],
        code: "invalid_value",
        message: schema.message
          ? schema.message
          : `Received ${getInputType()} but expected ${schema.values.length > 1 && "either "}${schema.values.join(" or ")}`,
        expected: `Values: ${schema.values.join(", ")}`,
        recieved: input,
      });
    } else if (schema.type === "array") {
      if (getInputType() !== "array") {
        issues.push({
          path: [...path],
          code: "invalid_type",
          message: schema.message
            ? schema.message
            : `Expected array but received ${getInputType()}`,
          expected: "array",
          recieved: input,
        });
      }
      if (schema.shape) {
        if (Array.isArray(input)) {
          input.forEach((i, index) => {
            issues = [
              ...issues,
              ..._validate(schema.shape, i, [...path, index]).issues,
            ];
          });
        }
      }
    } else if (schema.type === "object") {
      // Object.entries(schema.fields).forEach(([key, value]: [string, any]) => {
      //   if (
      //     Object.keys(schema.fields).includes(
      //       (input as Record<string, unknown>)[key] as string,
      //     )
      //   ) {
      //     issues.push({
      //       path: [key],
      //       code: "unknown_field",
      //       message: `This schema only expects fields: ${Object.keys(schema.fields).join(", ")}`,
      //     });
      //   }
      //   issues = [
      //     ...issues,
      //     ..._validate(value, (input as Record<string, unknown>)[key], [key])
      //       .issues,
      //   ];
      // });
      if (typeof input !== "object") {
        issues.push({
          path: [...path],
          code: "invalid_type",
          message: `Expected ${schema.type} but received ${getInputType()}`,
        });
      } else {
        Object.entries(schema.fields).forEach(([key, v]: [string, any]) => {
          const value = v as Record<string, unknown>;
          if (
            value.optional === false &&
            !Object.keys(input as Record<string, any>).includes(key)
          ) {
            issues.push({
              path: [...path, key],
              code: "missing_required_field",
              message: `Field: ${key} missing in input`,
              expected: `Field: ${key}`,
              recieved: undefined,
            });
          }
        });
        Object.entries(input as Record<string, unknown>).forEach(
          ([key, value]: [string, any]) => {
            if (!Object.keys(schema.fields).includes(key as string)) {
              issues.push({
                path: [key],
                code: "unknown_field",
                message: `This schema only expects fields: ${Object.keys(schema.fields).join(", ")}`,
              });
              return;
            }
            issues = [
              ...issues,
              ..._validate(schema.fields[key] as any, value, [...path, key])
                .issues,
            ];
          },
        );
      }
    }
  }
  if (schema.constraints) {
    issues = [...issues, ..._checkConstraints(schema, input, path)];
  }
  if (issues.length) {
    return {
      success: false,
      output: input,
      issues,
    };
  }
  return {
    success: true,
    output: _transform(schema, input),
    issues,
  };
}

function _checkConstraints(
  schema: VoxelSchema & { constraints: ConstraintObj[] },
  input: unknown,
  path: (string | number)[],
) {
  const issues: VoxelIssue[] = [];

  const errorMsg = (
    constraint: Record<string, unknown>,
    msg: string,
  ): string =>
    typeof constraint?.message === "string" ? constraint?.message : msg;
  if (schema.constraints) {
    for (const constraint of schema.constraints) {
      if (constraint.type === "length") {
        if (constraint.name === "min_length") {
          if (
            (typeof input === "string" || Array.isArray(input)) &&
            typeof constraint.value === "number" &&
            input.length < constraint.value
          )
            issues.push({
              path: [...path],
              code: "length_constraint_failed",
              message: errorMsg(
                constraint,
                `${schema.type.toUpperCase()} too short (Minimum of ${constraint.value} ${schema.type === "string" ? "characters" : "elements"})`,
              ),
            });
        }
        if (constraint.name === "max_length") {
          if (
            (typeof input === "string" || Array.isArray(input)) &&
            typeof constraint.value === "number" &&
            input.length > constraint.value
          )
            issues.push({
              path: [...path],
              code: "length_constraint_exceeded",
              message: errorMsg(
                constraint,
                `${schema.type.toUpperCase()} too large (Maximum of ${constraint.value} ${schema.type === "string" ? "characters" : "elements"})`,
              ),
            });
        }
      }
      if (constraint.type === "range") {
        if (constraint.name === "min") {
          if (
            typeof input === "number" &&
            typeof constraint.value === "number" &&
            input < constraint.value
          )
            issues.push({
              path: [...path],
              code: "range_constraint_failed",
              message: errorMsg(
                constraint,
                `${schema.type.toUpperCase()} too short (Minimum of ${constraint.value} ${schema.type === "string" ? "characters" : "elements"})`,
              ),
            });
        }
        if (constraint.name === "max") {
          if (
            typeof input === "number" &&
            typeof constraint.value === "number" &&
            input > constraint.value
          )
            issues.push({
              path: [...path],
              code: "range_constraint_exceeded",
              message: errorMsg(
                constraint,
                `${schema.type.toUpperCase()} too large (Maximum of ${constraint.value} ${schema.type === "string" ? "characters" : "elements"})`,
              ),
            });
        }
      }
      if (constraint.type === "pattern") {
        if (
          typeof input === "string" &&
          input.match(constraint.value as any) === null
        )
          issues.push({
            path: [...path],
            code: "pattern_mismatch",
            message: errorMsg(
              constraint,
              `${schema.type.toUpperCase()} too short (Minimum of ${constraint.value} ${schema.type === "string" ? "characters" : "elements"})`,
            ),
            expected: constraint.value,
            recieved: input,
          });
      }
    }
  }
  return issues;
}

function _transform<C extends VoxelSchema>(schema: C, input: InferInput<C>) {
  const finalObj: Record<string, unknown> = {};
  if (
    schema.type !== "object" &&
    schema.type !== "array" &&
    schema.type !== "phantom"
  ) {
    return !!schema.transform ? schema.transform(input as never) : input;
  } else {
    if (schema.type === "phantom") {
      return input;
    } else if (schema.type === "array") {
      if (Array.isArray(input)) {
        return [
          ...(input as any[]).map((i) =>
            schema.transform ? schema.transform(i as never) : i,
          ),
        ];
      }
    } else if (schema.type === "object") {
      Object.entries(schema.fields).forEach(([key, value]) => {
        finalObj[key] = _transform(value, input[key]);
      });
      return finalObj;
    }
  }
}
