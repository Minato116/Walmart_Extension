var myAnalyzer;

(() => {
  const carouselContainer = document.querySelector('[data-testid="vertical-carousel-container"]');
  const images = carouselContainer?.querySelectorAll('img') || [];
  const title = document.querySelector('#main-title');
  const description = document.querySelector('[data-testid="ui-collapse-panel"] .dangerous-html');
  const text = description?.textContent || '';
  const words = text.split(/[\s\n]+/).filter(word => word.match(/[\w™®*()]/));
  const listItems = document.querySelector('[data-testid="ui-collapse-panel"] .dangerous-html ul')?.children.length || 0;
  const ratingText = document.querySelector('[data-testid="item-review-section-link"]')?.textContent || '0';
  const ratingCount = parseFloat(ratingText.replace(/[^\d.]/g, '')) * 1000 || 0;
  const brandLink = document.querySelector('[data-seo-id="brand-name"]');
  const url = brandLink?.getAttribute('href') || '';
  const isValidPattern = url.startsWith('/brand/');
  const sellerInfo = document.querySelector('[data-testid="product-seller-info"]')?.textContent || 'Unknown seller';
  const buyBoxWinner = sellerInfo.includes('Walmart.com') ? 'Walmart.com' : sellerInfo.match(/by\s+([^\.]+)/)?.[1] || 'Unknown seller';

  const validations = {
    images: {
      criteria: 'Minimum 4 images with white background (RGB 255/255/255)',
      result: images.length >= 4,
      actual: images.length
    },
    imageFormat: {
      criteria: 'JPEG/JPG/PNG/BMG, RGB format, max 5MB, min 1000x1000px',
      result: Array.from(images).every(img => {
        const src = img.getAttribute('srcset')?.split(' ')[0];
        const match = src?.match(/odnHeight=(\d+)/);
        return match && parseInt(match[1]) >= 1000;
      }),
      actual: 'Format requirements checked'
    },
    title: {
      criteria: '50-75 characters, Brand + Item Name + Model + Style + Key Attributes',
      result: title?.textContent.length >= 50 && title.textContent.length <= 75,
      actual: title?.textContent.length || 0
    },
    titleProhibited: {
      criteria: 'No special chars, retailer info, sales info, or marketing phrases',
      result: !/[™½@^*]|#1|best|sale|amazon|ebay/i.test(title?.textContent || ''),
      actual: 'Content checked for prohibited terms'
    },
    description: {
      criteria: 'Minimum 150 words with product details and benefits',
      result: words.length >= 150,
      actual: words.length
    },
    bullets: {
      criteria: '3-10 bullet points, max 80 chars each',
      result: listItems >= 3 && listItems <= 10,
      actual: listItems
    },
    ratings: {
      criteria: 'At least 5 ratings/reviews',
      result: ratingCount >= 5,
      actual: ratingCount
    },
    brandShop: {
      criteria: 'Has valid brand shop link (/brand/)',
      result: isValidPattern,
      actual: url
    },
    buyBox: {
      criteria: 'Competitive pricing and fast shipping options',
      result: buyBoxWinner === 'Walmart.com',
      actual: buyBoxWinner
    }
  };

  const calculateScore = () => {
    const weights = {
      images: 15,
      imageFormat: 10,
      title: 15,
      titleProhibited: 10,
      description: 15,
      bullets: 10,
      ratings: 10,
      brandShop: 5,
      buyBox: 10
    };

    let totalScore = 0;
    let maxScore = 0;

    Object.entries(validations).forEach(([key, value]) => {
      if (weights[key]) {
        maxScore += weights[key];
        if (value.result) totalScore += weights[key];
      }
    });

    return (totalScore / maxScore * 100).toFixed(2);
  };

  chrome.runtime.sendMessage({ type: "VALIDATIONS_DATA", data: validations }, (response) => {

  });
})();




