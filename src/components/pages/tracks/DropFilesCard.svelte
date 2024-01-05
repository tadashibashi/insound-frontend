<script lang="ts">
    import { Icon, MusicalNote, Square3Stack3d } from "svelte-hero-icons";


</script>

<div class="Background"></div>
<div class="absolute w-full h-full flex flex-col items-center justify-center">
    <div class="absolute pointer-events-none">
        <div class="relative">
            <div class="Icon1 z-10 absolute block mb-2 drop-shadow-md text-gray-400">
                <Icon src="{MusicalNote}" size="48" />
            </div>
            <div class="Icon2 z-0 relative block mb-2 translate-y-8 text-gray-50">
                <Icon class="animate-pulse" src="{Square3Stack3d}" size="48" />
            </div>


        </div>

        <p class="Fadein-text relative text-center mx-auto text-sm translate-y-2 -translate-x-1 text-gray-500">Add files</p>
    </div>
</div>

<style>
    @keyframes icon-1 {
        0% {
            transform: translateY(-.5rem);
            opacity: 0;
        }
        100% {
            transform:  translateY(0);
            opacity: 100%;
        }
    }

    @keyframes icon-2 {
        0% {
            transform: translateY(2.1rem) scaleY(.95);
            opacity: 0;
        }

        100% {
            transform:  translateY(2rem) scaleY(1);
            opacity: 100%;
        }
    }

    @keyframes fade-in {
        0% {
            opacity: 0%;
        }
        100% {
            opacity: 100%;
        }
    }

    @keyframes background-fade-in {
        0% {
            background-color: #0000;
        }
        50% {
            background-color:  #dadada;
        }
        100% {
            background-color:  #dcdcdc;
        }
    }

    .Icon1 {
        animation: .3s ease-out 1 icon-1;
    }

    .Icon2 {
        animation: .3s ease-in 1 icon-2;
    }

    .Fadein-text {
        animation: .3s  ease-in-out 1 fade-in;
        text-shadow: 0 2px 3px #999f;
    }

    .Background {
        animation:  .3s linear 1 background-fade-in;
        @apply absolute w-full h-full rounded-md border-0;

        background-color:  #dcdcdc;
    }
</style>
