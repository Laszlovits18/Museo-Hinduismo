# Museo 3D del hinduismo

Museo virtual en español para Formación humana (Equipo 4). Se puede abrir en Google Chrome con doble clic en `index.html` y también publicar gratis en GitHub Pages. No necesita backend, cuentas ni instalación de paquetes. La visita empieza en un jardín exterior, se entra por la puerta central y se recorren siete salas en primera persona. Hay 21 piezas visuales diferentes, las diez preguntas guía, explicaciones y cuestionarios. El edificio tiene mampostería envejecida, ventanas arqueadas con profundidad, cúpulas con nervaduras, jardín, palmeras y dos grandes elefantes orientados hacia los visitantes. Las salas incluyen bancos tapizados, alfombras, molduras, iluminación cálida y una escultura diferente en cada sala: loto, manuscritos, rueda, lámpara, pavo real, campana y árbol. Las esculturas son decoración original del museo, no representaciones de una divinidad específica. El modo lectura conserva el contenido completo cuando no se quiere usar 3D o el navegador no admite WebGL.

## Cómo recorrerlo

- **Computadora:** pulsa «Empezar la visita». Avanza por el sendero y cruza la puerta central. Usa **W A S D** o las flechas para caminar. **Arrastra sobre la escena** para girar la cámara. También puedes usar **J / L** para girar y **I / K** para mirar arriba o abajo. Si el navegador captura el cursor, basta con mover el ratón. Usa **E** o clic para abrir una pieza o un atril. Pulsa **M** o «Mapa de salas» para cambiar de sala.
- **Celular o tableta:** mueve el control circular de la izquierda para caminar. Desliza el dedo sobre la mitad derecha para mirar. Toca una pieza o el botón «Explorar» para abrirla.
- Los atriles en cada sala abren todas sus exhibiciones y el cuestionario. Los marcos abren la imagen, su explicación y su crédito.
- Si el 3D no funciona, abre `lectura.html` desde el enlace «Modo lectura».

## Estructura

| Archivo o carpeta | Función |
| --- | --- |
| `index.html` | Entrada del museo 3D |
| `lectura.html` | Versión accesible de lectura |
| `css/museo3d.css`, `css/styles.css` | Diseño de ambas vistas |
| `js/museo3d.js`, `js/app.js` | Recorrido 3D y modo lectura |
| `js/vendor/three.global.js` | Biblioteca 3D Three.js para abrir el museo desde un archivo local |
| `js/offline-data.js` | Copia del contenido y las imágenes para abrir el museo sin servidor |
| `actualizar-offline.py` | Regenera la copia sin conexión después de editar el contenido |
| `content/` | Un JSON por sala, bibliografía y créditos |
| `assets/img/` | 14 fotografías con licencia abierta, 7 ilustraciones originales y tres texturas generadas para fachada, paredes y suelo |

Three.js se distribuye bajo licencia MIT. Se incluye su licencia en `js/vendor/THREE-LICENSE.txt`.

## Editar textos, imágenes y preguntas

Abre el JSON de la sala correspondiente. En `exhibiciones`, modifica `resumen` y `detalle`. Cada elemento de `galeria` corresponde a un marco del museo 3D:

- `titulo`: nombre de la pieza.
- `imagen`: ruta de la foto, por ejemplo `assets/img/templo.jpg`.
- `alt`: descripción breve para accesibilidad.
- `descripcion`: explicación que se abre al explorarla.
- `etiqueta`: «Del libro» o «Información adicional».
- `fuente`: enlace a la fuente de la explicación.

Las tres primeras piezas de `galeria` se muestran físicamente en cada sala. Puedes cambiar su orden o sustituirlas. Al añadir o reemplazar una imagen, guarda el archivo en `assets/img/` y actualiza también `content/creditos.json` con autor, licencia y enlace a la página original.

El objeto `quiz` contiene la pregunta, las opciones y el índice de la respuesta correcta: `0` es la primera opción, `1` la segunda y `2` la tercera. La bibliografía visible en la sala final está en `content/bibliografia.json`.

