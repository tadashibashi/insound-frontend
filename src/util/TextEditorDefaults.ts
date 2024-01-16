import { dropCursor, type KeyBinding} from "@codemirror/view";
import { copyLineDown, indentWithTab } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { basicSetup, type EditorView } from "codemirror";

export function createDefaultKeyMap(
    view: EditorView,
    onsave: (text: string) => void): KeyBinding[]
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
