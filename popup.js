var pdpPageData = [];

const generateMyReport = (reportData) => {
  const objectLength = Object.keys(reportData).length;
  const keyArray = Object.keys(reportData);

  // Define header separately
  {
    let tableSet = "";
    keyArray.forEach((d, i) => {
      for (let key in reportData) {
        // Additional logic if needed inside the loop
      }
      tableSet += ` <tr>
                      <th>${d}</th>
                      <th>${reportData[d].actual}</th>
                      <th>${reportData[d].criteria}</th>
                      <th>${reportData[d].result}</th>
                    </tr>`;
    });

    return `<div style = 'width: 100%; display:block''>
              <div class="header" style = 'width: 100%; text-align:center; margin-top:100px'>
                <h1 id="heading-text">Walmart PDP Analysis Report</h1>    
              </div>
              <div class="table-container" style = 'width: 100%; text-align:center; margin-top:30px'>
                <table id="brandTable" style = 'width: 100%; text-align:center; margin-top:30px; padding:100px'>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Actual</th>
                      <th>Criteria</th>
                     <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableSet}
                  </tbody>
                </table>
              </div>
            </div>`;
  }
}

document.addEventListener("DOMContentLoaded", function () {

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "VALIDATIONS_DATA") {
      const validations = message.data;
      pdpPageData = validations;

      sendResponse(Object.keys(pdpPageData).length);
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }

    const activeTab = tabs[0];
    const currentURL = activeTab.url;
    const isSearchPage = currentURL.includes("/search?");
    const isProductPage = currentURL.includes("/ip/");

    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        files: ["content.js"]
      },
      () => {
        const objectLength = Object.keys(pdpPageData).length;
        const keyArray = Object.keys(pdpPageData);

        // Define header separately
        if (isProductPage) {
          let tableSet = "";

          let validator = ``;
          keyArray.forEach((d, i) => {
            if (pdpPageData[d].result === false) {
              validator = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="green">
                              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7 19.6 5.6z"/>
                            </svg>`;
            }
            else if (pdpPageData[d].result === true) {
              validator = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="red">
                              <path d="M18.3 5.7L12 12l-6.3-6.3-1.4 1.4L10.6 12l-6.3 6.3 1.4 1.4L12 13.4l6.3 6.3 1.4-1.4L13.4 12l6.3-6.3z"/>
                            </svg>`;
            }
            else validator = 'none';
            tableSet += `
                          <tr>
                            <th>${d}</th>
                            <th>${pdpPageData[d].actual}</th>
                            <th>${pdpPageData[d].criteria}</th>
                            <th>${validator}</th>
                          </tr>`;
          });


          document.getElementById('cnt').innerHTML = `
                        <div>
                          <div class="header">
                            <h1 id="heading-text">Validations</h1>
                            <div class="header-buttons">
                              <button id="generateReportButton4" class="icon-button">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                  <polyline points="16 6 12 2 8 6"></polyline>
                                  <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                              </button>
                              <button id="settingsButton1" class="icon-button">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div class="table-container">
                            <div id="settingsModal1" class="modal hidden">
                              <div class="modal-content">
                                <div class="modal-header">
                                  <h2>Analysis Settings</h2>
                                  <button class="close-button1">x</button>
                                </div>
                                <div class="modal-body">
                                  <div class="setting-group">
                                    <label>Results Range:</label>
                                    <div class="toggle-group">
                                      <button class="toggle-button active" data-value="fullPage">Full Page</button>
                                      <button class="toggle-button" data-value="top10">Top 10</button>
                                    </div>
                                  </div>
                                  <div class="setting-group">
                                    <label>Sponsored Results:</label>
                                    <div class="toggle-group">
                                      <button class="toggle-button active" data-value="include">Include</button>
                                      <button class="toggle-button" data-value="exclude">Exclude</button>
                                    </div>
                                  </div>
                                </div>
                                <div class="modal-footer">
                                  <button id="applySettings1" class="primary-button">Apply & Analyze</button>
                                </div>
                              </div>
                            </div>
                            <table id="brandTable">
                              <thead>
                                <tr>
                                  <th>Category</th>
                                  <th>Actual</th>
                                  <th>Criteria</th>
                                  <th>Result</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${tableSet}
                              </tbody>
                            </table>
                          </div>
                          <div class="copyClipboard">
                            <button id="copyClipboard-btn" class="copyClipboard-btn">Copy Clipboard</button>
                            <button id="generateReportButton3" class="secondary-button">Share Report</button>
                          </div>
                        </div>`;


          document.getElementById("settingsButton1").addEventListener('click', async function () {
            if (document.getElementById("settingsModal1")) {
              document.getElementById('settingsModal1').classList.toggle('hidden');
            }
          })
          document.getElementById("applySettings1").addEventListener('click', async function () {
            // const resultLimit = document.querySelector('.toggle-button.active[data-value="fullPage"], .toggle-button.active[data-value="top10"]')?.dataset.value;
            // const includeSponsored = document.querySelector('.toggle-button.active[data-value="include"]') !== null;
            // const settings = {
            //   resultLimit: 'fullPage',
            //   includeSponsored: true
            // };
            alert("Why is this button")
            if (document.getElementById("settingsModal1")) {
              document.getElementById('settingsModal1').classList.toggle('hidden');
            }

          })

          window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('settingsModal1')) {
              document.getElementById('settingsModal1').classList.toggle('hidden');
            }
          });
          document.querySelector(".close-button1").addEventListener('click', async function () {
            if (document.getElementById("settingsModal1")) {
              document.getElementById('settingsModal1').classList.toggle('hidden');
            }
          })
          document.getElementById("copyClipboard-btn").addEventListener("click", function () {
            const table = document.getElementById("brandTable");
            const range = document.createRange();
            range.selectNodeContents(table);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            try {
              // Execute copy command
              const successful = document.execCommand('copy');
              if (successful) {
                if (!document.getElementById("copyClipboard-btn")) return;
                const originalText = document.getElementById("copyClipboard-btn").textContent;
                document.getElementById("copyClipboard-btn").textContent = 'Copied!';
                setTimeout(() => {
                  document.getElementById("copyClipboard-btn").textContent = originalText;
                }, 2000);
              } else {
                alert("Failed to copy the table.");
              }
            } catch (err) {
              console.error('Error copying the table to clipboard:', err);
            }

            // Deselect the table after copying
            selection.removeAllRanges();
          });

          document.getElementById("generateReportButton3").addEventListener('click', async function () {
            try {
              // First capture the screenshot using the existing method
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (!tab?.id) return;

              // Capture the screenshot
              const screenshot = await chrome.tabs.captureVisibleTab(null, {
                format: 'png'
              });

              // Create report content with screenshot
              const reportContent = generateMyReport(pdpPageData);
              const blob = new Blob([reportContent], {
                type: 'text/html;charset=utf-8'
              });

              // Create data URL instead of blob URL
              const reader = new FileReader();
              reader.onload = function (event) {
                chrome.tabs.create({
                  url: event.target.result
                });
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Error generating report:', error);
            }
          })

          document.getElementById("generateReportButton4").addEventListener('click', async function () {
            try {
              // First capture the screenshot using the existing method
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (!tab?.id) return;

              // Capture the screenshot
              const screenshot = await chrome.tabs.captureVisibleTab(null, {
                format: 'png'
              });

              // Create report content with screenshot
              const reportContent = generateMyReport(pdpPageData);
              const blob = new Blob([reportContent], {
                type: 'text/html;charset=utf-8'
              });

              // Create data URL instead of blob URL
              const reader = new FileReader();
              reader.onload = function (event) {
                chrome.tabs.create({
                  url: event.target.result
                });
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Error generating report:', error);
            }
          })

        } else if (isSearchPage) {
          new PopupManager();
        } else {
          // Handle other cases if needed
        }
      }
    );
  });
});

