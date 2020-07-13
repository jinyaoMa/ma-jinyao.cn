!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).toolbox=e()}}(function(){return function e(t,n,r){function o(i,c){if(!n[i]){if(!t[i]){var a="function"==typeof require&&require;if(!c&&a)return a(i,!0);if(s)return s(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var l=n[i]={exports:{}};t[i][0].call(l.exports,function(e){return o(t[i][1][e]||e)},l,l.exports,e,t,n,r)}return n[i].exports}for(var s="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(e,t,n){"use strict";function r(e,t){((t=t||{}).debug||a.debug)&&console.log("[sw-toolbox] "+e)}function o(e){var t;return e&&e.cache&&(t=e.cache.name),t=t||a.cache.name,caches.open(t)}function s(e,t,n){var o=e.url,s=n.maxAgeSeconds,i=n.maxEntries,c=n.name,a=Date.now();return r("Updating LRU order for "+o+". Max entries is "+i+", max age is "+s),u.getDb(c).then(function(e){return u.setTimestampForUrl(e,o,a)}).then(function(e){return u.expireEntries(e,i,s,a)}).then(function(e){r("Successfully updated IDB.");var n=e.map(function(e){return t.delete(e)});return Promise.all(n).then(function(){r("Done with cache cleanup.")})}).catch(function(e){r(e)})}function i(e){var t=Array.isArray(e);if(t&&e.forEach(function(e){"string"==typeof e||e instanceof Request||(t=!1)}),!t)throw new TypeError("The precache method expects either an array of strings and/or Requests or a Promise that resolves to an array of strings and/or Requests.");return e}var c,a=e("./options"),u=e("./idb-cache-expiration");t.exports={debug:r,fetchAndCache:function(e,t){var n=(t=t||{}).successResponses||a.successResponses;return fetch(e.clone()).then(function(r){return"GET"===e.method&&n.test(r.status)&&o(t).then(function(n){n.put(e,r).then(function(){var r=t.cache||a.cache;(r.maxEntries||r.maxAgeSeconds)&&r.name&&function(e,t,n){var r=s.bind(null,e,t,n);c=c?c.then(r):r()}(e,n,r)})}),r.clone()})},openCache:o,renameCache:function(e,t,n){return r("Renaming cache: ["+e+"] to ["+t+"]",n),caches.delete(t).then(function(){return Promise.all([caches.open(e),caches.open(t)]).then(function(t){var n=t[0],r=t[1];return n.keys().then(function(e){return Promise.all(e.map(function(e){return n.match(e).then(function(t){return r.put(e,t)})}))}).then(function(){return caches.delete(e)})})})},cache:function(e,t){return o(t).then(function(t){return t.add(e)})},uncache:function(e,t){return o(t).then(function(t){return t.delete(e)})},precache:function(e){e instanceof Promise||i(e),a.preCacheItems=a.preCacheItems.concat(e)},validatePrecacheInput:i,isResponseFresh:function(e,t,n){if(!e)return!1;if(t){var r=e.headers.get("date");if(r&&new Date(r).getTime()+1e3*t<n)return!1}return!0}}},{"./idb-cache-expiration":2,"./options":4}],2:[function(e,t,n){"use strict";var r="sw-toolbox-",o=1,s="store",i="url",c="timestamp",a={};t.exports={getDb:function(e){return e in a||(a[e]=function(e){return new Promise(function(t,n){var a=indexedDB.open(r+e,o);a.onupgradeneeded=function(){a.result.createObjectStore(s,{keyPath:i}).createIndex(c,c,{unique:!1})},a.onsuccess=function(){t(a.result)},a.onerror=function(){n(a.error)}})}(e)),a[e]},setTimestampForUrl:function(e,t,n){return new Promise(function(r,o){var i=e.transaction(s,"readwrite");i.objectStore(s).put({url:t,timestamp:n}),i.oncomplete=function(){r(e)},i.onabort=function(){o(i.error)}})},expireEntries:function(e,t,n,r){return function(e,t,n){return t?new Promise(function(r,o){var a=1e3*t,u=[],l=e.transaction(s,"readwrite"),p=l.objectStore(s);p.index(c).openCursor().onsuccess=function(e){var t=e.target.result;if(t&&n-a>t.value[c]){var r=t.value[i];u.push(r),p.delete(r),t.continue()}},l.oncomplete=function(){r(u)},l.onabort=o}):Promise.resolve([])}(e,n,r).then(function(n){return function(e,t){return t?new Promise(function(n,r){var o=[],a=e.transaction(s,"readwrite"),u=a.objectStore(s),l=u.index(c),p=l.count();l.count().onsuccess=function(){var e=p.result;e>t&&(l.openCursor().onsuccess=function(n){var r=n.target.result;if(r){var s=r.value[i];o.push(s),u.delete(s),e-o.length>t&&r.continue()}})},a.oncomplete=function(){n(o)},a.onabort=r}):Promise.resolve([])}(e,t).then(function(e){return n.concat(e)})})}}},{}],3:[function(e,t,n){"use strict";function r(e){return e.reduce(function(e,t){return e.concat(t)},[])}e("serviceworker-cache-polyfill");var o=e("./helpers"),s=e("./router"),i=e("./options");t.exports={fetchListener:function(e){var t=s.match(e.request);t?e.respondWith(t(e.request)):s.default&&"GET"===e.request.method&&0===e.request.url.indexOf("http")&&e.respondWith(s.default(e.request))},activateListener:function(e){o.debug("activate event fired");var t=i.cache.name+"$$$inactive$$$";e.waitUntil(o.renameCache(t,i.cache.name))},installListener:function(e){var t=i.cache.name+"$$$inactive$$$";o.debug("install event fired"),o.debug("creating cache ["+t+"]"),e.waitUntil(o.openCache({cache:{name:t}}).then(function(e){return Promise.all(i.preCacheItems).then(r).then(o.validatePrecacheInput).then(function(t){return o.debug("preCache list: "+(t.join(", ")||"(none)")),e.addAll(t)})}))}}},{"./helpers":1,"./options":4,"./router":6,"serviceworker-cache-polyfill":16}],4:[function(e,t,n){"use strict";var r;r=self.registration?self.registration.scope:self.scope||new URL("./",self.location).href,t.exports={cache:{name:"$$$toolbox-cache$$$"+r+"$$$",maxAgeSeconds:null,maxEntries:null,queryOptions:null},debug:!1,networkTimeoutSeconds:null,preCacheItems:[],successResponses:/^0|([123]\d\d)|(40[14567])|410$/}},{}],5:[function(e,t,n){"use strict";var r=new URL("./",self.location).pathname,o=e("path-to-regexp"),s=function(e,t,n,s){t instanceof RegExp?this.fullUrlRegExp=t:(0!==t.indexOf("/")&&(t=r+t),this.keys=[],this.regexp=o(t,this.keys)),this.method=e,this.options=s,this.handler=n};s.prototype.makeHandler=function(e){var t;if(this.regexp){var n=this.regexp.exec(e);t={},this.keys.forEach(function(e,r){t[e.name]=n[r+1]})}return function(e){return this.handler(e,t,this.options)}.bind(this)},t.exports=s},{"path-to-regexp":15}],6:[function(e,t,n){"use strict";var r=e("./route"),o=e("./helpers"),s=function(e,t){for(var n=e.entries(),r=n.next(),o=[];!r.done;)new RegExp(r.value[0]).test(t)&&o.push(r.value[1]),r=n.next();return o},i=function(){this.routes=new Map,this.routes.set(RegExp,new Map),this.default=null};["get","post","put","delete","head","any"].forEach(function(e){i.prototype[e]=function(t,n,r){return this.add(e,t,n,r)}}),i.prototype.add=function(e,t,n,s){var i;s=s||{},t instanceof RegExp?i=RegExp:i=(i=s.origin||self.location.origin)instanceof RegExp?i.source:function(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}(i),e=e.toLowerCase();var c=new r(e,t,n,s);this.routes.has(i)||this.routes.set(i,new Map);var a=this.routes.get(i);a.has(e)||a.set(e,new Map);var u=a.get(e),l=c.regexp||c.fullUrlRegExp;u.has(l.source)&&o.debug('"'+t+'" resolves to same regex as existing route.'),u.set(l.source,c)},i.prototype.matchMethod=function(e,t){var n=new URL(t),r=n.origin,o=n.pathname;return this._match(e,s(this.routes,r),o)||this._match(e,[this.routes.get(RegExp)],t)},i.prototype._match=function(e,t,n){if(0===t.length)return null;for(var r=0;r<t.length;r++){var o=t[r],i=o&&o.get(e.toLowerCase());if(i){var c=s(i,n);if(c.length>0)return c[0].makeHandler(n)}}return null},i.prototype.match=function(e){return this.matchMethod(e.method,e.url)||this.matchMethod("any",e.url)},t.exports=new i},{"./helpers":1,"./route":5}],7:[function(e,t,n){"use strict";var r=e("../options"),o=e("../helpers");t.exports=function(e,t,n){var s=(n=n||{}).cache||r.cache,i=s.queryOptions;return o.debug("Strategy: cache first ["+e.url+"]",n),o.openCache(n).then(function(t){return t.match(e,i).then(function(t){var r=Date.now();return o.isResponseFresh(t,s.maxAgeSeconds,r)?t:o.fetchAndCache(e,n)})})}},{"../helpers":1,"../options":4}],8:[function(e,t,n){"use strict";var r=e("../options"),o=e("../helpers");t.exports=function(e,t,n){var s=(n=n||{}).cache||r.cache,i=s.queryOptions;return o.debug("Strategy: cache only ["+e.url+"]",n),o.openCache(n).then(function(t){return t.match(e,i).then(function(e){var t=Date.now();if(o.isResponseFresh(e,s.maxAgeSeconds,t))return e})})}},{"../helpers":1,"../options":4}],9:[function(e,t,n){"use strict";var r=e("../helpers"),o=e("./cacheOnly");t.exports=function(e,t,n){return r.debug("Strategy: fastest ["+e.url+"]",n),new Promise(function(s,i){var c=!1,a=[],u=function(e){a.push(e.toString()),c?i(new Error('Both cache and network failed: "'+a.join('", "')+'"')):c=!0},l=function(e){e instanceof Response?s(e):u("No result returned")};r.fetchAndCache(e.clone(),n).then(l,u),o(e,t,n).then(l,u)})}},{"../helpers":1,"./cacheOnly":8}],10:[function(e,t,n){t.exports={networkOnly:e("./networkOnly"),networkFirst:e("./networkFirst"),cacheOnly:e("./cacheOnly"),cacheFirst:e("./cacheFirst"),fastest:e("./fastest")}},{"./cacheFirst":7,"./cacheOnly":8,"./fastest":9,"./networkFirst":11,"./networkOnly":12}],11:[function(e,t,n){"use strict";var r=e("../options"),o=e("../helpers");t.exports=function(e,t,n){var s=(n=n||{}).cache||r.cache,i=s.queryOptions,c=n.successResponses||r.successResponses,a=n.networkTimeoutSeconds||r.networkTimeoutSeconds;return o.debug("Strategy: network first ["+e.url+"]",n),o.openCache(n).then(function(t){var r,u,l=[];if(a){var p=new Promise(function(n){r=setTimeout(function(){t.match(e,i).then(function(e){var t=Date.now(),r=s.maxAgeSeconds;o.isResponseFresh(e,r,t)&&n(e)})},1e3*a)});l.push(p)}var f=o.fetchAndCache(e,n).then(function(e){if(r&&clearTimeout(r),c.test(e.status))return e;throw o.debug("Response was an HTTP error: "+e.statusText,n),u=e,new Error("Bad response")}).catch(function(r){return o.debug("Network or response error, fallback to cache ["+e.url+"]",n),t.match(e,i).then(function(e){if(e)return e;if(u)return u;throw r})});return l.push(f),Promise.race(l)})}},{"../helpers":1,"../options":4}],12:[function(e,t,n){"use strict";var r=e("../helpers");t.exports=function(e,t,n){return r.debug("Strategy: network only ["+e.url+"]",n),fetch(e)}},{"../helpers":1}],13:[function(e,t,n){"use strict";var r=e("./options"),o=e("./router"),s=e("./helpers"),i=e("./strategies"),c=e("./listeners");s.debug("Service Worker Toolbox is loading"),self.addEventListener("install",c.installListener),self.addEventListener("activate",c.activateListener),self.addEventListener("fetch",c.fetchListener),t.exports={networkOnly:i.networkOnly,networkFirst:i.networkFirst,cacheOnly:i.cacheOnly,cacheFirst:i.cacheFirst,fastest:i.fastest,router:o,options:r,cache:s.cache,uncache:s.uncache,precache:s.precache}},{"./helpers":1,"./listeners":3,"./options":4,"./router":6,"./strategies":10}],14:[function(e,t,n){t.exports=Array.isArray||function(e){return"[object Array]"==Object.prototype.toString.call(e)}},{}],15:[function(e,t,n){function r(e,t){for(var n,r=[],o=0,s=0,i="",u=t&&t.delimiter||"/";null!=(n=d.exec(e));){var l=n[0],p=n[1],f=n.index;if(i+=e.slice(s,f),s=f+l.length,p)i+=p[1];else{var h=e[s],m=n[2],g=n[3],x=n[4],v=n[5],w=n[6],y=n[7];i&&(r.push(i),i="");var b=null!=m&&null!=h&&h!==m,E="+"===w||"*"===w,k="?"===w||"*"===w,R=n[2]||u,$=x||v;r.push({name:g||o++,prefix:m||"",delimiter:R,optional:k,repeat:E,partial:b,asterisk:!!y,pattern:$?a($):y?".*":"[^"+c(R)+"]+?"})}}return s<e.length&&(i+=e.substr(s)),i&&r.push(i),r}function o(e){return encodeURI(e).replace(/[\/?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function s(e){return encodeURI(e).replace(/[?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function i(e){for(var t=new Array(e.length),n=0;n<e.length;n++)"object"==typeof e[n]&&(t[n]=new RegExp("^(?:"+e[n].pattern+")$"));return function(n,r){for(var i="",c=n||{},a=(r||{}).pretty?o:encodeURIComponent,u=0;u<e.length;u++){var l=e[u];if("string"!=typeof l){var p,f=c[l.name];if(null==f){if(l.optional){l.partial&&(i+=l.prefix);continue}throw new TypeError('Expected "'+l.name+'" to be defined')}if(h(f)){if(!l.repeat)throw new TypeError('Expected "'+l.name+'" to not repeat, but received `'+JSON.stringify(f)+"`");if(0===f.length){if(l.optional)continue;throw new TypeError('Expected "'+l.name+'" to not be empty')}for(var d=0;d<f.length;d++){if(p=a(f[d]),!t[u].test(p))throw new TypeError('Expected all "'+l.name+'" to match "'+l.pattern+'", but received `'+JSON.stringify(p)+"`");i+=(0===d?l.prefix:l.delimiter)+p}}else{if(p=l.asterisk?s(f):a(f),!t[u].test(p))throw new TypeError('Expected "'+l.name+'" to match "'+l.pattern+'", but received "'+p+'"');i+=l.prefix+p}}else i+=l}return i}}function c(e){return e.replace(/([.+*?=^!:${}()[\]|\/\\])/g,"\\$1")}function a(e){return e.replace(/([=!:$\/()])/g,"\\$1")}function u(e,t){return e.keys=t,e}function l(e){return e.sensitive?"":"i"}function p(e,t,n){h(t)||(n=t||n,t=[]);for(var r=(n=n||{}).strict,o=!1!==n.end,s="",i=0;i<e.length;i++){var a=e[i];if("string"==typeof a)s+=c(a);else{var p=c(a.prefix),f="(?:"+a.pattern+")";t.push(a),a.repeat&&(f+="(?:"+p+f+")*"),s+=f=a.optional?a.partial?p+"("+f+")?":"(?:"+p+"("+f+"))?":p+"("+f+")"}}var d=c(n.delimiter||"/"),m=s.slice(-d.length)===d;return r||(s=(m?s.slice(0,-d.length):s)+"(?:"+d+"(?=$))?"),s+=o?"$":r&&m?"":"(?="+d+"|$)",u(new RegExp("^"+s,l(n)),t)}function f(e,t,n){return h(t)||(n=t||n,t=[]),n=n||{},e instanceof RegExp?function(e,t){var n=e.source.match(/\((?!\?)/g);if(n)for(var r=0;r<n.length;r++)t.push({name:r,prefix:null,delimiter:null,optional:!1,repeat:!1,partial:!1,asterisk:!1,pattern:null});return u(e,t)}(e,t):h(e)?function(e,t,n){for(var r=[],o=0;o<e.length;o++)r.push(f(e[o],t,n).source);return u(new RegExp("(?:"+r.join("|")+")",l(n)),t)}(e,t,n):function(e,t,n){return p(r(e,n),t,n)}(e,t,n)}var h=e("isarray");t.exports=f,t.exports.parse=r,t.exports.compile=function(e,t){return i(r(e,t))},t.exports.tokensToFunction=i,t.exports.tokensToRegExp=p;var d=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"].join("|"),"g")},{isarray:14}],16:[function(e,t,n){!function(){var e=Cache.prototype.addAll,t=navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);if(t)var n=t[1],r=parseInt(t[2]);e&&(!t||"Firefox"===n&&r>=46||"Chrome"===n&&r>=50)||(Cache.prototype.addAll=function(e){function t(e){this.name="NetworkError",this.code=19,this.message=e}var n=this;return t.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return e=e.map(function(e){return e instanceof Request?e:String(e)}),Promise.all(e.map(function(e){"string"==typeof e&&(e=new Request(e));var n=new URL(e.url).protocol;if("http:"!==n&&"https:"!==n)throw new t("Invalid scheme");return fetch(e.clone())}))}).then(function(r){if(r.some(function(e){return!e.ok}))throw new t("Incorrect response status");return Promise.all(r.map(function(t,r){return n.put(e[r],t)}))}).then(function(){})},Cache.prototype.add=function(e){return this.addAll([e])})}()},{}]},{},[13])(13)}),self.addEventListener("install",function(){return self.skipWaiting()}),self.addEventListener("active",function(){return self.clients.claim()});var precacheUrls=["/","/posts/4759/","/posts/3164/","/posts/6004/","/posts/2915/","/posts/46208/","/posts/49651/","/posts/8716/","/posts/4785/","/posts/64366/","/posts/26104/","/posts/2141/","/posts/51385/","/posts/12019/","/posts/218/","/posts/64322/","/posts/9628/","/about/index.html","/extension/content.json","/gallery/index.html","/library/index.html","/icons/index.html","/letter/index.html","/records/content.json","/records/index.html","/resume/index.html","/extension/letter/index.css","/extension/palette/index.css","/extension/letter/index.js","/extension/palette/index.js","/extension/resume/index.css","/extension/resume/index.js","/extension/resume/chinese/data.json","/extension/resume/english/data.json","/extension/letter/english/data.json","/extension/letter/chinese/data.json"];toolbox.precache(precacheUrls),toolbox.options={networkTimeoutSeconds:5},toolbox.router.any(/(hm\.baidu\.com|google\.com|api\.i-meto\.com|api\.github\.com|clustrmaps\.com|cdn\.jsdelivr\.net)/,toolbox.networkOnly),toolbox.router.any(/(icon-lib|font-mustom|MPlayer)/,toolbox.networkOnly),toolbox.router.any(/.*\/asset\/part\/.+\.(html)(\?.*)?$/,toolbox.cacheFirst),toolbox.router.any(/.+\.(jpg|jpeg|png|gif|svg|webp|ico|eot|ttf|woff|woff2|otf|mtn|moc)(\?.*)?$/,toolbox.cacheFirst),toolbox.router.any(/\//,toolbox.networkFirst);