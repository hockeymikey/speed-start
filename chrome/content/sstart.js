justoff.sstart.SStart = new function () {

	var SStart = this;
	var Utils = justoff.sstart.Utils;
	var File = justoff.sstart.File;
	var Prefs = justoff.sstart.Prefs;
	var Dom = justoff.sstart.Dom;

	Components.utils.import("resource://sstart/cache.js", justoff.sstart);
	
	this.Locked = true;
	this.CacheDOM = false;
	this.Zoom = 1;
	this.PageId = 0;
	this.SearchNodes = {};

	this.isSStart = function (doc) {
		return doc && doc.location
			&& /chrome:\/\/sstart\/content\/sstart.html(\?.*)?/.test(doc.location.href);
	};

	this.reloadPage = function (doc) {
		doc.reload(false);
	};

	this.forEachSStartBrowser = function (onPage) {
		var gBrowser = Utils.getBrowser();
		for (var i = 0; i < gBrowser.browsers.length; i++) {
			var br = gBrowser.browsers[i];
			if (SStart.isSStart(br.contentDocument))
				onPage(br);
		}
	};

	this.isMainBgImage = function () {
		var bg = File.getDataDirectory();
		bg.append("bg_0");
		return bg.exists();
	};

	this.translate = function (key) {
		if (!SStart.bundle) {
			SStart.bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
				.getService(Components.interfaces.nsIStringBundleService)
				.createBundle("chrome://sstart/locale/sstart.strings");
		}
		return SStart.bundle.GetStringFromName(key);
	};

	this.getPageId = function () {
		return SStart.PageId;
	};

	this.setPageId = function (s) {
		SStart.PageId = s;
	};

	this.getZoom = function () {
		return SStart.Zoom;
	};

	this.setZoom = function (s) {
		SStart.Zoom = s;
	};

	this.isCacheDOM = function () {
		return SStart.CacheDOM;
	};

	this.setCacheDOM = function (s) {
		SStart.CacheDOM = s;
	};

	this.isLocked = function () {
		return SStart.Locked;
	};

	this.setLocked = function (s) {
		SStart.Locked = s;
	};

	this.toggleLocked = function () {
		SStart.Locked = !SStart.Locked;
	};

	this.areDecorationsVisible = function () {
		return Prefs.getBool("showDecorations");
	};

	this.refreshAll = function () {
		var c = document.body.getElementsByClassName("widget");
		for (var i = 0; i < c.length; i++) {
			var r = Dom.child(c[i], "refresh");
			if (r) {
				r.click()
			}
		}
	};

	this.alignAll = function () {
		var c = document.body.getElementsByClassName("widget");
		var event = new Event("align");
		var bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
			.getService(Components.interfaces.nsINavBookmarksService);
		var callback = {
			runBatched: function() {
				for (var i = 0; i < c.length; i++) {
					c[i].dispatchEvent(event);
				}
			}
		}
		bookmarksService.runInBatchMode(callback, null);
	};

	this.updateGridInterval = function (s) {
		justoff.sstart.cache.gridInterval = Prefs.getInt("gridInterval");
	};

	this.getGridInterval = function () {
		return justoff.sstart.cache.gridInterval;
	};

	this.updateNewtabOnLockDrag = function (s) {
		justoff.sstart.cache.newtabOnLockDrag = Prefs.getBool("newtabOnLockDrag");
	};

	this.newtabOnLockDrag = function () {
		return justoff.sstart.cache.newtabOnLockDrag;
	};

	this.clearCache = function (s) {
		justoff.sstart.cache.fragment = false;
	};

	this.updateAutoZoom = function (s) {
		justoff.sstart.cache.autoZoom = Prefs.getBool("autoZoom");
		if (justoff.sstart.cache.autoZoom) {
			justoff.sstart.cache.fragment = false;
		}
	};

	this.autoZoom = function () {
		return justoff.sstart.cache.autoZoom;
	};

	this.setEditOn = function () {
		justoff.sstart.cache.editOn = true;
	};

	this.setEditOff = function () {
		justoff.sstart.cache.editOn = false;
	};

	this.isEditOn = function () {
		return justoff.sstart.cache.editOn;
	};

	this.setUpdateMenu = function (s) {
		justoff.sstart.cache.updateMenu = s;
	};

	this.isUpdateMenu = function () {
		return justoff.sstart.cache.updateMenu;
	};

	this.alignToGrid = function (pos) {
		var min = Math.floor(pos / justoff.sstart.cache.gridInterval) * justoff.sstart.cache.gridInterval;
		if (pos - min > justoff.sstart.cache.gridInterval / 2)
			return min + justoff.sstart.cache.gridInterval;
		else
			return min;
	};

	this.deleteSearchNode = function (node) {
		if (node in SStart.SearchNodes) {
			delete SStart.SearchNodes[node];
		}
	};

	this.focusSearch = function (hoverEl) {
		try {
			var input = Dom.child(hoverEl.lastElementChild.firstElementChild, "search");
		} catch (e) {}
		if (input) {
			if (!(hoverEl.id in SStart.SearchNodes)) {
				input.addEventListener("keypress", function (e) {
					if (e.keyCode == e.DOM_VK_RETURN) {
						SStart.doSearch.call(self, this.value, input);
					}
				}, false);
				SStart.SearchNodes[hoverEl.id] = true;
			}
			input.focus();
		}
	};

	this.getSearchEngine = function (name) {
		var searchService = Components.classes["@mozilla.org/browser/search-service;1"]
			.getService(Components.interfaces.nsIBrowserSearchService);
		return searchService.getEngineByName(name) ||
			searchService.currentEngine;
	};

	this.doSearch = function (text, input) {
		var engine = SStart.getSearchEngine(Dom.child(input.parentNode.parentNode.parentNode, "title").textContent);
		input.value = "";
		var submission = engine.getSubmission(text, null);
		document.location = submission.uri.spec;
	};
	
	this.getDialogFeatures = function () {
		var prefService = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefBranch);
		if (prefService.getBoolPref("browser.preferences.instantApply")) {
			return "chrome,titlebar,centerscreen,modal,resizable,dialog=no";
		} else {
			return "chrome,centerscreen,modal,resizable";
		}
	};
	
};

