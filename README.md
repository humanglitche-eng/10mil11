# 10Mil11 · Lámparas con Amor

Sitio de [www.10mil11.com](https://www.10mil11.com/): lámparas de hierro y caireles
hechas a mano en La Plata. HTML estático, lo publica GitHub Pages con cada push a `main`.

- **Catálogo** (`catalogo.js` + `img/tienda/`): sale de la tienda Nube tal cual,
  cada producto con su foto, nombre, precio y categorías. No se edita a mano: se
  vuelve a relevar con `herramientas/tiendanube-catalogo/relevar.py` del vault de
  Human Glitche, apuntando a esta carpeta.
- **Reserva con seña** («Reservar»): contra la API de la plataforma
  (`api.hg-vl.com/v1/10mil11`). La seña es la variante `sena` de cada lámpara y el
  precio lo pone el servidor; se paga por Mercado Pago (la cuenta de 10Mil11) o por
  transferencia a su alias. El botón aparece solo cuando el comercio tiene cargado
  su alias o su Mercado Pago (panel → Ajustes → Cómo te pagan).
- **Vitrina**: la misma página se muestra en `demos.hg-vl.com/demo-10mil11`. Allí
  `MUESTRA` es true: se ve la etiqueta de demo y la reserva lleva a este sitio (la
  API no acepta pedidos desde una vitrina). **Se edita acá** y se copia a la vitrina.

Hecho por Human Glitche · Visual Lab.
