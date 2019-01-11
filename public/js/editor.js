
    var query_editor = ace.edit("query_editor_textarea")
    query_editor.setTheme("ace/theme/dreamweaver")
    query_editor.setOptions({
        fontSize: "12pt"
    })
    query_editor.getSession().setMode("ace/mode/sql")
    var query_editor_from_localstorage = localStorage.getItem('sql_query');
    query_editor.setValue(query_editor_from_localstorage == undefined || "" ? "" : query_editor_from_localstorage)


    query_editor.on("input", function(e) {
        localStorage.setItem('sql_query', query_editor.getValue())
    })

    window.onbeforeunload = function() {
        localStorage.setItem('sql_query', query_editor.getValue())
    };

    var includes_editor = ace.edit("query_includes_textarea")
    includes_editor.setTheme("ace/theme/dreamweaver")
    includes_editor.setOptions({
        fontSize: "12pt"
    })
    includes_editor.getSession().setMode("ace/mode/sql")
    var includes_editor_from_localstorage = localStorage.getItem('sql_include');
    includes_editor.setValue(includes_editor_from_localstorage == undefined || "" ? "" : includes_editor_from_localstorage)


    includes_editor.on("input", function(e) {
        localStorage.setItem('sql_include', includes_editor.getValue())
    })

    window.onbeforeunload = function() {
        localStorage.setItem('sql_include', includes_editor.getValue())
    };

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
        $.post("/internal/format_query", {
            "raw_query": includes_editor.getValue() + "\n" + query_editor.getValue()
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