
match 'projects/:id/redcase', :to => 'redcase#index', :via => 'get'
match 'projects/:id/redcase/index', :to => 'redcase#index', :via => 'get'
match 'projects/:id/redcase/execution_suite_manager', :to => 'redcase#execution_suite_manager'
match 'projects/:id/redcase/copy_test_case_to_exec', :to => 'redcase#copy_test_case_to_exec'
match 'projects/:id/redcase/get_test_case', :to => 'redcase#get_test_case', :via => 'get'
match 'projects/:id/redcase/get_executions', :to => 'redcase#get_executions', :via => 'get'
match 'projects/:id/redcase/get_attachment_urls', :to => 'redcase#get_attachment_urls', :via => 'get'
match 'projects/:id/redcase/execute', :to => 'redcase#execute'

match ':controller(/:action(/:id))(.:format)'
