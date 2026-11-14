// Welcome / options page: Hatrack's settings.

const $ = (id) => document.getElementById(id);

function send(type, extra = {}) {
  return browser.runtime.sendMessage({ type, ...extra });
}

function showSettings(s) {
  $("auto").checked = s.auto;
  $("catchLinks").checked = s.catchLinks && s.canCatchLinks;
  $("linksStatus").textContent = s.catchLinks && s.canCatchLinks ? "✓ On" : "Off";
  $("linksStatus").className = "status " + (s.catchLinks && s.canCatchLinks ? "good" : "");
  $("grace").value = String(s.graceMinutes);
}

$("auto").addEventListener("change", async () => {
  showSettings(await send("setSetting", { key: "auto", value: $("auto").checked }));
});

$("grace").addEventListener("change", async () => {
  showSettings(await send("setSetting", { key: "graceMinutes", value: Number($("grace").value) }));
});

send("settings").then(showSettings);
