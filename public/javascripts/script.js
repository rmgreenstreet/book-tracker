window.onload = function () {
    // formatTagCloud();
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
};

function removeTagFromList() {
    let parentTag = this.closest('.tag');
    parentTag.querySelector('input').checked = false;
    parentTag.remove();
};

let allXs = document.querySelectorAll('.remove-tag-x');

for (let x of allXs) {
    x.onclick = removeTagFromList;
}