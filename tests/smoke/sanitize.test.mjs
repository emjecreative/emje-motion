import { tmpUrl, eq } from './helpers.mjs';

const { sanitizeHtml } = await import(tmpUrl('mod-sanitizeHtml.mjs'));

// Passthrough for non-strings and empty input (unchanged behavior).
eq('empty', sanitizeHtml(''), '');
eq('null', sanitizeHtml(null), null);
eq('undef', sanitizeHtml(undefined), undefined);

// Legit author formatting round-trips untouched.
eq(
    'legit',
    sanitizeHtml('<p>Hello <strong>world</strong> and <a href="https://example.test/page?a=1&amp;b=2">link</a><br></p>'),
    '<p>Hello <strong>world</strong> and <a href="https://example.test/page?a=1&amp;b=2">link</a><br></p>',
);

// Event handlers are stripped in every quoting/shape variant.
eq('onclick', sanitizeHtml('<b onclick="evil()">t</b>'), '<b>t</b>');
eq('onfocus-upper', sanitizeHtml('<b ONFOCUS=evil()>t</b>'), '<b>t</b>');
eq('on-tab', sanitizeHtml('<b\tonclick =evil()>t</b>'), '<b>t</b>');
eq('on-newline', sanitizeHtml('<b onmouseover\n=\n"evil()">t</b>'), '<b>t</b>');
eq('on-nul', sanitizeHtml('<b o\0nclick="x">t</b>'), '<b>t</b>');

// javascript: URLs are dropped (case/whitespace/entity variants); safe URLs stay.
eq('js-url', sanitizeHtml('<a href="javascript:alert(1)">x</a>'), '<a>x</a>');
eq('js-url-mixed', sanitizeHtml('<a href="  JaVaScRiPt:alert(1)">x</a>'), '<a>x</a>');
eq('js-url-entity', sanitizeHtml('<a href="javascript&colon;alert(1)">x</a>'), '<a>x</a>');
eq('rel-url', sanitizeHtml('<a href="/path">x</a>'), '<a href="/path">x</a>');
eq('frag-url', sanitizeHtml('<a href="#top">x</a>'), '<a href="#top">x</a>');
eq('mailto-url', sanitizeHtml('<a href="mailto:a@example.test">x</a>'), '<a href="mailto:a@example.test">x</a>');

// Script-family elements are dropped with their whole subtree, including
// unclosed and nested/overlapping payloads.
eq('script', sanitizeHtml('a<script>alert(1)</script>b'), 'ab');
eq('script-unclosed', sanitizeHtml('a<script>alert(1)'), 'a');
eq('script-nested', sanitizeHtml('<<script>script>alert(1)</script>'), '&lt;');
eq('iframe', sanitizeHtml('a<iframe src="https://evil.test"></iframe>b'), 'ab');
eq('object', sanitizeHtml('a<object data="x"><param></object>b'), 'ab');
eq('svg', sanitizeHtml('a<svg><circle r="5"/></svg>b'), 'ab');

// Unknown elements are unwrapped (children kept); dangerous attributes go.
eq('div-unwrap', sanitizeHtml('<div class="x">t</div>'), 't');
eq('span-clean', sanitizeHtml('<span style="color:red" onclick="x" class="k">t</span>'), '<span class="k">t</span>');
eq('aria-kept', sanitizeHtml('<span aria-label="x">t</span>'), '<span aria-label="x">t</span>');

// Comments and bogus markup are dropped.
eq('comment', sanitizeHtml('a<!-- <script> -->b'), 'ab');
eq('doctype', sanitizeHtml('<!doctype html><p>t</p>'), '<p>t</p>');

// Images keep safe sources; handlers and unsafe schemes are dropped.
eq('img', sanitizeHtml('<img src="https://example.test/i.jpg" alt="a" onerror="x">'), '<img src="https://example.test/i.jpg" alt="a">');
eq('img-js', sanitizeHtml('<img src="javascript:alert(1)">'), '<img>');

// target=_blank gains rel=noopener (reverse tabnabbing).
eq('blank', sanitizeHtml('<a href="https://example.test" target="_blank">x</a>'), '<a href="https://example.test" target="_blank" rel="noopener">x</a>');
eq('blank-rel', sanitizeHtml('<a href="https://example.test" target="_blank" rel="author">x</a>'), '<a href="https://example.test" target="_blank" rel="author noopener">x</a>');

// Stray angle brackets are escaped, plain text passes through.
eq('stray-lt', sanitizeHtml('1 < 2'), '1 &lt; 2');
eq('gt-text', sanitizeHtml('a > b'), 'a > b');
