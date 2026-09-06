/**
 * Strip dangerous HTML before re-injection (defense-in-depth).
 *
 * Removes:
 * - inline event handlers (`on*`)
 * - `javascript:` URLs in href/src/link attributes
 * - <script>/<iframe>/<object>/<embed> elements
 *
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
    if (typeof html !== 'string' || html === '') {
        return html;
    }

    return html
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(\s)(href|src|xlink:href|action)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (match, ws, attr, value) => {
            const inner = value.replace(/^["']|["']$/g, '');
            if (/^\s*javascript:/i.test(inner)) {
                return ws + attr + '=""';
            }
            return match;
        })
        .replace(/<\s*(script|iframe|object|embed)\b[\s\S]*?<\s*\/\s*(script|iframe|object|embed)\s*>/gi, '');
}