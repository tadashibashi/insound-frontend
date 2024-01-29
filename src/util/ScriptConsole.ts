import { Callback } from "audio/Callback";

export class ScriptConsole
{
    private m_el: HTMLElement;

    private m_logTime: boolean = false;
    private m_logDate: boolean = false;

    readonly doMoveCursor: Callback<[number, number]>;

    constructor(element: HTMLElement)
    {
        this.m_el = element;
        this.doMoveCursor = new Callback;
    }

    get element(): HTMLElement { return this.m_el; }

    clear()
    {
        this.m_el.innerText = "";
    }

    /**
     * Print to the script console
     * @param level   - level of importance
     * @param name - logger name (may remove this later)
     * @param message
     * @param extraData - when level is 4, extraData is a number indicating the error line
     */
    print(level: number, name: string, message: string, extraData?: any)
    {
        message = message.trim();

        const lastChild = this.m_el.lastElementChild as HTMLElement;

        if (lastChild && parseInt(lastChild.dataset["level"] || "-1") === level)
        {
            const lastMessage = lastChild.dataset["message"] || "";

            if (message.trim() === lastMessage)
            {
                const iterations = parseInt(lastChild.dataset["iterations"] || "1");

                const itEl = lastChild.lastElementChild?.firstElementChild?.firstElementChild;
                if (!itEl) throw Error("Expected to find element with iteration text");

                itEl.className = "font-bold bg-gray-400 px-1.5 mt-[2px] me-1 text-white rounded-full text-[10px] flex justify-items items-center h-[12px]";
                itEl.innerHTML = `<span>${iterations + 1}</span>`


                lastChild.dataset["iterations"] = (iterations + 1).toString();

                return;
            }

        }

        const pEl = document.createElement("div");
        pEl.className = "relative flex mx-[2px] my-[2px] rounded-md pt-[2px] pb-[1px] ";
        pEl.dataset["level"] = level.toString();
        pEl.dataset["name"] = name;
        pEl.dataset["iterations"] = "1";
        pEl.dataset["message"] = message;


        const symbolEl = document.createElement("div");
        symbolEl.className = "w-3 h-3 mx-1 mt-[2px] ";

        const counterSpan = document.createElement("span");

        const prefixSpan = document.createElement("span");
        prefixSpan.className = "opacity-50 ";

        const messageContainer = document.createElement("div");
        messageContainer.className = "flex justify-between w-full pe-2";
        const messageSpan = document.createElement("span");
        messageSpan.className = "flex w-full pe-2";
        messageSpan.innerText = message;

        messageSpan.prepend(counterSpan);
        messageContainer.append(messageSpan);

        switch(level)
        {
        case 0: // comment/light
            pEl.style.color = "#ccc";
            symbolEl.innerHTML = "<div class='flex font-bold aspect-square items-center justify-center text-[10px] h-[12px] w-[12px] bg-blue-200 text-white rounded-full'><div>i</div></div>";
            break;
        case 1: // normal
            pEl.style.color = "#444";
            break;
        case 2: // warn
            pEl.style.color = "#FFBA00";
            break;
        case 3: // user error
            pEl.style.color = "red";
            break;
        case 4: // script error
            {
                if (typeof extraData === "number")
                {
                    const link = document.createElement("div");
                    link.className = "font-thin cursor-pointer underline text-blue-400 whitespace-nowrap";
                    link.addEventListener("click", () => this.doMoveCursor.invoke(extraData || 0, 0));
                    link.innerText = "line: " + extraData.toString();
                    messageContainer.appendChild(link);
                }

                pEl.className += " text-red-500 bg-red-100";
                symbolEl.innerHTML = "<div class='flex font-bold aspect-square items-center justify-center h-[12px] w-[12px] text-[12px] bg-red-400 text-red-900 rounded-full'><div>x</div></div>";
            }

            break;
        default: // unknown
            pEl.style.color = "#444";
            break;
        }

        const date = new Date();
        const hours = (date.getHours()%12).toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
        const time = `${hours}:${minutes}:${seconds}.${milliseconds}`;

        prefixSpan.innerText = `${this.m_logDate ? (" " + date.toLocaleDateString()) : ""}${this.m_logTime ? (" " + time) : ""} `;

        pEl.appendChild(symbolEl);
        pEl.appendChild(prefixSpan);
        pEl.appendChild(messageContainer);
        this.m_el.appendChild(pEl);

        // auto scroll
        const bottomSpace = this.m_el.scrollHeight - this.m_el.scrollTop - this.m_el.clientHeight;
        if (bottomSpace <= 24)
        {
            this.m_el.scroll(0, this.m_el.scrollHeight - this.m_el.clientHeight);
        }
    }
}
