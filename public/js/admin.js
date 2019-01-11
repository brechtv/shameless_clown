
    $("#test_connection_button").click(function() {
    	$.post("/internal/test_connection", function(result) {

    		var modal_html = `
	    		<div class="injected_modal modal fade" id="messager_modal" tabindex="-1" role="dialog" aria-labelledby="messager_modal_title" aria-hidden="false">
				  <div class="modal-dialog" role="document">
				    <div class="modal-content">
				      <div class="modal-header">
				        <h5 class="modal-title" id="messager_modal_title">Connection Status</h5>
				        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
				          <span aria-hidden="true">×</span>
				        </button>
				      </div>
				      <div class="modal-body">
				        ` + result + `
				      </div>
				      <div class="modal-footer">
				        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
				      </div>
				    </div>
				  </div>
				</div>`
			$("body").append(modal_html)
			$('#messager_modal').modal('show')

    	})
    })


    $("#query_editor_run_button").click(function() {
        var parameters_sql = "";
        var parameters = $(".parameter-list-item")
        $.each(parameters, function(i, v) {
            console.log($(v))
            var name = ($(v).find(".parameter_name").val());
            var val = ($(v).find(".parameter_value").val());
            parameters_sql += "DEFINE PARAMETER " + name + ": " + val + ";\n" 
        })

        $.post("/internal/format_query", {
            "raw_query": parameters_sql + "\n" + includes_editor.getValue() + "\n" + query_editor.getValue()
        }, function(results) {
            $("#formatted_query").html(results.replace(/\n/g, "<br>"))
            $.post("/internal/run_query", {
                "formatted_query": results
            }, function(results) {
                var results_table_html = `<table class="table">`

                $.each(JSON.parse(results), function(i, row) {
                    if (i == 0) {
                        results_table_html += `<thead><tr>`
                        for (var key in row) {
                            if (row.hasOwnProperty(key)) {
                                results_table_html += `<th scope="col">` + key + `</th>`
                            }
                        }
                        results_table_html += `</tr></thead>`
                    } else {
                        results_table_html += `<tr>`
                        for (var key in row) {
                            if (row.hasOwnProperty(key)) {
                                results_table_html += `<td>` + row[key] + `</td>`
                            }
                        }
                        results_table_html += `</tr>`
                    }
                })
                results_table_html += `</table>`
                $("#results-tab").click()
                $("#query_results").html(results_table_html)
            })
        })
    })