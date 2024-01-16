import { dropCursor, type KeyBinding} from "@codemirror/view";
import { copyLineDown, indentWithTab, undo, redo } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { basicSetup, type EditorView } from "codemirror";

export function createDefaultKeyMap(
    view: EditorView,
    onsave: (text: string) => void,
    onundo: () => void,
    onredo: () => void): KeyBinding[]
{
    return [
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

export function createDefaultExtensions()
{
    return [
        basicSetup,
        dropCursor(),
        StreamLanguage.define(lua),
    ];
}
