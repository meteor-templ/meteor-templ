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

// center
Template['/drop'].onRendered(function() {
	var instance;
	var anchor = this.$('#interval')[0];
	Meteor.setInterval(() => {
		instance = Drop.show({ template: 'arrowed', _anchor: anchor, position: positions[lodash.random(0, 3)] });
	}, 2000);
	Meteor.setTimeout(() => { Meteor.setInterval(() => {
		Drop.hide(instance);
	}, 2000); }, 1000);
});

// left
Template['/drop'].onRendered(function() {
	var instance;
	Meteor.setInterval(() => {
		var anchor = Drop.coordinates(this.$('#interval')[0])
		anchor.left = anchor.left + (anchor.width / 2) - 100;
		anchor.top = anchor.top + (anchor.height / 2);
		anchor.width = 0;
		anchor.height = 0;
		instance = Drop.show({ template: 'arrowed', _anchor: anchor, position: positions[lodash.random(0, 3)] });
	}, 2000);
	Meteor.setInterval(() => {
		if (Drop._data[instance]) {
			Drop._data[instance]._anchor.left--;
			Drop.tick(instance, Drop._data[instance]._anchor);
		}
	}, 10);
	Meteor.setTimeout(() => { Meteor.setInterval(() => {
		Drop.hide(instance);
	}, 2000); }, 1000);
});

// right	
Template['/drop'].onRendered(function() {
	var instance;
	Meteor.setInterval(() => {
		var anchor = Drop.coordinates(this.$('#interval')[0])
		anchor.left = anchor.left + (anchor.width / 2) + 100;
		anchor.top = anchor.top + (anchor.height / 2);
		anchor.width = 0;
		anchor.height = 0;
		instance = Drop.show({ template: 'arrowed', _anchor: anchor, position: positions[lodash.random(0, 3)] });
	}, 2000);
	Meteor.setInterval(() => {
		if (Drop._data[instance]) {
			Drop._data[instance]._anchor.left++;
			Drop.tick(instance, Drop._data[instance]._anchor);
		}
	}, 20);
	Meteor.setTimeout(() => { Meteor.setInterval(() => {
		Drop.hide(instance);
	}, 2000); }, 1000);
});

Template.registerHelper('lodash', function() { return lodash; });