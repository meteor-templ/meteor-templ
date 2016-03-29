Package.describe({
  name: 'shuttler:editor',
  version: '0.0.0',
  summary: 'Editor for graphs on shuttler.',
  git: 'https://github.com/meteor-shuttler/editor',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  
  api.use('mongo');
  api.use('ecmascript');
  api.use('templating');
  api.use('less');
  
  api.use('stevezhu:lodash@4.3.0');
  api.use('shuttler:ref@0.0.4');
  api.use('shuttler:graphs@0.0.11');
  api.use('shuttler:collection@0.0.4');
  
  api.addFiles('editor.html', 'client');
  api.addFiles('editor.js', 'client');
  api.addFiles('editor.less', 'client');
});