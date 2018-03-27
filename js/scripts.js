/*global $*/

$(document).ready(function(){
    
    //Script for lazy loading function.
    //Fades in pictures when they are scrolled past.
    //.show() allows the placeholders to appear first,
    //This is important to make smooth scrolling work right
    $("img.lazy").show().lazyload( {
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        visibleOnly: true,
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });
        
        
    //filter function by bootsnipp user "meetshah3795"
    //It filters by using an if else statement to either show or hide selected classes
    $(".filter-btn").click(function(){
        //Value pulls the currently selected filter button
        //It will equal all, costume, painting, or other
        var value = $(this).attr('data-filter');
        
        //The hide and show below are jquery effects. The number given is the speed at which the effect happens.
        
        if(value == "all")
        {
            //Show everything
            $('.filter').show('1000');
        }
        else
        {
            //Hide everything that is not the value
            $(".filter").not('.'+value).hide('3000');
            //Show everything that is the value
            $('.filter').filter('.'+value).show('3000');
            
        }
    });
    
});