window.onload = function () {
    // formatTagCloud();
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    $('#tag-search').keypress(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });
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
    } else if (parentTag.classList.contains('searched-tag') && document.querySelector('#tag-search').value) {
        parentTag.querySelector('input').checked = false;
        parentTag.querySelector('.add-tag-plus').classList.remove('not-visible');
        this.classList.add('not-visible');
        document.querySelector('#tag-search-results').appendChild(parentTag);
    } else {
        parentTag.remove();
    }
};

function addTagToList() {
    let parentTag = this.closest('.tag');
    if (parentTag !== document.querySelector('.popular-tags').querySelector('#'+parentTag.querySelector('input').getAttribute('id')).closest('.tag')) {
        parentTag.remove();
        parentTag = document.querySelector('.popular-tags').querySelector('#'+parentTag.querySelector('input').getAttribute('id')).closest('.tag');
    }
    parentTag.querySelector('.add-tag-plus').classList.add('not-visible');
    let tagCount = parentTag.querySelector('.tag-count');
    if (tagCount) {
        tagCount.classList.add('not-visible');
    }
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
    timeout = setTimeout(async function () {
        let results = await doSearch(that.value);
        listResults(results);
    }, 200);
});

async function doSearch(value){
    const response = await axios.get(`/tags/search/${value}`);
    return response.data;
}

function listResults(results) {
    let tagSearchResults = document.querySelector('#tag-search-results');
    for (let child of tagSearchResults.children) {
        tagSearchResults.removeChild(child);
    }
    if (results.length > 0) {
        for (let result of results) {
            if (!document.querySelector('.applied-tags').querySelector(`#tag${result._id}`)) {
                let blankResult = document.querySelector('#quick-result').content.cloneNode(true);
                blankResult.querySelector('.tag').setAttribute('title', `${result.description.substr(0,20)}...`)
                
                let resultLabel = blankResult.querySelector('label');
                resultLabel.setAttribute('for', `tag${result._id}`);
                resultLabel.prepend(`${result.title}`);

                let resultCheckBox = blankResult.querySelector('input');
                resultCheckBox.setAttribute('id', `tag${result._id}`);
                resultCheckBox.setAttribute('value', `${result._id}`);

                blankResult.querySelector('.remove-tag-x').addEventListener('click', removeTagFromList);
                blankResult.querySelector('.add-tag-plus').addEventListener('click', addTagToList);

                tagSearchResults.appendChild(blankResult);
            }
        }
    } else {
        const noResultsNode = document.createElement('p');
        noResultsNode.appendChild(document.createTextNode('No Tags Found'));
        tagSearchResults.appendChild(noResultsNode);
    }
}