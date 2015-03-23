class RedcasePerformance < ActionController::Base
	def start(action)
		@action = action
		@start_time = Time.now
		logger.info "[Redcase] Time calculation: #{@action}"
	end
	
	def stop()
		result = (Time.now - @start_time)
		logger.info "#{result.round(4)} sec(s): #{@action}"
	end
end