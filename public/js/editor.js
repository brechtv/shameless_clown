
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