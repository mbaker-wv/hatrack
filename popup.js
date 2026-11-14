// Toolbar popup: rename/keep the current hat. Creating and managing hats happens on the Manage hats page.

const $ = (id) => document.getElementById(id);
let tab;
let current;

function send(type, extra = {}) {
  return browser.runtime.sendMessage({ type, tab, ...extra });
}

async function render() {
  [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const { current: currentId, hats } = await send("describe");
  current = hats.find(h => h.id === currentId);
  $("current").hidden = !current;
  $("none").hidden = !!current;
  if (current) {
    $("dot").style.background = current.colorCode;
    if (document.activeElement !== $("name")) $("name").value = current.name;
    $("keep").checked = current.kept;
  }

  // Your top 3 other hats: kept ones first (they're your everyday hats), then by number.
  const top = hats.filter(h => h.id !== currentId)
    .sort((a, b) => (b.kept - a.kept) || (a.number - b.number)).slice(0, 3);
  $("hatsSection").hidden = top.length === 0;
  $("hatList").replaceChildren(...top.map((hat) => {
    const li = document.createElement("li");
    const go = document.createElement("button");
    go.className = "go";
    go.title = "Open a new tab in this hat";
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = hat.colorCode;
    const name = document.createElement("span");
    name.className = "hat-name";
    name.textContent = hat.name;
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = hat.tabCount === 1 ? "1 tab" : hat.tabCount ? `${hat.tabCount} tabs` : hat.kept ? "kept" : "closing";
    go.append(dot, name, count);
    go.onclick = async () => { await send("hatOpen", { id: hat.id, windowId: tab.windowId }); window.close(); };
    li.append(go);
    return li;
  }));
}

$("name").addEventListener("change", () => current && send("hatRename", { id: current.id, name: $("name").value }));
$("name").addEventListener("keydown", (e) => { if (e.key === "Enter") $("name").blur(); });
$("keep").addEventListener("change", () => current && send("hatKeep", { id: current.id, kept: $("keep").checked }));
$("newSame").addEventListener("click", async () => { await send("newSame"); window.close(); });
$("manage").addEventListener("click", async (e) => {
  e.preventDefault();
  await browser.tabs.create({ url: browser.runtime.getURL("hats.html") });
  window.close();
});
$("help").addEventListener("click", (e) => {
  e.preventDefault();
  browser.runtime.openOptionsPage();
  window.close();
});

render();
