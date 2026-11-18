/** Session flag for the "Turn the valve" welcome intro. Shared by server + client code. */
export const INTRO_KEY = "pp-intro-seen";

/** Runs before first paint: marks <html> so CSS hides the intro for returning visitors. */
export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_KEY}")==="1")document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;
