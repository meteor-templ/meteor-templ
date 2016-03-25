Router.route('/', function() {
    this.render('/');
});

Router.route('/drop', function() {
    this.render('/drop');
});

Template.registerHelper('lodash', function() { return lodash; });