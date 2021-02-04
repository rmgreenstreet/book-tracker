window.onload = function () {
    // formatTagCloud();
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
};

// function formatTagCloud() {
//     let tagCloud = document.querySelectorAll("span[class^='bucket'");
//     for (let tag of tagCloud) {
//         tag.classList.add('btn', 'p-1', 'm-1');
//     }
// }
