window.onload = function () {
    // formatTagCloud();
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
};

function removeTagFromList() {
    console.log('removing tag');
    let parentTag = this.closest('.tag');
    if(parentTag.classList.contains('popular-tag')){
        parentTag.querySelector('input').checked = false;
        parentTag.querySelector('.tag-count').classList.remove('not-visible');
        parentTag.querySelector('.add-tag-plus').classList.remove('not-visible');
        this.classList.add('not-visible');
        document.querySelector('.popular-tags').appendChild(parentTag);
    } else {
        parentTag.remove();
    }
};

function addTagToList() {
    let parentTag = this.closest('.tag');
    this.classList.add('not-visible');
    parentTag.querySelector('.tag-count').classList.add('not-visible');
    parentTag.querySelector('.remove-tag-x').classList.remove('not-visible');
    parentTag.querySelector('input').checked = true;
    document.querySelector('.applied-tags').appendChild(parentTag);
}



let allXs = document.querySelectorAll('.remove-tag-x');

for (let x of allXs) {
    x.onclick = removeTagFromList;
}

let allPluses = document.querySelectorAll('.add-tag-plus');

for (let plus of allPluses) {
    plus.onclick = addTagToList;
}

const tagSearchBox = document.querySelector('#tag-search');

let timeout = null;
tagSearchBox.addEventListener('input', function () {
    var that = this;
    if (timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
        doSearch(that.value);
    }, 200);
});

async function doSearch(value){
    const response = await axios.get(`/tags/search/${value}`);
    console.log(response.data);
}