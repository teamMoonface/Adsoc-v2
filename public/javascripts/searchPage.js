// searchPage.js 

$(document).ready(function(){
    
    /* ============================ PAGINATION + SEARCH/FILTER ================================ */
    $('#pager').bootpag({
        total: Math.ceil($('#totalRecords').val()/$('#size').val()),
        page: 1,
        maxVisible: 5,
        href: '#page-{{number}}'
    }).on('page', function(event, num) {
        $('#content').fadeOut('slow');
        populateJobPost(num, false);
        $(window).scrollTop(0,0);
    });
    
    // dynamically populates content; returns total number of job posts found
    function populateJobPost(page, change) {
        var template = $('.template').html();
        var html = '';
        var numJobs;
    
        var formData = $('form').serialize();
        $.post('/searchPage/search?page='+page+'&size='+$('#size').val(), formData, function(result) {
            jobsArr = result.jobsList;
            for (var i = 0; i < jobsArr.length; i++) {
                var job = jobsArr[i];
                var temp;
                temp = template.replace('job_name', job.name)
                                .replace('job_start_date', job.date_start_formatted)
                                .replace('job_end_date', job.date_end_formatted)
                                .replace('job_desc', job.desc)
                                .replace('job_remun', job.remun)
                                .replace('job_posted_date', job.date_posted_formatted)
                                .replace('job_skill_type', job.skill_type)
                                .replace('href="/"', 'href="' + job.url + '"')
                                .replace('job_employer', job.employer)
                html += temp;
            };
            
            console.log('total records: ' + result.totalRecords);
            $('#totalRecords').val(result.totalRecords);        
            $('#content').html(html);  
            $('#content').fadeIn('slow');
            
            console.log('total pages ' + Math.ceil(result.totalRecords/$('#size').val()));
            // update total pages dynamically
            $('#pager').bootpag({
                total: Math.ceil(result.totalRecords/$('#size').val()),
                page: change ? 1 : page, // if filter added, go to page 1
            });
        });
    };
    
    populateJobPost(1, false); // populate first page (initial loading)

    // Filters/Sort
    $('.skillTypeSelect, #minRemunSelect, #sortOptions').on('change', function() {
        $('#content').fadeOut('slow');
        populateJobPost(1, true);
        $(window).scrollTop(0,0);
        
        console.log('filter clicked');
    });
    
    // Keyword search
    $(document).on('click', '#searchBtn', function() {
        $('#content').fadeOut('slow');
        populateJobPost(1, true);
        $(window).scrollTop(0,0);  
        
        console.log('BTN CLICKED');
    })
    
    // Resolve 'enter' key issue
    $('#searchBar').keypress(function(e) {
        var key = e.which;
        if (key == 13) {
            $('#searchBtn').click();
            return false;
        }
    });
    
    /* ============================ SCROLL TO TOP ================================ */
    $(window).scroll(function() {
         if ($(this).scrollTop() >= 50) {   // If page is scrolled more than 50px
             $('#goTopBtn').fadeIn(200);    // Fade in the arrow
         } else {
             $('#goTopBtn').fadeOut(200);   // Else fade out the arrow
         }
    });
    
    $('#goTopBtn').click(function() {
        $('html body').animate({scrolltop: 0}, 'slow');
    }); 
});