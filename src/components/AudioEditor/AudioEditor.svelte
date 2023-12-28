<script lang="ts">
    interface AudioEditorData {
        audioFiles: {name: string, data: ArrayBuffer}[];
        isLooping: boolean;
        loopStart: number;
        loopEnd: number;
        markers: {name: string, offset: number}[];
        presets: {name: string, volumes: number[]}[];
        transitionTime: number;
        script: string;
    }
</script>
