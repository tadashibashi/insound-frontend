import { EditorView } from "codemirror";
import { undo, redo, undoDepth, redoDepth } from "@codemirror/commands";
import { EditorState, type Extension } from "@codemirror/state";
import { keymap, type KeyBinding } from "@codemirror/view";

import { Callback } from "audio/Callback";
import {
    createDefaultExtensions,
    createDefaultKeyMap } from "./TextEditorDefaults";

export interface TextEditorConfig {
    /** No need to add indent, or keymap extensions if indicated in config */
    extensions?: Extension[];
    indent?: number;
    text?: string;
    editMode?: boolean;
    keymap?: KeyBinding[];
};

export class TextEditorMgr
{
    private m_view: EditorView;
    private m_extensions: Extension[];
    readonly onsave: Callback<[string]>;

    /** Only captures when explicitly running member func not shortcut */
    readonly onundo: Callback<[]>;
    readonly onredo: Callback<[]>;

    get view() { return this.m_view; }
    get parent() { return this.m_view.dom; }
    get scrollDOM() { return this.m_view.scrollDOM; }
    get contentDOM() { return this.m_view.contentDOM; }

    constructor(config: TextEditorConfig = {})
    {
        this.m_view = new EditorView;
        this.m_extensions = [keymap.of(config.keymap ??
            createDefaultKeyMap(this.m_view,
                (text) => this.onsave.invoke(text),
                () => this.onundo.invoke(),
                () => this.onredo.invoke()
            )),
            ...(config.extensions ?? createDefaultExtensions({
                indent: config.indent,
                editMode: config.editMode,
            }))
        ];

        this.onsave = new Callback;
        this.onundo = new Callback;
        this.onredo = new Callback;

        this.text = config.text ?? "";
    }

    set text(value: string) {
        this.m_view.setState(EditorState.create({
            doc: value,
            extensions: this.m_extensions,
        }));
    }

    get undoDepth() {
        return undoDepth(this.m_view.state);
    }

    get redoDepth() {
        return redoDepth(this.m_view.state);
    }

    get text(): string {
        return this.m_view.state.doc.toString();
    }

    undo()
    {
        undo(this.m_view); // editor's `undo`, not recursive
        this.onundo.invoke();
    }

    redo()
    {
        redo(this.m_view); // editor's `redo`, not recursive
        this.onredo.invoke();
    }

    /**
     * Trigger onsave callback (need to implement functionality yourself)
     */
    save()
    {
        this.onsave.invoke(this.m_view.state.doc.toString());
    }
}
