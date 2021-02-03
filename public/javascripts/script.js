window.onload = function () {
    formatTagCloud();
};

function formatTagCloud() {
    let tagCloud = document.querySelectorAll("span[class^='bucket'");
    for (let tag of tagCloud) {
        tag.classList.add('btn', 'p-1', 'm-1');
    }
}