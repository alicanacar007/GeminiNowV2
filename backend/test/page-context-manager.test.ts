import assert from "node:assert/strict"

import { PageContextManager } from "../src/page-context-manager"

const manager = new PageContextManager()

const initial = manager.update("sess-1", {
  url: "https://example.com/form",
  title: "Example Form",
  fields: [
    {
      id: "first-name",
      label: "First Name",
      type: "text",
      required: true
    }
  ]
})

assert.equal(initial.url, "https://example.com/form")
assert.equal(initial.fields.length, 1)
assert.equal(initial.fields[0]?.label, "First Name")
assert.equal(initial.fields[0]?.required, true)

const updated = manager.update("sess-1", {
  url: "https://example.com/form",
  guidance: "Collect basic contact details",
  fields: [
    {
      label: "First Name",
      value: "Jane"
    },
    {
      label: "Email",
      type: "email"
    }
  ]
})

assert.equal(updated.guidance, "Collect basic contact details")
assert.equal(updated.fields.length, 2)
const [emailField, firstNameField] = updated.fields
assert.equal(emailField.label, "Email")
assert.equal(firstNameField.label, "First Name")
assert.equal(firstNameField.value, "Jane")

const setValueResult = manager.setFieldValue("sess-1", "email", "jane@example.com")
assert.equal(setValueResult, true)

const context = manager.getContext("sess-1")
assert.ok(context)
assert.equal(context?.fields.find((f) => f.label === "Email")?.value, "jane@example.com")

const prompt = manager.getPrompt("sess-1")
assert.ok(prompt?.includes("Example Form"))
assert.ok(prompt?.includes("First Name"))
assert.ok(prompt?.includes("current value: Jane"))
assert.ok(prompt?.includes("Email"))
assert.ok(prompt?.includes("current value: jane@example.com"))

ManagerStateIsolation: {
  const cloned = manager.getContext("sess-1")
  assert.ok(cloned)

  if (cloned) {
    cloned.fields[0]!.label = "Mutated"
    const again = manager.getContext("sess-1")
    assert.notEqual(again?.fields[0]?.label, "Mutated")
  }
}

assert.equal(manager.setFieldValue("missing", "field", "value"), false)

manager.clear("sess-1")
assert.equal(manager.getContext("sess-1"), null)

console.log("✅ PageContextManager tests passed")
