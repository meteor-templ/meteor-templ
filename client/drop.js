Router.route('/', function() {
    this.render('/');
});

Router.route('/drop', function() {
    this.render('/drop');
});

Template['/drop'].onRendered(function() {
	var svg = d3.select(this.$('svg')[0]);
	
	var anchor = svg
		.append('circle')
		.attr('r', 50)
		.attr('fill', '#000')
		.attr('cx', 50)
		.attr('data-drop-anchor', Random.id())
		.attr('cy', 50)[0][0]
	
	Drop.init({ template: 'arrowed', trigger: 'tooltip', position: 'r', _anchor: anchor });
	Drop.init({ template: 'arrowed', trigger: 'tooltip', position: 'l', _anchor: anchor });
});

var positions = ['t','r','b','l'];
	
var showInterval;
var hideInterval;
var instance;

Template['/drop'].onRendered(function() {
	var anchor = this.$('#interval')[0];
	// var anchor = Drop.coordinates(this.$('#interval')[0]); // Equal
	Meteor.setInterval(() => {
		instance = Drop.show({ template: 'arrowed', _anchor: anchor, position: positions[lodash.random(0, 3)] });
	}, 2000);
	Meteor.setTimeout(() => { Meteor.setInterval(() => {
		Drop.hide(instance);
	}, 2000); }, 1000);
});


Template['/drop'].onDestroyed(function() {
	if (instance) Drop.hide(instance);
	Meteor.clearInterval(showInterval);
	Meteor.clearInterval(hideInterval);
});

Template.registerHelper('lodash', function() { return lodash; });