// content.js
if (typeof ProductAnalyzer === 'undefined') {
  class ProductAnalyzer {
    constructor() {
      this.setupMessageListener();
    }

    setupMessageListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


        switch (request.action) {
          case "analyze":
            this.handleAnalyzeRequest(request, sendResponse);
            break;
          case "copyProductList":
            this.handleCopyProductList(sendResponse);
            break;
          case "ping":
            sendResponse({ status: "connected" });
            break;
          case "captureFullPage":
            this.handleScreenshotRequest(sendResponse);
            break;
        }
        return true; // Keep message channel open for async response
      });
    }

    async handleScreenshotRequest(sendResponse) {
      try {
        // Get page dimensions
        const fullHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        );

        // Return dimensions to popup
        sendResponse({
          success: true,
          dimensions: {
            height: fullHeight,
            width: document.documentElement.clientWidth
          }
        });
      } catch (error) {
        console.error('Screenshot error:', error);
        sendResponse({ error: error.message });
      }
    }

    calculateAdCompetition(sponsoredCount, totalResults) {
      const adPercentage = (sponsoredCount / totalResults) * 100;

      if (adPercentage < 13) {
        return {
          level: 'Low',
          description: 'Limited sponsored competition',
          percentage: adPercentage.toFixed(1),
          class: 'ad-competition-low'
        };
      } else if (adPercentage <= 18) {
        return {
          level: 'Medium',
          description: 'Moderate sponsored competition',
          percentage: adPercentage.toFixed(1),
          class: 'ad-competition-medium'
        };
      } else {
        return {
          level: 'High',
          description: 'Strong sponsored competition',
          percentage: adPercentage.toFixed(1),
          class: 'ad-competition-high'
        };
      }
    }

    async handleAnalyzeRequest(request, sendResponse) {
      try {
        const results = this.getAllResults();
        if (!results || results.length === 0) {
          throw new Error('No products found on page');
        }

        const screenshot = await this.captureVisibleArea();
        const { brandData, filteredResults } = this.calculateBrandShareFromTitles(
          results,
          request.resultLimit,
          request.includeSponsored
        );

        // Enhanced summary with sponsored metrics
        const summary = {
          ...this.calculateSummaryStats(results),
          totalSearchResults: results.length,
          sponsoredCount: results.filter(r => r.isSponsored).length,
          adCompetition: this.calculateAdCompetition(
            results.filter(r => r.isSponsored).length,
            results.length
          )
        };

        // Enhanced brand data with sponsored percentage
        Object.keys(brandData).forEach(brand => {
          const brandProducts = results.filter(r => this.extractBrandName(r.title) === brand);
          const sponsoredBrandProducts = brandProducts.filter(r => r.isSponsored);
          brandData[brand].sponsoredPercentage = parseFloat(((sponsoredBrandProducts.length / brandProducts.length) * 100).toFixed(2));
        });


        sendResponse({
          brandData,
          summary,
          totalResults: filteredResults.length,
          pageUrl: window.location.href,
          productList: this.formatProductList(results),
          screenshot: screenshot  // Add screenshot to response
        });

      } catch (error) {
        console.error('Analysis error:', error);
        sendResponse({ error: error.message });
      }
    }

    async captureVisibleArea() {
      try {
        // Get viewport dimensions
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Get scroll position
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Capture the screenshot
        const screenshot = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              action: "captureTab",
              data: {
                x: scrollX,
                y: scrollY,
                width: viewportWidth,
                height: viewportHeight
              }
            },
            response => resolve(response)
          );
        });

        return screenshot;
      } catch (error) {
        console.error('Error capturing screenshot:', error);
        throw error;
      }
    }

    handleCopyProductList(sendResponse) {
      try {
        const allResults = this.getAllResults();
        sendResponse({
          productList: JSON.stringify(this.formatProductList(allResults), null, 2)
        });
      } catch (error) {
        console.error('Error in getProductList:', error);
        sendResponse({ error: error.message });
      }
    }

    getAllResults() {
      try {


        const titles = document.querySelectorAll('span[data-automation-id="product-title"]');


        const carouselContainer = document.querySelector('[data-testid="sp"]') ||
          document.getElementById('SEARCH-SPCarousel-bottom-dog food-');

        const filteredTitles = Array.from(titles).filter(titleElement => {
          return !carouselContainer?.contains(titleElement);
        });



        const results = filteredTitles.map((titleElement, index) => {
          const parentElement = titleElement.closest('div[data-item-id]');
          const isSponsored = this.checkIfSponsored(parentElement);


          return {
            position: index + 1,
            title: titleElement.textContent.trim(),
            price: this.extractPrice(parentElement),
            rating: this.extractRating(parentElement),
            reviewsCount: this.extractReviewCount(parentElement),
            isSponsored: isSponsored,
            identifier: this.extractIdentifier(parentElement),
            url: this.extractUrl(parentElement)
          };
        });


        return results;

      } catch (error) {
        console.error('Error in getAllResults:', error);
        return [];
      }
    }

    extractPrice(parentElement) {
      if (!parentElement) return null;

      // Try different selectors for price
      const priceSelectors = [
        'div[data-automation-id="product-price"]',
        'div.mr1.mr2-xl.b.black.lh-copy.f5.f4-l[aria-hidden="true"]',
        'span.w_iUH7'
      ];

      let priceElement = null;
      for (const selector of priceSelectors) {
        priceElement = parentElement.querySelector(selector);
        if (priceElement) break;
      }

      if (!priceElement) return null;

      try {
        const priceText = priceElement.textContent.trim();


        // Extract numbers with decimal
        const priceMatch = priceText.match(/\$?(\d+(?:\.\d{2})?)/);
        if (!priceMatch) {

          return null;
        }

        let price = priceMatch[1];


        // If no decimal point, insert one
        if (!price.includes('.')) {
          if (price.length <= 2) {
            price = `0.${price.padStart(2, '0')}`;
          } else {
            const dollars = price.slice(0, -2);
            const cents = price.slice(-2);
            price = `${dollars}.${cents}`;
          }
        }


        const finalPrice = parseFloat(price);


        // Sanity check - if price is over 1000, it might need decimal adjustment
        if (finalPrice > 1000) {
          const adjustedPrice = finalPrice / 100;

          return adjustedPrice;
        }

        return finalPrice;

      } catch (error) {
        console.error('Error extracting price:', error);
        return null;
      }
    }

    extractRating(parentElement) {
      if (!parentElement) return null;
      const ratingElement = parentElement.querySelector('[data-testid="product-ratings"]');
      return ratingElement ? parseFloat(ratingElement.getAttribute('data-value')) : null;
    }

    extractReviewCount(parentElement) {
      if (!parentElement) return null;
      const reviewsElement = parentElement.querySelector('[data-testid="product-reviews"]');
      return reviewsElement ? parseInt(reviewsElement.getAttribute('data-value')) : null;
    }

    checkIfSponsored(parentElement) {
      if (!parentElement) return false;

      // Enhanced sponsored detection with multiple selectors
      const sponsoredSelectors = [
        'div.gray.f7.flex.items-center div',
        '[data-testid="sponsored-badge"]',
        '.sponsored-label',
        '[aria-label*="sponsored"]',
        '[aria-label*="Sponsored"]'
      ];

      // Check direct sponsored indicators
      for (const selector of sponsoredSelectors) {
        const element = parentElement.querySelector(selector);
        if (element && element.textContent.toLowerCase().includes('sponsored')) {
          return true;
        }
      }


      const sponsoredParentSelectors = ['[data-testid="sp"]', '[data-sponsored="true"]'];
      return sponsoredParentSelectors.some(selector =>
        parentElement.closest(selector) !== null
      );
    }

    extractIdentifier(parentElement) {
      if (!parentElement) return null;
      const linkElement = parentElement.querySelector('a[link-identifier]');
      return linkElement ? linkElement.getAttribute('link-identifier') : null;
    }

    extractUrl(parentElement) {
      if (!parentElement) return null;
      const linkElement = parentElement.querySelector('a[link-identifier]');
      return linkElement ? linkElement.href : null;
    }

    calculateBrandShareFromTitles(allResults, resultLimit, includeSponsored) {
      let filteredResults = resultLimit === 'fullPage'
        ? allResults
        : this.filterTopResults(allResults, includeSponsored, 10);

      const brandCounts = {};
      const sponsoredCounts = {};

      filteredResults.forEach(result => {
        const brand = this.extractBrandName(result.title);

        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        if (result.isSponsored) {
          sponsoredCounts[brand] = (sponsoredCounts[brand] || 0) + 1;
        }
      });

      const brandData = {};
      const totalResults = filteredResults.length;

      Object.entries(brandCounts).forEach(([brand, count]) => {
        brandData[brand] = {
          count,
          share: parseFloat(((count / totalResults) * 100).toFixed(2)),
          sponsoredCount: sponsoredCounts[brand] || 0
        };
      });

      return { brandData, filteredResults };
    }

    filterTopResults(results, includeSponsored, limit) {
      let filtered = [];

      for (const result of results) {
        if (filtered.length >= limit) break;
        if (includeSponsored || !result.isSponsored) {
          filtered.push(result);
        }
      }

      return filtered;
    }

    calculateSummaryStats(results) {
      const prices = results.map(r => r.price).filter(p => p !== null && p >= 0 && p <= 10000);
      const ratings = results.map(r => r.rating).filter(r => r !== null && r >= 0 && r <= 5);
      const reviews = results.map(r => r.reviewsCount).filter(r => r !== null && r >= 0);

      return {
        totalSearchResults: results.length,
        sponsoredCount: results.filter(r => r.isSponsored).length,

        // Price metrics
        avgPrice: prices.length ?
          parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)) : null,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,

        // Rating metrics
        avgRating: ratings.length ?
          parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : null,
        minRating: ratings.length ? Math.min(...ratings) : null,
        maxRating: ratings.length ? Math.max(...ratings) : null,

        // Review metrics
        avgReviewCount: reviews.length ?
          Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length) : null,
        minReviews: reviews.length ? Math.min(...reviews) : null,
        maxReviews: reviews.length ? Math.max(...reviews) : null
      };
    }

    extractBrandName(title) {
      return title.split(' ')[0].trim();
    }

    formatProductList(results) {
      const adCompetition = this.calculateAdCompetition(
        results.filter(r => r.isSponsored).length,
        results.length
      );

      // Return just the results array directly instead of nested object
      return results.map((result) => ({
        title: result.title,
        price: result.price,
        identifier: result.identifier,
        url: result.url,
        rating: result.rating,
        reviewsCount: result.reviewsCount,
        isSponsored: result.isSponsored
      }));
    }
  }
  new ProductAnalyzer();
}




//if(typeof myAnalyzer === 'undefined') myAnalyzer = 