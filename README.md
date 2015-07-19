# nw-flash-trust

Cross-platform solution for [NW.js](http://nwjs.io/) and [Electron](http://electron.atom.io/) to make your Flash plugins trusted, so they can run smoothly.

## Why this is needed?

NW.js uses local `file://` protocol to render pages. Unfortunately, for security reasons Flash Player doesn't like SWFs embedded locally and applies very restrictive policy to them. Such SWF lands in one of two possible [local sandboxes](http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7e3f.html), and communication via [ExternalInterface](http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/external/ExternalInterface.html) is blocked.

Fortunately there is officially supported way of making your local SWF trusted, so previously mentioned restrictions don't apply. Full explanation can be found in [Adobe Flash Player Administration Guide](http://www.adobe.com/devnet/flashplayer/articles/flash_player_admin_guide.html).

Long story short: you have to put text file in special directory provided by Flash Player and save to this file paths of SWFs you want to be trusted. **This library provides cross-platform API for doing just that.**

## Installation

```
npm install nw-flash-trust
```

## Usage & API

For simplicity API is fully synchronous. It does a little of I/O, but so little it shouldn't be an issue.

```javascript
var path = require('path');
var flashTrust = require('nw-flash-trust');

// appName could be any globally unique string containing only
// big and small letters, numbers and chars "-._"
// It specifies name of file where trusted paths will be stored.
// Best practice is to feed it with "name" value from your package.json file.
var appName = 'myApp';

// Initialization and parsing config file for given appName (if already exists).
var trustManager = flashTrust.initSync(appName);

// Alternatively you can provide a custom flash config folder for initialization.
// This is useful for example if you use Atom Electron and a PPAPI flash plugin (like Pepper Flash),
// as the flash config folder in this case would be in the Atom Electron data path folder.
var trustManager = flashTrust.initSync(appName, '/yourApp-data-path/Pepper Data/Shockwave Flash/WritableRoot');

// adds given filepath to trusted locations
// paths must be absolute
trustManager.add(path.resolve('path-to', 'file.swf'));

// whole folders are also allowed
trustManager.add(path.resolve('path-to', 'folder'));

// removes given path from trusted locations
trustManager.remove(path.resolve('path-to', 'file.swf'));

// returns true or false whether given path is trusted or not
var isTrusted = trustManager.isTrusted(path.resolve('path-to', 'file.swf'));

// returns array containing all trusted paths
var list = trustManager.list();

// removes all trusted locations from config file
trustManager.empty();
```

## License

MIT
