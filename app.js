var express = require('express');
var path = require('path');
var formidable = require('formidable');
var fs =require('fs-extra');
const {BigQuery} = require('@google-cloud/bigquery');


var app = express();
app.use(express.static(path.join(__dirname, 'public')));

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

// main path, renders the editor
app.get('/editor', function(req, res) {
    res.render('editor');
});


app.get('/upload_key', function(req, res) {
    res.redirect('back');
});

app.post('/upload_key', function (req, res) {
  var form = new formidable.IncomingForm();
    form.uploadDir = "./";
    form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
        if(fields.project_name) {
          var json =  JSON.stringify([{"project": fields.project_name}])
          fs.writeFile('project.json', json, 'utf8', function(err) {
          if (err)
              throw err;
            console.log('project file created.');  
          });
        }
        if(files.fileUploaded.size > 0) {
          fs.rename(files.fileUploaded.path, "key.json", function(err) {
          if (err)
              throw err;
            console.log('file uploaded and rename complete.');  
          });
          } else {
          fs.unlink(files.fileUploaded.path, function (err) {
              if (err) throw err;
              console.log('File deleted!');
          }); 
          }
        res.redirect('back');
    });
});



// main path for executing a sql query
app.post('/internal/format_query', function(req, res) {
  // get the sql from the body
  var raw_query = req.body.raw_query
  // construct the key (param label) value (param sql) object
  var defined_params_obj = {}
  // construct the key (macro label) value (macro sql) object
  var defined_macros_obj = {}



  // the parameter replace part
  try {
  // get all defined macro's in the query
  var defined_params_arr = raw_query.toLowerCase().match(/define parameter[\s\S]+?(?=;)/g)
  // loop through each param to clean and add to the object
  defined_params_arr.forEach(function(el) {
      // get the full param text
      var param = el.replace("define parameter ", "")
      // get the param name from the param
      var param_label = param.substr(0,param.indexOf(':')).trim()
      // then strip the name
    param = param.match(/\:[\s\S]+/g)[0]
    // and the colon which starts the param
    param = param.replace(":", "")
    // add it to the object
      defined_params_obj[param_label] = param
  });
  console.log(defined_params_obj)

  // get all param references (${param_NAME})
  var query_param_refs = raw_query.match(/\{.*\}/g)
  // loop through all references
  query_param_refs.forEach(function(el) {
      // get the reference label, cleaned
      var param_ref = el.replace("{", "").replace("}", "").toLowerCase()
      console.log("THIS", el, defined_params_obj[param_ref])
      // search for it in the param object (defined_params_obj)
      if(defined_params_obj[param_ref]) {
         console.log("THAT", el, defined_params_obj[param_ref])
        // replace the reference with the corresponding sql
        raw_query = raw_query.replace("$" + el, defined_params_obj[param_ref])
    }
  })
  } catch(err) {}

  // the macro replace part
  try {
  // get all defined macro's in the query
  var defined_macros_arr = raw_query.toLowerCase().match(/define macro[\s\S]+?(?=;)/g)
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
  console.log(defined_macros_obj)

  // get all macro references (${MACRO_NAME})
  var query_macro_refs = raw_query.match(/\{.*\}/g)
  // loop through all references
  query_macro_refs.forEach(function(el) {
  		// get the reference label, cleaned
  		var macro_ref = el.replace("{", "").replace("}", "").toLowerCase()
  		// search for it in the macro object (defined_macros_obj)
  		var macro_ref_sql = defined_macros_obj[macro_ref]
  		      if(defined_macros_obj[macro_ref]) {
        // replace the reference with the corresponding sql
        raw_query = raw_query.replace("$" + el, macro_ref_sql)
    }	})
  } catch(err) {}

  // then remove all defined macros from the resulting query
  raw_query = raw_query.replace(/(DEFINE MACRO|define macro)[\s\S]+?;/g, "").trim()
  // and remove all defined params from the resulting query
  raw_query = raw_query.replace(/(DEFINE PARAMETER|define parameter)[\s\S]+?;/g, "").trim()

  // return the formatted query
  var formatted_query = raw_query
  res.send(formatted_query)
  res.end()
})

// main path for running a sql query
app.post('/internal/run_query', function(req, res) {

  var project = JSON.parse(fs.readFileSync('project.json', 'utf8'))[0].project;
  console.log(project)

  const bigquery = new BigQuery({
      projectId: project,
      keyFilename: 'key.json'
    });

	var query = req.body.formatted_query
  console.log(query)

  bigquery.query(query, function(err, rows) {
    var query_results = err ? err : rows
    res.send(JSON.stringify(query_results))
    console.log(JSON.stringify(query_results))
    res.end()
  });
})

// main path for running a sql query
app.post('/internal/test_connection', function(req, res) {

  var project = JSON.parse(fs.readFileSync('project.json', 'utf8'))[0].project;

  const bigquery = new BigQuery({
      projectId: project,
      keyFilename: 'key.json'
    });

  bigquery.getDatasets(function(err, datasets) {
  if (!err) {
      var total_datasets = datasets.length > 0 ? "Success! Access to " + datasets.length + " datasets." : "Error! Reset credentials."
        res.send(total_datasets)
  }
  res.end()
});

})

app.listen(app.get('port'), function() {
    console.log('Editor started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});