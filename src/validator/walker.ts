import type { VoxelIssue, VoxelIssueCodes, VoxelSchema } from "./types";

function createIssue(
  type: VoxelSchema["type"],
  code: VoxelIssueCodes,
  message: string,
  path: VoxelIssue["path"],
  recieved: unknown,
): VoxelIssue {
  return { expected: type, recieved, code, message, path };
}

export function walk(schema: VoxelSchema, data: unknown, path: string[] = []) {
  const issues: VoxelIssue[] = [];
  switch (schema.type) {
    case "string":
      if (typeof data !== "string")
        issues.push(
          createIssue(
            "string",
            "invalid_type",
            schema.message ?? `Expected ${schema.type} but got ${typeof data}`,
            path,
            data,
          ),
        );
      break;
    case "number":
      if (typeof data !== "number")
        issues.push(
          createIssue(
            "number",
            "invalid_type",
            schema.message ?? `Expected ${schema.type} but got ${typeof data}`,
            path,
            data,
          ),
        );
      break;
  }
}
