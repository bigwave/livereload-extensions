
TabState::send = (message, data={}) ->
  chrome.tabs.sendMessage @tab, [message, data]

TabState::bundledScriptURI = -> chrome.runtime.getURL('livereload.js')

LiveReloadGlobal.isAvailable = (tab) -> yes

LiveReloadGlobal.initialize()


ToggleCommand =
  invoke: ->
  update: (tabId) ->
    status = LiveReloadGlobal.tabStatus(tabId)
    chrome.browserAction.setTitle { tabId, title: status.buttonToolTip }
    chrome.browserAction.setIcon { tabId, path: { '19' : status.buttonIcon, '38' : status.buttonIconHiRes } }

getHost = (url) ->
  matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
  domain = matches && matches[1]
  domain.split(':')[0]

getProtocol = (url) ->
  matches = url.match(/^(https?)\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
  matches && matches[1]

chrome.browserAction.onClicked.addListener (tab) ->
  host = getHost(tab.url)
  protocol = getProtocol(tab.url)
  LiveReloadGlobal.toggle(tab.id, host, protocol)
  ToggleCommand.update(tab.id)

chrome.tabs.onSelectionChanged.addListener (tabId, selectInfo) ->
  ToggleCommand.update(tabId)

chrome.tabs.onRemoved.addListener (tabId) ->
  LiveReloadGlobal.killZombieTab tabId


chrome.runtime.onMessage.addListener ([eventName, data], sender, sendResponse) ->
  # console.log "#{eventName}(#{JSON.stringify(data)})"
  switch eventName
    when 'status'
      host = getHost(sender.tab.url)
      LiveReloadGlobal.updateStatus(sender.tab.id, data, host)
      ToggleCommand.update(sender.tab.id)
    else
      LiveReloadGlobal.received(eventName, data)
