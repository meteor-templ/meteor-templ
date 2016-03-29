var Data = DropData = new Mongo.Collection(null);

Data.attachSchema(new SimpleSchema({
	trigger: {
		type: String,
		defaultValue: 'toggle',
		allowedValues: ['toggle', 'tooltip', 'dropmenu', 'dropdown', 'popover']
	},
	template: {
		type: String,
		defaultValue: '/drop:template',
		allowedValues: ['/drop:template', '/drop:nested', '/drop:content']
	},
	theme: {
		type: String,
		defaultValue: 'DropDefault',
		allowedValues: ['DropDefault', 'DropBootstrap']
	},
	placement: {
		type: String,
		defaultValue: 'global',
		allowedValues: ['global', 'dropLocalPlacement']
	},
	location: {
		type: String,
		defaultValue: 'outside',
		allowedValues: ['outside', 'inside']
	},
	direction: {
		type: String,
		defaultValue: 'top',
		allowedValues: ['top', 'right', 'left', 'bottom']
	},
	position: {
		type: Number,
		defaultValue: 0.5,
		min: 0, max: 1,
		decimal: true
	},
	alignment: {
		type: Number,
		defaultValue: 0.5,
		min: 0, max: 1,
		decimal: true
	},
	example: {
		type: String,
		defaultValue: 'template',
		allowedValues: ['template', 'script'],
		optional: true
	}
}));

var d = Data.insert({});
var drop, trigger;

Router.route('/drop', function() {
	this.render('/drop', { data: { data: Data.findOne(d) }});
});

Template['/drop:zone'].events({
	'change input, change select, change .nouislider':function(event, tempalte) {
		var values = AutoForm.getFormValues('DropZoneControl');
		Data.update(d, values.updateDoc);
	}
});

Template['/drop:zone'].helpers({
	Data: function() { return Data; }
});

Template['/drop:zone'].events({
	'click [data-templ-drop-action]': function(event, template) {
		trigger.anchor = true;
		drop[$(event.currentTarget).data('templ-drop-action')]();
	}
});

Template['/drop:zone'].onRendered(function() {
	this.$('.anchor').draggable({
		cancel: false,
		containment: ".anchors"
	});
	this.$('.anchors').resizable({
		maxHeight: 400,
		minHeight: 70,
		handles: 's',
		resize: () => {
			if (this.$('.anchor').height() + this.$('.anchor').offset().top > this.$('.anchors').height() + this.$('.anchors').offset().top) {
				this.$('.anchor').css({ top: this.$('.anchors').height() - this.$('.anchor').height() });
			}
		}
	});
	drop = new Drop(Data.findOne(d));
	drop.tick({ anchor: this.$('.anchor')[0] });
	if (drop.data.template == '/drop:template') {
		drop.data.content = Template['/drop:handy'];
	}
	drop.watchWindow().watchDrag();
	drop.show();
	trigger = drop.trigger(drop.data.trigger);
	Data.find({ _id: d }).observe({
		changed: function(data) {
			if (data.template == '/drop:template')
				data.content = Template['/drop:handy'];
			else data.content = undefined;
			drop.tick(data);
			trigger.destroy();
			trigger = drop.trigger(data.trigger);
		}
	});
});

Template['/drop:zone'].onDestroyed(function() {
	drop.hide();
});