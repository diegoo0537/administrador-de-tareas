const CACHE_NAME = 'administrador-tareas-app-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/registro.html',
  '/app.html',
  '/css/estilo-app.css',
  '/css/estilo-login.css',
  '/css/estilo-registro.css',
  '/js/app.js',
  '/js/login.js',
  '/js/registro.js',
  '/js/config.js',
  '/manifest.json',
  '/imagenes/añadir-tarea.png',
  '/imagenes/darse_baja.png',
  '/imagenes/flecha-abajo.png',
  '/imagenes/flecha-derecha.png',
  '/imagenes/imagen_salir.png',
  '/imagenes/ojo_abierto.png',
  '/imagenes/ojo_cerrado.png',
  '/sw.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});