TreeData = new Mongo.Collection(null);

TreeData.attachSchema(new SimpleSchema({
	flow: {
		type: String,
		defaultValue: 'one',
		allowedValues: ['one', 'two'],
		optional: true
	},
	theme: {
		type: String,
		defaultValue: 'default',
		allowedValues: ['default','custom','animated'],
		optional: true
	}
}));

var d = TreeData.insert({});

TreeDocuments = new Mongo.Collection(null, { ref: '/tree:documents' });
TreeDocuments.helpers({
	cursor(type) { return TreeDocuments.find({ parent: this._id, type: type }); }
});
TreeDocuments.insert({});

CustomStates = new Mongo.Collection(null, { ref: '/tree:states' });
CustomStates.attachTemplTreeStatesGraph();

Router.route('/tree', function() {
	this.render('/tree');
});

Template['/tree'].helpers({
	roots() {
		return TreeDocuments.find({ parent: { $exists: false } });
	},
	States() {
		return Templ.Tree.States;
	},
	CustomStates() {
		return CustomStates;
	},
	Data(){
		return TreeData;
	},
	data() {
		return TreeData.findOne(d);
	}
});


Template['/tree'].events({
	'change input, change select':function(event, tempalte) {
		var values = AutoForm.getFormValues('TreeControl');
		TreeData.update(d, values.updateDoc);
	}
});

Template['TreeInsert'].events({
	'click': function(event, template) {
		if (template.data && template.data.document && template.data.type)
			TreeDocuments.insert({
				parent: template.data.document._id,
				type: template.data.type
			});
		else TreeDocuments.insert({});
	}
});

Template['TreeRemove'].events({
	'click': function(event, template) {
		TreeDocuments.remove(template.data.document._id);
	}
});