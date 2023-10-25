// run.ts
import { serve } from 'https://deno.land/std@0.105.0/http/server.ts';

const server = serve({ port: 8000 });

console.log('Servidor en ejecución en http://localhost:8000/');

for await (const req of server) {
    if (req.url === '/') {
        const html = await Deno.readTextFile('index.html');
        req.respond({ body: html, headers: new Headers({ 'Content-Type': 'text/html' }) });
    } else if (req.url === '/index.js') {
        const js = await Deno.readTextFile('index.js');
        req.respond({ body: js, headers: new Headers({ 'Content-Type': 'application/javascript' }) });
    } else if (req.url === '/fleet.js') { // Ahora servimos fleet.js en lugar de fleet.ts
        const js = await Deno.readTextFile('fleet.js');
        req.respond({ body: js, headers: new Headers({ 'Content-Type': 'application/javascript' }) });
    } else if (req.url === '/node_modules/@fleet-sdk/core/dist/index.esm.js') { // Ahora servimos fleet.js en lugar de fleet.ts
        const js = await Deno.readTextFile('node_modules/@fleet-sdk/core/dist/index.esm.js');
        req.respond({ body: js, headers: new Headers({ 'Content-Type': 'application/javascript' }) });
    } else {
        req.respond({ status: 404, body: 'Página no encontrada' });
    }
}