//------------------------------------- search page analyze-----------------------------------------------------

class PopupManager {
  constructor() {
    this.settings = {
      resultLimit: 'fullPage',
      includeSponsored: true
    };
    this.lastSummary = null;
    this.initializeElements();
    this.setupEventListeners();
    this.autoRunAnalysis();
  }

  initializeElements() {
    // Cache all DOM elements
    this.elements = {
      errorBanner: document.getElementById('errorBanner'),
      refreshButton: document.getElementById('refreshButton'),
      resultsArea: document.getElementById('resultsArea'),
      loadingState: document.getElementById('loadingState'),
      statusDiv: document.getElementById('status'),
      totalSearchResults: document.getElementById('totalSearchResults'),
      totalAds: document.getElementById('totalAds'),
      adPercentage: document.getElementById('adPercentage'),
      settingsButton: document.getElementById('settingsButton'),
      settingsModal: document.getElementById('settingsModal'),
      closeButton: document.querySelector('.close-button'),
      applySettingsButton: document.getElementById('applySettings'),
      copyButton: document.getElementById('copyButton'),
      copyClipboard: document.getElementById('copyClipboard'),
      copyListButton: document.getElementById('copyListButton'),
      copySummaryButton: document.getElementById('copySummaryButton'),
      brandTable: document.getElementById('brandTable'),
      productTable: document.getElementById('productTable'),
      expandBrands: document.getElementById('expandBrands'),
      screenshotButton: document.getElementById('screenshotButton'),
      reportButtons: document.querySelectorAll('#generateReportButton, #generateReportButton2, #generateReportButton3, #generateReportButton4')
    };

    this.toggleButtons = document.querySelectorAll('.toggle-button');
  }

