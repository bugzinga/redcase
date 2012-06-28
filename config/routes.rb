
if Redcase::System::rails3?
    get 'redcase', :to => 'redcase#index'
    get 'testsuitestree/context_menu', :to => 'redcase_context_menus#test_suites_tree'
end
