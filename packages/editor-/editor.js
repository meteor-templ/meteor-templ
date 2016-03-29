Shuttler.Editor = function() {
	if (!(this instanceof Shuttler.Editor))
		return new Shuttler.Editor();

	// Collection of viewed queries to collections.
	this.queries = new Mongo.Collection(null);
	
	// Collection of fixed nodes.
	this.fixed = new Mongo.Collection(null);

	var editor = this;

	this.node = function() {
		var data = d3.select(this).data()[0];
		if (data._t === 'query') {
			var text = d3.select(this).append('text')
				.attr('dx', 0).attr('dy', 0)
				.attr('fill', editor.queries.findOne(data._id).color)
				.attr('text-anchor', 'middle')
				.text(editor.queries.findOne(data._id).name)
			var bbox = this.getBBox();
			var rect = d3.select(this)
				.insert("rect", "text")
				.classed('name', true)
				.attr("x", bbox.x - 7).attr("y", bbox.y - 4)
				.attr("width", bbox.width + (7 * 2)).attr("height", bbox.height + (4 * 2))
				.attr("fill", "transparent")
				.attr("stroke", editor.queries.findOne(data._id).color)
				.attr("stroke-width", 1)
		} else {
			d3.select(this).append('circle')
				.attr('class', 'document')
				.attr('cursor', 'crosshair')
				.attr('r', 8)
				.attr('fill', editor.queries.findOne(data._q).color)
			d3.select(this)
				.append('text')
				.attr('dx', 0).attr('dy', -10)
				.attr('fill', '#fff')
				.attr('text-anchor', 'middle')
				.text(function(n) { return n._id })
		}
	};

	this.line = function() {
		var line = d3.select(this);
		var data = line.data()[0];
		if (data._t === 'query') {
		} else {
			line
				.attr('stroke', editor.queries.findOne(data._q).color)
				.attr('stroke-width', () => { return '2' })
				.attr('stroke-dasharray', data._selected?'10, 10':'')
			    .attr("marker-end", function(l) {
			    	if (l._t == 'source') return "url(#"+l._q+"-source)";
			    	if (l._t == 'target') return "url(#"+l._q+"-target)";
		    	})
		}
		
	};
	
	this.select = function(node) {
		var data = node.data()[0];
		if (data._t === 'query') {
			var name = node.select('rect.name');
			node
				.append('rect')
				.classed('selector', true)
				.attr("x", parseInt(name.attr('x')) - 1).attr("y", parseInt(name.attr('y')) - 1)
				.attr("width", parseInt(name.attr('width')) + 2).attr("height", parseInt(name.attr('height')) + 2)
				.attr("fill", "transparent")
				.attr("stroke", editor.queries.findOne(data._id).color)
				.attr("stroke-width", 2)
		} else {
			node
				.append('circle')
				.classed('selector', true)
				.attr('r', 10)
				.attr('fill', 'transparent')
				.attr('stroke', editor.queries.findOne(data._q).color)
				.attr('stroke-width', 1)
		}
	};
	
	this.unselect = function(node) {
		node.selectAll('.selector')
			.remove();
	};
	
	this.fix = function(node) {
		var data = node.data()[0];
		if (data._t === 'query') {
			var name = node.select('rect.name');
			node
				.append('rect')
				.classed('fixer', true)
				.attr("x", parseInt(name.attr('x')) - 4).attr("y", parseInt(name.attr('y')) - 4)
				.attr("width", parseInt(name.attr('width')) + 8).attr("height", parseInt(name.attr('height')) + 8)
				.attr("fill", "transparent")
				.attr("stroke", editor.queries.findOne(data._id).color)
				.attr("stroke-width", 1)
				.attr('stroke-dasharray', '3, 3')
		} else {
			node
				.append('circle')
				.classed('fixer', true)
				.attr('r', 12)
				.attr('fill', 'transparent')
				.attr('stroke', editor.queries.findOne(data._q).color)
				.attr('stroke-width', 1)
				.attr('stroke-dasharray', '3, 3')
		}
	};
	
	this.unfix = function(node) {
		node.selectAll('.fixer')
			.remove();
	};
};

