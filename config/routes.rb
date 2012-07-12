
if Redcase::System::rails3?
    get 'redcase', :to => 'redcase#index'
    get 'redcase_context_menus/test_suites_tree'
    resources :redcase_test_suites
else
    ActionController::Routing::Routes.draw do |map|
        map.connect '/redcase', :controller => 'redcase', :action => 'index'
        map.connect 'redcase_context_menus/test_suites_tree', :controller => 'redcase_context_menus', :action => 'test_suites_tree'
        map.resources :redcase_test_suites
    end
end
