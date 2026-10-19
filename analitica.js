/*
 * Analítica de 10Mil11 (Umami Cloud, plan Hobby gratis). Mismo patrón que
 * analitica/hg.js de hg-vl.com.
 *
 * Sin cookies, sin localStorage, sin datos personales: no hace falta banner.
 * Mide visitas por página y estos eventos:
 *
 *   producto     se abrió la ficha de una lámpara (modelo)
 *   comprar      pasó al formulario de compra (modelo)
 *   pedido       la API tomó el pedido (modelo, modo: total|sena, pago: mp|trf,
 *                entrega: envio|retiro); sale justo antes de ir a pagar
 *   pedido-error el formulario se envió pero la API no tomó el pedido (modelo)
 *   resultado    cómo terminó, en gracias.html (estado: pagado | aprobado |
 *                pendiente | rechazado | transferencia | anotado, modo, pago, modelo)
 *   whatsapp     clic a WhatsApp (desde: sección de la página, ficha, a-medida,
 *                chat, gracias, inmersiva)
 *   chat         se abrió el asistente (una vez por página)
 *   inmersiva    clic hacia la experiencia inmersiva (desde)
 *   instagram    clic hacia @lamparas_10mil11
 *   tienda-nube  clic hacia la tienda Nube
 *
 * Nunca se manda el código del pedido ni nada del formulario: en gracias.html
 * la URL lleva ?p=<código>, que es la llave del pedido, así que ahí se excluye
 * la query entera. El hash (#producto=…) se excluye siempre: si no, cada ficha
 * contaría como una visita más.
 *
 * Las páginas llaman a window.medir('evento', {dato: 'x'}). index.html y
 * gracias.html dejan en el <head> un stub que encola esas llamadas hasta que
 * este archivo (defer) carga; acá se vacía la cola.
 *
 * Mientras WEBSITE_ID tenga el valor de ejemplo, o fuera de los dominios del
 * sitio (vitrina en demos.hg-vl.com, localhost), este archivo NO carga Umami ni
 * manda ningún dato. Se puede publicar tranquilo antes de tener la cuenta.
 */
(function () {
  'use strict';

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║  PEGAR ACÁ EL WEBSITE ID DE UMAMI                                 ║
  // ║  (cloud.umami.is > Settings > Websites > www.10mil11.com > Edit)  ║
  // ║  Es un UUID tipo 1a2b3c4d-....                                    ║
  // ╚══════════════════════════════════════════════════════════════════╝
  var WEBSITE_ID = '35437661-16a2-4e6e-bea2-cc2a079a31d5';

  var DOMINIOS = ['www.10mil11.com', '10mil11.com'];

  var cola = (window.medir && window.medir.q) || [];
  var activo = /^[0-9a-f-]{36}$/i.test(WEBSITE_ID) &&
    DOMINIOS.indexOf(location.hostname) >= 0 && !window.__m11;

  if (!activo) {                           // sin ID real o fuera del sitio: nada
    window.medir = function () {};
    return;
  }
  window.__m11 = true;

  var listo = false;
  function enviar(nombre, datos) {
    try { window.umami.track(nombre, datos); } catch (e) { /* nunca rompe el sitio */ }
  }
  window.medir = function (nombre, datos) {
    if (listo) enviar(nombre, datos);
    else cola.push([nombre, datos]);
  };

  var pagina = /gracias(\.html)?$/.test(location.pathname) ? 'gracias'
    : /inmersivo(\.html)?$/.test(location.pathname) ? 'inmersiva' : 'inicio';

  // De qué parte de la página salió el clic.
  function desde(el) {
    if (el.closest('#hgia-panel')) return 'chat';
    if (el.id === 'fichaWa') return 'a-medida';
    if (el.closest('#pv')) return 'ficha';
    if (pagina !== 'inicio') return pagina;
    if (el.closest('.nav-in,nav')) return 'menu';
    var s = el.closest('section[id],header[id],footer[id],nav[id]');
    return s ? s.id : 'otra';
  }

  // Etiqueta el link con data-umami-event ANTES de que lo lea Umami (este
  // listener va en window/captura, el de Umami en document/captura). Umami
  // espera a que salga el evento antes de navegar.
  function etiquetar(a, evento, datos) {
    a.setAttribute('data-umami-event', evento);
    Object.keys(datos || {}).forEach(function (k) {
      a.setAttribute('data-umami-event-' + k, String(datos[k]).slice(0, 80));
    });
  }

  var chatMedido = false;
  window.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    if (!chatMedido && t.closest('#hgia-bubble')) {
      chatMedido = true;
      window.medir('chat', { pagina: pagina });
      return;
    }
    var a = t.closest('a[href]');
    if (!a) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    var host = url.hostname.replace(/^www\./, '');

    // Se re-etiqueta en cada clic: el link de «A tu medida» y los del chat
    // cambian de contexto, y un atributo viejo mentiría.
    if (host === 'wa.me' || host === 'api.whatsapp.com') etiquetar(a, 'whatsapp', { desde: desde(a) });
    else if (host === 'instagram.com') etiquetar(a, 'instagram', { desde: desde(a) });
    else if (/(^|\.)mitiendanube\.com$/.test(host)) etiquetar(a, 'tienda-nube', { desde: desde(a) });
    else if (url.origin === location.origin && /inmersivo(\.html)?$/.test(url.pathname)) etiquetar(a, 'inmersiva', { desde: desde(a) });
  }, true);

  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', WEBSITE_ID);
  s.setAttribute('data-domains', DOMINIOS.join(','));
  s.setAttribute('data-exclude-hash', 'true');
  if (pagina === 'gracias') s.setAttribute('data-exclude-search', 'true');
  s.onload = function () {
    listo = true;
    cola.splice(0).forEach(function (c) { enviar(c[0], c[1]); });
  };
  (document.head || document.documentElement).appendChild(s);
})();
