export type FieldIdentifier = string

export interface FieldInput {
  id?: string
  label: string
  type?: string
  required?: boolean
  selector?: string
  value?: string
}

export interface PageContextInput {
  url: string
  title?: string
  guidance?: string
  fields?: FieldInput[]
}

export interface FieldState {
  id?: string
  label: string
  type?: string
  required?: boolean
  selector?: string
  value?: string
  lastUpdated: number
}

export interface PageContextSnapshot {
  url: string
  title?: string
  guidance?: string
  fields: FieldState[]
  capturedAt: number
}

export interface PageContextState {
  url: string
  title?: string
  guidance?: string
  fields: FieldState[]
  lastUpdated: number
  history: PageContextSnapshot[]
}

const DEFAULT_HISTORY_LIMIT = 5

export class PageContextManager {
  private readonly historyLimit: number
  private readonly contexts = new Map<string, PageContextState>()

  constructor(historyLimit = DEFAULT_HISTORY_LIMIT) {
    if (historyLimit < 1) {
      throw new Error("historyLimit must be at least 1")
    }
    this.historyLimit = historyLimit
  }

  update(sessionId: string, payload: PageContextInput): PageContextState {
    const trimmedUrl = payload.url.trim()
    if (!trimmedUrl) {
      throw new Error("PageContextManager.update requires a non-empty url")
    }

    const now = Date.now()
    const existing = this.contexts.get(sessionId)
    const normalizedFields = this.normalizeFields(payload.fields ?? [], now)

    if (!existing) {
      const newState: PageContextState = {
        url: trimmedUrl,
        title: this.normalizeOptionalText(payload.title),
        guidance: this.normalizeOptionalText(payload.guidance),
        fields: normalizedFields,
        lastUpdated: now,
        history: []
      }

      this.pushSnapshot(newState, now)
      this.contexts.set(sessionId, newState)
      return this.cloneState(newState)
    }

    existing.url = trimmedUrl
    if (payload.title !== undefined) {
      existing.title = this.normalizeOptionalText(payload.title)
    }
    if (payload.guidance !== undefined) {
      existing.guidance = this.normalizeOptionalText(payload.guidance)
    }

    if (normalizedFields.length > 0) {
      this.mergeFields(existing.fields, normalizedFields, now)
    }

    existing.lastUpdated = now
    this.pushSnapshot(existing, now)

    return this.cloneState(existing)
  }

  setFieldValue(sessionId: string, fieldKey: FieldIdentifier, value: string): boolean {
    const context = this.contexts.get(sessionId)
    if (!context) {
      return false
    }

    const target = this.findField(context.fields, fieldKey)
    if (!target) {
      return false
    }

    target.value = value
    target.lastUpdated = Date.now()
    context.lastUpdated = target.lastUpdated
    this.pushSnapshot(context, target.lastUpdated)
    return true
  }

  getContext(sessionId: string): PageContextState | null {
    const context = this.contexts.get(sessionId)
    if (!context) {
      return null
    }
    return this.cloneState(context)
  }

  getPrompt(sessionId: string): string | null {
    const context = this.contexts.get(sessionId)
    if (!context) {
      return null
    }

    const lines: string[] = []
    lines.push(`You are assisting a user on the page: ${context.title ?? context.url}.`)
    lines.push(`Current URL: ${context.url}`)

    if (context.guidance) {
      lines.push(`Page guidance: ${context.guidance}`)
    }

    if (context.fields.length > 0) {
      lines.push("Detected form fields:")
      for (const field of context.fields) {
        const requiredLabel = field.required ? " (required)" : ""
        const valueSnippet = field.value ? ` — current value: ${field.value}` : ""
        lines.push(`- ${field.label}${requiredLabel}${valueSnippet}`)
      }
    }

    return lines.join("\n")
  }

  clear(sessionId: string): void {
    this.contexts.delete(sessionId)
  }

  clearAll(): void {
    this.contexts.clear()
  }

  private normalizeFields(fields: FieldInput[], timestamp: number): FieldState[] {
    const normalized: FieldState[] = []

    for (const field of fields) {
      const label = field.label.trim()
      if (!label) {
        continue
      }

      const normalizedField: FieldState = {
        id: field.id?.trim() || undefined,
        label,
        type: field.type?.trim() || undefined,
        required: field.required,
        selector: field.selector?.trim() || undefined,
        value: field.value,
        lastUpdated: timestamp
      }

      normalized.push(normalizedField)
    }

    return normalized
  }

  private mergeFields(existing: FieldState[], incoming: FieldState[], timestamp: number) {
    const existingMap = new Map<string, FieldState>()
    for (const field of existing) {
      existingMap.set(this.fieldKey(field), field)
    }

    for (const field of incoming) {
      const key = this.fieldKey(field)
      const current = existingMap.get(key)

      if (current) {
        current.type = field.type ?? current.type
        current.required = field.required ?? current.required
        current.selector = field.selector ?? current.selector
        if (field.value !== undefined) {
          current.value = field.value
        }
        current.lastUpdated = timestamp
      } else {
        existingMap.set(key, { ...field, lastUpdated: timestamp })
      }
    }

    const mergedFields = Array.from(existingMap.values())
    mergedFields.sort((a, b) => a.label.localeCompare(b.label))
    existing.splice(0, existing.length, ...mergedFields)
  }

  private pushSnapshot(state: PageContextState, timestamp: number) {
    const snapshot: PageContextSnapshot = {
      url: state.url,
      title: state.title,
      guidance: state.guidance,
      capturedAt: timestamp,
      fields: state.fields.map((field) => ({ ...field }))
    }

    state.history.push(snapshot)
    if (state.history.length > this.historyLimit) {
      state.history.splice(0, state.history.length - this.historyLimit)
    }
  }

  private findField(fields: FieldState[], fieldKey: FieldIdentifier): FieldState | undefined {
    const trimmed = this.normalizeKey(fieldKey)
    if (!trimmed) {
      return undefined
    }

    return fields.find((field) => {
      const idMatch = this.normalizeKey(field.id) === trimmed
      const labelMatch = this.normalizeKey(field.label) === trimmed
      return idMatch || labelMatch
    })
  }

  private fieldKey(field: FieldState) {
    return this.normalizeKey(field.id) ?? this.normalizeKey(field.label) ?? ""
  }

  private normalizeOptionalText(value?: string) {
    const trimmed = value?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : undefined
  }

  private normalizeKey(value?: string) {
    if (!value) {
      return undefined
    }

    const trimmed = value.trim().toLowerCase()
    if (!trimmed) {
      return undefined
    }

    return trimmed.replace(/[^a-z0-9]/g, "")
  }

  private cloneState(state: PageContextState): PageContextState {
    return {
      url: state.url,
      title: state.title,
      guidance: state.guidance,
      lastUpdated: state.lastUpdated,
      fields: state.fields.map((field) => ({ ...field })),
      history: state.history.map((snapshot) => ({
        ...snapshot,
        fields: snapshot.fields.map((field) => ({ ...field }))
      }))
    }
  }
}