Template['shuttlerEditor'].onRendered(function() {
	if (!this.data.editor || !(this.data.editor instanceof Shuttler.Editor))
		throw new Meteor.Error('Wrong Shuttler.Editor instance!');

	var editor = this.data.editor;
	var queries = editor.queries;

	var svg = d3.select(this.$('svg')[0]);
	
	svg
		.on('mousemove', function() {
			mousemoved = true;
		})
		.on('mousedown', function() {
			mousedown = true;
		})
		.on('mouseup', function() {
			mousedown = false;
		})

	// force
	var force = d3.layout.force();
	
	force
		.linkDistance((l) => { return l.distance; })
		.linkStrength((l) => { return l.strength; })
		.charge(-500)
		.on('tick', () => {
			svg.selectAll('.node')
				.attr('transform', (n) => {
					if (editor.fixed.findOne(n.id)) {
						editor.fixed.update(n.id, { $set: { x: n.x, y: n.y } });
					}
					return 'translate(' + n.x + ',' + n.y + ')';
				})
			svg.selectAll('.line')
				.attr("x1", function(l) { return l.source.x; })
				.attr("y1", function(l) { return l.source.y; })
				.attr("x2", function(l) { return l.target.x; })
				.attr("y2", function(l) { return l.target.y; })
		})
	
	var mousedown = false;
	var mousemoved = false;
	var mouseovered = undefined;
	var selected = undefined;
	
	// resize
	((resize) => {
		resize();
		d3.select(window).on('resize', resize);
	})(() => {
		var width = window.innerWidth;
		var height = (window.innerHeight / 100) * 80;
		svg.attr('width', width).attr('height', height);
		force.size([width, height]).resume();
	});

	var redraw = () => {
		var nodes = {};

		nodes.data = svg.selectAll('.node').data(force.nodes(), function(n) {
			if (n._t === 'query') return n.id;
			else return n.id;
		})
		
		nodes.g = nodes.data.enter().append('g')
			.attr('class', 'node')
			.attr('data-id', (n) => { return n.id; })
			.style('cursor', 'pointer')
			.call(force.drag)
			.call(function(g) {
				g.each(editor.node);
			})
			.on('mousedown', function(n) {
				mousemoved = false;
				svg.selectAll('.node:not([data-id='+n.id+']').call(editor.unselect);
				svg.selectAll('.node[data-id='+n.id+']').call(editor.select);
			})
			.on('mouseup', function(n) {
				if (selected && selected.id == n.id) {
					if (!mousemoved) {
						var fixed = editor.fixed.findOne(selected.id);
						if (fixed) editor.fixed.remove(selected.id);
						else editor.fixed.insert({ _id: selected.id });
						n.fixed = !fixed;
						redraw();
					}
				} else {
					selected = n;
				}
			})
			.on('mouseover', function(n) {
				if (!mousedown) {
					n.fixed = true;
				}
			})
			.on('mouseout', function(n) {
				if (!mousedown) {
					n.fixed = !!editor.fixed.findOne(n.id);
				}
			})

		nodes.data.exit().remove();
		
		var lines = {};

		lines.data = svg.selectAll('.line').data(force.links(), function(l) { return l.id; })
		lines.line = lines.data.enter().insert('line', '.node')
			.attr('class', 'line')
			.attr('data-id', (l) => { return l.id; })
			.call(function(line) {
				line.each(editor.line);
			})

		lines.data.exit().remove();
		
		force.start();
	};
	
	var observers = {};
	
	var added = (q) => {
		var qid = 'node-query-'+q._id
		var qfixed = editor.fixed.findOne(qid);
		var qn = { id: qid, _id: q._id, _t: 'query' };
		if (qfixed) {
			qn.fixed = !!qfixed;
			qn.x = qfixed.x;
			qn.y = qfixed.y;
		}
		force.nodes().push(qn);
		var collection = Shuttler.collection(q.collection);
		observers[q._id] = collection.find(q.query).observe({
			added: (d) => {
				var did = 'node-document-'+d._id;
				var dfixed = editor.fixed.findOne(did);
				var qfixed = editor.fixed.findOne(qid);
				var dn = { id: did, _id: d._id, _q: q._id };
				if (dfixed) {
					dn.fixed = !!dfixed;
					dn.x = dfixed.x;
					dn.y = dfixed.y;
				} else if(qfixed) {
					dn.x = qfixed.x;
					dn.y = qfixed.y;
				}
				force.nodes().push(dn);
				force.links().push({
					id: 'line-query-'+d._id, _id: d._id, _d: d._id, _q: q._id, _t: 'query',
					source: qn, target: dn, distance: 50, strength: 1
				});
				if (collection.isGraph) {
					force.links().push({
						id: 'line-graph-'+d._id+'-source', _id: d._id, _d: d._id, _q: q._id, _t: 'source', _selected: !!d._selected,
						source: dn, target: lodash.find(force.nodes(), (n) => { return n._id === d._source.id }), distance: 50, strength: 0.05
					},{
						id: 'line-graph-'+d._id+'-target', _id: d._id, _d: d._id, _q: q._id, _t: 'target', _selected: !!d._selected,
						source: dn, target: lodash.find(force.nodes(), (n) => { return n._id === d._target.id }), distance: 50, strength: 0.05
					});
				}
				redraw();
			},
			changed: (nd, od) => {
				if (!lodash.isEqual(nd._source, od._source)) {
					var link = lodash.find(force.links(), (l) => { return l.id === 'line-graph-'+nd._id+'-source'; });
					link.target = lodash.find(force.nodes(), (n) => { return n._id === nd._source.id });
				}
				if (!lodash.isEqual(nd._target, od._target)) {
					var link = lodash.find(force.links(), (l) => { return l.id === 'line-graph-'+nd._id+'-target'; });
					link.target = lodash.find(force.nodes(), (n) => { return n._id === nd._target.id });
				}
				redraw();
			},
			removed: (d) => {
				lodash.remove(force.nodes(), (n) => { return n._id === d._id; });
				lodash.remove(force.links(), (n) => { return n._id === d._id; });
				redraw();
			}
		});
		redraw();
	};
	var removed = (q) => {
		lodash.remove(force.nodes(), (n) => {
			return n._id === q._id || n._q === q._id;
		});
		lodash.remove(force.links(), (l) => {
			return l._q === q._id;
		});
		observers[q._id].stop();
		delete observers[q._id];
		redraw();
	};
	
	queries.find().forEach(added);

	// observe queries
	queries.find().observe({
		added: added,
		changed: (nq, oq) => {
			removed(oq);
			added(nq);
		},
		removed: removed
	});

	// observe fixeds
	editor.fixed.find().observe({
		added: (f) => {
			svg.select('[data-id='+f._id+']').call(editor.fix).call(function(n) {
				var data = n.data()[0];
				data.fixed = true;
			});
		},
		removed: (f) => {
			svg.select('[data-id='+f._id+']').call(editor.unfix).call(function(n) {
				var data = n.data()[0];
				data.fixed = false;
			});
		}
	});

	redraw();
});

Template['shuttlerEditor'].helpers({
	
});