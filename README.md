Cross-platform solution for [node-webkit](https://github.com/rogerwang/node-webkit) to make your Flash content trusted, so it can run smoothly.

## Background

Node-webkit uses "file:" protocol to render pages (what makes perfect sense because it runs locally). Unfortunately, for security reasons Flash doesn't like swfs embedded locally and applies very restrictive policy to them. Such swf lands in one of two possible [local sandboxes](http://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS5b3ccc516d4fbf351e63e3d118a9b90204-7e3f.html), and communication via ExternalInterface is blocked.

### Solution

Fortunately there is officially supported way of making your local swf trusted, so previously mentioned restrictions don't apply. Full explanation can be found in [Adobe Flash Player Administration Guide](http://www.adobe.com/devnet/flashplayer/articles/flash_player_admin_guide.html).

Long story short: you have to put config file in special directory provided by Flash Player and save to this file paths of swfs you want to be trusted. This library provides cross-platform API for doing just that.

### Tested on

- Windows XP
- Windows 7
- Mac OS 10.8
- Linux Mint
- Ubuntu
- Fedora

## Installation

```
npm install git://github.com/szwacz/nw-flash-trust.git#master
```

## Usage & API

For the simplicity API is fully synchronous. It does a little of I/O, but so little I don't think it will freeze anything. If you have different opinion please share it.

```javascript
var path = require('path');
var flashTrust = require('nw-flash-trust');

// appName could be any globally unique string containing only
// big and small letters, numbers and chars "-._".
// It specifies name of file where trusted paths will be stored.
// Best practice is to feed it with "name" value from your package.json file.
var appName = 'my-test-app';

try {
    // initialization and parsing config file for given appName (if already exists)
    var trustManager = flashTrust.initSync(appName);
} catch(err) {
    if (err.message === 'Flash Player config folder not found.') {
        // Directory needed to do the work does not exist.
        // Probbably Flash Player is not installed, there is nothing I can do.
    }
}

// adds given filepath to trusted locations
trustManager.add('/path/to/file.swf');

// whole folders are also allowed
trustManager.add('/path/to/folder');

// removes given path from trusted locations
trustManager.remove('/path/to/file.swf');

// returns true or false whether given path is trusted or not
var isTrusted = trustManager.isTrusted('/path/to/file.swf');

// returns array containing all trusted paths
var list = trustManager.list();

// removes all trusted locations from config file
trustManager.empty();
```

### Making files inside my application trusted

```javascript
var path = require('path');

// as for node-webkit 0.6.3 __dirname is not supported so little more work is needed
var appPath = path.dirname(process.execPath);

// use path.join() for constructing system paths because it will
// insert '\' or '/' depending on platform
var playerPath = path.join(appPath, 'player.swf');

trustManager.add(playerPath);
```

### Pitfalls

On Windows 2 Flash plugins can coexist: ActiveX plugin for Internet Explorer and second one, for all other browsers (Chrome, Firefox, Opera, Safari). If only ActiveX plugin is installed there is flash-config-folder on this maschine, so nw-flash-trust will instantiate withou throwing any error. But node-webkit uses the second plugin so in this case there is no Flash for him. Dont rely for Flash detection on what nw-flash-trust tells you.

To be sure Flash is available in node-webkit use this function:
```javascript
function isFlashAvailable() {
    return typeof navigator.plugins.namedItem('Shockwave Flash') === 'object';
}
```

## License

MIT