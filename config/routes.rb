
if ( Rails::version().split('.').first.to_i > 2)
    get 'index', :to => 'redcase#index'
end
