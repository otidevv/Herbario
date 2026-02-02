// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching logic for species detail page
    const tabs = document.querySelectorAll('.species-tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabs.length > 0) {
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to current tab and content
                this.classList.add('active');
                tabContents[index].classList.add('active');
            });
        });
    }
});