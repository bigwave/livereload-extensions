Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/CustomizableUI.jsm");
function startup(data, reason) {
	//Components.utils.import("chrome://myAddon/content/myModule.jsm");
	//myModule.startup();  // Do whatever initial startup stuff you need to do

	forEachOpenWindow(loadIntoWindow);
	Services.wm.addListener(WindowListener);
}
function shutdown(data, reason) {
	if (reason == APP_SHUTDOWN)
		return;

	forEachOpenWindow(unloadFromWindow);
	Services.wm.removeListener(WindowListener);

	//myModule.shutdown();  // Do whatever shutdown stuff you need to do on addon disable

	//Components.utils.unload("chrome://myAddon/content/myModule.jsm");  // Same URL as above

	// HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
	//               in order to fully update images and locales, their caches need clearing here
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}
function install(data, reason) {}
function uninstall(data, reason) {}
function loadIntoWindow(window) {
	/* call/move your UI construction function here */
	console.log("I'm starting!");
	let io =
		Components.classes["@mozilla.org/network/io-service;1"].
		getService(Components.interfaces.nsIIOService);

	this._ss =
		Components.classes["@mozilla.org/content/style-sheet-service;1"].
		getService(Components.interfaces.nsIStyleSheetService);
	this._uri = io.newURI("chrome://livereload/skin/toolbar.css", null, null);
	this._ss.loadAndRegisterSheet(this._uri, this._ss.USER_SHEET);
    var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
               .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript("chrome://livereload/content/global.js", window);
    loader.loadSubScript("chrome://livereload/content/injected.js", window);
    loader.loadSubScript("chrome://livereload/content/firefox.js", window);

    CustomizableUI.createWidget({
		id : "livereload-button",
		defaultArea : CustomizableUI.AREA_NAVBAR,
		label : "Hello Button",
		tooltiptext : "Hello!",
		onCommand : function (aEvent) {
			let win = aEvent.target.ownerDocument.defaultView;
            win.load
            win.ToggleButton.update();
		}
	});
    
    try {
        window.windowInit();
    } catch(e) {
        console.log(e.stack);
    }

}
function unloadFromWindow(window) {
	/* call/move your UI tear down function here */
if (this._ss.sheetRegistered(this._uri, this._ss.USER_SHEET)) {
  this._ss.unregisterSheet(this._uri, this._ss.USER_SHEET);
}
	CustomizableUI.destroyWidget("livereload-button");
}
function forEachOpenWindow(todo) // Apply a function to all open browser windows
{
	var windows = Services.wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements())
		todo(windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindow));
}
var WindowListener = {
	onOpenWindow : function (xulWindow) {
		var window = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);
		function onWindowLoad() {
			window.removeEventListener("load", onWindowLoad);
			if (window.document.documentElement.getAttribute("windowtype") == "navigator:browser")
				loadIntoWindow(window);
		}
		window.addEventListener("load", onWindowLoad);
	},
	onCloseWindow : function (xulWindow) {},
	onWindowTitleChange : function (xulWindow, newTitle) {}
};
