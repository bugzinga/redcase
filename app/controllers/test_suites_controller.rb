class TestSuitesController < ApplicationController
    def new
        @parent = TestSuite.find(params[:parent_id])
        @node = TestSuite.new
        @node.parent = @parent

        respond_to do |format|
            format.html
            format.js 
        end
    end
    
    def create
        @node = TestSuite.new(params[:test_suite])
        @parent = @node.parent
        if @node.save
            respond_to do |format|
                format.js
            end
        end
    end
    
    def show
        @node = TestSuite.includes(:children).find(params[:id])
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