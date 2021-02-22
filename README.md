# Prototipo de 2D networking game
Juego 2D online (client-server) web

* server > node js, express, socketio

* cliente > html, js (socketio)

* se renderiza todo en un canvas

<strong>PUERTO</strong> (default): `4004`

## Setup
1) `npm install` en el directorio base
2) abrir el server: `npm start`
3) ir a: http://localhost:4004 

nota: se pueden abrir múltiples clientes desde la misma pc, entrando desde diferentes tabs!!

![Imagen del juego](screenshots/preview1.PNG?raw=true "2D game")


btw, no pretende ser un caso real 100% omegaseguro pro mastercode666gamer de juego client-server (deben haber bugs, no tiene la mejor ui, etc...); simplemente fue hecho para testear algunas cosas (client side prediction, server reconciliation, entity interpolation, ...) y por lo divertido q sonaba el hecho de hacer correr un jueguito (<strong>online y realtime wowAmigo¿EnTiempoREal????LolL!!XD!!</strong>) en un canvas
