CustomEvents =
  bind: (element, eventName, handler) ->
    if element.addEventListener
      element.addEventListener eventName, handler, false
    else if element.attachEvent
      element[eventName] = 1
      element.attachEvent 'onpropertychange', (event) ->
        if event.propertyName is eventName
          handler()
    else
      throw new Error("Attempt to attach custom event #{eventName} to something which isn't a DOMElement")

  fire: (element, eventName) ->
    if element.addEventListener
      event = document.createEvent('HTMLEvents')
      event.initEvent(eventName, true, true)
      document.dispatchEvent(event)
    else if element.attachEvent
      if element[eventName]
        element[eventName]++
    else
      throw new Error("Attempt to fire custom event #{eventName} on something which isn't a DOMElement")


LiveReloadInjected =
  ExtVersion: '2.0.0'
  _hooked: no

  findScriptTag: ->
    for element in document.getElementsByTagName('script')
      if src = element.src
        if m = src.match /// /livereload\.js (?: \? (.*) )? $///
          return element
    null

  doDisable: (callback) ->
    element = @findScriptTag()
    if element
      CustomEvents.fire document, 'LiveReloadShutDown'
      element.parentNode.removeChild(element) if element.parentNode
    callback()

  doEnable: ({ useFallback, baseURI })->
    if useFallback
      url = "#{scriptURI}?ext=Safari&extver=#{@ExtVersion}&host=localhost"
      console.log "Loading LiveReload.js bundled with the browser extension..."
    else
      url = "http://localhost:35729/livereload.js?ext=Safari&extver=#{@ExtVersion}"
      console.log "Loading LiveReload.js from #{url.replace(/\?.*$/, '')}..."

    @hook()
    element = document.createElement('script')
    element.src = url
    document.body.appendChild(element)

  hook: ->
    return if @_hooked
    @_hooked = yes

    CustomEvents.bind document, 'LiveReloadConnect', =>
      @send 'status', active: yes
    CustomEvents.bind document, 'LiveReloadDisconnect', =>
      @send 'status', active: no

  disable: ->
    @doDisable =>
      @send 'status', enabled: no, active: no

  enable: (options) ->
    @doDisable =>
      @doEnable options
      @send 'status', enabled: yes

  initialize: ->
    if @findScriptTag()
      @send 'status', enabled: yes, active: yes
      @hook()
    else
      @send 'status', enabled: no, active: no