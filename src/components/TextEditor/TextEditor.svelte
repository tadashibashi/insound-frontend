<script lang="ts">
    import debounce from "app/util/debounce";
    import type { Delegate } from "app/util/delegate";

    import {basicSetup, EditorView} from "codemirror";
    import {autocompletion} from "@codemirror/autocomplete";
    import {indentWithTab, copyLineDown} from "@codemirror/commands"
    import {StreamLanguage, indentUnit} from "@codemirror/language";
    import {lua} from "@codemirror/legacy-modes/mode/lua";
    import {keymap, dropCursor} from "@codemirror/view";
    import {EditorState} from "@codemirror/state";
    import { onMount } from "svelte";

    export let onRequestText: Delegate<string, []>;
    export let onSave: () => void = () => {};
    export let value: string = "";

    let viewEl: HTMLDivElement;
    let view: EditorView;

    function setEditorText(view: EditorView, text: string)
    {
        view.setState(EditorState.create({
            doc: text,
            extensions: [
                basicSetup,
                StreamLanguage.define(lua),
                dropCursor(),
                autocompletion({

                }),
                indentUnit.of("    "),
                keymap.of([
                    indentWithTab,
                    {
                        key: "Mod-Shift-d",
                        run() { return copyLineDown(view); }
                    },
                    {
                        key: "Mod-s",
                        run() {
                            onSave();
                            return true;
                        }
                    }
                ]),
            ]
        }));
    }

    onMount(() => {
        onSave = debounce(onSave, 1000);
        const requestTextHandler = () => {
            return view.state.doc.toString();
        };

        onRequestText.subscribe(requestTextHandler);
        view = new EditorView({
            parent: viewEl,
        });
        setEditorText(view, value);

        return () => {
            onRequestText.unsubscribe(requestTextHandler);
        };
    });

</script>

<div  class="box-border w-full p-2">
    <div bind:this={viewEl} class="border border-gray-100 rounded-2xl overflow-clip shadow-sm" />
</div>
