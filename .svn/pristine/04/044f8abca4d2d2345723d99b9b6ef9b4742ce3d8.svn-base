const pagenation = {
    wrap: document.querySelector("#app_wrap"),
    pages: document.querySelectorAll("section.contents.paging_layout article.page"),
    totalPages: 0,
    currentPage: 1,
    activePage: null,
};

pagenation.totalPages = pagenation.pages.length;
pagenation.activePage = isPaging ? document.querySelector("article.on") : document;

if (pagenation.totalPages === 0 || !pagenation.wrap) {
    // console.warn("🚨 페이지가 없거나 `#app_wrap`이 없습니다.");
} else {
    isPaging = true;
    const pagingController = document.createElement("div");
    pagingController.classList.add("paging_controller");

    const prevButton = document.createElement("button");
    prevButton.classList.add("prev");

    const nextButton = document.createElement("button");
    nextButton.classList.add("next");

    const pagination = document.createElement("div");
    pagination.classList.add("pagenation");

    const pageButtons = [];
    for (let i = 0; i < pagenation.totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i + 1;
        pageButton.dataset.page = i + 1;
        if (i === 0) pageButton.classList.add("on");
        pageButtons.push(pageButton);
        pagination.appendChild(pageButton);
    }

    pagingController.appendChild(prevButton);
    pagingController.appendChild(nextButton);
    pagingController.appendChild(pagination);
    pagenation.wrap.appendChild(pagingController);

    function updatePagination() {
        globalFaultCount = 0;
        pagenation.pages.forEach(page => page.classList.remove("on"));
        pagenation.pages[pagenation.currentPage - 1].classList.add("on");
        
        pagenation.activePage = pagenation.pages[pagenation.currentPage - 1];
        
        pageButtons.forEach(button => button.classList.remove("on"));
        pageButtons[pagenation.currentPage - 1].classList.add("on");

        prevButton.classList.toggle("disabled", pagenation.currentPage === 1);
        nextButton.classList.toggle("disabled", pagenation.currentPage === pagenation.totalPages);

        pagenation.wrap.dataset.currentPage = `page_${pagenation.currentPage}`;
        // console.log(pagenation.currentPage, pagenation.activePage)
    }

    prevButton.addEventListener("click", () => {
        if (pagenation.currentPage > 1) {
            pagenation.currentPage--;
            updatePagination();
        }
    });

    nextButton.addEventListener("click", () => {
        if (pagenation.currentPage < pagenation.totalPages) {
            pagenation.currentPage++;
            updatePagination();
        }
    });

    pageButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const page = Number(e.target.dataset.page);
            if (page !== pagenation.currentPage) {
                pagenation.currentPage = page;
                updatePagination();
            }
        });
    });

    updatePagination();
}
