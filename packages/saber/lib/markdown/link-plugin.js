const path = require('upath')

module.exports = function(md) {
  // eslint-disable-next-line camelcase
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]

    const hrefIndex = token.attrIndex('href')
    const link = token.attrs[hrefIndex]

    if (link) {
      if (/^[^:]+:\/\//.test(link[1])) {
        if (/^https?:/.test(link[1])) {
          // External link
          token.attrSet('target', '_blank')
          token.attrSet('rel', 'noopener noreferrer')
        }
      } else if (link[1]) {
        // Internal link
        token.tag = 'saber-link'
        link[0] = 'to'

        const matched = /^([^#?]+)([#?].*)?$/.exec(link[1])
        if (
          matched &&
          /\.md$/.test(matched[1]) &&
          env.filePath &&
          env.pagesDir
        ) {
          const absolutePath = path.resolve(
            path.dirname(env.filePath),
            matched[1]
          )
          if (absolutePath.includes(`${env.pagesDir}/`)) {
            link[0] = ':to'
            link[1] = `$saber.getPageLink("${matched[1]}", "${matched[2] ||
              ''}")`
          }
        }
      }
    }

    return self.renderToken(tokens, idx, options)
  }

  // eslint-disable-next-line camelcase
  md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
    const openToken = tokens[idx - 2]
    const token = tokens[idx]
    const prefix = ''
    if (openToken) {
      if (openToken.tag === 'saber-link') {
        token.tag = 'saber-link'
      }
    }
    return prefix + self.renderToken(tokens, idx, options)
  }
}
