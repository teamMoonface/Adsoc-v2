/* jquery */

// tool tip
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});

// SEARCH PAGE: submit form on change of sort/filter selection
$(document).ready(function(){
    $('.skillTypeSelect, #minRemunSelect, #sortOptions').on('change', function() {
        $('#searchForm').submit();
    });
});