function N(){}function z(t,e){for(const n in e)t[n]=e[n];return t}function q(t){return t()}function tt(){return Object.create(null)}function H(t){t.forEach(q)}function M(t){return typeof t=="function"}function et(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function nt(t,e){return t!=t?e==e:t!==e}function it(t){return Object.keys(t).length===0}function C(t,...e){if(t==null){for(const i of e)i(void 0);return N}const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function rt(t){let e;return C(t,n=>e=n)(),e}function st(t,e,n){t.$$.on_destroy.push(C(e,n))}function ct(t,e,n,i){if(t){const r=S(t,e,n,i);return t[0](r)}}function S(t,e,n,i){return t[1]&&i?z(n.ctx.slice(),t[1](i(e))):n.ctx}function ot(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const c=[],s=Math.max(e.dirty.length,r.length);for(let l=0;l<s;l+=1)c[l]=e.dirty[l]|r[l];return c}return e.dirty|r}return e.dirty}function lt(t,e,n,i,r,c){if(r){const s=S(e,n,i,c);t.p(s,r)}}function ut(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function at(t){const e={};for(const n in t)n[0]!=="$"&&(e[n]=t[n]);return e}function ft(t,e){const n={};e=new Set(e);for(const i in t)!e.has(i)&&i[0]!=="$"&&(n[i]=t[i]);return n}function _t(t){const e={};for(const n in t)e[n]=!0;return e}function dt(t){return t??""}function ht(t,e,n){return t.set(n),e}function pt(t){return t&&M(t.destroy)?t.destroy:N}let y=!1;function mt(){y=!0}function yt(){y=!1}function W(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function B(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const o=[];for(let u=0;u<e.length;u++){const a=e[u];a.claim_order!==void 0&&o.push(a)}e=o}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let o=0;o<e.length;o++){const u=e[o].claim_order,a=(r>0&&e[n[r]].claim_order<=u?r+1:W(1,r,P=>e[n[P]].claim_order,u))-1;i[o]=n[a]+1;const k=a+1;n[k]=o,r=Math.max(k,r)}const c=[],s=[];let l=e.length-1;for(let o=n[r]+1;o!=0;o=i[o-1]){for(c.push(e[o-1]);l>=o;l--)s.push(e[l]);l--}for(;l>=0;l--)s.push(e[l]);c.reverse(),s.sort((o,u)=>o.claim_order-u.claim_order);for(let o=0,u=0;o<s.length;o++){for(;u<c.length&&s[o].claim_order>=c[u].claim_order;)u++;const a=u<c.length?c[u]:null;t.insertBefore(s[o],a)}}function I(t,e){t.appendChild(e)}function L(t,e){if(y){for(B(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function bt(t,e,n){y&&!n?L(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function F(t){t.parentNode&&t.parentNode.removeChild(t)}function gt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function j(t){return document.createElement(t)}function R(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function v(t){return document.createTextNode(t)}function xt(){return v(" ")}function wt(){return v("")}function E(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function vt(t){return function(e){return e.preventDefault(),t.call(this,e)}}function kt(t){return function(e){return e.stopPropagation(),t.call(this,e)}}function Et(t){return function(e){e.target===this&&t.call(this,e)}}function U(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}const G=["width","height"];function At(t,e){const n=Object.getOwnPropertyDescriptors(t.__proto__);for(const i in e)e[i]==null?t.removeAttribute(i):i==="style"?t.style.cssText=e[i]:i==="__value"?t.value=t[i]=e[i]:n[i]&&n[i].set&&G.indexOf(i)===-1?t[i]=e[i]:U(t,i,e[i])}function Nt(t){return t.dataset.svelteH}function Ct(t){return t===""?null:+t}function St(t){return Array.from(t.childNodes)}function J(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function D(t,e,n,i,r=!1){J(t);const c=(()=>{for(let s=t.claim_info.last_index;s<t.length;s++){const l=t[s];if(e(l)){const o=n(l);return o===void 0?t.splice(s,1):t[s]=o,r||(t.claim_info.last_index=s),l}}for(let s=t.claim_info.last_index-1;s>=0;s--){const l=t[s];if(e(l)){const o=n(l);return o===void 0?t.splice(s,1):t[s]=o,r?o===void 0&&t.claim_info.last_index--:t.claim_info.last_index=s,l}}return i()})();return c.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,c}function T(t,e,n,i){return D(t,r=>r.nodeName===e,r=>{const c=[];for(let s=0;s<r.attributes.length;s++){const l=r.attributes[s];n[l.name]||c.push(l.name)}c.forEach(s=>r.removeAttribute(s))},()=>i(e))}function jt(t,e,n){return T(t,e,n,j)}function Dt(t,e,n){return T(t,e,n,R)}function K(t,e){return D(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>v(e),!0)}function Tt(t){return K(t," ")}function Ot(t,e){e=""+e,t.data!==e&&(t.data=e)}function Pt(t,e){t.value=e??""}function zt(t,e,n,i){n==null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function qt(t,e,n){for(let i=0;i<t.options.length;i+=1){const r=t.options[i];if(r.__value===e){r.selected=!0;return}}(!n||e!==void 0)&&(t.selectedIndex=-1)}function Ht(t){const e=t.querySelector(":checked");return e&&e.__value}let p;function Q(){if(p===void 0){p=!1;try{typeof window<"u"&&window.parent&&window.parent.document}catch{p=!0}}return p}function Mt(t,e){getComputedStyle(t).position==="static"&&(t.style.position="relative");const i=j("iframe");i.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),i.setAttribute("aria-hidden","true"),i.tabIndex=-1;const r=Q();let c;return r?(i.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",c=E(window,"message",s=>{s.source===i.contentWindow&&e()})):(i.src="about:blank",i.onload=()=>{c=E(i.contentWindow,"resize",e),e()}),I(t,i),()=>{(r||c&&i.contentWindow)&&c(),F(i)}}function Wt(t,e,n){t.classList.toggle(e,!!n)}function V(t,e,{bubbles:n=!1,cancelable:i=!1}={}){return new CustomEvent(t,{detail:e,bubbles:n,cancelable:i})}function Bt(t,e){const n=[];let i=0;for(const r of e.childNodes)if(r.nodeType===8){const c=r.textContent.trim();c===`HEAD_${t}_END`?(i-=1,n.push(r)):c===`HEAD_${t}_START`&&(i+=1,n.push(r))}else i>0&&n.push(r);return n}function It(t,e){return new t(e)}let m;function b(t){m=t}function f(){if(!m)throw new Error("Function called outside component initialization");return m}function Lt(t){f().$$.on_mount.push(t)}function Ft(t){f().$$.after_update.push(t)}function Rt(t){f().$$.on_destroy.push(t)}function Ut(){const t=f();return(e,n,{cancelable:i=!1}={})=>{const r=t.$$.callbacks[e];if(r){const c=V(e,n,{cancelable:i});return r.slice().forEach(s=>{s.call(t,c)}),!c.defaultPrevented}return!0}}function Gt(t,e){return f().$$.context.set(t,e),e}function Jt(t){return f().$$.context.get(t)}function Kt(t){return f().$$.context.has(t)}function Qt(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach(i=>i.call(this,e))}const h=[],A=[];let d=[];const x=[],O=Promise.resolve();let w=!1;function X(){w||(w=!0,O.then(Z))}function Vt(){return X(),O}function Y(t){d.push(t)}function Xt(t){x.push(t)}const g=new Set;let _=0;function Z(){if(_!==0)return;const t=m;do{try{for(;_<h.length;){const e=h[_];_++,b(e),$(e.$$)}}catch(e){throw h.length=0,_=0,e}for(b(null),h.length=0,_=0;A.length;)A.pop()();for(let e=0;e<d.length;e+=1){const n=d[e];g.has(n)||(g.add(n),n())}d.length=0}while(h.length);for(;x.length;)x.pop()();w=!1,g.clear(),b(t)}function $(t){if(t.fragment!==null){t.update(),H(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(Y)}}function Yt(t){const e=[],n=[];d.forEach(i=>t.indexOf(i)===-1?e.push(i):n.push(i)),n.forEach(i=>i()),d=e}export{qt as $,H as A,Wt as B,E as C,Jt as D,pt as E,M as F,rt as G,R as H,Dt as I,Gt as J,ht as K,Ut as L,nt as M,Rt as N,Qt as O,z as P,At as Q,ft as R,at as S,Nt as T,Y as U,Mt as V,_t as W,Kt as X,C as Y,dt as Z,Pt as _,xt as a,kt as a0,Et as a1,Ct as a2,Ht as a3,Xt as a4,Bt as a5,vt as a6,gt as a7,tt as a8,Z as a9,it as aa,Yt as ab,m as ac,b as ad,q as ae,h as af,X as ag,mt as ah,yt as ai,Ft as b,Tt as c,F as d,wt as e,j as f,jt as g,St as h,bt as i,U as j,zt as k,v as l,K as m,Ot as n,Lt as o,A as p,It as q,ct as r,et as s,Vt as t,lt as u,ut as v,ot as w,L as x,N as y,st as z};