| Sala | Archivo |
| --- | --- |
| Vestíbulo | `content/vestibulo.json` |
| 4.1 Origen, organización y textos | `content/sala-41.json` |
| 4.2 Doctrina, moral y destino | `content/sala-42.json` |
| Fiestas | `content/fiestas.json` |
| Mundo actual | `content/actualidad.json` |
| Comparación | `content/comparacion.json` |
| Conclusiones | `content/final.json` |

Mantén la sintaxis de JSON: comillas dobles, comas y corchetes. Para comprobarla, puedes ejecutar `python3 -m json.tool content/nombre.json`.

Si cambias textos o imágenes y quieres seguir abriendo el museo con doble clic, ejecuta `python3 actualizar-offline.py` desde la carpeta del museo. Esto actualiza `js/offline-data.js`. En GitHub Pages los JSON se leen directamente, pero conviene subir también la copia actualizada para que la descarga funcione sin servidor.

## Probarlo en tu computadora

**Forma rápida:** abre `index.html` con Google Chrome. La visita 3D y `lectura.html` funcionan directamente desde la carpeta, incluso sin conexión. Conserva todas las subcarpetas junto a los dos archivos HTML; no abras un HTML aislado fuera de la carpeta.

**Forma alternativa para probar la publicación:** desde la carpeta `museo-hinduismo`, ejecuta:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000` en un navegador actualizado. Para detener el servidor, pulsa **Ctrl+C**.

## Publicarlo gratis en GitHub Pages

1. Crea en GitHub un repositorio público, por ejemplo `museo-hinduismo`.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio. `index.html` debe quedar junto a `lectura.html`, `css`, `js`, `content` y `assets`.
3. Abre **Settings → Pages** en el repositorio.
4. En **Build and deployment**, elige **Deploy from a branch**. Selecciona `main` y `/ (root)`; guarda.
5. GitHub mostrará la dirección pública cuando termine de publicarlo. Abre esa dirección y comprueba el 3D y el modo lectura.
6. Si editas un JSON o cambias una imagen y subes los archivos, GitHub Pages publicará la nueva versión.

## Llevar el museo a una presentación de Canva

1. **Descarga** `museo-hinduismo.zip` y descomprímelo. Conserva la carpeta completa. Dentro, `index.html` abre la visita 3D en tu computadora.
2. Para que otras personas puedan entrar desde tu presentación, publica la carpeta en **GitHub Pages** con los pasos anteriores. Copia la dirección pública del museo.
3. En Canva, crea una diapositiva con un botón o texto como «Entrar al museo». Selecciónalo y usa **Más → Enlace** para pegar la dirección pública. Al presentar, haz clic y el museo se abrirá en el navegador. También puedes insertar un código QR con la aplicación **QR Code** de Canva y pegar la misma dirección.
4. Si quieres mostrar un recorrido *dentro* de la diapositiva, graba tu pantalla mientras caminas por el museo y sube el video a Canva. El video se reproduce en la presentación, pero no permite caminar libremente.

Canva puede guardar un ZIP o HTML como archivo subido, pero no ejecutarlo como museo interactivo dentro del editor. Un enlace a un archivo local de tu computadora tampoco abrirá el museo en el equipo de tus compañeros; para compartir la experiencia interactiva necesitas la dirección pública.

## Revisión antes de entregar en clase

- Confirma en tu ejemplar el año y la edición exactos de **Religión Católica**. El prompt compartido indicó 2019, pero el dato quedó marcado para verificar.
- Completa la edición y las páginas de las obras de Hans Küng y Kim Knott citadas en el libro.
- Revisa los textos de las páginas 179–181 con tu profesor si quiere una paráfrasis todavía más cercana.
- Mantén los créditos cuando cambies imágenes. Las 14 fotografías, las 7 ilustraciones originales y las tres texturas generadas están registradas en `content/creditos.json`.
