import { dropCursor, gutter, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection, type KeyBinding } from "@codemirror/view";
import { copyLineDown, indentWithTab, undo, redo, history, defaultKeymap } from "@codemirror/commands";
import { StreamLanguage, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentUnit } from "@codemirror/language";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { EditorState } from "@codemirror/state";
import { searchKeymap } from "@codemirror/search";
import { EditorView } from "codemirror";

export function createDefaultKeyMap(
    view: EditorView,
    onsave: (text: string) => void,
    onundo: () => void,
    onredo: () => void): KeyBinding[]
{
    return [
        ...defaultKeymap,
        ...completionKeymap,
        ...searchKeymap,
        indentWithTab,
        {
            key: "Mod-Shift-d",
            run() { return copyLineDown(view); }
        },
        {
            key: "Mod-s",
            run() {
                onsave(view.state.doc.toString());
                return true;
            }
        },
        {
            key: "Mod-z",
            run() {
                const result = undo(view);
                if (result)
                    onundo();
                return result;
            }
        },
        {
            key: "Mod-Shift-z",
            run() {
                const result = redo(view);
                if (result)
                    onredo();
                return result;
            }
        }
    ];
}

export interface DefaultExtConfig {
    indent?: number;
    editMode?: boolean;
}

export function createDefaultExtensions(config: DefaultExtConfig)
{
    const exts = [
        gutter({}),
        lineNumbers(),
        history(),
        syntaxHighlighting(defaultHighlightStyle),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        autocompletion(),
        indentUnit.of(" ".repeat(4)),
        StreamLanguage.define(lua),
    ];

    if (config.editMode ?? false)
    {
        exts.push(
            highlightActiveLineGutter(),
            highlightActiveLine(),
            EditorView.editable.of(true),
            EditorState.readOnly.of(false),
        );
    }
    else
    {
        exts.push(
            EditorView.editable.of(false),
            EditorState.readOnly.of(true),
        );
    }

    return exts;
}
