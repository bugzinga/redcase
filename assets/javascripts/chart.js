
var RedcaseGraph = function($) {

	var self = this;

	this.chart = null;

	this.chartOptions = {
		legendTemplate:
			'<table class="jschart-legend-table">' +
				'<% for (var i = 0; i < segments.length; i++) { %>' +
					'<tr>' +
						'<td class="jschart-legend-cell"' +
						   ' style="width: 10px; background-color: <%=segments[i].fillColor %>"></td>' +
						'<td><% if (segments[i].label) { %><%= segments[i].label %><% } %></td>' +
					'</tr>' +
				'<% } %>' +
			'</table>'
	};

	this.isRendered = function() {
		var computeDimension = function(element, dimension) {
			return element['offset' + dimension]
				|| document.defaultView
					.getComputedStyle(element)
					.getPropertyValue(dimension);
		};
		var graphElement = $('#jschart_id').get(0);
		return graphElement
			&& !isNaN(computeDimension(graphElement, 'Height'))
			&& !isNaN(computeDimension(graphElement, 'Width'));
	};

	this.update = function() {
		var apiParams = $.extend(
			{},
			Redcase.methods.graph.actions.show(0), {
				params: {
					environment_id: $('#environment').val(),
					suite_id: $('#suite').val(),
					version_id: $('#versionx').val()
				},
				success: function(data) {
					self.refresh(data);
				},
				errorMessage: "Couldn't load graph"
			}
		);
		Redcase.apiCall(apiParams);
	};

	this.refresh = function(data) {
		if (self.chart) {
			self.chart.destroy();
		}
		if (!this.isRendered()) {
			return;
		}
		var graphElement = $('#jschart_id').get(0);
		var context = graphElement.getContext("2d");
		var canvas = context.canvas;
		if ((canvas.width > 0) && (canvas.height > 0)) {
			self.chart = new Chart(context).Pie(
				data,
				self.chartOptions
			);
			$('#jschart_legend').html(
				self.chart.generateLegend()
			);
		}
	};

	(function() {
		$('#tab-Report').click(function() {
			self.update();
		});
		self.update();
	})();

}

jQuery(function($) {
	if (Redcase.Graph) {
		return;
	}
	Redcase.Graph = new RedcaseGraph($);
});

