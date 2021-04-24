module.exports = function(grunt) {
  require('time-grunt')(grunt);

  const PACKAGE_JSON_CONTENTS = grunt.file.readJSON('package.json');
  const PACKAGE_NAME = PACKAGE_JSON_CONTENTS.name;

  const MANIFEST_JSON_CONTENTS = grunt.file.readJSON('src/manifest.json');
  const MANIFEST_VERSION = MANIFEST_JSON_CONTENTS.version;

  const FILE_NAME_PREFIX = `${ PACKAGE_NAME }-v`;

  grunt.initConfig({
    pkg: PACKAGE_JSON_CONTENTS,
    manifest: MANIFEST_JSON_CONTENTS,
    config: {
      tempDir:
        grunt.cli.tasks[0] === 'tgut' ? 'build/tgut-temp/' : 'build/tgs-temp/',
      buildName:
        grunt.cli.tasks[0] === 'tgut'
          ? 'tgut-<%= manifest.version %>'
          : `${ FILE_NAME_PREFIX }${ MANIFEST_VERSION }`,
    },
    copy: {
      main: {
        expand: true,
        src: ['src/**', '!src/tests.html', '!src/js/tests/**'],
        dest: '<%= config.tempDir %>',
      },
    },
    'string-replace': {
      debugoff: {
        files: {
          '<%= config.tempDir %>src/js/':
            '<%= config.tempDir %>src/js/gsUtils.js',
        },
        options: {
          replacements: [
            {
              pattern: /debugInfo\s*=\s*true/,
              replacement: 'debugInfo = false',
            },
            {
              pattern: /debugError\s*=\s*true/,
              replacement: 'debugError = false',
            },
          ],
        },
      },
      debugon: {
        files: {
          '<%= config.tempDir %>src/js/':
            '<%= config.tempDir %>src/js/gsUtils.js',
        },
        options: {
          replacements: [
            {
              pattern: /debugInfo\s*=\s*false/,
              replacement: 'debugInfo = true',
            },
            {
              pattern: /debugError\s*=\s*false/,
              replacement: 'debugError = true',
            },
          ],
        },
      },
      localesTgut: {
        files: {
          '<%= config.tempDir %>src/_locales/':
            '<%= config.tempDir %>src/_locales/**',
        },
        options: {
          replacements: [
            {
              pattern: /Idle Tabs/gi,
              replacement: 'Idle Tabzzz',
            },
          ],
        },
      },
    },
    crx: {
      public: {
        src: [
          '<%= config.tempDir %>src/**/*',
          '!**/html2canvas.js',
          '!**/Thumbs.db',
        ],
        dest: 'build/zip/<%= config.buildName %>.zip',
      },
      private: {
        src: [
          '<%= config.tempDir %>src/**/*',
          '!**/html2canvas.js',
          '!**/Thumbs.db',
        ],
        dest: 'build/crx/<%= config.buildName %>.crx',
        options: {
          privateKey: 'key.pem',
        },
      },
    },
    clean: ['<%= config.tempDir %>'],
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-crx');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', [
    'copy',
    'string-replace:debugoff',
    'crx:public',
    'crx:private',
    'clean',
  ]);
  grunt.registerTask('tgut', [
    'copy',
    'string-replace:debugon',
    'string-replace:localesTgut',
    'crx:public',
    'crx:private',
    'clean',
  ]);
};