  setupEventListeners() {
    // Settings modal
    this.elements.settingsButton?.addEventListener('click', () => this.toggleModal(true));
    this.elements.closeButton?.addEventListener('click', () => this.toggleModal(false));
    this.elements.applySettingsButton?.addEventListener('click', () => this.applySettings());
    this.elements.screenshotButton?.addEventListener('click', () => this.captureFullPage());
    this.elements.generateReportButton?.addEventListener('click', () => this.generateAndDownloadReport());
    this.elements.generateReportButton2?.addEventListener('click', () => this.generateAndDownloadReport());
    this.elements.generateReportButton3?.addEventListener('click', () => this.generateAndDownloadReport());
    this.elements.generateReportButton4?.addEventListener('click', () => this.generateAndDownloadReport());

    // Toggle buttons
    this.elements.reportButtons?.forEach(button => {
      button.addEventListener('click', () => this.generateAndDownloadReport());
    });

    // Copy buttons
    this.elements.copyButton?.addEventListener('click', () => this.copyResults());
    this.elements.copyClipboard?.addEventListener('click', () => this.copyClipboard());
    this.elements.copyListButton?.addEventListener('click', () => this.copyProductList());
    this.elements.copySummaryButton?.addEventListener('click', () => this.copySummaryData());

    // Refresh button
    this.elements.refreshButton?.addEventListener('click', () => this.refreshPage());

    // Expand brands button
    this.elements.expandBrands?.addEventListener('click', () => this.toggleBrandList());

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) {
        this.toggleModal(false);
      }
    });
  }

  async captureFullPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      // Show loading state
      this.elements.screenshotButton.textContent = 'Capturing...';
      this.elements.screenshotButton.disabled = true;

      // Get page dimensions from content script
      const response = await this.sendMessageToTab(tab.id, {
        action: "captureFullPage"
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Capture the visible tab
      const screenshot = await chrome.tabs.captureVisibleTab(null, {
        format: 'png'
      });

      // Create download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const a = document.createElement('a');
      a.href = screenshot;
      a.download = `walmart-page-${timestamp}.png`;
      a.click();

      this.setStatus('Screenshot captured successfully');
    } catch (error) {
      console.error('Screenshot error:', error);
      this.setStatus('Failed to capture screenshot', true);
    } finally {
      // Reset button
      this.elements.screenshotButton.textContent = 'Capture Screenshot';
      this.elements.screenshotButton.disabled = false;
    }
  }

  async autoRunAnalysis() {
    this.showLoading(true);
    await this.runAnalysis();
  }

  async refreshPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.reload(tab.id);
      window.close();
    }
  }

  async runAnalysis() {
    try {
      this.showError(false);
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('No active tab found');
      }

      // Log URL to Google Sheet
      fetch('https://script.google.com/macros/s/AKfycbwadh_Fh0blVpBNae70dUlJA2Qu9v_lpXAl_kxKuLMiT9SKO-h8BYnN6BshHqHj6Ldt/exec', {
        method: 'POST',
        body: JSON.stringify({ url: tabs[0].url })
      }).catch(console.error); // Will continue even if logging fails

      const response = await this.sendMessageToTab(tabs[0].id, {
        action: "analyze",
        ...this.settings
      });

      if (!response || response.error) {
        throw new Error(response?.error || 'No response from page');
      }

      this.displayResults(response);
      this.setStatus('Analysis complete');
    } catch (error) {
      if (error.message.includes('Connection lost')) {
        this.showError(true);
      } else {
        this.setStatus(error.message, true);
      }
    } finally {
      this.showLoading(false);
    }
  }

  async sendMessageToTab(tabId, message) {
    try {
      return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, response => {
          if (chrome.runtime.lastError) {
            this.showError(true);
            reject(new Error('Connection lost. Please refresh the page.'));
          } else {
            this.showError(false);
            resolve(response);
          }
        });
      });
    } catch (error) {
      this.showError(true);
      throw error;
    }
  }

  displayResults(data) {

    this.lastSummary = data.summary;
    this.currentUrl = data.pageUrl;


    // Safely show results area
    if (this.elements.resultsArea) {
      this.elements.resultsArea.classList.remove('hidden');
    }

    // Update counts
    const totalResults = data.summary.totalSearchResults;
    const totalAds = data.summary.sponsoredCount;
    const adPercentage = ((totalAds / totalResults) * 100).toFixed(2);

    this.updateCount('totalSearchResults', totalResults);
    this.updateCount('totalAds', totalAds);
    this.updateCount('adPercentage', `${adPercentage}%`);

    // Display brand share and product list
    this.displayBrandShare(data.brandData);

    // Ensure productList is an array before calling map
    if (Array.isArray(data.productList)) {
      this.displayProductList(data.productList);
    } else {
      console.error('Product list is not an array:', data.productList);
    }

    this.displayMetrics(data.summary);
  }


  displayBrandShare(brandData) {
    if (!this.elements.brandTable) return;

    const tbody = this.elements.brandTable.querySelector('tbody');
    if (!tbody) return;

    const brandRows = Object.entries(brandData)
      .sort((a, b) => b[1].share - a[1].share)
      .map(([brand, data]) => ({
        brand,
        html: `
<tr>
<td>${this.escapeHtml(brand)}</td>
<td>${data.count}</td>
<td>${data.share.toFixed(2)}%</td>
<td>${data.sponsoredCount || 0}</td>
</tr>
`
      }));

    // Show only first 5 rows initially
    tbody.innerHTML = brandRows.slice(0, 5).map(row => row.html).join('');

    // Handle expand button
    if (brandRows.length > 5) {
      this.elements.expandBrands.classList.remove('hidden');
      this.elements.expandBrands._allRows = brandRows;
      this.elements.expandBrands._expanded = false;
      this.elements.expandBrands.textContent = 'Show All Brands';
    } else {
      this.elements.expandBrands.classList.add('hidden');
    }
  }

  async generateAndDownloadReport() {
    try {
      if (!this.lastSummary) {
        throw new Error('No analysis data available. Please run analysis first.');
      }

      const reportData = {
        summary: this.lastSummary,
        brandData: {},
        productList: [],
        date: new Date().toLocaleString(),
        pageUrl: this.currentUrl
      };

      // Get product data from the table
      const productTable = document.getElementById('productTable');
      if (productTable) {
        const rows = Array.from(productTable.querySelectorAll('tbody tr'));
        reportData.productList = rows.map(row => ({
          title: row.cells[1].textContent,
          price: row.cells[2].textContent.replace('$', ''),
          rating: row.cells[3].textContent,
          reviewsCount: row.cells[4].textContent,
          isSponsored: row.getAttribute('data-sponsored') === 'true'
        }));
      }

      // Brand data collection
      const brandTable = document.getElementById('brandTable');
      if (brandTable) {
        const rows = Array.from(brandTable.querySelectorAll('tbody tr'));
        rows.forEach(row => {
          const cells = row.cells;
          reportData.brandData[cells[0].textContent] = {
            count: parseInt(cells[1].textContent),
            share: parseFloat(cells[2].textContent),
            sponsoredCount: parseInt(cells[3].textContent)
          };
        });
      }

      const generator = new ReportGenerator(reportData);
      generator.downloadReport();

      this.setStatus('Report generated successfully');

    } catch (error) {
      console.error('Report generation error:', error);
      this.setStatus('Failed to generate report: ' + error.message, true);
    }
  }

  displayProductList(products) {

    if (!this.elements.productTable) {
      console.error('Product table element not found');
      return;
    }

    const tbody = this.elements.productTable.querySelector('tbody');
    if (!tbody) {
      console.error('Table body not found');
      return;
    }

    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      return;
    }

    tbody.innerHTML = products.map((product, index) => `
<tr data-sponsored="${product.isSponsored}">
<td>${index + 1}</td>
<td class="truncate max-w-[200px]">
<a href="${product.url}" 
title="${this.escapeHtml(product.title)}"
target="_blank" 
class="text-blue-600 hover:text-blue-800 hover:underline">
${this.escapeHtml(product.title)}
</a>
</td>
<td>${product.price ? `$${product.price.toFixed(2)}` : '-'}</td>
<td>${product.rating ? product.rating.toFixed(1) : '-'}</td>
<td>${product.reviewsCount?.toLocaleString() || '-'}</td>
<td style="text-align: center;">${product.isSponsored ? '&#x2713;' : '-'}</td>
</tr>
`).join('');
  }



  toggleBrandList() {
    if (!this.elements.expandBrands._allRows) return;

    const tbody = this.elements.brandTable.querySelector('tbody');
    const isExpanded = this.elements.expandBrands._expanded;

    if (isExpanded) {
      // Show only first 5 rows
      tbody.innerHTML = this.elements.expandBrands._allRows
        .slice(0, 5)
        .map(row => row.html)
        .join('');
      this.elements.expandBrands.textContent = 'Show All Brands';
    } else {
      // Show all rows
      tbody.innerHTML = this.elements.expandBrands._allRows
        .map(row => row.html)
        .join('');
      this.elements.expandBrands.textContent = 'Show Less';
    }

    this.elements.expandBrands._expanded = !isExpanded;
  }

  displayMetrics(summary) {
    this.updateMetricVisualization(
      'price-distribution',
      summary.minPrice,
      summary.avgPrice,
      summary.maxPrice,
      '$'
    );

    this.updateMetricVisualization(
      'rating-distribution',
      summary.minRating,
      summary.avgRating,
      summary.maxRating
    );

    this.updateMetricVisualization(
      'review-distribution',
      summary.minReviews,
      summary.avgReviewCount,
      summary.maxReviews,
      '',
      true
    );
  }

  updateMetricVisualization(groupId, min, avg, max, prefix = '', formatNumbers = false) {
    const group = document.getElementById(groupId);
    if (!group) return;

    const range = max - min;
    const percentage = ((avg - min) / range) * 100;

    const rangeFill = group.querySelector('.range-fill');
    const rangeAverage = group.querySelector('.range-average');

    if (rangeFill) {
      rangeFill.style.left = '0%';
      rangeFill.style.width = '100%';
    }

    if (rangeAverage) {
      rangeAverage.style.left = `${percentage}%`;
    }

    const minLabel = group.querySelector('.range-min');
    const avgLabel = group.querySelector('.range-avg');
    const maxLabel = group.querySelector('.range-max');

    if (minLabel) minLabel.textContent = this.formatValue(min, prefix, formatNumbers);
    if (avgLabel) avgLabel.textContent = this.formatValue(avg, prefix, formatNumbers);
    if (maxLabel) maxLabel.textContent = this.formatValue(max, prefix, formatNumbers);
  }

  showError(show, message = 'Connection lost. Please refresh the page to continue') {
    if (this.elements.errorBanner) {
      this.elements.errorBanner.classList.toggle('hidden', !show);
      const textSpan = this.elements.errorBanner.querySelector('span');
      if (textSpan) {
        textSpan.textContent = message;
      }
    }
  }

  toggleModal(show) {
    if (this.elements.settingsModal) {
      this.elements.settingsModal.classList.toggle('hidden', !show);
    }
  }

  handleToggleButton(event) {
    const buttonGroup = event.target.closest('.toggle-group');
    if (buttonGroup) {
      buttonGroup.querySelectorAll('.toggle-button').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
    }
  }

  applySettings() {
    // Get settings from toggle buttons
    const resultLimit = document.querySelector('.toggle-button.active[data-value="fullPage"], .toggle-button.active[data-value="top10"]')?.dataset.value;
    const includeSponsored = document.querySelector('.toggle-button.active[data-value="include"]') !== null;

    this.settings = { resultLimit, includeSponsored };
    this.toggleModal(false);
    this.runAnalysis();
  }

  async copyResults() {
    try {
      const table = document.getElementById('brandTable');
      if (!table) return;

      const rows = Array.from(table.rows);
      const tsv = rows
        .map(row => Array.from(row.cells).map(cell => cell.textContent).join('\t'))
        .join('\n');

      await navigator.clipboard.writeText(tsv);
      this.showCopySuccess(this.elements.copyButton);
    } catch (error) {
      this.setStatus('Failed to copy results', true);
    }
  }
  async copyClipboard() {
    try {
      const table = document.getElementById('brandTable');
      if (!table) return;

      const rows = Array.from(table.rows);
      const tsv = rows
        .map(row => Array.from(row.cells).map(cell => cell.textContent).join('\t'))
        .join('\n');

      await navigator.clipboard.writeText(tsv);
      this.showCopySuccess(this.elements.copyClipboard);
    } catch (error) {
      this.setStatus('Failed to copy clipboard', true);
    }
  }

  async copyProductList() {
    try {
      const table = document.getElementById('productTable');
      if (!table) return;

      const rows = Array.from(table.rows);
      // Skip header row
      const tsv = rows.slice(1).map(row => {
        const cells = Array.from(row.cells);
        return [
          cells[0].textContent,                              // #
          cells[1].querySelector('a')?.textContent.trim(),   // Title
          cells[2].textContent.replace('$', '').trim(),      // Price
          cells[3].textContent,                              // Rating
          cells[4].textContent,                              // Reviews
          cells[5].textContent === '✓' ? 'Yes' : 'No'        // Sponsored
        ].join('\t');
      }).join('\n');

      await navigator.clipboard.writeText(tsv);
      this.showCopySuccess(this.elements.copyListButton);
    } catch (error) {
      this.setStatus('Failed to copy product list', true);
    }
  }

  async copySummaryData() {
    if (!this.lastSummary) return;

    try {
      const summaryData = [
        ['Search Overview', 'Value'],
        ['Total Search Results', this.lastSummary.totalSearchResults],
        ['Total Ads', this.lastSummary.sponsoredCount],
        ['Ad Percentage', `${((this.lastSummary.sponsoredCount / this.lastSummary.totalSearchResults) * 100).toFixed(2)}%`],
        [''],
        ['Metric', 'Min', 'Avg', 'Max'],
        ['Price',
          this.formatValue(this.lastSummary.minPrice, '$'),
          this.formatValue(this.lastSummary.avgPrice, '$'),
          this.formatValue(this.lastSummary.maxPrice, '$')
        ],
        ['Rating',
          this.formatValue(this.lastSummary.minRating),
          this.formatValue(this.lastSummary.avgRating),
          this.formatValue(this.lastSummary.maxRating)
        ],
        ['Reviews',
          this.formatNumber(this.lastSummary.minReviews),
          this.formatNumber(this.lastSummary.avgReviewCount),
          this.formatNumber(this.lastSummary.maxReviews)
        ]
      ];

      const tsv = summaryData.map(row => row.join('\t')).join('\n');
      await navigator.clipboard.writeText(tsv);
      this.showCopySuccess(this.elements.copySummaryButton);
    } catch (error) {
      this.setStatus('Failed to copy summary data', true);
    }
  }


  showLoading(show) {
    if (this.elements.loadingState) {
      this.elements.loadingState.classList.toggle('hidden', !show);
    }
    if (this.elements.resultsArea) {
      this.elements.resultsArea.classList.toggle('hidden', show);
    }
  }

  setStatus(message, isError = false) {
    if (!this.elements.statusDiv) return;

    this.elements.statusDiv.textContent = message;
    this.elements.statusDiv.classList.toggle('hidden', !message);
    this.elements.statusDiv.classList.toggle('error', isError);
  }

  showCopySuccess(button) {
    if (!button) return;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }

  updateCount(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = typeof value === 'number' ?
        value.toLocaleString() : value || '0';
    }
  }

  formatValue(value, prefix = '', formatNumbers = false) {
    if (value === null || value === undefined) return '-';
    if (formatNumbers) {
      return `${prefix}${Number(value).toLocaleString()}`;
    }
    return `${prefix}${Number(value).toFixed(2)}`;
  }


  formatNumber(value) {
    if (value === null || value === undefined) return '-';
    return Number(value).toLocaleString();
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}


