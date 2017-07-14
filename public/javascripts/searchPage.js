// SEARCH PAGE: submit form on change of sort/filter selection
 $(document).ready(function(){
     $('.skillTypeSelect, #minRemunSelect, #sortOptions').on('change', function() {
         $('#searchForm').submit();
     });
 });
 
 // ===== Scroll to Top ==== 
 $(window).scroll(function() {
     if ($(this).scrollTop() >= 50) {   // If page is scrolled more than 50px
         $('#goTopBtn').fadeIn(200);    // Fade in the arrow
     } else {
         $('#goTopBtn').fadeOut(200);   // Else fade out the arrow
     }
 });
 
 $('#goTopBtn').click(function() {
     $('html body').animate({scrolltop: 0}, 'slow');
 }) 