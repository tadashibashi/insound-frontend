<script>
    import { TrackSrv } from "app/util/service/TrackSrv";
    import Form from "../Form.svelte";

    // Maximum number of track input slots
    const MAX_TRACKS = 8;

    // Current number of track input slots
    let trackCount = 1;


    /**
     * @brief       Callback to remove a track input slot
     */
    function onRemoveTrack() {
        --trackCount;
        if (trackCount <= 0)
            trackCount = 1;
    }

    /**
     * @brief       Callback to add a new track slot
     */
    function onAddTrack() {
        ++trackCount;
        if (trackCount >= MAX_TRACKS)
            trackCount = MAX_TRACKS;
    }

</script>


<Form action={TrackSrv.create}>
        <input type="text" name="title" class="text-center text-blue-500" minlength={1} required/>

        <div class="flex flex-col items-center">
            <!-- Create track name / file for each layer -->
            {#each Array(trackCount) as _, i ("track" + i)}
                <input type="text" name="names" placeholder={"Layer " + (i + 1)} minlength={1} required />
                <input type="file" name="files" accept="audio/*" required />
            {/each}
        </div>

        <button type="button" on:click={onAddTrack}>+</button>
        <button type="button" on:click={onRemoveTrack}>-</button>

        <input type="submit" value="Create"/>
</Form>
