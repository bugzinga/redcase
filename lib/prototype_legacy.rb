
# TODO: Methods below are copied from the following links
#       to support Protorype helper methods in Rails 3:
#       1. https://github.com/rails/prototype-rails
#       2. https://github.com/rails/prototype_legacy_helper
#       This stuff shall be retired ASAP.

module PrototypeLegacy

	def method_option_to_s(method)
		(method.is_a?(String) and !method.index("'").nil?) ? method : "'#{method}'"
	end
			
	def remote_function(options)
		javascript_options = options_for_ajax(options)
		update = ''
		if options[:update] && options[:update].is_a?(Hash)
			update  = []
			update << "success:'#{options[:update][:success]}'" if options[:update][:success]
			update << "failure:'#{options[:update][:failure]}'" if options[:update][:failure]
			update  = '{' + update.join(',') + '}'
		elsif options[:update]
			update << "'#{options[:update]}'"
		end
		function = update.empty? ?
			"new Ajax.Request(" :
			"new Ajax.Updater(#{update}, "
		url_options = options[:url]
		function << "'#{ERB::Util.html_escape(escape_javascript(url_for(url_options)))}'"
		function << ", #{javascript_options})"
		function = "#{options[:before]}; #{function}" if options[:before]
		function = "#{function}; #{options[:after]}"  if options[:after]
		function = "if (#{options[:condition]}) { #{function}; }" if options[:condition]
		function = "if (confirm('#{escape_javascript(options[:confirm])}')) { #{function}; }" if options[:confirm]
		return function.html_safe
	end

	def options_for_ajax(options)
		js_options = build_callbacks(options)
		js_options['asynchronous'] = options[:type] != :synchronous
		js_options['method']       = method_option_to_s(options[:method]) if options[:method]
		js_options['insertion']    = "'#{options[:position].to_s.downcase}'" if options[:position]
		js_options['evalScripts']  = options[:script].nil? || options[:script]
		if options[:form]
			js_options['parameters'] = 'Form.serialize(this)'
		elsif options[:submit]
			js_options['parameters'] = "Form.serialize('#{options[:submit]}')"
		elsif options[:with]
			js_options['parameters'] = options[:with]
		end
		if protect_against_forgery? && !options[:form]
			if js_options['parameters']
				js_options['parameters'] << " + '&"
			else
				js_options['parameters'] = "'"
			end
			js_options['parameters'] << "#{request_forgery_protection_token}=' + encodeURIComponent('#{escape_javascript form_authenticity_token}')"
		end
		options_for_javascript(js_options)
	end
	
	def options_for_javascript(options)
		if options.empty?
			'{}'
		else
			"{#{options.keys.map { |k| "#{k}:#{options[k]}" }.sort.join(', ')}}"
		end
	end	
				
	def build_callbacks(options)
		_CALLBACKS = Set.new([ :create, :uninitialized, :loading, :loaded,
				:interactive, :complete, :failure, :success ] +
				(100..599).to_a)
		callbacks = {}
		options.each do |callback, code|
			if _CALLBACKS.include?(callback)
				name = 'on' + callback.to_s.capitalize
				callbacks[name] = "function(request){#{code}}"
			end
		end
		callbacks
	end
				
	def observe_field(field_id, options = {})
		if options[:frequency] && options[:frequency] > 0
			build_observer('Form.Element.Observer', field_id, options)
		else
			build_observer('Form.Element.EventObserver', field_id, options)
		end
	end
	
	def build_observer(klass, name, options = {})
		if options[:with] && (options[:with] !~ /[\{=(.]/)
			options[:with] = "'#{options[:with]}=' + encodeURIComponent(value)"
		else
			options[:with] ||= 'value' unless options[:function]
		end
		callback = options[:function] || remote_function(options)
		javascript  = "new #{klass}('#{name}', "
		javascript << "#{options[:frequency]}, " if options[:frequency]
		javascript << "function(element, value) {"
		javascript << "#{callback}}"
		javascript << ")"
		javascript_tag(javascript)
	end
		
	def link_to_remote(name, options = {}, html_options = {})
		link_to_function(name, remote_function(options), html_options || options.delete(:html))
	end

end

include PrototypeLegacy
