import './main.css'
// @ts-ignore –– plain tsc and some IDE's will mark this as an error
import App from "./components/App.svelte";

const target = document.getElementById("app");
if (!target) {
  throw Error("Missing element with id 'app'!");
}

const app = new App({ target });

export default app;
