# networking-game
Javascript web browser simple 2D game (online socket io)

* web server > node js, express, socket io

* cliente > canvas html, js (+socket io)

server default port: 4004

para abrir el juego:
1) npm install en el directorio root del proyecto
2) desde 1 terminal, para abrir el webserver: npm start
3) desde el navegador, ir a: http://localhost:4004 
nota: se pueden abrir múltiples clientes (paso 3)
  

btw, no pretende ser un caso real de juego client-server (debe haber bugs, problemas, no es responsivo, etc...), simplemente fue hecho para testear lag compensation techniques (client side prediction, server reconciliation, entity interpolation) en el caso de un juego 2D (con la particularidad de correr en el canvas de un browser) :P
