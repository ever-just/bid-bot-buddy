// Web Content Scraper - Frontend JavaScript

/**
 * Initialize the scraper functionality
 */
function initializeScraper() {
    const form = document.getElementById('scrapeForm');
    const urlInput = document.getElementById('urlInput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');
    const exampleButtons = document.querySelectorAll('.example-btn');

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a URL');
            return;
        }

        await scrapePage(url);
    });

    // Handle example button clicks
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            urlInput.value = url;
        });
    });
}

/**
 * Scrape a webpage and display results
 */
async function scrapePage(url) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');

    // Reset displays
    hideElement(resultsContainer);
    hideElement(errorContainer);
    showElement(loadingIndicator);

    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        hideElement(loadingIndicator);

        if (data.status === 'error') {
            showError(data.error || 'Failed to scrape the webpage');
            return;
        }

        displayResults(data);

    } catch (error) {
        hideElement(loadingIndicator);
        showError('Network error: ' + error.message);
    }
}

/**
 * Display scraping results
 */
function displayResults(data) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    const html = `
        <div class="card results-card shadow-lg fade-in">
            <div class="card-header results-header">
                <h4 class="mb-0">
                    <i class="fas fa-check-circle"></i> Scraping Results
                </h4>
                <small>Scraped from: <a href="${data.final_url}" target="_blank" class="text-white">${data.final_url}</a></small>
            </div>
            <div class="card-body">
                <!-- Statistics -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-number">${data.statistics?.total_links || 0}</div>
                            <div class="stat-label">Links Found</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-number">${data.statistics?.total_forms || 0}</div>
                            <div class="stat-label">Forms Found</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-number">${data.statistics?.total_images || 0}</div>
                            <div class="stat-label">Images Found</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-number">${data.statistics?.total_tables || 0}</div>
                            <div class="stat-label">Tables Found</div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <ul class="nav nav-tabs" id="resultTabs" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#text" type="button">
                            <i class="fas fa-font"></i> Text Content
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="links-tab" data-bs-toggle="tab" data-bs-target="#links" type="button">
                            <i class="fas fa-link"></i> Links (${data.statistics?.total_links || 0})
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="forms-tab" data-bs-toggle="tab" data-bs-target="#forms" type="button">
                            <i class="fas fa-wpforms"></i> Forms (${data.statistics?.total_forms || 0})
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="images-tab" data-bs-toggle="tab" data-bs-target="#images" type="button">
                            <i class="fas fa-image"></i> Images (${data.statistics?.total_images || 0})
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="screenshot-tab" data-bs-toggle="tab" data-bs-target="#screenshot" type="button">
                            <i class="fas fa-camera"></i> Screenshot
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="raw-tab" data-bs-toggle="tab" data-bs-target="#raw" type="button">
                            <i class="fas fa-code"></i> Raw Data
                        </button>
                    </li>
                </ul>

                <div class="tab-content" id="resultTabContent">
                    <!-- Text Content Tab -->
                    <div class="tab-pane fade show active" id="text" role="tabpanel">
                        ${generateTextContent(data.content?.text)}
                    </div>

                    <!-- Links Tab -->
                    <div class="tab-pane fade" id="links" role="tabpanel">
                        ${generateLinksContent(data.content?.links)}
                    </div>

                    <!-- Forms Tab -->
                    <div class="tab-pane fade" id="forms" role="tabpanel">
                        ${generateFormsContent(data.content?.forms)}
                    </div>

                    <!-- Images Tab -->
                    <div class="tab-pane fade" id="images" role="tabpanel">
                        ${generateImagesContent(data.content?.images)}
                    </div>

                    <!-- Screenshot Tab -->
                    <div class="tab-pane fade" id="screenshot" role="tabpanel">
                        ${generateScreenshotContent(data.screenshot)}
                    </div>

                    <!-- Raw Data Tab -->
                    <div class="tab-pane fade" id="raw" role="tabpanel">
                        ${generateRawDataContent(data)}
                    </div>
                </div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = html;
    showElement(resultsContainer);
}

/**
 * Generate text content display
 */
function generateTextContent(textData) {
    if (!textData) return '<p class="text-muted">No text content found.</p>';

    let html = '';

    // Headings
    if (textData.headings && textData.headings.length > 0) {
        html += '<h5><i class="fas fa-heading"></i> Headings</h5>';
        html += '<div class="mb-4">';
        textData.headings.forEach(heading => {
            html += `<div class="mb-2">
                <span class="badge bg-primary">H${heading.level}</span>
                <span class="ms-2">${escapeHtml(heading.text)}</span>
            </div>`;
        });
        html += '</div>';
    }

    // Paragraphs
    if (textData.paragraphs && textData.paragraphs.length > 0) {
        html += '<h5><i class="fas fa-paragraph"></i> Paragraphs</h5>';
        html += '<div class="mb-4">';
        textData.paragraphs.slice(0, 5).forEach(paragraph => {
            html += `<p class="border-start border-primary ps-3 mb-2">${escapeHtml(paragraph.substring(0, 200))}${paragraph.length > 200 ? '...' : ''}</p>`;
        });
        if (textData.paragraphs.length > 5) {
            html += `<p class="text-muted">... and ${textData.paragraphs.length - 5} more paragraphs</p>`;
        }
        html += '</div>';
    }

    return html || '<p class="text-muted">No text content found.</p>';
}

/**
 * Generate links content display
 */
function generateLinksContent(links) {
    if (!links || links.length === 0) {
        return '<p class="text-muted">No links found.</p>';
    }

    let html = '<div class="table-responsive">';
    html += '<table class="table table-striped">';
    html += '<thead><tr><th>Link Text</th><th>URL</th><th>Type</th></tr></thead>';
    html += '<tbody>';
    
    links.slice(0, 50).forEach(link => {
        const linkText = link.text.trim() || '(no text)';
        const linkType = link.is_external ? 'External' : 'Internal';
        const badgeClass = link.is_external ? 'bg-warning' : 'bg-success';
        
        html += `<tr>
            <td>${escapeHtml(linkText.substring(0, 50))}${linkText.length > 50 ? '...' : ''}</td>
            <td><a href="${escapeHtml(link.absolute_url)}" target="_blank" class="text-break">${escapeHtml(link.absolute_url.substring(0, 80))}${link.absolute_url.length > 80 ? '...' : ''}</a></td>
            <td><span class="badge ${badgeClass}">${linkType}</span></td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    html += '</div>';
    
    if (links.length > 50) {
        html += `<p class="text-muted">Showing first 50 of ${links.length} links.</p>`;
    }
    
    return html;
}