class ReportGenerator {
  constructor(data) {
    this.data = data;
    this.date = new Date().toLocaleString();
  }

  async downloadReport() {
    try {
      // First capture the screenshot using the existing method
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      // Capture the screenshot
      const screenshot = await chrome.tabs.captureVisibleTab(null, {
        format: 'png'
      });

      // Create report content with screenshot
      const reportContent = this.generateReport(screenshot);
      const blob = new Blob([reportContent], {
        type: 'text/html;charset=utf-8'
      });

      // Create data URL instead of blob URL
      const reader = new FileReader();
      reader.onload = function (event) {
        chrome.tabs.create({
          url: event.target.result
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }

  generateCompetitionCard() {
    const adPercentage = (this.data.summary.sponsoredCount / this.data.summary.totalSearchResults) * 100;
    let level, colorClass;

    if (adPercentage < 13) {
      level = 'Low';
      colorClass = 'color: #059669';  // Green
    } else if (adPercentage <= 18) {
      level = 'Medium';
      colorClass = 'color: #D97706';  // Orange
    } else {
      level = 'High';
      colorClass = 'color: #DC2626';  // Red
    }

    return `
<div class="metric-card">
<h3>Competition Level</h3>
<p style="${colorClass}; font-weight: bold; font-size: 1.2em;">${level}</p>
</div>
`;
  }


  formatNumber(value) {
    if (value === null || value === undefined) return '-';
    return Number(value).toLocaleString();
  }

  generateReport() {
    return `
<!DOCTYPE html>
<html>
<head>
<title>Walmart Search Analysis - ${this.date}</title>
<style>
/* Core styles */
body {
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
line-height: 1.6;
max-width: 1200px;
margin: 0 auto;
padding: 20px;
background: #fff;
color: #333;
}

.report-header {
text-align: center;
padding: 20px;
border-bottom: 2px solid #0071dc;
margin-bottom: 30px;
}

.page-url {
color: #666;
margin-top: 10px;
margin-bottom: 20px;
font-size: 0.9em;
word-break: break-all;
}

.metrics-grid {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 20px;
margin: 20px 0;
}

.metric-card {
background: #f8f9fa;
padding: 20px;
border-radius: 8px;
text-align: center;
}

.section {
margin: 40px 0;
padding: 20px;
background: white;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
width: 100%;
border-collapse: collapse;
margin: 20px 0;
}

th, td {
padding: 12px;
text-align: left;
border-bottom: 1px solid #eee;
}

th {
background: #f8f9fa;
font-weight: 500;
}

.export-buttons {
position: fixed;
top: 20px;
right: 20px;
display: flex;
gap: 10px;
}

.export-button {
padding: 8px 16px;
border: none;
border-radius: 4px;
background: #0071dc;
color: white;
cursor: pointer;
}

.warning {
background: #fee2e2;
color: #dc2626;
}

@media print {
.export-buttons {
display: none;
}
table th:first-child,
table td:first-child {
width: 50px;
text-align: center;
}

table td:nth-child(2) {
text-align: left;
min-width: 200px;
}

.sponsored-row {
background-color: #fff8e6;
}

.badge {
display: inline-block;
padding: 2px 6px;
border-radius: 4px;
font-size: 12px;
margin-top: 4px;
}

.badge-sponsored {
background: #FFF4E6;
color: #D97706;
border: 1px solid #FBBF24;
}

.badge-organic {
background: #ECFDF5;
color: #059669;
border: 1px solid #34D399;
}

tr.sponsored-row td {
background-color: #fff8e6;
}

/* Update table styles to ensure proper spacing */
td {
vertical-align: top;
padding: 12px;
}

/* Make sure long product titles wrap properly */
td:nth-child(2) {
max-width: 300px;
word-wrap: break-word;

.screenshot-section {
margin: 20px 0;
text-align: center;
}

.screenshot-section img {
max-width: 100%;
height: auto;
border: 1px solid #ddd;
border-radius: 4px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
}
</style>
<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
</head>
<body>
<div class="export-buttons">
<button onclick="window.print()" class="export-button">Save as PDF</button>
<button onclick="captureScreenshot()" class="export-button">Save as PNG</button>
</div>

<div class="report-header">
<small>Built by <a href="https://shelfsight.co" target="_blank">shelfsight.co</a></small>
<h1>Walmart Search Analysis Report</h1>
<p class="page-url">Analysis URL: ${this.data.pageUrl || 'URL not available'}</p>
<p>Generated on ${this.date}</p>
</div>

<div class="section">
<h2>Results Overview</h2> 
<div class="metrics-grid">
<div class="metric-card">
<h3>Total Results</h3>
<p>${this.data.summary.totalSearchResults}</p>
</div>
<div class="metric-card">
<h3>Total Ads</h3>
<p>${this.data.summary.sponsoredCount}</p>
</div>
<div class="metric-card">
<h3>Ad Percentage</h3>
<p>${((this.data.summary.sponsoredCount / this.data.summary.totalSearchResults) * 100).toFixed(1)}%</p>
</div>
</div>
${this.generateCompetitionCard()}
</div>

<div class="section">
<h2>Metrics Distribution</h2>
<div class="metrics-grid">
<div class="metric-card">
<h3>Price Distribution</h3>
<table style="margin: 0;">
<tr>
  <td style="text-align: left;">Minimum:</td>
  <td style="text-align: right;">$${this.data.summary.minPrice?.toFixed(2) || '-'}</td>
</tr>
<tr>
  <td style="text-align: left;">Average:</td>
  <td style="text-align: right;">$${this.data.summary.avgPrice?.toFixed(2) || '-'}</td>
</tr>
<tr>
  <td style="text-align: left;">Maximum:</td>
  <td style="text-align: right;">$${this.data.summary.maxPrice?.toFixed(2) || '-'}</td>
</tr>
</table>
</div>

<div class="metric-card">
<h3>Rating Distribution</h3>
<table style="margin: 0;">
<tr>
  <td style="text-align: left;">Minimum:</td>
  <td style="text-align: right;">${this.data.summary.minRating?.toFixed(1) || '-'} ★</td>
</tr>
<tr>
  <td style="text-align: left;">Average:</td>
  <td style="text-align: right;">${this.data.summary.avgRating?.toFixed(1) || '-'} ★</td>
</tr>
<tr>
  <td style="text-align: left;">Maximum:</td>
  <td style="text-align: right;">${this.data.summary.maxRating?.toFixed(1) || '-'} ★</td>
</tr>
</table>
</div>

<div class="metric-card">
<h3>Review Count Distribution</h3>
<table style="margin: 0;">
<tr>
  <td style="text-align: left;">Minimum:</td>
  <td style="text-align: right;">${this.formatNumber(this.data.summary.minReviews) || '-'}</td>
</tr>
<tr>
  <td style="text-align: left;">Average:</td>
  <td style="text-align: right;">${this.formatNumber(Math.round(this.data.summary.avgReviewCount)) || '-'}</td>
</tr>
<tr>
  <td style="text-align: left;">Maximum:</td>
  <td style="text-align: right;">${this.formatNumber(this.data.summary.maxReviews) || '-'}</td>
</tr>
</table>
</div>
</div>
</div>


<div class="section">
<h2>Brand Share Analysis</h2>
<table>
<thead>
<tr>
<th>Brand</th>
<th>Product Count</th>
<th>Share (%)</th>
<th>Sponsored Count</th>
</tr>
</thead>
<tbody>
${this.generateBrandShareRows()}
</tbody>
</table>
</div>

<div class="section">
<h2>Product List</h2>
<table>
<thead>
<tr>
<th style="text-align: center;">#</th>
<th style="text-align: left;">Title</th>
<th>Price</th>
<th>Rating</th>
<th>Reviews</th>
<th>Sponsored</th>
</tr>
</thead>
<tbody>
${this.generateProductRows()}
</tbody>
</table>
</div>

<script>
async function captureScreenshot() {
const buttons = document.querySelector('.export-buttons');
buttons.style.display = 'none';

try {
const canvas = await html2canvas(document.body);
const link = document.createElement('a');
link.download = 'walmart-analysis-' + Date.now() + '.png';
link.href = canvas.toDataURL();
link.click();
} finally {
buttons.style.display = 'flex';
}
}
</script>
</body>
</html>
`;
  }

  generateBrandShareRows() {
    return Object.entries(this.data.brandData)
      .map(([brand, data]) => `
<tr>
<td>${brand}</td>
<td>${data.count}</td>
<td>${data.share.toFixed(1)}%</td>
<td>${data.sponsoredCount}</td>
</tr>
`).join('');
  }

  generateProductRows() {
    return this.data.productList.map((product, index) => {
      const formattedPrice = product.price ? `$${parseFloat(product.price).toFixed(2)}` : '-';
      const rowClass = product.isSponsored ? 'sponsored-row' : '';

      return `
<tr class="${rowClass}">
<td style="text-align: center;">${index + 1}</td>
<td style="text-align: left;">${product.title || '-'}</td>
<td style="text-align: right;">${formattedPrice}</td>
<td style="text-align: center;">${product.rating || '-'}</td>
<td style="text-align: right;">${product.reviewsCount || '-'}</td>
<td style="text-align: center;">${product.isSponsored ? '&#x2713;' : '-'}</td>
</tr>
`;
    }).join('');
  }

  downloadReport() {
    const reportContent = this.generateReport();
    const blob = new Blob([reportContent], {
      type: 'text/html;charset=utf-8'
    });

    // Create data URL instead of blob URL
    const reader = new FileReader();
    reader.onload = function (event) {
      chrome.tabs.create({
        url: event.target.result
      });
    };
    reader.readAsDataURL(blob);
  }

  async generateAndDownloadReport() {
    try {
      if (!this.lastSummary) {
        throw new Error('No analysis data available. Please run analysis first.');
      }

      const reportData = {
        summary: this.lastSummary,
        brandData: {},
        productList: [],
        date: new Date().toLocaleString(),
        pageUrl: this.currentUrl || window.location.href
      };

      // Get product data
      const productTable = document.getElementById('productTable');
      if (productTable) {
        const rows = Array.from(productTable.querySelectorAll('tbody tr'));
        reportData.productList = rows.map(row => ({
          title: row.cells[1].querySelector('a').textContent.trim(),
          price: row.cells[2].textContent.replace('$', '').trim(),
          rating: row.cells[3].textContent.trim(),
          reviewsCount: parseInt(row.cells[4].textContent.replace(/,/g, ''), 10),
          isSponsored: row.cells[5].textContent === '✓'
        }));
      }

      // Brand data collection
      const brandTable = document.getElementById('brandTable');
      if (brandTable) {
        const rows = Array.from(brandTable.querySelectorAll('tbody tr'));
        rows.forEach(row => {
          const cells = row.cells;
          reportData.brandData[cells[0].textContent] = {
            count: parseInt(cells[1].textContent),
            share: parseFloat(cells[2].textContent),
            sponsoredCount: parseInt(cells[3].textContent)
          };
        });
      }

      const generator = new ReportGenerator(reportData);
      generator.downloadReport();

      this.setStatus('Report generated successfully');
    } catch (error) {
      console.error('Report generation error:', error);
      this.setStatus('Failed to generate report: ' + error.message, true);
    }
  }


  async getActiveTabId() {
    try {
      // Try to get the active tab directly from the current window
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {

        return tab.id;
      }

      // Fallback: query all windows
      const [activeTab] = await chrome.tabs.query({ active: true });
      if (activeTab?.id) {

        return activeTab.id;
      }

      console.warn('No active tab ID found');
      return null;
    } catch (error) {
      console.error('Error getting active tab ID:', error);
      return null;
    }
  }
}
// Initialize popup when document is loaded










