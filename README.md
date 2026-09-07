# XDATASHARE

Sitio web estático de [XDATASHARE](https://xdatashare.com/), publicado mediante GitHub Pages.

No utiliza framework, gestor de paquetes ni proceso de compilación: el navegador carga directamente el HTML, CSS y JavaScript del repositorio.

## Estructura

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── site.css
│   │   └── exchange.css
│   └── js/
│       ├── site.js
│       ├── exchange.js
│       └── hero-network.js
├── CNAME
├── robots.txt
└── sitemap.xml
```

- `index.html`: contenido, estructura semántica y metadatos SEO.
- `base.css`: variables, estilos globales y componentes compartidos.
- `site.css`: navegación, hero, secciones, tarjetas y reglas responsive.
- `exchange.css`: estilos y animaciones del diagrama de intercambio.
- `site.js`: navegación y aparición progresiva de contenidos.
- `exchange.js`: secuencia animada del intercambio de datos.
- `hero-network.js`: animación de red del canvas del hero.

El SVG del intercambio permanece dentro de `index.html` porque `exchange.js` modifica directamente sus clases y elementos.

## Desarrollo local

Desde la raíz del repositorio, inicia cualquier servidor HTTP estático. Con Python:

```bash
python3 -m http.server 8000
```

Después abre [http://localhost:8000](http://localhost:8000) en el navegador.

No es necesario instalar dependencias.

## Publicación

GitHub Pages sirve los archivos directamente desde la raíz de la rama `main`. Al publicar cambios en esa rama no hay que ejecutar ningún comando de build.

El archivo `CNAME` configura el dominio personalizado `xdatashare.com` y debe conservarse en la raíz del repositorio.

## Comprobaciones antes de publicar

- Revisar la página en escritorio y móvil.
- Comprobar los enlaces internos y externos.
- Confirmar que la navegación, las animaciones y el canvas funcionan sin errores en la consola.
- Verificar que los recursos de `assets/` cargan sin respuestas 404.
- Mantener actualizados `sitemap.xml` y los metadatos de `index.html` cuando cambie el contenido público.
