
include Redcase

if System::rails3?
    get 'index', :to => 'redcase#index'
end
