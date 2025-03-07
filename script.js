document.addEventListener("DOMContentLoaded", () => {
    loadPage("bars"); 
});

function loadPage(page) {
    fetch(`pages/${page}/${page}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById("page-content").innerHTML = data;
            document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} | Aarav Bullion`;

            document.querySelectorAll(".nav-links a").forEach(link => {
                link.classList.remove("active");
            });

            const activeLink = document.querySelector(`.nav-links a[href="#"][onclick="loadPage('${page}')"]`);
            if (activeLink) activeLink.classList.add("active");

            const container = document.querySelector(".container");
            if (page === "bars") {
                container.style.display = "block";
            } else {
                container.style.display = "none";
            }
        })
        .catch(error => console.error("Error loading page:", error));
}


function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.body.appendChild(script);
}

function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("active");
}


document.addEventListener('DOMContentLoaded', () => {
    class RatesAPI {
        constructor(apiUrl, updateInterval = 500) {
            this.apiUrl = apiUrl;
            this.updateInterval = updateInterval;
            this.ratesBody = document.getElementById('ratesBody');
            this.ratesTable = document.getElementById('ratesTable');
            this.loadingIndicator = document.getElementById('loadingIndicator');
            this.lastUpdatedEl = document.getElementById('lastUpdated');
            this.mainRatesHeader = document.getElementById('mainRatesHeader');
            this.currentFilter = "All";  // Stores the active filter
        }

        async fetchRates() {
            try {
                const startTime = performance.now();
                const response = await fetch(this.apiUrl);
                const text = await response.text();
                const endTime = performance.now();
                const rates = this.parseRates(text);
                this.updateRatesTable(rates);
                const responseTime = (endTime - startTime).toFixed(2);
                this.lastUpdatedEl.textContent = `Last Updated: ${new Date().toLocaleString()} (Response Time: ${responseTime}ms)`;
                this.loadingIndicator.style.display = 'none';
                this.ratesTable.style.display = 'table';
            } catch (error) {
                console.error('Error fetching rates:', error);
                this.loadingIndicator.textContent = 'Error loading rates. Retrying...';
            }
        }

        parseRates(responseText) {
            const lines = responseText.trim().split('\n');
            const ratesMap = {
                'Gold($)..': {},
                'Silver': {},
                'USD': {},
                'GOLD COSTING': {},
                'SILVER COSTING': {},
                'Specific Gold Rates': [],
                'Specific Silver Rates': []
            };

            lines.forEach(line => {
                const parts = line.trim().split('\t');
                if (parts.length >= 5) {
                    const name = parts[1].trim();
                    const current = parseFloat(parts[2]);
                    const high = parseFloat(parts[3]);
                    const low = parseFloat(parts[4]);

                    if (name === 'Gold($)..') {
                        ratesMap['Gold($)..'] = { current, high, low };
                    } else if (name === 'Silver') {
                        ratesMap['Silver'] = { current, high, low };
                    } else if (name === 'USD') {
                        ratesMap['USD'] = { current, high, low };
                    } else if (name === 'GOLD COSTING') {
                        ratesMap['GOLD COSTING'] = { current, high, low };
                    } else if (name === 'SILVER COSTING') {
                        ratesMap['SILVER COSTING'] = { current, high, low };
                    } else if (name.includes('GOLD 999')) {
                        ratesMap['Specific Gold Rates'].push({ name, current, high, low });
                    } else if (name.includes('SILVER 999')) {
                        ratesMap['Specific Silver Rates'].push({ name, current, high, low });
                    }
                }
            });

            return ratesMap;
        }

        updateRatesTable(rates) {
            const mainRatesHeaderDiv = this.mainRatesHeader.children;
            mainRatesHeaderDiv[0].textContent = rates['Gold($)..'].current.toFixed(2);
            mainRatesHeaderDiv[1].textContent = rates['Silver'].current.toFixed(2);
            mainRatesHeaderDiv[2].textContent = rates['USD'].current.toFixed(3);

            this.ratesBody.innerHTML = '';

            const mainRates = [
                { name: 'Gold', data: rates['Gold($)..'] },
                { name: 'Silver', data: rates['Silver'] },
                { name: 'USD', data: rates['USD'] },
                { name: 'Gold Costing', data: rates['GOLD COSTING'] },
                { name: 'Silver Costing', data: rates['SILVER COSTING'] }
            ];

            mainRates.forEach(rate => {
                const row = this.createRateRow(rate.name, rate.data);
                this.ratesBody.appendChild(row);
            });

            rates['Specific Gold Rates'].forEach(rate => {
                const row = this.createRateRow(rate.name, rate);
                this.ratesBody.appendChild(row);
            });

            rates['Specific Silver Rates'].forEach(rate => {
                const row = this.createRateRow(rate.name, rate);
                this.ratesBody.appendChild(row);
            });

            this.applyFilter();
        }

        createRateRow(name, data) {
            const row = document.createElement('tr');
            row.setAttribute('data-category', name.includes('GOLD') ? 'Gold' : name.includes('SILVER') ? 'Silver' : 'Other');

            row.innerHTML = `
                <td>${name}</td>
                <td>${data.current || 'N/A'}</td>
                <td><button style="padding: 5px; margin:2px 40px">Buy</button></td>
            `;
            return row;
        }

        startRealTimeUpdates() {
            this.fetchRates();
            setInterval(() => {
                this.fetchRates();
            }, this.updateInterval);
        }

        applyFilter() {
            document.querySelectorAll("#ratesBody tr").forEach(row => {
                const category = row.getAttribute("data-category");

                if (this.currentFilter === "All") {
                    row.style.display = "";
                } else {
                    row.style.display = category === this.currentFilter ? "" : "none";
                }
            });
        }

        setFilter(filterType) {
            this.currentFilter = filterType;
            this.applyFilter();
        }
    }

    const ratesAPI = new RatesAPI('https://bcast.aaravbullion.in/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/aarav?_=1741068774453');
    ratesAPI.startRealTimeUpdates();

    document.querySelectorAll(".rate-tabs div").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".rate-tabs div").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
        });
    });

    document.getElementById("goldFilter").addEventListener("click", () => ratesAPI.setFilter("Gold"));
    document.getElementById("silverFilter").addEventListener("click", () => ratesAPI.setFilter("Silver"));
    document.getElementById("coinFilter").addEventListener("click", () => ratesAPI.setFilter("COIN"));
});