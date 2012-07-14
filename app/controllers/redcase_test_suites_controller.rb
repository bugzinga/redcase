
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
        begin
            if @node.save!
                respond_to do |format|
                    format.js { render :layout => false }
                end
            else
                raise
            end
        rescue
            flash.now[:error] = l(:redcase_i18n_error_suite_exists)
            render :new, :layout => false, :content_type => 'text/javascript'
        end
    end

    def show
        @node = RedcaseTestSuite.find(params[:id], :include => :children)
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
        begin
            if @node.save!
                respond_to do |format|
                    format.js
                end
            else
                raise
            end
        rescue
            flash.now[:error] = l(:redcase_i18n_error_suite_exists)
            render :edit, :layout => false, :content_type => 'text/javascript'           
        end
    end

    def destroy
        node = RedcaseTestSuite.find(params[:id])
        @node_class = "#{node.class}:#{node.id}"
        @parent_class = "#{node.parent.class}:#{node.parent.id}"
        node.destroy
        respond_to do |format|
            format.js { render :layout => false }
        end
    end

end
