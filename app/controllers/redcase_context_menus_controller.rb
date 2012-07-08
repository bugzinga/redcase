
class RedcaseContextMenusController < ApplicationController

    unloadable

    def test_suites_tree
        @node = get_node
        render :layout => false
    end

    private

    def get_node
        node_params = params[:ids].first.split(":")
        node = node_params.first.constantize.find(node_params.last.to_i)
    end

end
