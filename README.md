# XDATASHARE

Sitio web estático y bilingüe de [XDATASHARE](https://xdatashare.com/), publicado mediante GitHub Pages.

No utiliza framework, gestor de paquetes ni proceso de compilación: el navegador carga directamente el HTML, CSS y JavaScript del repositorio.

## Estructura

```text
.
├── index.html          → español
├── en/
│   └── index.html      → inglés
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── site.css
│   │   └── exchange.css
│   └── js/
│       ├── language.js
│       ├── site.js
│       ├── exchange.js
│       └── hero-network.js
├── CNAME
├── robots.txt
└── sitemap.xml
```

- `index.html` y `en/index.html`: contenido, estructura semántica y metadatos SEO de cada idioma.
- `base.css`: variables, estilos globales y componentes compartidos.
- `site.css`: navegación, hero, secciones, tarjetas y reglas responsive.
- `exchange.css`: estilos y animaciones del diagrama de intercambio.
- `language.js`: selección de idioma, preferencia guardada y redirección inicial.
- `site.js`: navegación y aparición progresiva de contenidos.
- `exchange.js`: secuencia animada del intercambio de datos.
- `hero-network.js`: animación de red del canvas del hero.

El SVG del intercambio permanece dentro de cada `index.html` porque `exchange.js` modifica directamente sus clases y elementos.

## Idiomas

La web se publica como dos páginas independientes que comparten los mismos CSS y JavaScript:

| Idioma | URL | Archivo |
|---|---|---|
| Español | `https://xdatashare.com/` | `index.html` |
| Inglés | `https://xdatashare.com/en/` | `en/index.html` |

Solo existen estos dos idiomas. Cualquier otro idioma del navegador se atiende en inglés, que es también el destino de `hreflang="x-default"`.

Ambos documentos mantienen **los mismos IDs y anclas** (`top`, `que-es`, `beneficios`, `como`, `arquitectura`, `produccion`, `demo`), de modo que el selector `ES / EN` de la navegación conserva la sección que se está leyendo al cambiar de idioma.

### Selección de idioma

`assets/js/language.js` resuelve el idioma en este orden:

1. Parámetro explícito `?lang=es` o `?lang=en` en la URL.
2. Preferencia guardada en `localStorage` bajo la clave `xdatashare.language`.
3. Idioma principal del navegador; cualquier valor que empiece por `es` selecciona español y el resto, inglés.

La detección automática del navegador solo se aplica al entrar en la raíz sin preferencia previa. A partir de ahí se respeta siempre la elección manual, que se guarda al usar el selector. Los enlaces `ES / EN` son enlaces reales entre ambas páginas y funcionan aunque JavaScript esté desactivado o `localStorage` no esté disponible.

> **Excepción intencionada al orden de scripts:** `language.js` se carga en el `<head>` **sin `defer`**, a diferencia del resto de scripts. Debe ejecutarse antes de pintar la página para que una redirección a `/en/` no muestre brevemente el idioma incorrecto. No añadas `defer` ni lo muevas al final del documento.

### Flujo de traducción

Al cambiar contenido público hay que actualizar **los dos documentos**:

1. Editar el contenido en `index.html` y su equivalente en `en/index.html`.
2. Revisar en ambos los metadatos asociados: `title`, `description`, `keywords`, Open Graph, Twitter Card y JSON-LD.
3. Conservar en inglés los nombres propios, marcas, estándares, términos técnicos y URLs externas.
4. Mantener idénticos los IDs y anclas; si se añade una sección nueva, añadirla en los dos idiomas con el mismo ID.
5. Las etiquetas de las seis fases del diagrama de intercambio viven en los atributos `data-phase-label` de cada `.ex-step`, no en `exchange.js`. Traducirlas también ahí.
6. Comprobar que siguen coincidiendo el canonical, los `hreflang` recíprocos, `og:locale` y `og:locale:alternate` de cada página.

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
- Revisar las dos páginas, `/` y `/en/`, y el selector de idioma en escritorio y móvil.
- Confirmar que la selección manual de idioma se guarda, prevalece sobre el navegador y no produce bucles de redirección.
- Mantener actualizados `sitemap.xml` y los metadatos de ambos idiomas cuando cambie el contenido público.
