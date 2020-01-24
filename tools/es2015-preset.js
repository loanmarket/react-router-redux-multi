const BABEL_ENV = process.env.BABEL_ENV

module.exports = () => ([
  "@babel/preset-env", {
      loose: true,
      modules: BABEL_ENV === 'es' ? false : 'commonjs'
    }
])