
class RedcaseTestSuitesController < ApplicationController

    unloadable

    def new
        @parent = RedcaseTestSuite.find(params[:parent_id])
        @node = RedcaseTestSuite.new
        @node.parent = @parent
        respond_to do |format|
            format.js { render :layout => false }
        end
    end

    def create
        @node = RedcaseTestSuite.new(params[:redcase_test_suite])
        @parent = @node.parent
        if @node.save
            respond_to do |format|
                format.js { render :layout => false }
            end
        end
    end

    def show
        @node = RedcaseTestSuite.includes(:children).find(params[:id])
        @level = params[:level]
        respond_to do |format|
            format.js
        end
    end

    def edit
        @node = RedcaseTestSuite.find(params[:id])
        respond_to do |format|
            format.js
        end
    end

    def update
        @node = RedcaseTestSuite.find(params[:id])
        @node.name = params[:redcase_test_suite][:name]
        @node.save!
        respond_to do |format|
            format.js
        end
    end

    def destroy
        node = RedcaseTestSuite.find(params[:id])
        @node_class = "#{node.class}:#{node.id}"
        @parent_class = "#{node.parent.class}:#{node.parent.id}"
        node.destroy
        respond_to do |format|
            format.js
        end
    end

end
