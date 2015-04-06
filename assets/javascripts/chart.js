jQuery2(function() {
	jQuery2('#tab-Report').on('click', Redcase.Graph.update);
	Redcase.Graph.update();
})

Redcase.Graph = {};

Redcase.Graph.chartOptions = {
	legendTemplate : 
		"<table class=\"jschart-legend-table\">" +
			"<% for (var i=0; i<segments.length; i++){%>" +
				"<tr><td class=\"jschart-legend-cell\" style=\"width: 10px; background-color: <%=segments[i].fillColor%>\"></td><td><%if(segments[i].label){%><%=segments[i].label%><%}%></td></tr>" +
			"<%}%>" +
		"</table>"
}

Redcase.Graph.isRendered = function() {
	var computeDimension, graph_el;
	
	computeDimension = function(element,dimension) 
	{
		if (element['offset'+dimension])
		{
			return element['offset'+dimension];
		}
		else
		{
			return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
		}
	};
	graph_el = jQuery2('#jschart_id').get(0);
	
	return !isNaN(computeDimension(graph_el, 'Height')) && !isNaN(computeDimension(graph_el, 'Width'));
}

Redcase.Graph.update = function() {
	var
	apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.graph.actions.show.getCall(0), {
		params : {
			'environment_id' : jQuery2('#environment').val(),
			'suite_id': jQuery2('#suite').val(),
			'version_id': jQuery2('#versionx').val()
		},		
		success : function(data, textStatus, request) {
			var graph_el, ctx;
			if (Redcase.Graph.Chart !== undefined) 
			{
				Redcase.Graph.Chart.destroy();
			}

			if (Redcase.Graph.isRendered()) 
			{
				graph_el = jQuery2('#jschart_id').get(0);
				ctx = graph_el.getContext("2d");
				if (ctx.canvas.width > 0 && ctx.canvas.height > 0) 
				{
					Redcase.Graph.Chart = new Chart(ctx).Pie(data,Redcase.Graph.chartOptions);			
					jQuery2('#jschart_legend').html(Redcase.Graph.Chart.generateLegend())
				}
			}
		},
		errorMessage : "Couldn't load graph"
	});
	Redcase.apiCall(apiParms);	
}