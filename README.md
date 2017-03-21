# charactor-scanner

scan all used charactors from directories/files non repeatly

be useful for fontmin

can distinguish Unicode out of `\u0000~\uFFFF`, charactors like: `'Ǒ'` whose code is `'\u01D1'`

**USE ES2015** 

## Usage

~~~
npm install charactor-scanner
~~~

~~~
const Scan = require('charactor-scanner');
const path = require('path');

Scan({
  dir: [path.resolve(__dirname, './test-directory')]
}, data => console.log("Async Callback call: ", data.join()));

// Async Callback call:  !,",#,$,%,&,',(,),*,+,,,-,.,/,0,1,2,3,4,5,6,7,8,9,:,;,<,=,>,?,@,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,[,\,],^,_,`,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,{,|,},~,𠮷,𠮶,ノ,ン,リ,ピ,ー,ト,的,方,式,来,和,会,计,师,费

Scan({
  dir: path.resolve(__dirname, './test-directory')
}).then(data => console.log("Async Promise call: ", data.join()));

// Async Promise call:  !,",#,$,%,&,',(,),*,+,,,-,.,/,0,1,2,3,4,5,6,7,8,9,:,;,<,=,>,?,@,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,[,\,],^,_,`,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,{,|,},~,的,方,式,来,和,会,计,师,费,𠮷,𠮶,ノ,ン,リ,ピ,ー,ト

console.log("Sync call: ", Scan({
  dir: path.resolve(__dirname, './test-directory'),
  sync: true,
  appendAscii: false
}).join());

// Sync call:  {,",a,:,𠮷,𠮶,,,b,ノ,ン,リ,ピ,ー,ト,},c,o,n,s,l,e,.,g,(,',的,方,式,来,和,会,计,师,费,),;,<,!,d,t,y,p,h,m,>,r,=,U,T,F,-,8,v,i,w,u,1,0,x,q,X,A,C,D,/,*,k,#,f

~~~

### API
~~~
const Scan = require('charactor-scanner');  
Scan(options, callback)
~~~

**When `options.sync` is `true`, the function directly return the result**

**When `options.sync` is `false`, and `callback` have NOT passed, the function return a `Promise` object, and the result will be resolved: `.then(result => console.log(result)`**

**When `options.sync` is `false`, and `callback` have passed, the callback function will be called after scanning and the result will be the first param of callback**

### params

#### `options` : {}

- `sync`: `Boolean`, if use sync mode, default: `false`
- `appendAscii`: `Boolean`, append all readable ascii charactors to the result no matter they are appeared or not, default: `true`
- `dir`: `String / Array`, **Needed**, the dir(s) where to scan charactors, *you have to pass absolute path(s)*, use `path.resolve` to transform paths to absolute
- `ext`: `String / Array`, only scan files with specific ext(s), example: `'json'` or `['txt', 'json', 'html']`
- `ignoreExt`: `String / Array`, files with specific ext(s) should be ignore
- `regExp`: `RegExp`, only scan files whose **path string** match the regexp, example: `/lang-/`, `/\.foo\.txt$/`, `\/dir-foo\/`
- `ignoreRegExp`: `RegExp`, ignore files whose **path string** match the regexp
- Weight: `ignoreRegExp` > `regExp` > `ignoreExt` > `ext`

#### `callback` : function(result){}

### return

An array contains charactors.

### Shortage

cann't identify `"\u0061"` as an `"a"` in javascript file