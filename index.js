const fs = require('fs');
const path = require('path');
const os = require('os');

const ASCII = Array.apply(null, {length: 128}).map((u, i) => String.fromCharCode(i));
const ASCRegExpString = ASCII.map(u => /[0-9a-z]/i.test(u) ? u : `\\${u}`).join('');
const ASCRegExp = new RegExp(`[${ASCRegExpString}]`, 'g');

const _walk = function (dir, done) {
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        
        let pending = list.length;
        if (!pending) return done(null, results);
        
        list.forEach(file => {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    _walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                }
                else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

const _walkSync = function (dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(_walkSync(file))
        }
        else {
            results.push(file)
        }
    });
    return results;
};

const filterFiles = function (list, opt) {
    if (opt.ext.length) {
        list = list.filter(file => new RegExp(`\\.(\?\:${opt.ext.join('|')})\$`, 'i').test(file));
    }
    if (opt.ignoreExt.length) {
        list = list.filter(file => !new RegExp(`\\.(\?\:${opt.ignoreExt.join('|')})\$`, 'i').test(file));
    }
    if (Object.prototype.toString.call(opt.regExp) === '[object RegExp]') {
        list = list.filter(file => opt.regExp.test(file));
    }
    if (Object.prototype.toString.call(opt.ignoreRegExp) === '[object RegExp]') {
        list = list.filter(file => !opt.ignoreRegExp.test(file));
    }
    return list;
};

const getFontCharsSync = function (opt) {
    let files = [];
    opt.dir.forEach(dir => {
        files = files.concat(_walkSync(dir))
    });
    files = filterFiles(files, opt);
    
    let results = opt.appendAscii ? new Set(ASCII.slice(33, 127)) : new Set();
    files.forEach(file => {
        let str = (fs.readFileSync(file, 'utf8') || '').replace(/\s/g, '');
        results = new Set([...results, ...new Set(opt.appendAscii ? str.replace(ASCRegExp, '') : str)])
    });
    return [...results];
};

const getFontChars = function (opt, callback) {
    let totalResult = opt.appendAscii ? new Set(ASCII.slice(33, 127)) : new Set();
    let looping = opt.dir.length;
    opt.dir.forEach(dir => _walk(dir, function (err, files) {
        if (err) throw err;
        
        files = filterFiles(files, opt);
        
        let results = new Set();
        let pending = files.length;
        
        files.forEach(file => {
            fs.readFile(file, 'utf8', (err, data) => {
                data = (data || '').replace(/\s/g, '');
                results = new Set([...results, ...new Set(opt.appendAscii ? data.replace(ASCRegExp, '') : data)]);
                if (!--pending) {
                    totalResult = new Set([...totalResult, ...results]);
                    if (!--looping) {
                        callback([...totalResult]);
                    }
                }
                ;
            })
        })
    }));
};

const options = {
    sync: false,
    appendAscii: true,
    dir: [],
    ext: [],
    ignoreExt: [],
    regExp: null,
    ignoreRegExp: null
};

module.exports = function (opt, callback) {
    // check opt
    if (!opt) {
        console.log('Charactor Scanner :: ERR: Need options');
        return;
    }
    if (!opt.dir) {
        console.log('Charactor Scanner :: ERR: Need dir in options');
        return;
    }
    Object.prototype.toString.call(opt.dir) !== '[object Array]' && (opt.dir = [opt.dir]);
    
    // check path, treat all os as Unix-like except Windows
    let absolutPathRegexp = os.type() === 'Windows_NT' ? /^[a-zA-Z]:\\(((?![<>:"/\\|?*]).)+((?<![ .])\\)?)*$/ : /^\//;
    opt.dir = opt.dir.filter(d => Object.prototype.toString.call(d) === '[object String]' && d.trim() && absolutPathRegexp.test(d));
    
    if (!opt.dir.length) {
        console.log(
            'Charactor Scanner :: ERR: All dirs need to be Absolute paths, please use [path.resolve] to access them before pass');
        return;
    }
    opt = Object.assign({}, options, opt);
    Object.prototype.toString.call(opt.ext) !== '[object Array]' && (opt.ext = [opt.ext]);
    opt.ext = opt.ext.filter(e => Object.prototype.toString.call(e) === '[object String]' && e.trim());
    Object.prototype.toString.call(opt.ignoreExt) !== '[object Array]' && (opt.ignoreExt = [opt.ignoreExt]);
    opt.ignoreExt = opt.ignoreExt.filter(e => Object.prototype.toString.call(e) === '[object String]' && e.trim());
    
    if (opt.sync) {
        return getFontCharsSync(opt);
    }
    else {
        if (callback) {
            return getFontChars(opt, callback);
        }
        else {
            return new Promise(resolve => {
                getFontChars(opt, result => resolve(result))
            });
        }
    }
};
