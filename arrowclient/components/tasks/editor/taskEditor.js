import { Schema } from "prosemirror-model"
import { EditorState, TextSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"

const schema = new Schema({
  nodes: {
    doc: { content: "paragraph+" },
    paragraph: {
      group: "block",
      content: "text*",
      toDOM() {
        return ["div", 0]
      },
      parseDOM: [{ tag: "div" }],
    },
    text: { group: "inline" },
  },
})

let activeEditor = null
let shouldOpenKeyboardOnNextFocus = false

function buildDocFromText(fullText = "") {
  const lines = String(fullText).replace(/\r/g, "").split("\n")
  const safeLines = lines.length ? lines : [""]

  return schema.node(
    "doc",
    null,
    safeLines.map((line) => schema.node("paragraph", null, line ? schema.text(line) : null)),
  )
}

function getFullText(doc) {
  return doc.content.content.map((node) => node.textContent).join("\n")
}

function splitNameAndNote(fullText = "") {
  const lines = String(fullText).replace(/\r/g, "").split("\n")
  const name = (lines[0] || "").trim()
  const note = lines.slice(1).join("\n")
  return { name, note }
}

function createState(name, note) {
  const fullText = note ? `${name || ""}\n${note}` : name || ""
  return EditorState.create({
    doc: buildDocFromText(fullText),
    schema,
    plugins: [keymap(baseKeymap)],
  })
}

export function createTaskEditor({ element, initialName = "", initialNote = "", onChange = () => {} }) {
  if (!element) return null

  const view = new EditorView(element, {
    state: createState(initialName, initialNote),
    dispatchTransaction(transaction) {
      const nextState = view.state.apply(transaction)
      view.updateState(nextState)
      if (transaction.docChanged) onChange()
    },
  })

  activeEditor = view
  return view
}

export function destroyTaskEditor(editorInstance = activeEditor) {
  if (!editorInstance) return
  if (activeEditor === editorInstance) activeEditor = null
  editorInstance.destroy()
}

export function getTaskEditorValue(editorInstance = activeEditor) {
  if (!editorInstance) return { name: "", note: "" }
  return splitNameAndNote(getFullText(editorInstance.state.doc))
}

export function setTaskEditorValue(editorInstance = activeEditor, { name = "", note = "" } = {}) {
  if (!editorInstance) return

  const fullText = note ? `${name || ""}\n${note}` : name || ""
  const nextDoc = buildDocFromText(fullText)
  const nextState = EditorState.create({
    doc: nextDoc,
    schema,
    plugins: editorInstance.state.plugins,
  })
  editorInstance.updateState(nextState)
}

export function focusTaskEditor({ atStart = true } = {}, editorInstance = activeEditor) {
  if (!editorInstance) return

  const doc = editorInstance.state.doc
  const pos = atStart ? 1 : Math.max(1, doc.content.size)
  const tr = editorInstance.state.tr.setSelection(TextSelection.create(doc, pos))
  editorInstance.dispatch(tr)
  editorInstance.focus()
  consumeKeyboardOpenRequest(editorInstance)
}

export function selectTaskTitle(editorInstance = activeEditor) {
  if (!editorInstance) return

  const doc = editorInstance.state.doc
  const firstLine = doc.firstChild
  const from = 1
  const to = from + (firstLine ? firstLine.content.size : 0)
  const tr = editorInstance.state.tr.setSelection(TextSelection.create(doc, from, to))
  editorInstance.dispatch(tr)
  editorInstance.focus()
  consumeKeyboardOpenRequest(editorInstance)
}

export function getActiveTaskEditor() {
  return activeEditor
}

export function requestTaskEditorKeyboard() {
  shouldOpenKeyboardOnNextFocus = isMobileViewport()
}

function consumeKeyboardOpenRequest(editorInstance) {
  if (!shouldOpenKeyboardOnNextFocus) return
  shouldOpenKeyboardOnNextFocus = false
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") return
  window.requestAnimationFrame(() => {
    if (!editorInstance || editorInstance.isDestroyed) return
    editorInstance.focus()
  })
}

function isMobileViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
  return window.matchMedia("(pointer: coarse)").matches
}
