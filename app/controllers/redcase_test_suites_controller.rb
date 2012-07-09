
class RedcaseTestSuitesController < ApplicationController

    unloadable

    def new
        @parent = RedcaseTestSuite.find(params[:parent_id])
        @node = RedcaseTestSuite.new
        @node.parent = @parent

        respond_to do |format|
            format.html
            format.js 
        end
    end

    def create
        @node = RedcaseTestSuite.new(params[:test_suite])
        @parent = @node.parent
        if @node.save
            respond_to do |format|
                format.js
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
    end

    def update
    end

    def destroy
    end

end
