// Theme Toggle
const lightBtn = document.getElementById('light-btn');
const darkBtn = document.getElementById('dark-btn');
const html = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeButtons(savedTheme);

lightBtn.addEventListener('click', () => setTheme('light'));
darkBtn.addEventListener('click', () => setTheme('dark'));

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
    if (theme === 'dark') {
        darkBtn.classList.add('active');
        lightBtn.classList.remove('active');
    } else {
        lightBtn.classList.add('active');
        darkBtn.classList.remove('active');
    }
}

// File Upload
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const howItWorks = document.getElementById('how-it-works');
const scanAgainBtn = document.getElementById('scan-again');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

scanAgainBtn.addEventListener('click', () => {
    results.classList.remove('active');
    uploadZone.style.display = 'block';
    howItWorks.style.display = 'grid';
    fileInput.value = '';
});

async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!['pdf', 'docx'].includes(ext)) {
        alert('Please upload a PDF or DOCX file.');
        return;
    }

    uploadZone.style.display = 'none';
    howItWorks.style.display = 'none';
    loading.classList.add('active');

    const formData = new FormData();
    formData.append('file', file);

    try {
            // API endpoint - change this to your Cloud Run URL
            const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? '/analyze'  // Local development
                : 'https://YOUR-CLOUD-RUN-URL.run.app/analyze';  // Production
            
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

        const data = await response.json();

        if (data.error) {
            alert('Error: ' + data.error);
            uploadZone.style.display = 'block';
            howItWorks.style.display = 'grid';
        } else {
            displayResults(data);
        }
    } catch (error) {
        alert('An error occurred while analyzing the file.');
        uploadZone.style.display = 'block';
        howItWorks.style.display = 'grid';
    } finally {
        loading.classList.remove('active');
    }
}

function displayResults(data) {
    const verdictCard = document.getElementById('verdict-card');
    const verdictIcon = document.getElementById('verdict-icon');
    const verdictTitle = document.getElementById('verdict-title');
    const verdictMessage = document.getElementById('verdict-message');
    const filename = document.getElementById('filename');
    const filetype = document.getElementById('filetype');
    const findingsContainer = document.getElementById('findings-container');

    verdictCard.className = 'verdict-card ' + data.verdict;

    const verdictConfig = {
        clean: { icon: '✅', title: 'No Traps Detected', desc: 'This file appears clean. No hidden text or suspicious content found.' },
        low: { icon: '⚡', title: 'Minor Findings', desc: 'Some unusual characters detected. Probably safe, but review below.' },
        medium: { icon: '⚠️', title: 'Suspicious Content Found', desc: 'This file contains hidden content. Review the findings carefully.' },
        high: { icon: '🚨', title: 'TRAP DETECTED!', desc: 'This file contains hidden instructions that could be read by AI!' }
    };

    const config = verdictConfig[data.verdict];
    verdictIcon.textContent = config.icon;
    verdictTitle.textContent = config.title;
    verdictMessage.textContent = config.desc;
    
    // Truncate filename if too long
    const displayFilename = data.filename.length > 20 
        ? data.filename.substring(0, 17) + '...' 
        : data.filename;
    filename.textContent = displayFilename;
    filename.title = data.filename;
    
    filetype.textContent = data.file_type;

    // Build findings sections
    findingsContainer.innerHTML = '';

    const findingTypes = [
        { key: 'white_text', title: 'White/Hidden Text', icon: '🎨', desc: 'Text colored white to hide on white backgrounds' },
        { key: 'invisible_chars', title: 'Invisible Characters', icon: '👻', desc: 'Zero-width and hidden Unicode characters' },
        { key: 'small_text', title: 'Microscopic Text', icon: '🔬', desc: 'Text too small to see (under 2pt)' },
        { key: 'hidden_text', title: 'Hidden Text Property', icon: '🙈', desc: 'Word document hidden text formatting' },
        { key: 'hidden_layers', title: 'Hidden Layers', icon: '📑', desc: 'Hidden PDF layers or annotations' }
    ];

    findingTypes.forEach(type => {
        const findings = data[type.key];
        if (!findings) return;

        const section = document.createElement('div');
        section.className = 'findings-section';

        const count = findings.length;
        const header = document.createElement('div');
        header.className = 'findings-header';
        header.innerHTML = `
            <div class="findings-title">
                <span class="findings-title-icon">${type.icon}</span>
                <span>${type.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="findings-count ${count === 0 ? 'zero' : ''}">${count}</span>
                <span class="findings-chevron">▼</span>
            </div>
        `;

        const body = document.createElement('div');
        body.className = 'findings-body';

        if (count === 0) {
            body.innerHTML = `<p class="empty-findings">✓ No ${type.title.toLowerCase()} detected</p>`;
        } else {
            findings.forEach(finding => {
                const item = document.createElement('div');
                item.className = 'finding-item';

                let location = '';
                if (finding.page) location = `📍 Page ${finding.page}`;
                if (finding.paragraph) location = `📍 Paragraph ${finding.paragraph}`;
                if (finding.location) location += ` (${finding.location})`;
                if (finding.char_count) location += ` • ${finding.char_count} characters`;

                let details = [];
                if (finding.char_code) details.push(finding.char_code);
                if (finding.char_name) details.push(finding.char_name);
                if (finding.color) details.push(finding.color);
                if (finding.font_size !== undefined) details.push(`${finding.font_size}pt`);
                if (finding.property) details.push(finding.property);

                item.innerHTML = `
                    ${location ? `<div class="finding-location">${location}</div>` : ''}
                    ${finding.text ? `<div class="finding-text">"${escapeHtml(finding.text)}"</div>` : ''}
                    ${finding.context ? `<div class="finding-text">${escapeHtml(finding.context)}</div>` : ''}
                    ${details.length > 0 ? `
                        <div class="finding-tags">
                            ${details.map(d => `<span class="finding-tag">${escapeHtml(d)}</span>`).join('')}
                        </div>
                    ` : ''}
                `;

                body.appendChild(item);
            });
        }

        header.addEventListener('click', () => {
            header.classList.toggle('open');
            body.classList.toggle('open');
        });

        // Auto-open sections with findings
        if (count > 0) {
            header.classList.add('open');
            body.classList.add('open');
        }

        section.appendChild(header);
        section.appendChild(body);
        findingsContainer.appendChild(section);
    });

    results.classList.add('active');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

