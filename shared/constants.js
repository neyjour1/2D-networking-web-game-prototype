// SERVER PORT
export const PORT = 4004; // server port

// TICK RATES y FPS
export const WORLD_FPS = 66; // simular fisicas mundo FPS
export const SERVER_FPS = 22; // enviar paquetes FPS
export const SERVER_TICK_RATE = 1000/SERVER_FPS;
export const WORLD_TICK_RATE = 1000/WORLD_FPS // ~= 1 tick cada 16,67 ms (cada 15 ms)

// GAME
export const PLAYER_SIZE = 30; // width height player
export const CANVAS_SIZE = {width: 800, height: 600}; // width height canvas

// SERVER
// update world loop (fisicas, simulacion de los personajes) -> 66 fps (1 update cada 0,016s || 16,7ms)
// sockets loop (broadcast a los sockets) -> 22 updates por segundo (1 update cada 0,045s || 45ms)

// CLIENTE
// main loop (requestAnimationFrame)
// envia unicamente input
// input sequence number
