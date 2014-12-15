This is a fork of [original LiveReload](https://github.com/dvdotsenko/livereload_ie_extension) browser extension with fixed [tab's current host issue](https://github.com/livereload/livereload-extensions/pull/16) (so it works in any virtual machine) and slightly more straightforward building process.

I would be happy to **merge this into** mainstream (if it will display some activity) or pull it to someone who wants to support this project.

Tested to work in FF >= 10, Chrome >= 20, Opera >= 15.

## Building

 * Install [node.js](http://nodejs.org/download/)

 * Install [Grunt](http://gruntjs.com/getting-started#how-the-cli-works) Task Runner

        npm install -g grunt-cli

 * [Fetch](http://gruntjs.com/getting-started#working-with-an-existing-grunt-project) project dependencies

        npm install

 * __Optional__ Move your [Chrome private key](http://developer.chrome.com/extensions/packaging.html#creating) to `keys/chrome.pem` (you may want to [generate it from command line](https://github.com/jed/crx#crx-keygen-directory))

 * If you don't have a key in the keys folder, then the Chrome extension will be pacakaged as a zip file for [uploading to the chrome app store](http://developer.chrome.com/extensions/packaging.html)

 * Build either Firefox (`grunt firefox`), ether Chome/Opera.Next (`grunt chrome`) or both (`grunt`) extensions.

 * Increment version number with grunt bump

## Todo

 * [Automate](http://developer.streak.com/2013/01/how-to-build-safari-extension-using.html) generation extension in Safari format ([XAR](http://mackyle.github.io/xar/howtosign.html#safariextz))
 * Unify icons 
 * Test in old browser versions 
 * Integrate Opera.Presto into build process
 * Link to appropriate [IE addon](https://github.com/dvdotsenko/livereload_ie_extension)
