'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

function getUserHome() {
    if (process.platform === 'win32') {
        return process.env.USERPROFILE;
    }
    return process.env.HOME;
}

function getFlashPlayerFolder() {
    switch (os.platform()) {
    case 'win32':
        var version = os.release().split('.');
        if (version[0] === '5') {
            // xp
            return getUserHome() + '\\Application Data\\Macromedia\\Flash Player';
        } else {
            // vista, 7, 8
            return getUserHome() + '\\AppData\\Roaming\\Macromedia\\Flash Player';
        }
    case 'darwin':
        // os x
        return getUserHome() + '/Library/Preferences/Macromedia/Flash Player';
    case 'linux':
        return getUserHome() + '/.macromedia/Flash_Player';
    }
    return null;
}

module.exports.initSync = function (appName) {
    
    var trusted = [];
    var cfgPath;
    
    function save() {
        var data = trusted.join(os.EOL);
        fs.writeFileSync(cfgPath, data, { encoding: 'utf8' });
    }
    
    function add(path) {
        if (!isTrusted(path)) {
            trusted.push(path);
        }
        save();
    }
    
    function remove(path) {
        var index = trusted.indexOf(path);
        if (index !== -1) {
            trusted.splice(index, 1);
        }
        save();
    }
    
    function isTrusted(path) {
        return trusted.indexOf(path) !== -1;
    }
    
    function list() {
        return trusted.concat();
    }
    
    function empty() {
        trusted = [];
        save();
    }
    
    // Init
    // ----------------------
    
    if (typeof appName !== 'string' || appName === '' || !appName.match(/^[a-zA-Z0-9-_\.]*$/)) {
        throw new Error('Provide valid appName.');
    }
    
    // Determine flash player config folder path
    
    cfgPath = getFlashPlayerFolder();
    if (!fs.existsSync(cfgPath)) {
        // if this folder is not present then there is nothing I can do
        throw new Error('Flash Player config folder not found.');
    }
    
    // Adding next parts to path one after another and checking if they exist
    
    cfgPath = path.resolve(cfgPath, '#Security');
    if (!fs.existsSync(cfgPath)) {
        fs.mkdirSync(cfgPath);
    }
    
    cfgPath = path.resolve(cfgPath, 'FlashPlayerTrust');
    if (!fs.existsSync(cfgPath)) {
        fs.mkdirSync(cfgPath);
    }
    
    cfgPath = path.resolve(cfgPath, appName + '.cfg');
    if (fs.existsSync(cfgPath)) {
        // load and parse file if exists
        var data = fs.readFileSync(cfgPath, { encoding: 'utf8' });
        trusted = data.split(os.EOL);
        var emptyStringIndex = trusted.indexOf('');
        if (emptyStringIndex !== -1) {
            trusted.splice(emptyStringIndex, 1);
        }
    }
    
    // API
    // ----------------------
    
    return {
        add: add,
        list: list,
        isTrusted: isTrusted,
        remove: remove,
        empty: empty,
    };
};