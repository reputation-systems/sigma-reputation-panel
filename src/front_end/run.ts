import {serve, file} from 'bun';

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return Response(file("./index.html"));
    if (url.pathname === "/index.js") return Response(file("./index.js"));
    if (url.pathname === "/fleet.ts") return Response(file("./fleet.ts"));
    return new Response("404!");
  },
});

console.log(`Listening on localhost:${server.port}`);