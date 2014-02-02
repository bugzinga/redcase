
# TODO: Redmine developers don't seem to assume that
#       plugin developers (or anyone else) may use
#       HTTP requests to receive data in JSON format
#       from some controllers of Redmine plugins,
#       so they just disabled such a functionality
#       keeping that type of request for Redmine's
#       REST API only (see application_controller.rb,
#       find_current_user() and api_request?() methods.
#       The code below overrides that madness, but
#       this matter should be addressed in a more
#       sofisticated way here to keep Redmine's REST API
#       feature alive and at the same time allowing
#       Redcase users to work with the plugin with
#       no issues.
module ApplicationControllerPatch

  def self.included(base)
    base.class_eval do
    
      alias_method :redmine_api_request?, :api_request?

      def api_request?
        false
        #redmine_api_request?
      end

    end
  end

end
