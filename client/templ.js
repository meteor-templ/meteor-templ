Router.route('/', function() {
    this.render('/');
});

Template.registerHelper('lodash', function() { return lodash; });