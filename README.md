# 📦 Voxel

> A tiny, extensible schema and validation layer built for Cube.

**Voxel** is a schema definition library that focuses on:

- minimal bundle size
- strong TypeScript autocomplete
- predictable validation
- extensible primitives
- transportable, data-first schemas

Voxel is designed to be boring, explicit, and easy to reason about.

---

## ✨ Features

- ⚡ **Tiny** — ~3.8kb gzipped
- 🧠 **Schema-as-data** (no classes, no chains)
- 🔍 **Validation + transformation pipeline**
- 🧩 **Extensible primitives**
- 🧑‍💻 **Autocomplete-driven DX**
- 🔗 **Built for Cube**, usable standalone

---

## 📌 Core idea

Voxel schemas are **declarative objects**, not executable pipelines.

Validation refines input.  
Transforms optionally change the output shape.

---

## 🚀 Installation

```bash
bunx jsr:add voxel
# or
npx jsr:add voxel
```

```ts
const username = string({
  minLength: 3,
  maxLength: 20,
});
```

### Validation

```ts
const password = v.string({
  minLength: 8,
});

const validationOutput1 = v.validate(password, "12345678"); // {success: true, output: 12345678, issues: []}
const validationOutput2 = v.validate(password, "123456"); // {success: false, output: 12345678, issues: [{ code: 'length_... }]}
```
