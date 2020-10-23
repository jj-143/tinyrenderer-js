parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"g9lg":[function(require,module,exports) {
"use strict";function r(r){return o(r)||e(r)||n(r)||t()}function t(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function n(r,t){if(r){if("string"==typeof r)return a(r,t);var n=Object.prototype.toString.call(r).slice(8,-1);return"Object"===n&&r.constructor&&(n=r.constructor.name),"Map"===n||"Set"===n?Array.from(r):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?a(r,t):void 0}}function e(r){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(r))return Array.from(r)}function o(r){if(Array.isArray(r))return a(r)}function a(r,t){(null==t||t>r.length)&&(t=r.length);for(var n=0,e=new Array(t);n<t;n++)e[n]=r[n];return e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.mToV=exports.identity_4=exports.matmul=exports.matmul4=exports.matmulvec4aug=exports.matmulvec=exports.transpose=exports.columnVector=exports.inverse3=exports.inverse=exports.vecdiv=exports.determinant3=exports.determinant=exports.neg=exports.iNormalize3=exports.normalize=exports.abs=exports.dot=exports.subtract=exports.cross=void 0;var u=function(r,t){return[r[1]*t[2]-r[2]*t[1],-r[0]*t[2]+r[2]*t[0],r[0]*t[1]-r[1]*t[0]]};exports.cross=u;var i=function(r,t){return[r[0]-t[0],r[1]-t[1],r[2]-t[2]]};exports.subtract=i;var s=function(r,t){return r[0]*t[0]+r[1]*t[1]+r[2]*t[2]};exports.dot=s;var c=function(r){return Math.sqrt(Math.pow(r[0],2)+Math.pow(r[1],2)+Math.pow(r[2],2))};exports.abs=c;var p=function(r){var t=c(r);return r.map(function(r){return r/t})};exports.normalize=p;var f=function(r){var t=Math.sqrt(Math.pow(r[0],2)+Math.pow(r[1],2)+Math.pow(r[2],2));return r[0]/=t,r[1]/=t,r[2]/=t,r};exports.iNormalize3=f;var m=function(r){return r.map(function(r){return-r})};exports.neg=m;var v=function(t,n,e){return r(Array(t.length-1).keys()).map(function(o){return[].concat(r(t[o=o<n?o:o+1].slice(0,e)),r(t[o].slice(e+1)))})},l=function r(t){return 2==t.length?t[0][0]*t[1][1]-t[0][1]*t[1][0]:t[0].reduce(function(n,e,o){return e*(o%2?-1:1)*r(v(t,0,o))+n},0)};exports.determinant=l;var x=function(r){return r[0][0]*(r[1][1]*r[2][2]-r[1][2]*r[2][1])-r[0][1]*(r[1][0]*r[2][2]-r[1][2]*r[2][0])+r[0][2]*(r[1][0]*r[2][1]-r[1][1]*r[2][0])};exports.determinant3=x;var h=function(r){return r.map(function(t,n){return t.map(function(t,e){return((n+e)%2?-1:1)*l(v(r,e,n))})})},y=function(r,t){return r.map(function(r){return r/t})};exports.vecdiv=y;var d=function(r){var t=l(r);return h(r).map(function(r){return y(r,t)})};exports.inverse=d;var g=function(r){var t=r[0][0]*(r[1][1]*r[2][2]-r[1][2]*r[2][1])-r[0][1]*(r[1][0]*r[2][2]-r[1][2]*r[2][0])+r[0][2]*(r[1][0]*r[2][1]-r[1][1]*r[2][0]);return[[(r[1][1]*r[2][2]-r[1][2]*r[2][1])/t,(-r[0][1]*r[2][2]+r[0][2]*r[2][1])/t,(r[0][1]*r[1][2]-r[0][2]*r[1][1])/t],[(-r[1][0]*r[2][2]+r[1][2]*r[2][0])/t,(r[0][0]*r[2][2]-r[0][2]*r[2][0])/t,(-r[0][0]*r[1][2]+r[0][2]*r[1][0])/t],[(r[1][0]*r[2][1]-r[1][1]*r[2][0])/t,(-r[0][0]*r[2][1]+r[0][1]*r[2][0])/t,(r[0][0]*r[1][1]-r[0][1]*r[1][0])/t]]};exports.inverse3=g;var b=function(r){return r.map(function(r){return[r]})};exports.columnVector=b;var A=function(t){var n=t.length,e=t[0].length;return void 0===e?t.map(function(r){return[r]}):r(Array(e).keys()).map(function(e){return r(Array(n).keys()).map(function(r){return t[r][e]})})};exports.transpose=A;var w=function(r,t){return[r[0][0]*t[0]+r[0][1]*t[1]+r[0][2]*t[2],r[1][0]*t[0]+r[1][1]*t[1]+r[1][2]*t[2],r[2][0]*t[0]+r[2][1]*t[1]+r[2][2]*t[2]]};exports.matmulvec=w;var M=function(r,t,n){return[r[0][0]*t[0]+r[0][1]*t[1]+r[0][2]*t[2]+r[0][3]*n,r[1][0]*t[0]+r[1][1]*t[1]+r[1][2]*t[2]+r[1][3]*n,r[2][0]*t[0]+r[2][1]*t[1]+r[2][2]*t[2]+r[2][3]*n,r[3][0]*t[0]+r[3][1]*t[1]+r[3][2]*t[2]+r[3][3]*n]};exports.matmulvec4aug=M;var j=function(r,t){for(var n=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],e=0;e<4;e++)for(var o=0;o<4;o++){for(var a=0,u=0;u<4;u++)a+=r[e][u]*t[u][o];n[e][o]=a}return n};exports.matmul4=j;var S=function(r,t,n){if(r[0].length!=t.length||!r[0].length||!t[0].length)throw Error("Dimension error");for(var e=r.length,o=t[0].length,a=r[0].length,u=null!=n?n:Array.from(Array(e)).map(function(r){return[]}),i=0;i<e;i++)for(var s=0;s<o;s++){for(var c=0,p=0;p<a;p++)c+=r[i][p]*t[p][s];u[i][s]=c}return u};exports.matmul=S;var z=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];exports.identity_4=z;var O=function(r){return y(r,r[3]).slice(0,3)};exports.mToV=O;
},{}],"ngvj":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.barycentric=i,exports.calcModelViewMatrix=u,exports.calcPerspectiveMatrix=s,exports.calcViewportMatrix=l;var r=require("./vecOps");function t(r){return a(r)||o(r)||n(r)||e()}function e(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function n(r,t){if(r){if("string"==typeof r)return c(r,t);var e=Object.prototype.toString.call(r).slice(8,-1);return"Object"===e&&r.constructor&&(e=r.constructor.name),"Map"===e||"Set"===e?Array.from(r):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?c(r,t):void 0}}function o(r){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(r))return Array.from(r)}function a(r){if(Array.isArray(r))return c(r)}function c(r,t){(null==t||t>r.length)&&(t=r.length);for(var e=0,n=new Array(t);e<t;e++)n[e]=r[e];return n}function i(t,e,n,o,a){var c=(0,r.cross)([n[0]-t[0],e[0]-t[0],t[0]-o],[n[1]-t[1],e[1]-t[1],t[1]-a]);return Math.abs(c[2])<1?[-1,0,0]:[1-(c[0]+c[1])/c[2],c[1]/c[2],c[0]/c[2]]}function u(e,n,o){var a=(0,r.normalize)((0,r.subtract)(e,o)),c=(0,r.normalize)((0,r.cross)(n,a)),i=(0,r.normalize)((0,r.cross)(a,c)),u=[[].concat(t(c),[0]),[].concat(t(i),[0]),[].concat(t(a),[0]),[0,0,0,1]],s=[[1,0,0,-o[0]],[0,1,0,-o[1]],[0,0,1,-o[2]],[0,0,0,1]];return(0,r.matmul)(u,s)}function s(r){return[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,-1/r,1]]}function l(r,t,e,n){var o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:255;return[[e/2,0,0,r+e/2],[0,n/2,0,t+n/2],[0,0,o/2,o/2],[0,0,0,1]]}
},{"./vecOps":"g9lg"}],"e1dR":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.triangleWithZBuffer=c;var r=require("./vecOps"),t=require("./utils");function e(r,t){return u(r)||o(r,t)||a(r,t)||n()}function n(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function a(r,t){if(r){if("string"==typeof r)return i(r,t);var e=Object.prototype.toString.call(r).slice(8,-1);return"Object"===e&&r.constructor&&(e=r.constructor.name),"Map"===e||"Set"===e?Array.from(r):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?i(r,t):void 0}}function i(r,t){(null==t||t>r.length)&&(t=r.length);for(var e=0,n=new Array(t);e<t;e++)n[e]=r[e];return n}function o(r,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(r)){var e=[],n=!0,a=!1,i=void 0;try{for(var o,u=r[Symbol.iterator]();!(n=(o=u.next()).done)&&(e.push(o.value),!t||e.length!==t);n=!0);}catch(c){a=!0,i=c}finally{try{n||null==u.return||u.return()}finally{if(a)throw i}}return e}}function u(r){if(Array.isArray(r))return r}function c(n,a,i,o,u,c,f,l){var s=e((0,r.matmul)([n,a,i],l).map(function(t){return(0,r.vecdiv)(t.slice(0,3),t[3])}),3);n=s[0],a=s[1],i=s[2];for(var m=[Math.max(0,parseInt(Math.min(n[0],a[0],i[0]))),Math.max(0,parseInt(Math.min(n[1],a[1],i[1])))],v=[Math.min(f,parseInt(Math.max(n[0],a[0],i[0]))),Math.min(f,parseInt(Math.max(n[1],a[1],i[1])))],y=m[0];y<=v[0];y++)for(var h=m[1];h<=v[1];h++){var p=(0,t.barycentric)(n,a,i,y,h);if(!(p[0]<0||p[1]<0||p[2]<0)){var d=(0,r.dot)([n[2],a[2],i[2]],p),b=(f-1-h)*f+y;if(!(u[b]>d)){var M=[0,0,0,255];o.fragment(p,M)||(u[b]=d,c[4*b]=M[0],c[4*b+1]=M[1],c[4*b+2]=M[2],c[4*b+3]=M[3])}}}}
},{"./vecOps":"g9lg","./utils":"ngvj"}],"ARGM":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.PerspectiveCamera=void 0;var t=require("./utils"),i=require("./vecOps");function e(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function o(t,i){for(var e=0;e<i.length;e++){var o=i[e];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function r(t,i,e){return i&&o(t.prototype,i),e&&o(t,e),t}var s=function(){function o(r){var s=r.position,a=r.lookAt,n=void 0===a?[0,0,0]:a,u=r.up,l=void 0===u?[0,1,0]:u,c=r.viewport;e(this,o),this.position=s,this.lookAt=n,this.up=l,this.vW=c[0],this.vH=c[1];var p=(0,t.calcPerspectiveMatrix)((0,i.abs)((0,i.subtract)(s,n))),v=(0,t.calcModelViewMatrix)(s,l,n);this.uniM=(0,i.matmul)(p,v),this.viewportTr=(0,i.transpose)((0,t.calcViewportMatrix)(0,0,this.vW,this.vH,255))}return r(o,[{key:"update",value:function(e){var o=e.position,r=e.lookAt,s=e.up;this.position=null!=o?o:this.position,this.lookAt=null!=r?r:this.lookAt,this.up=null!=s?s:this.up;var a=(0,t.calcPerspectiveMatrix)((0,i.abs)((0,i.subtract)(this.position,this.lookAt))),n=(0,t.calcModelViewMatrix)(this.position,this.up,this.lookAt);this.uniM=(0,i.matmul)(a,n)}}]),o}();exports.PerspectiveCamera=s;
},{"./utils":"ngvj","./vecOps":"g9lg"}],"uBxZ":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"PerspectiveCamera",{enumerable:!0,get:function(){return t.PerspectiveCamera}}),exports.TinyRenderer=void 0;var e=require("./utils/drawer"),t=require("./utils/PerspectiveCamera");function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function a(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}var i=function(){function t(e){var n=e.target;r(this,t);var a=this.domElement=n||document.createElement("canvas");this.ctx=a.getContext("2d")}return a(t,[{key:"setSize",value:function(e,t){this.domElement.width=e,this.domElement.height=t,this.zBuffer=new Uint8ClampedArray(e*t*4)}},{key:"render",value:function(t,r){var n=r.vW,a=r.vH;this.ctx.clearRect(0,0,n,a);var i=this.ctx.getImageData(0,0,n,a),o=i.data;this.zBuffer.fill(-1/0);var u=t.model,c=t.light,s=u.shader,l=r.viewportTr;s.updateUniform({uniM:r.uniM,lightDir:c.dir});for(var f=new Date,v=[],d=0;d<u.faces.length;d++){for(var h=0;h<3;h++)v[h]=s.vertex(d,h);e.triangleWithZBuffer.apply(void 0,v.concat([s,this.zBuffer,o,n,l]))}console.log("render: ",new Date-f,"ms"),this.ctx.putImageData(i,0,0)}}]),t}();exports.TinyRenderer=i;
},{"./utils/drawer":"e1dR","./utils/PerspectiveCamera":"ARGM"}],"bj8e":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.FastDiffuseTangentNormalSpecular=exports.DiffuseTangentNormalSpecular=exports.DiffuseNormalSpecular=exports.TextureAndNormalMap=exports.ShaderWithTexture=exports.GouraudShader=void 0;var t=require("./vecOps");function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function r(t,e){return u(t)||s(t,e)||a(t,e)||i()}function i(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function a(t,e){if(t){if("string"==typeof t)return n(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(t,e):void 0}}function n(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,i=new Array(e);r<e;r++)i[r]=t[r];return i}function s(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var r=[],i=!0,a=!1,n=void 0;try{for(var s,u=t[Symbol.iterator]();!(i=(s=u.next()).done)&&(r.push(s.value),!e||r.length!==e);i=!0);}catch(o){a=!0,n=o}finally{try{i||null==u.return||u.return()}finally{if(a)throw n}}return r}}function u(t){if(Array.isArray(t))return t}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&h(t,e)}function h(t,e){return(h=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function f(t){var e=v();return function(){var r,i=c(t);if(e){var a=c(this).constructor;r=Reflect.construct(i,arguments,a)}else r=i.apply(this,arguments);return l(this,r)}}function l(t,r){return!r||"object"!==e(r)&&"function"!=typeof r?m(t):r}function m(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function v(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}function c(t){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function d(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function g(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function x(t,e,r){return e&&g(t.prototype,e),r&&g(t,r),t}var y=function(){function e(){d(this,e)}return x(e,[{key:"updateUniform",value:function(e){var r;this.uniM=null!==(r=e.uniM)&&void 0!==r?r:this.uniM,this.uniMIT=e.uniM?(0,t.inverse)((0,t.transpose)(this.uniM)):this.uniMIT,this.lightDirTrx=e.uniM||e.lightDir?(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniM,e.lightDir,1).slice(0,3)):this.lightDirTrx}}]),e}(),p=function(e){o(i,y);var r=f(i);function i(t){var e;return d(this,i),(e=r.call(this)).model=t.model,e.varyingIntensity=[],e}return x(i,[{key:"vertex",value:function(e,r){var i=this.model.faces[e].v[r],a=this.model.vertices[i],n=(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniMIT,this.model.vns[i],0).slice(0,3)),s=(0,t.matmulvec4aug)(this.uniM,a,1);return this.varyingIntensity[r]=(0,t.dot)(n,this.lightDirTrx),s}},{key:"fragment",value:function(e,r){var i=(0,t.dot)(this.varyingIntensity,e);return r[0]=255*i,r[1]=255*i,r[2]=255*i,!1}}]),i}();exports.GouraudShader=p;var T=function(e){o(a,y);var i=f(a);function a(t){var e;return d(this,a),(e=i.call(this)).model=t.model,e.diffuse=t.diffuse,e.diffuseW=e.diffuse.header.width,e.diffuseH=e.diffuse.header.height,e.varyingIntensity=[],e.varyingVertexTextureUV=[],e}return x(a,[{key:"vertex",value:function(e,r){var i=this.model.faces[e].v[r],a=this.model.vertices[i],n=(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniMIT,this.model.vns[i],0).slice(0,3)),s=(0,t.matmulvec4aug)(this.uniM,a,1);this.varyingIntensity[r]=Math.max(0,(0,t.dot)(n,this.lightDirTrx));var u=this.model.faces[e].vt[r];return this.varyingVertexTextureUV[r]=this.model.vts[u],s}},{key:"fragment",value:function(e,i){var a=(0,t.dot)(this.varyingIntensity,e),n=r((0,t.matmul)([e],this.varyingVertexTextureUV)[0].map(function(t){return parseInt(1024*t)}),2),s=n[0],u=n[1],o=s+(this.diffuseH-1-u)*this.diffuseW;return i[0]=this.diffuse.imageData[4*o]*a,i[1]=this.diffuse.imageData[4*o+1]*a,i[2]=this.diffuse.imageData[4*o+2]*a,!1}}]),a}();exports.ShaderWithTexture=T;var V=function(e){o(a,y);var i=f(a);function a(t){var e;return d(this,a),(e=i.call(this)).model=t.model,e.diffuse=t.diffuse,e.normal=t.normal,e.diffuseW=e.diffuse.header.width,e.diffuseH=e.diffuse.header.height,e.varyingVertexTextureUV=[],e}return x(a,[{key:"vertex",value:function(e,r){var i=this.model.faces[e].v[r],a=this.model.vertices[i],n=(0,t.matmulvec4aug)(this.uniM,a,1),s=this.model.faces[e].vt[r];return this.varyingVertexTextureUV[r]=this.model.vts[s],n}},{key:"fragment",value:function(e,i){var a=r((0,t.matmul)([e],this.varyingVertexTextureUV)[0].map(function(t){return parseInt(1024*t)}),2),n=a[0],s=a[1],u=n+(this.diffuseH-1-s)*this.diffuseW,o=(0,t.iNormalize3)([this.normal.imageData[4*u]/255*2-1,this.normal.imageData[4*u+1]/255*2-1,this.normal.imageData[4*u+2]/255*2-1]),h=(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniMIT,o,0).slice(0,3)),f=Math.min(1,Math.max(0,(0,t.dot)(h,this.lightDirTrx)));return i[0]=this.diffuse.imageData[4*u]*f,i[1]=this.diffuse.imageData[4*u+1]*f,i[2]=this.diffuse.imageData[4*u+2]*f,i[3]=this.diffuse.imageData[4*u+3],!1}}]),a}();exports.TextureAndNormalMap=V;var D=function(e){o(a,y);var i=f(a);function a(t){var e;return d(this,a),(e=i.call(this)).model=t.model,e.diffuse=t.diffuse,e.normal=t.normal,e.specular=t.specular,e.diffuseW=e.diffuse.header.width,e.diffuseH=e.diffuse.header.height,e.varyingVertexTextureUV=[],e}return x(a,[{key:"vertex",value:function(e,r){var i=this.model.faces[e].v[r],a=this.model.vertices[i],n=(0,t.matmulvec4aug)(this.uniM,a,1),s=this.model.faces[e].vt[r];return this.varyingVertexTextureUV[r]=this.model.vts[s],n}},{key:"fragment",value:function(e,i){var a=r((0,t.matmul)([e],this.varyingVertexTextureUV)[0].map(function(t){return parseInt(1024*t)}),2),n=a[0],s=a[1],u=n+(this.diffuseH-1-s)*this.diffuseW,o=(0,t.iNormalize3)([this.normal.imageData[4*u]/255*2-1,this.normal.imageData[4*u+1]/255*2-1,this.normal.imageData[4*u+2]/255*2-1]),h=(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniMIT,o,0).slice(0,3)),f=Math.min(1,Math.max(0,(0,t.dot)(h,this.lightDirTrx))),l=2*(0,t.dot)(h,this.lightDirTrx),m=(0,t.iNormalize3)([h[0]*l-this.lightDirTrx[0],h[1]*l-this.lightDirTrx[1],h[2]*l-this.lightDirTrx[2]]),v=this.specular.imageData[4*u],c=f+.6*Math.pow(Math.max(0,m[2]),v);return i[0]=Math.min(255,5+this.diffuse.imageData[4*u]*c),i[1]=Math.min(255,5+this.diffuse.imageData[4*u+1]*c),i[2]=Math.min(255,5+this.diffuse.imageData[4*u+2]*c),i[3]=this.diffuse.imageData[4*u+3],!1}}]),a}();exports.DiffuseNormalSpecular=D;var M=function(e){o(a,y);var i=f(a);function a(t){var e;return d(this,a),(e=i.call(this)).model=t.model,e.diffuse=t.diffuse,e.normal=t.normal,e.specular=t.specular,e.diffuseW=e.diffuse.header.width,e.diffuseH=e.diffuse.header.height,e.varyingVertexTextureUV=[],e.vertexNormals=[],e.varyingCoord=[],e}return x(a,[{key:"vertex",value:function(e,r){var i=this.model.faces[e].v[r],a=this.model.vertices[i],n=(0,t.matmulvec4aug)(this.uniM,a,1);this.varyingCoord[r]=[n[0]/n[3],n[1]/n[3],n[2]/n[3]];var s=this.model.faces[e].vt[r];return this.varyingVertexTextureUV[r]=this.model.vts[s],this.vertexNormals[r]=(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniMIT,this.model.vns[this.model.faces[e].vn[r]],0).slice(0,3)),n}},{key:"fragment",value:function(e,i){var a=r((0,t.matmul)([e],this.varyingVertexTextureUV)[0].map(function(t){return parseInt(1024*t)}),2),n=a[0],s=a[1],u=n+(this.diffuseH-1-s)*this.diffuseW,o=(0,t.iNormalize3)((0,t.matmul)([e],this.vertexNormals)[0]),h=[this.normal.imageData[4*u]/255*2-1,this.normal.imageData[4*u+1]/255*2-1,this.normal.imageData[4*u+2]/255*2-1],f=(0,t.subtract)(this.varyingCoord[1],this.varyingCoord[0]),l=(0,t.subtract)(this.varyingCoord[2],this.varyingCoord[0]),m=(0,t.inverse3)([f,l,o]),v=(0,t.subtract)(this.varyingVertexTextureUV[1],this.varyingVertexTextureUV[0]),c=(0,t.subtract)(this.varyingVertexTextureUV[2],this.varyingVertexTextureUV[0]);v[2]=0,c[2]=0;var d=(0,t.matmul)(m,[v,c,[0,0,0]]);d=(0,t.transpose)(d),(0,t.iNormalize3)(d[0]),(0,t.iNormalize3)(d[1]),d[2]=o;var g=(0,t.iNormalize3)((0,t.matmul)([h],d)[0]),x=Math.max(0,(0,t.dot)(g,this.lightDirTrx)),y=2*(0,t.dot)(g,this.lightDirTrx),p=(0,t.iNormalize3)([g[0]*y-this.lightDirTrx[0],g[1]*y-this.lightDirTrx[1],g[2]*y-this.lightDirTrx[2]]),T=this.specular.imageData[4*u],V=x+.6*Math.pow(Math.max(0,p[2]),T);return i[0]=Math.min(255,5+this.diffuse.imageData[4*u]*V),i[1]=Math.min(255,5+this.diffuse.imageData[4*u+1]*V),i[2]=Math.min(255,5+this.diffuse.imageData[4*u+2]*V),i[3]=this.diffuse.imageData[4*u+3],!1}}]),a}();exports.DiffuseTangentNormalSpecular=M;var b=function(e){o(i,y);var r=f(i);function i(t){var e;return d(this,i),(e=r.call(this)).model=t.model,e.diffuse=t.diffuse,e.normal=t.normal,e.specular=t.specular,e.diffuseW=e.diffuse.header.width,e.diffuseH=e.diffuse.header.height,e.varyingVertexTextureUV=[],e.vertexNormals=[],e.varyingCoord=[],e}return x(i,[{key:"vertex",value:function(e,r){var i=this.model.faces[e].v[r],a=this.model.vertices[i],n=(0,t.matmulvec4aug)(this.uniM,a,1);this.varyingCoord[r]=[n[0]/n[3],n[1]/n[3],n[2]/n[3]];var s=this.model.faces[e].vt[r];return this.varyingVertexTextureUV[r]=this.model.vts[s],this.vertexNormals[r]=(0,t.iNormalize3)((0,t.matmulvec4aug)(this.uniMIT,this.model.vns[this.model.faces[e].vn[r]],0).slice(0,3)),n}},{key:"fragment",value:function(e,r){var i=[parseInt(1024*(e[0]*this.varyingVertexTextureUV[0][0]+e[1]*this.varyingVertexTextureUV[1][0]+e[2]*this.varyingVertexTextureUV[2][0])),parseInt(1024*(e[0]*this.varyingVertexTextureUV[0][1]+e[1]*this.varyingVertexTextureUV[1][1]+e[2]*this.varyingVertexTextureUV[2][1])),parseInt(1024*(e[0]*this.varyingVertexTextureUV[0][2]+e[1]*this.varyingVertexTextureUV[1][2]+e[2]*this.varyingVertexTextureUV[2][2]))],a=i[1],n=i[0]+(this.diffuseH-1-a)*this.diffuseW,s=(0,t.iNormalize3)([e[0]*this.vertexNormals[0][0]+e[1]*this.vertexNormals[1][0]+e[2]*this.vertexNormals[2][0],e[0]*this.vertexNormals[0][1]+e[1]*this.vertexNormals[1][1]+e[2]*this.vertexNormals[2][1],e[0]*this.vertexNormals[0][2]+e[1]*this.vertexNormals[1][2]+e[2]*this.vertexNormals[2][2]]),u=[this.normal.imageData[4*n]/255*2-1,this.normal.imageData[4*n+1]/255*2-1,this.normal.imageData[4*n+2]/255*2-1],o=(0,t.inverse3)([[this.varyingCoord[1][0]-this.varyingCoord[0][0],this.varyingCoord[1][1]-this.varyingCoord[0][1],this.varyingCoord[1][2]-this.varyingCoord[0][2]],[this.varyingCoord[2][0]-this.varyingCoord[0][0],this.varyingCoord[2][1]-this.varyingCoord[0][1],this.varyingCoord[2][2]-this.varyingCoord[0][2]],s]),h=[this.varyingVertexTextureUV[1][0]-this.varyingVertexTextureUV[0][0],this.varyingVertexTextureUV[1][1]-this.varyingVertexTextureUV[0][1],0],f=[this.varyingVertexTextureUV[2][0]-this.varyingVertexTextureUV[0][0],this.varyingVertexTextureUV[2][1]-this.varyingVertexTextureUV[0][1],0],l=[];l[0]=[o[0][0]*h[0]+o[0][1]*f[0],o[0][0]*h[1]+o[0][1]*f[1],s[0]],l[1]=[o[1][0]*h[0]+o[1][1]*f[0],o[1][0]*h[1]+o[1][1]*f[1],s[1]],l[2]=[o[2][0]*h[0]+o[2][1]*f[0],o[2][0]*h[1]+o[2][1]*f[1],s[2]];var m=Math.sqrt(Math.pow(l[0][0],2)+Math.pow(l[1][0],2)+Math.pow(l[2][0],2)),v=Math.sqrt(Math.pow(l[0][1],2)+Math.pow(l[1][1],2)+Math.pow(l[2][1],2));l[0][0]/=m,l[1][0]/=m,l[2][0]/=m,l[0][1]/=v,l[1][1]/=v,l[2][1]/=v;var c=(0,t.iNormalize3)((0,t.matmulvec)(l,u)),d=Math.max(0,(0,t.dot)(c,this.lightDirTrx)),g=2*(0,t.dot)(c,this.lightDirTrx),x=(0,t.iNormalize3)((0,t.subtract)(c.map(function(t){return t*g}),this.lightDirTrx)),y=this.specular.imageData[4*n],p=d+.6*Math.pow(Math.max(0,x[2]),y);return r[0]=Math.min(255,5+this.diffuse.imageData[4*n]*p),r[1]=Math.min(255,5+this.diffuse.imageData[4*n+1]*p),r[2]=Math.min(255,5+this.diffuse.imageData[4*n+2]*p),r[3]=this.diffuse.imageData[4*n+3],!1}}]),i}();exports.FastDiffuseTangentNormalSpecular=b;
},{"./vecOps":"g9lg"}],"XLLO":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;const e=0,t=1,a=3,r=9,o=10,i=11,s=0,h=2,n=3,l=4,g=48;class p{_checkHeader(){const t=this.header;if(t.imageType===e)throw Error("No data");if(t.hasColorMap){if(t.colorMapLength>256||24!==t.colorMapDepth||1!==t.colorMapType)throw Error("Invalid colormap for indexed type")}else if(t.colorMapType)throw Error("Why does the image contain a palette ?");if(!t.width||!t.height)throw Error("Invalid image size");if(8!==t.pixelDepth&&16!==t.pixelDepth&&24!==t.pixelDepth&&32!==t.pixelDepth)throw Error('Invalid pixel size "'+t.pixelDepth+'"')}_decodeRLE(e,t,a,r){const o=new Uint8Array(r),i=new Uint8Array(a);let s=0;for(;s<r;){const r=e[t++];let h=1+(127&r);if(128&r){for(let r=0;r<a;++r)i[r]=e[t+r];t+=a;for(let e=0;e<h;++e)o.set(i,s),s+=a}else{h*=a;for(let a=0;a<h;++a)o[s+a]=e[t+a];s+=h,t+=h}}return o}_getImageData8bits(e,t,a,r,o,i,s,h,n,l){for(let g=0,p=o;p!==s;p+=i)for(let o=h;o!==l;o+=n,g++){const i=t[g];e[4*(o+r*p)+3]=255,e[4*(o+r*p)+2]=a[3*i+0],e[4*(o+r*p)+1]=a[3*i+1],e[4*(o+r*p)+0]=a[3*i+2]}return e}_getImageData16bits(e,t,a,r,o,i,s,h,n,l){for(let g=0,p=o;p!==s;p+=i)for(let a=h;a!==l;a+=n,g+=2){const o=t[g+0]|t[g+1]<<8;e[4*(a+r*p)+0]=(31744&o)>>7,e[4*(a+r*p)+1]=(992&o)>>2,e[4*(a+r*p)+2]=(31&o)>>3,e[4*(a+r*p)+3]=32768&o?0:255}return e}_getImageData24bits(e,t,a,r,o,i,s,h,n,l){for(let g=0,p=o;p!==s;p+=i)for(let a=h;a!==l;a+=n,g+=3)e[4*(a+r*p)+3]=255,e[4*(a+r*p)+2]=t[g+0],e[4*(a+r*p)+1]=t[g+1],e[4*(a+r*p)+0]=t[g+2];return e}_getImageData32bits(e,t,a,r,o,i,s,h,n,l){for(let g=0,p=o;p!==s;p+=i)for(let a=h;a!==l;a+=n,g+=4)e[4*(a+r*p)+2]=t[g+0],e[4*(a+r*p)+1]=t[g+1],e[4*(a+r*p)+0]=t[g+2],e[4*(a+r*p)+3]=t[g+3];return e}_getImageDataGrey8bits(e,t,a,r,o,i,s,h,n,l){for(let g=0,p=o;p!==s;p+=i)for(let a=h;a!==l;a+=n,g++){const o=t[g];e[4*(a+r*p)+0]=o,e[4*(a+r*p)+1]=o,e[4*(a+r*p)+2]=o,e[4*(a+r*p)+3]=255}return e}_getImageDataGrey16bits(e,t,a,r,o,i,s,h,n,l){for(let g=0,p=o;p!==s;p+=i)for(let a=h;a!==l;a+=n,g+=2)e[4*(a+r*p)+0]=t[g+0],e[4*(a+r*p)+1]=t[g+0],e[4*(a+r*p)+2]=t[g+0],e[4*(a+r*p)+3]=t[g+1];return e}open(e,t){const a=new XMLHttpRequest;a.responseType="arraybuffer",a.open("GET",e,!0),a.onload=(()=>{200===a.status&&(this.load(new Uint8Array(a.response)),t&&t())}),a.send(null)}load(e){let s=0;if(e.length<18)throw Error("Not enough data to contain header");const h={idLength:e[s++],colorMapType:e[s++],imageType:e[s++],colorMapIndex:e[s++]|e[s++]<<8,colorMapLength:e[s++]|e[s++]<<8,colorMapDepth:e[s++],offsetX:e[s++]|e[s++]<<8,offsetY:e[s++]|e[s++]<<8,width:e[s++]|e[s++]<<8,height:e[s++]|e[s++]<<8,pixelDepth:e[s++],flags:e[s++]};if(h.hasEncoding=h.imageType===r||h.imageType===o||h.imageType===i,h.hasColorMap=h.imageType===r||h.imageType===t,h.isGreyColor=h.imageType===i||h.imageType===a,this.header=h,this._checkHeader(),(s+=h.idLength)>=e.length)throw Error("No data");if(h.hasColorMap){const t=h.colorMapLength*(h.colorMapDepth>>3);this.palette=e.subarray(s,s+t),s+=t}const n=h.pixelDepth>>3,l=h.width*h.height,g=l*n;h.hasEncoding?this.imageData=this._decodeRLE(e,s,n,g):this.imageData=e.subarray(s,s+(h.hasColorMap?l:g))}getImageData(e){const{width:t,height:a,flags:r,pixelDepth:o,isGreyColor:i}=this.header,p=(r&g)>>l;let c,d,m,f,D,y,u;switch(e||(e=document?document.createElement("canvas").getContext("2d").createImageData(t,a):{width:t,height:a,data:new Uint8ClampedArray(t*a*4)}),p===h||p===n?(f=0,D=1,y=a):(f=a-1,D=-1,y=-1),p===h||p===s?(c=0,d=1,m=t):(c=t-1,d=-1,m=-1),o){case 8:u=i?this._getImageDataGrey8bits:this._getImageData8bits;break;case 16:u=i?this._getImageDataGrey16bits:this._getImageData16bits;break;case 24:u=this._getImageData24bits;break;case 32:u=this._getImageData32bits}return u.call(this,e.data,this.imageData,this.palette,t,f,D,y,c,d,m),e}getCanvas(){const{width:e,height:t}=this.header,a=document.createElement("canvas"),r=a.getContext("2d"),o=r.createImageData(e,t);return a.width=e,a.height=t,r.putImageData(this.getImageData(o),0,0),a}getDataURL(e){return this.getCanvas().toDataURL(e||"image/png")}}exports.default=p;
},{}],"Ry6W":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.loadTGA=m,exports.loadModel=p,exports.Loader=void 0;var e=t(require("tga-js"));function t(e){return e&&e.__esModule?e:{default:e}}function r(e){return u(e)||i(e)||o(e)||n()}function n(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function o(e,t){if(e){if("string"==typeof e)return a(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?a(e,t):void 0}}function i(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function u(e){if(Array.isArray(e))return a(e)}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function f(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function s(e,t,r){return t&&c(e.prototype,t),r&&c(e,r),e}var l=function(){function e(){f(this,e),this.items=new Map}return s(e,[{key:"all",value:function(){var e=this;return Promise.all(this.items.values()).then(function(t){var n={};return r(e.items.keys()).forEach(function(e,r){return n[e]=t[r]}),n})}},{key:"addModel",value:function(e,t){this.items.set(e,p(t))}},{key:"addTexture",value:function(e,t){this.items.set(e,m(t))}}]),e}();function m(t){return new Promise(function(r){var n=new e.default;n.open(t,function(){r({imageData:n.getImageData().data,header:n.header})})})}function p(e){return fetch(e).then(function(e){return e.text()}).then(function(e){return e.split("\n")}).then(function(e){var t=[],r=[],n=[],o=[];return e.forEach(function(e){var i=e.split(" ",1)[0];if("v"===i)t.push(e.split(" ").filter(function(e){return""!=e}).splice(1).map(function(e){return Number(e)}));else if("vt"===i)n.push(e.match(/ [\d.]+/g).slice(0,2).map(Number));else if("vn"===i)o.push(e.split(" ").filter(function(e){return""!=e}).splice(1).map(function(e){return Number(e)}));else if("f"===i){var u=Array.from(e.matchAll(/ (\d+)\/(\d+)\/(\d+)/g)),a={v:u.map(function(e){return Number(e[1])-1}),vt:u.map(function(e){return Number(e[2])-1}),vn:u.map(function(e){return Number(e[3])-1})};r.push(a)}}),{vertices:t,faces:r,vts:n,vns:o}})}exports.Loader=l;
},{"tga-js":"XLLO"}],"Xspz":[function(require,module,exports) {
module.exports="/tinyrenderer-js/docs/african_head.22fc9067.obj";
},{}],"WN3L":[function(require,module,exports) {
module.exports="/tinyrenderer-js/docs/african_head_diffuse.ec823637.tga";
},{}],"HIaF":[function(require,module,exports) {
module.exports="/tinyrenderer-js/docs/african_head_spec.c774354c.tga";
},{}],"EV1D":[function(require,module,exports) {
module.exports="/tinyrenderer-js/docs/african_head_nm_tangent.07850cea.tga";
},{}],"Focm":[function(require,module,exports) {
"use strict";var e=require("../src/index"),r=require("../src/utils/shaders"),t=require("../src/utils/Loader"),n=require("../src/utils/vecOps"),a=c(require("./obj/african_head.obj")),i=c(require("./obj/african_head_diffuse.tga")),o=c(require("./obj/african_head_spec.tga")),u=c(require("./obj/african_head_nm_tangent.tga"));function c(e){return e&&e.__esModule?e:{default:e}}function d(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,n)}return t}function s(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?d(Object(t),!0).forEach(function(r){l(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):d(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function l(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function f(e,r){if(null==e)return{};var t,n,a=p(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}function p(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}var b=new t.Loader;b.addModel("model",a.default),b.addTexture("diffuse",i.default),b.addTexture("specular",o.default),b.addTexture("normal",u.default);var O=new e.TinyRenderer({target:document.getElementById("app")});O.setSize(800,800);var h=new e.PerspectiveCamera({position:[1,1,3],viewport:[800,800]}),g={dir:(0,n.neg)((0,n.normalize)([-4,-2,-3]))},j={light:g};b.all().then(function(e){var t=e.model,n=s({model:t},f(e,["model"]));t.shader=new r.FastDiffuseTangentNormalSpecular(n),j.model=t,w()});var m=-Math.PI/36,y=0,v=3;function w(){O.render(j,h);var e=[Math.cos(m)*y-Math.sin(m)*v,Math.sin(m)*y+Math.cos(m)*v];y=e[0],v=e[1],g.dir=[Math.cos(m)*g.dir[0]-Math.sin(m)*g.dir[2],g.dir[1],Math.sin(m)*g.dir[0]+Math.cos(m)*g.dir[2]],h.update({position:[y,0,v]}),requestAnimationFrame(w)}
},{"../src/index":"uBxZ","../src/utils/shaders":"bj8e","../src/utils/Loader":"Ry6W","../src/utils/vecOps":"g9lg","./obj/african_head.obj":"Xspz","./obj/african_head_diffuse.tga":"WN3L","./obj/african_head_spec.tga":"HIaF","./obj/african_head_nm_tangent.tga":"EV1D"}]},{},["Focm"], null)
//# sourceMappingURL=/tinyrenderer-js/docs/demo.39364594.js.map