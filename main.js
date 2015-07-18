'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var mkdirp = require('mkdirp');

function getFlashPlayerFolder() {
    switch (process.platform) {
    case 'win32':
        var version = os.release().split('.');
        if (version[0] === '5') {
            // xp
            return process.env.USERPROFILE + '\\Application Data\\Macromedia\\Flash Player';
        } else {
            // vista, 7, 8
            return process.env.USERPROFILE + '\\AppData\\Roaming\\Macromedia\\Flash Player';
        }
    case 'darwin':
        // osx
        return process.env.HOME + '/Library/Preferences/Macromedia/Flash Player';
    case 'linux':
        return process.env.HOME + '/.macromedia/Flash_Player';
    }
    return null;
}

function getFlashPlayerConfigFolder(customFolder) {
    if (customFolder) {
        return path.join(customFolder, '#Security', 'FlashPlayerTrust');
    }
    return path.join(getFlashPlayerFolder(), '#Security', 'FlashPlayerTrust');
}

module.exports.initSync = function (appName, customFolder) {
    
    var trusted = [];
    var cfgPath, cfgFolder;
    
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
    
    cfgFolder = getFlashPlayerConfigFolder(customFolder);

    // Find out if Flash Config Folder exists
    if (!fs.existsSync(cfgFolder)) {
        // if this folder is not present then try to create it
        try {
            mkdirp.sync(cfgFolder);
        } catch(err) {
            throw new Error('Could not create Flash Player config folder.');
        }
    }
    
    cfgPath = path.join(cfgFolder, appName + '.cfg');
    if (fs.existsSync(cfgPath)) {
        // load and parse file if exists
        var data = fs.readFileSync(cfgPath, { encoding: 'utf8' });
        trusted = data.split(os.EOL);
        // on the end of file could be empty line which means nothing
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