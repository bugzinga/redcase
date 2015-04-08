resources :projects do
	namespace :redcase do
		resources :environments, only: [:index, :create, :update, :destroy]
		resources :testsuites, only: [:index, :create, :update, :destroy]
		resources :testcases, only: [:index, :update] do
			post 'copy', on: :member
		end
		resources :executionsuites, only: [:index, :update, :create, :destroy, :show]		
		resources :executionjournals, only: [:index]
		resources :export, only: [:index]
		resources :graph, only: [:show]
		resources :combos, only: [:index]
	end
end

get 'projects/:id/redcase', :to => 'redcase#index'
get 'projects/:id/redcase/get_attachment_urls', :to => 'redcase#get_attachment_urls'