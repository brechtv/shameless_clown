

$(document).ready(function(){
// load existing params from localstorage
var params_from_local_storage = JSON.parse(localStorage.getItem('sql_parameters'));
if(params_from_local_storage){
    for(param in params_from_local_storage) {
        var parameter_list_html = `
        <div class="parameter-list-item p-2 mt-2 border rounded">
          <label class="control-label small" for="field1">Key</label>
          <input class="parameter_name" type="text"/ value="`+ param + `">
          <label class="control-label small" for="field1">Value</label>
          <input class="parameter_value" type="text"/ value="`+  params_from_local_storage[param] +`">
          <button class="btn btn-link parameter-remove-this btn-sm" type="button" onclick="$(this).parent().remove()">Remove</button>
        </div>`
        $(".parameters-list").append(parameter_list_html)
    }
}

// to add more parameters
    $(".parameter-add").click(function(e){
        e.preventDefault();
        var parameter_list_html = 
        `<div class="parameter-list-item p-2 mt-2 border rounded">
          <label class="control-label small" for="field1">Key</label>
          <input class="parameter_name" type="text"/>
          <label class="control-label small" for="field1">Value</label>
          <input class="parameter_value" type="text"/>
          <button class="btn btn-link parameter-remove-this btn-sm" type="button" onclick="$(this).parent().remove()">Remove</button>
      </div>`
      $(".parameters-list").append(parameter_list_html)
    });
});

// to save parameters to localstorage
$(".parameter-save").click(function() {
   var parameters = $(".parameter-list-item")
   var parameters_obj = {}
   $.each(parameters, function(i, v) {
    var name = ($(v).find(".parameter_name").val());
    var val = ($(v).find(".parameter_value").val());
    parameters_obj[name] = val
   })
   localStorage.setItem('sql_parameters', JSON.stringify(parameters_obj))
})


