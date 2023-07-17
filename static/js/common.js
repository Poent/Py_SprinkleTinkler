$(document).ready(function() {
    // This code will run after the page has loaded

    // Dark mode toggling
    $('#dark-mode-toggle').click(function() {
        $('body').toggleClass('bg-dark');
        $('body').toggleClass('text-light');
        $('table').toggleClass('table-light table-dark');
        $('.btn').toggleClass('btn-light');
        
        const darkMode = $('body').hasClass('bg-dark');
        localStorage.setItem('dark-mode', darkMode);
    });

    if(localStorage.getItem('dark-mode') === 'true') {
        $('body').addClass('bg-dark');
        $('body').addClass('text-light');
        $('table').addClass('table-dark');
        $('.btn').addClass('btn-light');
    }

    // Other common JavaScript code...
});