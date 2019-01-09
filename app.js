var express = require('express');
var path = require('path');
var app = express();

const request = require('request');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

// main path, renders the editor
app.get('/', function(req, res) {
    res.render('editor');
});

// main path for executing a sql query
app.post('/internal/format_query', function(req, res) {
  // get the sql from the body
  var raw_query = req.body.raw_query

  // get all defined macro's in the query
  var defined_macros_arr = raw_query.toLowerCase().match(/define macro[\s\S]+?(?=;)/g)
  // construct the key (macro label) value (macro sql) object
  var defined_macros_obj = {}

  // loop through each macro to clean and add to the object
  defined_macros_arr.forEach(function(el) {
  		// get the full macro text
	  	var macro = el.replace("define macro ", "")
	  	// get the macro name from the macro
	  	var macro_label = macro.substr(0,macro.indexOf(':')).trim()
	  	// then strip the name
		macro = macro.match(/\:[\s\S]+/g)[0]
		// and the colon which starts the macro
		macro = macro.replace(":", "")
		// add it to the object
	  	defined_macros_obj[macro_label] = macro
	});

  // get all macro references (${MACRO_NAME})
  var query_macro_refs = raw_query.match(/\{.*\}/g)
  // loop through all references
  query_macro_refs.forEach(function(el) {
  		// get the reference label, cleaned
  		var macro_ref = el.replace("{", "").replace("}", "").toLowerCase()
  		// search for it in the macro object (defined_macros_obj)
  		var macro_ref_sql = defined_macros_obj[macro_ref]
  		// replace the reference with the corresponding sql
  		raw_query = raw_query.replace("$" + el, macro_ref_sql)
	})

  // then remove all defined macros from the resulting query
  raw_query = raw_query.replace(/(DEFINE MACRO|define macro)[\s\S]+?;/g, "").trim()

  // return the formatted query
  var formatted_query = raw_query
  res.send(formatted_query)
  res.end()
})

// main path for running a sql query
app.post('/internal/run_query', function(req, res) {

	// write the stuff

  var query_results = "ABC THIS IS A RESULT"
  res.send(query_results)
  res.end()
})

app.listen(app.get('port'), function() {
    console.log('Editor started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});