/**
 * Generate forms content display
 */
function generateFormsContent(forms) {
    if (!forms || forms.length === 0) {
        return '<p class="text-muted">No forms found.</p>';
    }

    let html = '';
    forms.forEach((form, index) => {
        html += `<div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0">Form ${index + 1}</h6>
            </div>
            <div class="card-body">
                <p><strong>Action:</strong> ${escapeHtml(form.action || '(none)')}</p>
                <p><strong>Method:</strong> <span class="badge bg-info">${form.method}</span></p>
                <p><strong>Inputs:</strong></p>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead><tr><th>Type</th><th>Name</th><th>Required</th></tr></thead>
                        <tbody>`;
        
        form.inputs.forEach(input => {
            html += `<tr>
                <td><span class="badge bg-secondary">${input.type}</span></td>
                <td>${escapeHtml(input.name || '(no name)')}</td>
                <td>${input.required ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-muted"></i>'}</td>
            </tr>`;
        });
        
        html += `</tbody></table></div>
            </div>
        </div>`;
    });

    return html;
}

/**
 * Generate images content display
 */
function generateImagesContent(images) {
    if (!images || images.length === 0) {
        return '<p class="text-muted">No images found.</p>';
    }

    let html = '<div class="row">';
    images.slice(0, 20).forEach(image => {
        html += `<div class="col-md-6 mb-3">
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title">${escapeHtml(image.alt || 'No alt text')}</h6>
                    <p class="card-text">
                        <small class="text-muted">
                            <a href="${escapeHtml(image.absolute_url)}" target="_blank" class="text-break">
                                ${escapeHtml(image.absolute_url.substring(0, 80))}${image.absolute_url.length > 80 ? '...' : ''}
                            </a>
                        </small>
                    </p>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';

    if (images.length > 20) {
        html += `<p class="text-muted">Showing first 20 of ${images.length} images.</p>`;
    }

    return html;
}

/**
 * Generate screenshot content display
 */
function generateScreenshotContent(screenshot) {
    if (!screenshot) {
        return '<p class="text-muted">No screenshot available.</p>';
    }

    return `<div class="text-center">
        <img src="${escapeHtml(screenshot)}" class="img-fluid rounded shadow" alt="Page Screenshot" style="max-height: 600px;">
        <p class="mt-2">
            <a href="${escapeHtml(screenshot)}" target="_blank" class="btn btn-outline-primary">
                <i class="fas fa-external-link-alt"></i> View Full Size
            </a>
        </p>
    </div>`;
}

/**
 * Generate raw data content display
 */
function generateRawDataContent(data) {
    return `<div class="mb-3">
        <button id="downloadBtn" class="btn btn-primary">
            <i class="fas fa-download"></i> Download JSON
        </button>
    </div>
    <pre class="json-viewer">${JSON.stringify(data, null, 2)}</pre>
    <script>
        document.getElementById('downloadBtn').addEventListener('click', function() {
            const dataStr = JSON.stringify(${JSON.stringify(data)}, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'scraped_data.json';
            link.click();
            URL.revokeObjectURL(url);
        });
    </script>`;
}

/**
 * Show error message
 */
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    showElement(errorContainer);
}

/**
 * Show element
 */
function showElement(element) {
    element.style.display = 'block';
}

/**
 * Hide element
 */
function hideElement(element) {
    element.style.display = 'none';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
} 