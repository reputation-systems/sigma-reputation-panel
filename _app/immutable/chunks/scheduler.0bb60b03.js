function y(){}function w(t,n){for(const e in n)t[e]=n[e];return t}function E(t){return t()}function D(){return Object.create(null)}function j(t){t.forEach(E)}function v(t){return typeof t=="function"}function F(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}function M(t){return Object.keys(t).length===0}function m(t,...n){if(t==null){for(const o of n)o(void 0);return y}const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function S(t){let n;return m(t,e=>n=e)(),n}function A(t,n,e){t.$$.on_destroy.push(m(n,e))}function B(t,n,e,o){if(t){const r=x(t,n,e,o);return t[0](r)}}function x(t,n,e,o){return t[1]&&o?w(e.ctx.slice(),t[1](o(n))):e.ctx}function G(t,n,e,o){if(t[2]&&o){const r=t[2](o(e));if(n.dirty===void 0)return r;if(typeof r=="object"){const i=[],_=Math.max(n.dirty.length,r.length);for(let u=0;u<_;u+=1)i[u]=n.dirty[u]|r[u];return i}return n.dirty|r}return n.dirty}function H(t,n,e,o,r,i){if(r){const _=x(n,e,o,i);t.p(_,r)}}function I(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let o=0;o<e;o++)n[o]=-1;return n}return-1}function P(t){const n={};for(const e in t)e[0]!=="$"&&(n[e]=t[e]);return n}function U(t,n){const e={};n=new Set(n);for(const o in t)!n.has(o)&&o[0]!=="$"&&(e[o]=t[o]);return e}function J(t){return t&&v(t.destroy)?t.destroy:y}let f;function d(t){f=t}function l(){if(!f)throw new Error("Function called outside component initialization");return f}function K(t){l().$$.on_mount.push(t)}function L(t){l().$$.after_update.push(t)}function N(t){l().$$.on_destroy.push(t)}function Q(t,n){return l().$$.context.set(t,n),n}function R(t){return l().$$.context.get(t)}function T(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach(o=>o.call(this,n))}const a=[],g=[];let s=[];const p=[],k=Promise.resolve();let b=!1;function C(){b||(b=!0,k.then(q))}function V(){return C(),k}function O(t){s.push(t)}function W(t){p.push(t)}const h=new Set;let c=0;function q(){if(c!==0)return;const t=f;do{try{for(;c<a.length;){const n=a[c];c++,d(n),z(n.$$)}}catch(n){throw a.length=0,c=0,n}for(d(null),a.length=0,c=0;g.length;)g.pop()();for(let n=0;n<s.length;n+=1){const e=s[n];h.has(e)||(h.add(e),e())}s.length=0}while(a.length);for(;p.length;)p.pop()();b=!1,h.clear(),d(t)}function z(t){if(t.fragment!==null){t.update(),j(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(O)}}function X(t){const n=[],e=[];s.forEach(o=>t.indexOf(o)===-1?n.push(o):e.push(o)),e.forEach(o=>o()),s=n}export{D as A,q as B,M as C,X as D,f as E,d as F,E as G,a as H,C as I,L as a,g as b,B as c,G as d,A as e,O as f,I as g,T as h,W as i,Q as j,N as k,R as l,S as m,y as n,K as o,J as p,l as q,j as r,F as s,V as t,H as u,U as v,w,P as x,m as y,v as z};
