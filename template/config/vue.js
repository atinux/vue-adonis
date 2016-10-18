'use strict'

module.exports = {

  /*
  |--------------------------------------------------------------------------
  | Output directory for generated files
  |--------------------------------------------------------------------------
  |
  | Directory where the generated files will be added (in public/)
  | By default, il will be in the public/dist/
  |
  */
  outputDir: 'dist',

  /*
  |--------------------------------------------------------------------------
  | Generated Files Names
  |--------------------------------------------------------------------------
  */
  filenames: {
    clientVendor: 'client-vendor-bundle.js',
    client: 'client-bundle.js',
    server: 'server-bundle.js',
    css: 'style.css'
  },

  /*
  |--------------------------------------------------------------------------
  | Cache Components (activated only in production)
  |--------------------------------------------------------------------------
  | If set to true, please install the lru-cache module (npm i -s lru-cache)
  */
  cache: true,
  /*
  | max: <integer>, maximum number omponents cached
  | maxAge: <integer>, after <interger> ms, the cached component will be removed
  */
  cacheOptions: {
    max: 1000,
    maxAge: 15 * 60 * 1000
  },

  /*
  |--------------------------------------------------------------------------
  | Webpack Configuration
  |--------------------------------------------------------------------------
  |
  | The generated files will be added in the public/dist/ directory
  |
  */
  webpack: {
    /*
    |--------------------------------------------------------------------------
    | Server Configuration
    |--------------------------------------------------------------------------
    |
    | Path to the webpack configuration for the server-bundle.js file
    | You can change the name of the file generated in above (filenames.server)
    |
    */
    serverConfig: 'webpack/server.config',

    /*
    |--------------------------------------------------------------------------
    | Client Configuration
    |--------------------------------------------------------------------------
    |
    | Path to the webpack configuration for the client-vendor-bundle.js and
    | client-bundle.js file
    | You can change the name of the files generated above
    | (filenames.clientVendor and filenames.client)
    |
    | In production, the CSS will be extracted and created as a single file in
    | the public/dist/ directory
    | You can change the name of the css file above (filenames.css)
    |
    */
    clientConfig: 'webpack/client.config'

  }

}
