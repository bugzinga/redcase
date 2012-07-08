
if Redcase::System::rails3?
    get 'redcase', :to => 'redcase#index'
    get 'redcase_context_menus/test_suites_tree'
    resources :redcase_test_suites
end
