module RedcaseTestSuitesHelper
    def tr_id(node)
        "#{node.class}:#{node.id}"
    end
    
    def errors_par
        tag(:p, :style => "color: red", :id => "errors")
    end
end