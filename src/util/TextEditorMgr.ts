import { EditorView } from "codemirror";
import { undo as editorUndo, redo as editorRedo } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { keymap, type KeyBinding } from "@codemirror/view";

import { Callback } from "audio/Callback";
import {
    createDefaultExtensions,
    createDefaultKeyMap } from "./TextEditorDefaults";
import { util } from ".";

export interface TextEditorConfig {
    /** No need to add indent, or keymap extensions if indicated in config */
    extensions?: Extension[];
    indent?: number;
    keymap?: KeyBinding[];
    text?: string;
};

export class TextEditorMgr
{
    private m_view: EditorView;
    private m_extensions: Extension[];
    private m_id: string;

    readonly onsave: Callback<[string]>;

    get view() { return this.m_view; }
    get parent() { return this.m_view.dom; }
    get id() { return this.m_id; }

    constructor(config: TextEditorConfig = {})
    {
        this.m_view = new EditorView;
        this.m_id = util.genRandHex(4) + '-' + util.genRandHex(4);
        this.m_view.dom.id = this.m_id;

        this.m_extensions = config.extensions ?? createDefaultExtensions();
        this.m_extensions.push(indentUnit.of(" ".repeat(config.indent ?? 4)));
        this.m_extensions.push(keymap.of(config.keymap ??
            createDefaultKeyMap(this.m_view,
                (text) => this.onsave.invoke(text))
            )
        );

        this.onsave = new Callback;

        this.text = config.text ?? "";
    }

    set text(value: string) {
        this.m_view.setState(EditorState.create({
            doc: value,
            extensions: this.m_extensions,
        }));

    }

    get text(): string {
        return this.m_view.state.doc.toString();
    }

    undo()
    {
        editorUndo(this.m_view);
    }

    redo()
    {
        editorRedo(this.m_view);
    }

    /**
     * Trigger onsave callback (need to implement functionality yourself)
     */
    save()
    {
        this.onsave.invoke(this.m_view.state.doc.toString());
    }
}
