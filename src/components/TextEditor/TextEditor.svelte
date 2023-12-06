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
    export let value: string =
`-- Lua Script
function on_init()
    print("script initialized")
end

function on_load()
    -- init params
    snd.param.add_float("f", 0, 1, .01, .5)

    print("Marker count: "..snd.marker.count())

    for i=1, snd.marker.count() do
        local marker = snd.marker.get(i)
        print(marker.name..": "..marker.seconds)
    end
end

--Occurs every audio update - about once every 10 milliseconds
--@param delta number - number of milliseconds since last frame
--@param total number - total number of milliseconds since last frame
function on_update(delta, total)

end

function on_marker(name, offset)
    print("Marker: "..name..", "..offset)
    if name == "LoopStart" then
        snd.param.set("f", math.random() )
        print("f set to: "..snd.param.get("f"))
    end
end

-- Occurs when a parameter is set
function on_paramset(name, value)
    print("param set: "..name..": "..value)
end
`;

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
    <div bind:this={viewEl} class="border border-gray-100 rounded-2xl overflow-clip shadow-2xl">

    </div>
</div>
