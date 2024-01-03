<script lang="ts">
    import { Icon, MusicalNote, Square3Stack3d } from "svelte-hero-icons";


</script>

<div class="absolute w-full h-full rounded-md bg-gray-100 border-0"></div>
<div class="absolute w-full h-full flex flex-col items-center justify-center">
    <div class="absolute pointer-events-none">
        <div class="relative">
            <div class="Icon1 z-10 absolute block mb-2 drop-shadow-md">
                <Icon src="{MusicalNote}" size="48" />
            </div>
            <div class="Icon2 z-0 relative block mb-2 text-white translate-y-8 text-gray-50">
                <Icon class="animate-pulse" src="{Square3Stack3d}" size="48" />
            </div>


        </div>

        <p class="Fadein relative text-center text-xs absolute drop-shadow-md translate-y-1">Add files</p>
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
        0%, 50% {
            transform: translateY(2.25rem);
            opacity: 0;
        }

        100% {
            transform:  translateY(2rem);
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

    .Icon1 {
        animation: .3s ease-out 1 icon-1;
    }

    .Icon2 {
        animation: .3s ease-out 1 icon-2;
    }

    .Fadein {
        animation: .3s  ease-in 1 fade-in;
    }
</style>
