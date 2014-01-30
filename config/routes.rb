match 'projects/:id/redcase', :to => 'redcase#index', :via => 'get'
match 'projects/:id/redcase/index', :to => 'redcase#index', :via => 'get'
match ':controller(/:action(/:id))(.:format)'