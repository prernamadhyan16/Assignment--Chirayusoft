document.addEventListener("DOMContentLoaded", () => {
    loadPage("bars"); 
    
});

function loadPage(page) {
    fetch(`pages/${page}/${page}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById("page-content").innerHTML = data;
            document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} | Aarav Bullion`; // Dynamic Title

            document.querySelectorAll(".nav-links a").forEach(link => {
                link.classList.remove("active");
            });

            document.querySelector(`.nav-links a[href="#"][onclick="loadPage('${page}')"]`).classList.add("active");
        })
        .catch(error => console.error("Error loading page:", error));
}

function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("active");
}
