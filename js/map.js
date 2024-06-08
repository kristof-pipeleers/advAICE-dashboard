document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('map', {
        center: [50.85045, 4.34878],
        zoom: 9,
        zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© werecircle - Greenaumatic'
    }).addTo(map);

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    var markers = L.markerClusterGroup();
    var allMarkers = [];
    var selectedMarker = null;
    var cityList = new Set();
    var activityList = new Set();

    var advaiceIcon = L.icon({
        iconUrl: 'images/advaice-icon.png',
        iconSize: [36, 40],
        iconAnchor: [18, 40],
        popupAnchor: [-3, -40]
    });

    var info = L.control();
    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function(props) {
        if (props) {
            document.querySelector('.company-name .info-value').innerText = props['Company Name'] || 'N/A';
            document.querySelector('.company-address .info-value').innerText = props['Full Address'] || 'N/A';
            document.querySelector('.company-id .info-value').innerText = formatBelgianCompanyId(props['Company ID']) || 'N/A';
            document.querySelector('.company-start .info-value').innerText = props['Start Date'] || 'N/A';
            document.querySelector('.company-employees .info-value').innerText = props['Number of Employees'] || 'N/A';
            document.querySelector('.company-turnover .info-value').innerText = formatTurnover(props['Turnover']) || 'N/A';
    
            document.querySelector('#ecodesign-descr').innerText = (props['ECODESIGN'] && props['ECODESIGN'].trim() !== '') ? props['ECODESIGN'] : 'nothing found';
            document.querySelector('#lifespan-descr').innerText = (props['LEVENSDUURVERLENGING'] && props['LEVENSDUURVERLENGING'].trim() !== '') ? props['LEVENSDUURVERLENGING'] : 'nothing found';
            document.querySelector('#material-descr').innerText = (props['MATERIALENGEBRUIK'] && props['MATERIALENGEBRUIK'].trim() !== '') ? props['MATERIALENGEBRUIK'] : 'nothing found';
    
            function createUrlIcons(entityId, urls) {
                const container = document.getElementById(`${entityId}-urls`);
                container.innerHTML = '';
              
                const urlArray = typeof urls === 'string' ? urls.split(', ') : urls;
                urlArray.forEach(url => {
                  if (!url.trim()) {
                    return;
                  }
                  const urlSpan = document.createElement('span');
                  urlSpan.className = 'url-span';

                  const link = document.createElement('a');
                  link.href = url;
                  link.target = '_blank';

                  const icon = document.createElement('i');
                  icon.className = 'fa-solid fa-file';

                  link.appendChild(icon);
                  urlSpan.appendChild(link);
                  container.appendChild(urlSpan);
                });
            }
        
            createUrlIcons('ecodesign', props['ECODESIGN urls']);
            createUrlIcons('lifespan', props['LEVENSDUURVERLENGING urls']);
            createUrlIcons('material', props['MATERIALENGEBRUIK urls']);
    
            const activitiesElement = document.querySelector('.company-activities');
            activitiesElement.innerHTML = '<span class="info-label">Company Activities</span>';
            if (props['Activities'] && props['NACE Descriptions']) {
                const activitiesArray = props['Activities'].split(', ');
                const descriptionsArray = props['NACE Descriptions'].split('; ');
                if (activitiesArray.length === descriptionsArray.length && activitiesArray.length > 0) {
                    for (let i = 0; i < activitiesArray.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.classList.add('activity-item');
    
                        const naceCodeSpan = document.createElement('span');
                        naceCodeSpan.innerText = activitiesArray[i] || 'N/A';
                        naceCodeSpan.classList.add('activity-code');
    
                        const descriptionSpan = document.createElement('span');
                        descriptionSpan.innerText = descriptionsArray[i] || 'N/A';
                        descriptionSpan.classList.add('activity-descr');
    
                        listItem.appendChild(naceCodeSpan);
                        listItem.appendChild(descriptionSpan);
    
                        activitiesElement.appendChild(listItem);
                    }
                } else {
                    const listItem = document.createElement('li');
                    listItem.classList.add('activity-item');
    
                    const descriptionSpan = document.createElement('span');
                    descriptionSpan.innerText = 'No activities available';
                    descriptionSpan.classList.add('activity-descr');
    
                    listItem.appendChild(descriptionSpan);
                    activitiesElement.appendChild(listItem);
                }
            } else {
                const listItem = document.createElement('li');
                listItem.classList.add('activity-item');
    
                const descriptionSpan = document.createElement('span');
                descriptionSpan.innerText = 'No activities available';
                descriptionSpan.classList.add('activity-descr');
    
                listItem.appendChild(descriptionSpan);
                activitiesElement.appendChild(listItem);
            }
        }
    };    

    info.addTo(map);

    var processedDataMap = {};

    d3.csv('farma_companies/updated_dataset.csv').then(function(data) {
        if (data.length > 0) {
            data.forEach(function(d) {
                var marker = L.marker([parseFloat(d.Latitude), parseFloat(d.Longitude)], {icon: advaiceIcon});
                marker.feature = { properties: d };
                allMarkers.push(marker);

                // Add city and activities to the respective lists for autocomplete
                if (d.City) {
                    var city = d.City.trim().toLowerCase();
                    cityList.add(city);
                    processedDataMap[city] = d;
                }

                if (d.Activities) {
                    var activities = d.Activities.split(', ');
                    activities.forEach(function(activity) {
                        activityList.add(activity.trim().toLowerCase());
                    });
                }

                marker.on('mouseover', function(e) {
                    if (marker._icon) {
                        L.DomUtil.addClass(marker._icon, 'marker-hover');
                    }
                    info.update(d);
                });
                marker.on('mouseout', function(e) {
                    if (marker._icon) {
                        L.DomUtil.removeClass(marker._icon, 'marker-hover');
                    }
                    if (selectedMarker) {
                        info.update(selectedMarker.feature.properties);
                    } else {
                        info.update();
                    }
                });
                marker.on('click', function(e) {
                    if (selectedMarker && selectedMarker._icon) {
                        L.DomUtil.removeClass(selectedMarker._icon, 'marker-selected');
                    }
                    selectedMarker = marker;
                    if (marker._icon) {
                        L.DomUtil.addClass(marker._icon, 'marker-selected');
                    }
                    info.update(d);
                    map.setView(marker.getLatLng(), map.getZoom());
                });

                markers.addLayer(marker);
            });

            map.addLayer(markers);
            selectRandomMarker();

            // Initialize autocomplete for cities and activities
            initAutocomplete(Array.from(cityList), 'search-city', 'search-city-suggestion', 'city-suggestions-list');
            initAutocomplete(Array.from(activityList), 'search-activity', 'search-activity-suggestion', 'activity-suggestions-list');
        }
    }).catch(function(error) {
        console.error("Error loading the CSV: ", error);
    });

    function selectRandomMarker() {
        var allMarkers = markers.getLayers();
        if (allMarkers.length > 0) {
            var randomMarker = allMarkers[Math.floor(Math.random() * allMarkers.length)];
            selectedMarker = randomMarker;
            info.update(randomMarker.feature.properties);
            map.setView(randomMarker.getLatLng(), map.getZoom());
            if (randomMarker._icon) {
                L.DomUtil.addClass(randomMarker._icon, 'marker-selected');
            }
        }
    }

    function formatBelgianCompanyId(companyId) {
        let idString = companyId.toString();
        idString = idString.replace(/\D/g, '');
        if (idString.length !== 9) {
            throw new Error("Invalid company ID length. Belgian company IDs must have exactly 9 digits.");
        }
        return `${idString.slice(0, 3)}.${idString.slice(3, 6)}.${idString.slice(6, 9)}`;
    }

    function formatTurnover(value) {
        if (!value) return 'n.b.';
        return '€ ' + Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // Initialize the noUiSlider
    var turnoverSlider = document.getElementById('turnover-filter');
    noUiSlider.create(turnoverSlider, {
        start: [0, 100000000], // Start with log values
        connect: true,
        range: {
            'min': 0,
            'max': 8 // log10(100000000) = 8
        },
        tooltips: [true, true],
        format: {
            to: function(value) {
                return Math.round(Math.pow(10, value)); // Convert log value to normal value
            },
            from: function(value) {
                return Math.log10(value); // Convert normal value to log value
            }
        }
    });

    turnoverSlider.noUiSlider.on('update', function(values, handle) {
        var handles = document.getElementsByClassName('noUi-handle');
        handles[handle].getElementsByClassName('noUi-tooltip')[0].innerText = formatTurnover(values[handle]);
    });

    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    function applyFilters() {
        var activityFilter = document.querySelector('#search-activity').value.toLowerCase();
        var turnoverRange = turnoverSlider.noUiSlider.get();
        var turnoverMin = parseInt(turnoverRange[0]);
        var turnoverMax = parseInt(turnoverRange[1]);
        var cityFilter = document.querySelector('#search-city').value.toLowerCase();

        var ecodesignFilter = document.getElementById('ecodesign-checkbox').checked;
        var materialUseFilter = document.getElementById('material-use-checkbox').checked;
        var lifespanExtensionFilter = document.getElementById('lifespan-extension-checkbox').checked;

        var filteredMarkers = allMarkers.filter(function(marker) {
            var properties = marker.feature.properties;
            var matchesActivity = activityFilter ? properties['Activities'].toLowerCase().includes(activityFilter) : true;
            var turnover = parseFloat(properties['Turnover'].replace(',', ''));
            var matchesTurnover = turnover >= turnoverMin && turnover <= turnoverMax;
            var cityName = properties['City'] ? properties['City'].toLowerCase().trim() : '';
            var matchesCity = cityFilter ? cityName.includes(cityFilter) : true;

            var matchesEcodesign = ecodesignFilter ? properties['ECODESIGN'] && properties['ECODESIGN'].trim() !== '' : true;
            var matchesMaterialUse = materialUseFilter ? properties['MATERIALENGEBRUIK'] && properties['MATERIALENGEBRUIK'].trim() !== '' : true;
            var matchesLifespanExtension = lifespanExtensionFilter ? properties['LEVENSDUURVERLENGING'] && properties['LEVENSDUURVERLENGING'].trim() !== '' : true;

            return matchesActivity && matchesTurnover && matchesCity && matchesEcodesign && matchesMaterialUse && matchesLifespanExtension;
        });

        markers.clearLayers();
        filteredMarkers.forEach(function(marker) {
            markers.addLayer(marker);
        });
        map.addLayer(markers);
    }

    // Autocomplete function
    function initAutocomplete(itemList, searchInputId, searchSuggestionId, suggestionsListId) {
        var searchInput = document.querySelector(`#${searchInputId}`);
        var searchSuggestion = document.querySelector(`#${searchSuggestionId}`);
        var suggestionsList = document.querySelector(`#${suggestionsListId}`);
        suggestionsList.classList.add('suggestions-list');

        searchInput.addEventListener('input', function() {
            givesuggestions();
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (searchInput.value == "") return;
                var searchTerm = searchInput.value.trim().toLowerCase();
                var matches = itemList.filter(function(item) {
                    return item.toLowerCase().startsWith(searchTerm);
                }).slice(0, 3);

                if (matches.length > 0) {
                    searchInput.value = matches[0];
                    searchSuggestion.value = '';
                    suggestionsList.innerHTML = '';
                }
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                var searchTerm = searchInput.value.trim().toLowerCase();
                var matches = itemList.filter(function(item) {
                    return item.toLowerCase().startsWith(searchTerm);
                }).slice(0, 3);

                if (matches.length > 0) {
                    searchInput.value = matches[0];
                    searchSuggestion.value = '';
                }
            }
            if (e.key === 'Escape') {
                searchInput.blur();
                searchSuggestion.value = '';
                suggestionsList.innerHTML = '';
            }
        });

        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.innerHTML = ''; // Only clear suggestions
            }
        });

        function givesuggestions() {
            var searchTerm = searchInput.value.trim().toLowerCase();
            suggestionsList.innerHTML = '';
            searchSuggestion.value = '';

            if (searchTerm.length > 0) {
                var matches = itemList.filter(function(item) {
                    return item.toLowerCase().startsWith(searchTerm);
                }).slice(0, 3);

                if (matches.length > 0) {
                    searchSuggestion.value = searchInput.value + matches[0].substring(searchTerm.length);
                }

                matches.forEach(function(match) {
                    var li = document.createElement('li');
                    li.textContent = match;
                    li.addEventListener('click', function() {
                        searchInput.value = match;
                        searchSuggestion.value = '';
                        suggestionsList.innerHTML = '';
                    });
                    suggestionsList.appendChild(li);
                });
            }
        }
    }
});
