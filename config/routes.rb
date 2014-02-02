
match 'projects/:id/redcase', :to => 'redcase#index', :via => 'get'
match 'projects/:id/redcase/index', :to => 'redcase#index', :via => 'get'
match 'projects/:id/redcase/execution_suite_manager', :to => 'redcase#execution_suite_manager'
match 'projects/:id/redcase/execution_suite_manager', :to => 'redcase#execution_suite_manager'
match 'projects/:id/redcase/copy_test_case_to_exec', :to => 'redcase#copy_test_case_to_exec'

match ':controller(/:action(/:id))(.:format)'
